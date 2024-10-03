require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const crypto = require("crypto");

require('./db/conn');
const Razorpay = require("razorpay");
const authRoutes = require('./routes/authRoutes');
const User = require("./model/userModel");
const EventRegistration = require("./model/registrationSchema");
const sendEmail = require("./utils/sendEmail");
const Payment = require("./model/paymentModel");
const BasicRegistration = require("./model/basicRegistration");
const MembershipCard = require("./model/membershipCard");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const Order =require('./model/orderModel');

const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';


app.use(cors({
  origin: `${BASE_URL}`,
  methods: "GET,POST,PUT,DELETE",

}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/auth/', authRoutes);



function generateBasicPDF(userData) {
  const doc = new PDFDocument();
  const filePath = `./receipt-${userData.email}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  // Header styling
  doc.fontSize(25)
    .font('Helvetica-Bold') // Bold font
    .fillColor('#003366') // Blue color
    .text('Payment Receipt', {
      align: 'center',
      underline: true
    });

  doc.moveDown(2); // Adds vertical spacing

  // User Data section with styling
  doc.fontSize(12)
    .font('Helvetica') // Regular font
    .fillColor('#000') // Reset to black text color
    .text(`Name: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.name}`); // Bold for user data

  doc.font('Helvetica')
    .text(`Email: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.email}`);

  doc.font('Helvetica')
    .text(`Phone: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.mobile}`);

  doc.font('Helvetica')
    .text(`Amount Paid: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.amount}`);

  doc.font('Helvetica')
    .text(`Payment_Id: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.payment_Id}`);

  // Footer section
  doc.moveDown(2);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#555') // Lighter color for footer
    .text('Thank you for your purchase!', {
      align: 'center'
    });

  doc.end();

  return filePath;
}

function generateMembershipPDF(userData) {
  const doc = new PDFDocument();
  const filePath = `./receipt-${userData.email}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  // Header styling
  doc.fontSize(25)
    .font('Helvetica-Bold') // Bold font
    .fillColor('#003366') // Blue color
    .text('Payment Receipt', {
      align: 'center',
      underline: true
    });

  doc.moveDown(2); // Adds vertical spacing

  // User Data section with styling
  doc.fontSize(12)
    .font('Helvetica') // Regular font
    .fillColor('#000') // Reset to black text color
    .text(`Name: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.name}`); // Bold for user data

  doc.font('Helvetica')
    .text(`Email: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.email}`);

  doc.font('Helvetica')
    .text(`Phone: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.mobile}`);


  doc.font('Helvetica')
    .text(`Amount Paid: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.amount}`);

  doc.font('Helvetica')
    .text(`Payment_Id: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.payment_Id}`);

  // Footer section
  doc.moveDown(2);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#555') // Lighter color for footer
    .text('Thank you for your purchase!', {
      align: 'center'
    });

  doc.end();

  return filePath;
}

function generateEventPDF(userData) {
  const doc = new PDFDocument();
  const filePath = `./receipt-${userData.teamLeaderEmail}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  // Header styling
  doc.fontSize(25)
    .font('Helvetica-Bold') // Bold font
    .fillColor('#003366') // Blue color
    .text('Payment Receipt', {
      align: 'center',
      underline: true
    });

  doc.moveDown(2); // Adds vertical spacing

  // User Data section with styling
  doc.fontSize(12)
    .font('Helvetica') // Regular font
    .fillColor('#000') // Reset to black text color
    .text(`Name: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.teamLeaderName}`); // Bold for user data

  doc.font('Helvetica')
    .text(`Email: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.teamLeaderEmail}`);

  doc.font('Helvetica')
    .text(`Phone: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.teamLeaderMobileNo}`);


  doc.font('Helvetica')
    .text(`Amount Paid: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.amount}`);

  doc.font('Helvetica')
    .text(`Payment_Id: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.payment_Id}`);

  // Footer section
  doc.moveDown(2);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#555') // Lighter color for footer
    .text('Thank you for your purchase!', {
      align: 'center'
    });

  doc.end();

  return filePath;
}


//Payment Route
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

app.post("/api/saveRegistration", async (req, res) => {
  try {
    const { name, email, mobile, fees } = req.body;
    const existingMember = await BasicRegistration.findOne({ email });

    if (existingMember) {
      return res.status(400).json({ success: false, message: "A member with this email already exists.Check your cart or profile to see the details." });
    }

    const registration = new BasicRegistration({
      name,
      email,
      mobile,
      amount: fees,
    });

    await registration.save();

    res.status(200).json({ success: true, message: "Basic Registration details saved to cart successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to save membership data." });
  }
});
app.post("/api/saveMemberCard", async (req, res) => {
  try {
    const { name, email, mobile, fees } = req.body;

    const existingMember = await MembershipCard.findOne({ email });

    if (existingMember) {
      return res.status(400).json({ success: false, message: "A member with this email already exists.Check your cart or profile to see the details." });
    }

    const registration = new MembershipCard({
      name,
      email,
      mobile,
      amount: fees,
    });

    await registration.save();

    res.status(200).json({ success: true, message: "Membership card details saved to cart successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to save membership data." });
  }
});




app.post("/api/webhook", async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const { event, payload } = req.body;

  const webhookSignature = req.headers["x-razorpay-signature"];
  const generatedSignature = crypto.createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (generatedSignature === webhookSignature) {
    // Handle webhook event here
    console.log(`Webhook event received: ${event}`);
    
    // Handle payment captured event (successful payment)
    if (event === "payment.captured") {
      const paymentDetails = payload.payment.entity;

      const orderId = paymentDetails.order_id;
      const paymentId = paymentDetails.id;
      const paymentTime = new Date(paymentDetails.created_at * 1000); // Unix timestamp to Date

      try {
        // Save payment details to the database
        const paymentRecord = new Payment({
          order_id: orderId,
          payment_id: paymentId,
          payment_time: paymentTime,
          amount: paymentDetails.amount,
          status: "captured",  // Marking the payment as captured
        });

        await paymentRecord.save();
        console.log("Payment details saved successfully:", paymentRecord);

      } catch (error) {
        console.error("Error saving payment details:", error);
        return res.status(500).json({ success: false, message: "Error saving payment details" });
      }
    }

    // Handle payment failure (optional)
    if (event === "payment.failed") {
      console.log("Payment failed:", payload);
      // You can add logic to handle failure (e.g., send a failure notification or email)
    }

    res.status(200).json({ success: true, message: "Webhook received successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }
});




const checkout = async (req, res) => {
  try {
    const options = {
      amount: Math.round(Number(req.body.amount) * 100), // Convert amount to paisa (smallest unit for INR)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    const order = await instance.orders.create(options); // Creating Razorpay order
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({
      success: false,
      message: "Something went wrong during checkout",
    });
  }
};

const basicpaymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature , email } = req.body;
    console.log(req.body);

    var {
      validatePaymentVerification,
    } = require("./node_modules/razorpay/dist/utils/razorpay-utils");

    if (
      validatePaymentVerification(
        { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
        razorpay_signature,
        process.env.RAZORPAY_API_SECRET
      )) {
      try {
        // Save registration with payment details
        const registration = await BasicRegistration.findOne({ email: email });

        console.log(registration);

        if (!registration) {
          return res.status(404).json({ error: 'Registration not found' });
        }

        registration.Paid = true;
        registration.payment_Id = razorpay_payment_id;
        registration.order_Id = razorpay_order_id;
        registration.signature = razorpay_signature;

        await registration.save();

        console.log(registration);
        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const subject = " PYREXIA 2024 Basic Registration Confirmation";
        const message = `
        <p> Dear ${registration.name},</p>
        
          <p> We are excited to confirm your basic registration for PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
        
        <p> PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
        
       <p> Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
        
       <p> Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
        
       <p> Best regards,</p>
       <p> Team PYREXIA </p>
        `;


        const pdfPath = generateBasicPDF(registration);

        try {
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          return res.status(200).json({
            success: true,
            message: "Payment verified and registration saved. A confirmation email has been sent.",
          });
        } catch (error) {
          console.error("Error sending confirmation email:", error);
          return res.status(500).json({
            success: true, // Payment was still successful, but email failed
            message: "Payment verified but failed to send confirmation email. Please contact support.",
          });
        }
      } catch (error) {
        console.error("Error saving registration data:", error);
        return res.status(500).json({
          success: false,
          message: "Error saving registration data",
          error,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
    });
  }
};

const membershipCardPaymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

    var {
      validatePaymentVerification,
    } = require("./node_modules/razorpay/dist/utils/razorpay-utils");

    if (
      validatePaymentVerification(
        { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
        razorpay_signature,
        process.env.RAZORPAY_API_SECRET
      )) {
      try {
        // Save registration with payment details
        const registration = await MembershipCard.findOne({ email: email});


        if (!registration) {
          return res.status(404).json({ error: 'Registration not found' });
        }

        registration.Paid = true;
        registration.payment_Id = razorpay_payment_id;
        registration.order_Id = razorpay_order_id;
        registration.signature = razorpay_signature;

        await registration.save();
        console.log(registration);

        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const subject = " PYREXIA 2024 Membership Card Confirmation";
        const message = `
        <p>Dear ${registration.name},</p>
        
         <p>We are excited to confirm your registration for  Membership Card of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
        
         <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
        
         <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
        
         <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
        
         <p>Best regards,</p>
         <p>Team PYREXIA</p>
        `;


        const pdfPath = generateMembershipPDF(registration);


        try {
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          return res.status(200).json({
            success: true,
            message: "Payment verified and registration saved. A confirmation email has been sent.",
          });

        } catch (error) {
          console.error("Error sending confirmation email:", error);
          return res.status(500).json({
            success: true, // Payment was still successful, but email failed
            message: "Payment verified but failed to send confirmation email. Please contact support.",
          });
        }
      } catch (error) {
        console.error("Error saving registration data:", error);
        return res.status(500).json({
          success: false,
          message: "Error saving registration data",
          error,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
    });
  }
};

const eventpaymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, eventName, amount } = req.body;

    var {
      validatePaymentVerification,
    } = require("./node_modules/razorpay/dist/utils/razorpay-utils");

    if (
      validatePaymentVerification(
        { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
        razorpay_signature,
        process.env.RAZORPAY_API_SECRET
      )) {
      try {
        const registration = await EventRegistration.findOne({ teamLeaderEmail: email, eventName });


        if (!registration) {
          return res.status(404).json({ error: 'Registration not found' });
        }

        registration.Paid = true;
        registration.amount = amount;
        registration.payment_Id = razorpay_payment_id;
        registration.order_Id = razorpay_order_id;
        registration.signature = razorpay_signature;

        await registration.save();
        console.log(registration);


        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const subject = `PYREXIA 2024 ${eventName} Confirmation`;
        const message = `
        <p>Dear ${registration.teamLeaderName},</p>
        
        <p>We are excited to confirm your registration for event  ${eventName} of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
        
        <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
        
        <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
        
        <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
        
       <p> Best regards,</p>
       <p> Team PYREXIA</p>
        `;


        const pdfPath = generateEventPDF(registration);


        try {
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          return res.status(200).json({
            success: true,
            message: "Payment verified and registration saved. A confirmation email has been sent.",
          });
        } catch (error) {
          console.error("Error sending confirmation email:", error);
          return res.status(500).json({
            success: true, // Payment was still successful, but email failed
            message: "Payment verified but failed to send confirmation email. Please contact support.",
          });
        }
      } catch (error) {
        console.error("Error saving registration data:", error);
        return res.status(500).json({
          success: false,
          message: "Error saving registration data",
          error,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error during payment verification:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during payment verification",
    });
  }
};


const router = express.Router();

// Define routes
router.route('/checkout').post(checkout);
router.route('/basicpaymentverification').post(basicpaymentVerification);
router.route('/membershipCardPaymentVerification').post(membershipCardPaymentVerification);
router.route('/eventpaymentverification').post(eventpaymentVerification);
// router.route('/webhook').post(webhook);
app.use('/api', router);

// Endpoint to get Razorpay API key
app.get('/api/getkey', (req, res) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);


app.post('/api/saveEventOrder', async (req, res) => {
  try {
    const { order_id, email, eventName} = req.body;

    // Save the order details in your database
    const registration = await EventRegistration.findOne({ teamLeaderEmail: email, eventName });


        if (!registration) {
          return res.status(404).json({ error: 'Registration not found' });
        }
        registration.order_Id = order_id;
        await registration.save();
        console.log(registration);
    
        const payment_time= new Date();
        const order= new Order({
          order_id,
          email,
          payment_time,
          eventName:eventName,
        });
        await order.save();


    res.status(200).json({ success: true, message: "Order saved successfully" });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

app.post('/api/saveMemberOrder', async (req, res) => {
  try {
    const { order_id, email} = req.body;

    // Save the order details in your database
    const registration = await MembershipCard.findOne({ email: email });


        if (!registration) {
          return res.status(404).json({ error: 'Registration not found' });
        }
        registration.order_Id = order_id;
        await registration.save();
        console.log(registration);

    res.status(200).json({ success: true, message: "Order saved successfully" });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});
app.post('/api/saveBasicOrder', async (req, res) => {
  try {
    const { order_id, email} = req.body;

    // Save the order details in your database
    const registration = await BasicRegistration.findOne({ email: email });


        if (!registration) {
          return res.status(404).json({ error: 'Registration not found' });
        }
        registration.order_Id = order_id;
        await registration.save();
        console.log(registration);

    res.status(200).json({ success: true, message: "Order saved successfully" });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});


//Payment Route Ends

// app.all('*', (req, res, next) => {
//     next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
// });


app.post('/user/registrations', async (req, res) => {
  const email = req.body.email;


  try {
    const registrations = await BasicRegistration.find({ email });
    if (!registrations[0].payment_Id) {
      return res.status(404).json({ message: 'No registrations found' });
    }

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error });
  }
});


app.post('/user/member-card', async (req, res) => {
  const email = req.body.email;


  try {
    const registrations = await MembershipCard.find({ email });
    if (!registrations) {
      return res.status(404).json({ message: 'No registrations found' });
    }


    res.json(registrations[0].payment_Id);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching registrations', error });
  }
});


app.post('/registerevent', async (req, res) => {
  const { mainevent ,eventName, teamLeaderName, teamLeaderMobileNo, teamLeaderEmail, teamLeaderCollege, teamSize, teamLeaderGender, fees } = req.body;

  if (!mainevent || !eventName || !teamLeaderName || !teamLeaderMobileNo || !teamLeaderEmail || !teamLeaderCollege || !fees || teamSize === undefined) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  try {
    const existingRegistration = await EventRegistration.findOne({ teamLeaderEmail, eventName });

    if (existingRegistration) {
      return res.status(400).json({ error: 'A registration with this email already exists for this event.' });
    }
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }

  try {
    const registration = new EventRegistration({
      mainevent,
      eventName,
      teamLeaderName,
      teamLeaderMobileNo,
      teamLeaderEmail,
      teamLeaderCollege,
      teamSize,
      teamLeaderGender,
      fees
    });
    await registration.save();
    res.status(200).json({ success: true, message: 'Successfully added to Cart! Pay to complete registration process' });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ error: 'Error in adding event to cart. Please try again later.' });
  }
});


app.post('/cart/remove', async (req, res) => {
  const { eventName, userEmail } = req.body; // Ensure you use the correct field names

  try {
    // Delete documents matching the criteria
    const result = await EventRegistration.deleteMany({ teamLeaderEmail: userEmail, eventName: eventName });

    // Check if any documents were deleted
    if (result.deletedCount > 0) {
      res.json({ success: true, message: 'Item(s) removed successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Failed to remove item:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});
app.post('/cart/removeMember', async (req, res) => {
  const { userEmail } = req.body; // Ensure you use the correct field names

  try {
    // Delete documents matching the criteria
    const result = await MembershipCard.deleteMany({ email: userEmail});

    // Check if any documents were deleted
    if (result.deletedCount > 0) {
      res.json({ success: true, message: 'Item(s) removed successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    console.error('Failed to remove item:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
});


app.post('/user/events', async (req, res) => {
  const { email: userEmail } = req.body; // Use destructuring to get the email from the request body

  try {
    const cartItems = await EventRegistration.find({ teamLeaderEmail: userEmail, Paid: true });

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "No paid registrations found for this user." });
    }


    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching registration details:", error);
    res.status(500).json({ error: "Error fetching registration details", details: error.message });
  }
});



app.post('/cart', async (req, res) => {
  const userEmail = req.query.email;

  try {
    const cartItems = await EventRegistration.find({ teamLeaderEmail: userEmail, Paid: false });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cart items", details: error });
  }
});

app.post('/cart2', async (req, res) => {
  const userEmail = req.query.email;

  try {
    const cartItems = await BasicRegistration.find({ email: userEmail, Paid: false });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cart2 items", details: error });
  }
});
app.post('/cart3', async (req, res) => {
  const userEmail = req.query.email;

  try {
    const cartItems = await MembershipCard.find({ email: userEmail, Paid: false });
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cart3 items", details: error });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})

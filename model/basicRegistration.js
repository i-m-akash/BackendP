const mongoose = require("mongoose");

const basicregistrationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String,  },
      college: { type: String, },
    amount: { type: String, required: true },
    order_Id: { type: String  },
    Paid: { type: Boolean, required:true ,default:false }, 
    payment_Id: {
        type: String,
       
    },
    signature: {
        type: String,
        
    },

});

const BasicRegistration = mongoose.model('BasicRegistration', basicregistrationSchema);
module.exports = BasicRegistration;


const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
  },
  payment_id: {
    type: String,
    required: true,
  },
  payment_time: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["captured", "failed"], // This ensures the status can only be either "captured" or "failed"
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

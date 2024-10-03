const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  payment_time: {
    type: Date,
    required: true,
  },
  eventName: {
    type: String,
    required:true,
  },
  
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

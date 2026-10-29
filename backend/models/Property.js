const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  status: { type: String, enum: ['Available', 'Sold', 'Under Construction'], default: 'Available' },
  image: { type: String },
  description: { type: String },
  location: { type: String },
  totalShares: { type: Number, default: 100 },
  availableShares: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);
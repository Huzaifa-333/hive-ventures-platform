const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorName: { type: String, required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  propertyName: { type: String, required: true },
  amount: { type: Number, required: true },
  sharePercentage: { type: Number, default: 0 },
  sharesBought: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'sold', 'withdrawn'], default: 'active' },
  investmentDate: { type: Date, default: Date.now },
  exitDate: { type: Date },
  profitAmount: { type: Number, default: 0 },
  chequeIssued: { type: Boolean, default: false },
  chequeNumber: { type: String }
});

module.exports = mongoose.model('Investment', InvestmentSchema);
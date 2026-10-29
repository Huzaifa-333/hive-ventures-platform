const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['investor', 'admin'], default: 'investor' },
  email: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  age: { type: Number, min: 18, max: 100 },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
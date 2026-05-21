const mongoose = require('mongoose');

const WaitlistEmailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    source: { type: String, default: 'landing' },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WaitlistEmail', WaitlistEmailSchema);

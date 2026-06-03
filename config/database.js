const mongoose = require('mongoose');

const MONGO_URI =
  process.env.MONGO_URI

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (err) {
    console.error('[db] connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };

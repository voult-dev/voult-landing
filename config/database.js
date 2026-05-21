const mongoose = require('mongoose');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/usersEmail';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[db] connected → ${MONGO_URI}`);
  } catch (err) {
    console.error('[db] connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };

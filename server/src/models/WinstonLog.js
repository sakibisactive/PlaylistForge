const mongoose = require('mongoose');

const WinstonLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  level: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  meta: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('WinstonLog', WinstonLogSchema);

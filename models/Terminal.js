const mongoose = require('mongoose');

const terminalSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, unique: true },
    address: { type: String },
    city:    { type: String, required: true },
    region:  { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Terminal', terminalSchema);

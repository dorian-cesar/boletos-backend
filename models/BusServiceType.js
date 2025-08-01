// models/BusServiceType.js
const mongoose = require('mongoose');

const busServiceTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

module.exports = mongoose.model('BusServiceType', busServiceTypeSchema);

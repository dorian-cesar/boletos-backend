const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  region: { type: String, required: false },
  country: { type: String, default: 'Chile' }
});

module.exports = mongoose.model('City', citySchema);

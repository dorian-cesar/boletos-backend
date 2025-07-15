// models/ServiceTemplate.js

const mongoose = require('mongoose');

const serviceTemplateSchema = new mongoose.Schema({
  origin: String,
  destination: String,
  terminalOrigin: String,
  cancelado: { type: Boolean, default: false },
  terminalDestination: String,
  days: [Number],
  time: String,
  arrivalDate: String,
  arrivalTime: String,
  busLayout: String,
  busTypeDescription: String, // ejemplo: Salón-Cama-Premium
  priceFirst: Number,
  priceSecond: Number,

  seatDescriptionFirst: String,
  seatDescriptionSecond: String,
  price: Number, // opcional si se mantiene un precio base
  company: String
});

module.exports = mongoose.model('ServiceTemplate', serviceTemplateSchema);

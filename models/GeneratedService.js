// models/GeneratedService.js

const mongoose = require('mongoose');

const generatedServiceSchema = new mongoose.Schema({
  date: String,
  origin: String,
  destination: String,
  terminalOrigin: String,
  terminalDestination: String,
  departureTime: String,
  arrivalDate: String,
  arrivalTime: String,
  layout: String,
  busTypeDescription: String,
  priceFirst: Number,
  priceSecond: Number,
 
  seatDescriptionFirst: String,
  seatDescriptionSecond: String,
  seats: [{
    number: String,
    status: String,
    holdUntil: Date,
    reserved: Boolean,
    paid: Boolean,
    authCode: String,
    floor: Number // opcional si quieres distinguir primer y segundo piso
  }],
  price: Number,
  company: String,
    // 👇 Nuevos campos
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  crew: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


module.exports = mongoose.model('GeneratedService', generatedServiceSchema);

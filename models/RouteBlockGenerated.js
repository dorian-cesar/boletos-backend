const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: String,
  occupied: Boolean,
  passengerName: String,
  passengerDocument: String,
  reservedAt: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorizationCode: String,
  from: String,
  to: String
}, { _id: false });

const segmentSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  price: { type: Number },
  departureTime: { type: String },
  arrivalTime: { type: String }
}, { _id: false });

const routeBlockGeneratedSchema = new mongoose.Schema({
  routeBlock: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteBlock', required: true },
  date: { type: Date, required: true },

  // Antes: required: true, ahora opcional porque lo controlan los segments
  time: { type: String, required: false },  

  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'Layout' }, // 👈 NUEVO
  crew: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  seatMatrix: {
    type: Map,
    of: [seatSchema]
  },

  segments: [segmentSchema],

  availableSeats: { type: Number },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('RouteBlockGenerated', routeBlockGeneratedSchema);

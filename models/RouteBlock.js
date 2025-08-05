const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  order: { type: Number, required: true }
});

const routeBlockSchema = new mongoose.Schema({
  routeMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteMaster', required: true },
  name: { type: String, required: true }, // Ej: "Bloque Norte"
  segments: [segmentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RouteBlock', routeBlockSchema);

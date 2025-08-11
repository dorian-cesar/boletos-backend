const mongoose = require('mongoose');

const routeBlockSchema = new mongoose.Schema({
  routeMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteMaster', required: true },
  name: { type: String, required: true }, // Ej: "Bloque Sur", "Segmento 1"
  stops: [{
    name: { type: String, required: true },
    order: { type: Number, required: true }
  }],
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'Layout', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Opcional: para auditoría
}, {
  timestamps: true
});

module.exports = mongoose.model('RouteBlock', routeBlockSchema);

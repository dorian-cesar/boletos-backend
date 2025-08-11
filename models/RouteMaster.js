const mongoose = require('mongoose');

const routeMasterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ej: "Santiago - Puerto Montt"
  stops: [{
    name: { type: String, required: true }, // Ej: "Rancagua"
    order: { type: Number, required: true }  // Posición en la ruta
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('RouteMaster', routeMasterSchema);

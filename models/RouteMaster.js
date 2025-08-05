const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  city: { type: String, required: true },
  order: { type: Number, required: true } // orden lógico en la ruta
});

const routeMasterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ej: "Santiago - Puerto Montt"
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  stops: [stopSchema], // ciudades intermedias con orden
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RouteMaster', routeMasterSchema);

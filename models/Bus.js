// models/Bus.js
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  patente: { type: String, required: true, unique: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  revision_tecnica: { type: Date, required: true },
  permiso_circulacion: { type: Date, required: true },
  disponible: { type: Boolean, default: true },
  
  // Si deseas asociar cada bus a un layout específico:
  layout: { type: mongoose.Schema.Types.ObjectId, ref: 'Layout' }
});

module.exports = mongoose.model('Bus', busSchema);

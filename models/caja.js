// models/Caja.js
const mongoose = require('mongoose');

const cajaSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  fechaApertura: { type: Date, default: Date.now },
  fechaCierre: { type: Date },
  estado: { type: String, enum: ['abierta', 'cerrada'], default: 'abierta' },
  saldoInicial: { type: Number, default: 0 }
});

module.exports = mongoose.model('Caja', cajaSchema);

// models/Movimiento.js
const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  caja: { type: mongoose.Schema.Types.ObjectId, ref: 'Caja', required: true },
  tipo: { type: String, enum: ['ingreso', 'egreso'], required: true },
  medioPago: { type: String, enum: ['efectivo', 'tarjeta'], required: true },
  monto: { type: Number, required: true },
  servicioId: { type: String },
  origen: { type: String },
  destino: { type: String },
  horaSalida: { type: String },
  cliente: { type: String },
  descripcion: { type: String },
  fecha: { type: Date, default: Date.now },
  usuario: { type: String, required: true },
  nroTransaccion: { type: String },
  asientos: [{
    seat: String,
    floor: Number,
    price: Number
  }]
});

module.exports = mongoose.model('Movimiento', movimientoSchema);

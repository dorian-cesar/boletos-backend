// models/Layout.js
const mongoose = require('mongoose');

const layoutSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  rows: Number,
  columns: Number,
  pisos: Number,
  capacidad: Number,
  tipo_Asiento_piso_1: String,
  tipo_Asiento_piso_2: String,
  floor1: {
    seatMap: [[String]]
  },
  floor2: {
    seatMap: [[String]]
  }
});

module.exports = mongoose.model('Layout', layoutSchema);

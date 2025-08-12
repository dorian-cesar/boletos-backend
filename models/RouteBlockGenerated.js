const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: String,             // Ej: "1A"
  occupied: Boolean,              // true si está ocupado
  passengerName: String,          // Opcional
  passengerDocument: String,      // Opcional
  from: String,                   // Ciudad de origen del tramo reservado
  to: String ,                     // Ciudad de destino del tramo reservado
  reservedAt: { type: Date }       // ⬅️ Nueva fecha/hora de reserva
}, { _id: false });

const segmentSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  price: { type: Number, required: false},
  departureTime: { type: String, required:false },
  arrivalTime: { type: String, required:false }
}, { _id: false });

const routeBlockGeneratedSchema = new mongoose.Schema({
  routeBlock: { type: mongoose.Schema.Types.ObjectId, ref: 'RouteBlock', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // Ej: "14:00"

  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  crew: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Chofer, auxiliar, etc.

  seatMatrix: {                    // Estado actual de cada asiento
    type: Map,
    of: [seatSchema]           // Array de ocupación por tramo
  },

   segments: [segmentSchema],  // 👈 Aquí se guardan precios y horarios por tramo

  availableSeats: { type: Number }, // Campo calculado al crear

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});


module.exports = mongoose.model('RouteBlockGenerated', routeBlockGeneratedSchema);

const GeneratedService = require("../models/GeneratedService");
const mongoose = require('mongoose');

async function holdSeat(serviceId, seatNumber, userId) {
  const service = await GeneratedService.findById(serviceId);
  if (!service) throw new Error("Servicio no encontrado");

  const seat = service.seats.find((s) => s.number === seatNumber);
  if (!seat) throw new Error("Asiento no válido");

  if (seat.status === "available") {
    seat.status = "hold";
    seat.reserved = true;
    seat.holdUntil = new Date(Date.now() + 10 * 60 * 1000);
    await service.save();
    return { success: true };
  }

  throw new Error("Asiento no disponible");
}

async function confirmSeat(serviceId, seatNumber, authCode, userId) {
  const service = await GeneratedService.findById(serviceId);
  if (!service) throw new Error("Servicio no encontrado");

  const seat = service.seats.find((s) => s.number === seatNumber);
  if (!seat || seat.status !== "hold")
    throw new Error("Asiento no reservado o no válido");

  seat.status = "paid";
  seat.paid = true;
  seat.holdUntil = null;
  seat.authCode = authCode;
  seat.userId = new mongoose.Types.ObjectId(userId);
  service.markModified("seats");
  await service.save();

  return { success: true };
}
async function releaseSeat(serviceId, seatNumber) {
  const service = await GeneratedService.findById(serviceId);
  if (!service) throw new Error("Servicio no encontrado");

  const seat = service.seats.find((s) => s.number === seatNumber);
  if (!seat) throw new Error("Asiento no válido");

  // Solo se puede liberar un asiento que está en espera ('hold')
  if (seat.status !== "hold") {
    throw new Error(
      "El asiento no se puede liberar porque no está reservado o ya fue pagado."
    );
  }

  // Restaurar el estado del asiento a 'disponible'
  seat.status = "available";
  seat.reserved = false;
  seat.holdUntil = null;

  await service.save();
  return { success: true, message: "Asiento liberado correctamente." };
}

module.exports = {
  holdSeat,
  confirmSeat,
  releaseSeat, // ✅ Exportar la nueva función
};

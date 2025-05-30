const GeneratedService = require('../models/GeneratedService');

async function holdSeat(serviceId, seatNumber, userId) {
    const service = await GeneratedService.findById(serviceId);
    if (!service) throw new Error('Servicio no encontrado');

    const seat = service.seats.find(s => s.number === seatNumber);
    if (!seat) throw new Error('Asiento no válido');

    if (seat.status === 'available') {
        seat.status = 'hold';
        seat.reserved = true;
        seat.holdUntil = new Date(Date.now() + 10 * 60 * 1000);
        await service.save();
        return { success: true };
    }

    throw new Error('Asiento no disponible');
}

async function confirmSeat(serviceId, seatNumber, authCode) {
    const service = await GeneratedService.findById(serviceId);
    if (!service) throw new Error('Servicio no encontrado');

    const seat = service.seats.find(s => s.number === seatNumber);
    if (!seat || seat.status !== 'hold') throw new Error('Asiento no reservado o no válido');

    seat.status = 'paid';
    seat.paid = true;
    seat.holdUntil = null;
    seat.authCode = authCode;
    await service.save();

    return { success: true };
}

module.exports = { holdSeat, confirmSeat };
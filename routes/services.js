const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');
const layoutData = require('../layout.json');


router.get('/', async (req, res) => {
    const { origin, destination, date } = req.query;

    const services = await GeneratedService.find({
        origin,
        destination,
        date
    });

    res.json(services.map(s => ({
        id: s._id,
            origin: s.origin,
            destination: s.destination,
            date: s.date,
            departureTime: s.departureTime,
            arrivalDate: s.arrivalDate,
            arrivalTime: s.arrivalTime,
            layout: s.layout,
            price: s.price,
            priceFirst: s.priceFirst,
            priceSecond: s.priceSecond,
            company: s.company,
            busTypeDescription: s.busTypeDescription,
            seatDescriptionFirst: s.seatDescriptionFirst,
            seatDescriptionSecond: s.seatDescriptionSecond,
            terminalOrigin: s.terminalOrigin,
            terminalDestination: s.terminalDestination,
            availableSeats: s.seats.filter(seat => seat.status === 'available').length,
             layout: layoutData.layouts[s.layout] || null  // ← aquí incluimos el mapa del layout

    })));
});

router.get('/all', async (req, res) => {
  try {
    const services = await GeneratedService.find({});
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los servicios.' });
  }
});

const verifyToken = require('../middlewares/auth');

// Revertir asiento reservado
router.patch('/revert-seat', verifyToken, async (req, res) => {
    const { serviceId, seatNumber } = req.body;

    if (!serviceId || !seatNumber) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (serviceId, seatNumber).' });
    }

    try {
        const service = await GeneratedService.findById(serviceId);
        if (!service) return res.status(404).json({ error: 'Servicio no encontrado.' });

        const seat = service.seats.find(s => s.number === seatNumber);
        if (!seat) return res.status(404).json({ error: 'Asiento no encontrado.' });

        // Solo revertimos si estaba reservado o no disponible
        seat.status = "available";
        seat.holdUntil = null;
        seat.reserved = false;
        seat.paid = false;
        seat.authCode = null;

        await service.save();
        res.json({ message: 'Asiento revertido correctamente.' });
    } catch (error) {
        console.error("Error revirtiendo asiento:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});




module.exports = router;
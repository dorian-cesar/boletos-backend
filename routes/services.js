const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');

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
        price: s.price, // ✅ Agrega esto
        availableSeats: s.seats.filter(seat => seat.status === 'available').length
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

module.exports = router;
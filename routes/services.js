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
router.patch('/revert-seat',  async (req, res) => {
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


// GET /api/services/:id/seats
router.get('/:id/seats-detail', async (req, res) => {
    try {
        const service = await GeneratedService.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const layout = layoutData.layouts[service.layout];
        const structuredSeats = {
            firstFloor: [],
            secondFloor: []
        };

        // Piso 1
        if (layout.floor1 && layout.floor1.seatMap) {
            for (let row of layout.floor1.seatMap) {
                const rowSeats = row
                    .filter(seatNumber => seatNumber !== "")
                    .map(seatNumber => {
                        const seatData = service.seats.find(s => s.number === seatNumber);
                        return {
                            ...seatData.toObject(),
                            price: service.seatPrices?.firstFloor || service.price || 0,
                            floor: 'floor1'
                        };
                    });
                if (rowSeats.length) structuredSeats.firstFloor.push(rowSeats);
            }
        }

        // Piso 2
        if (layout.floor2 && layout.floor2.seatMap) {
            for (let row of layout.floor2.seatMap) {
                const rowSeats = row
                    .filter(seatNumber => seatNumber !== "")
                    .map(seatNumber => {
                        const seatData = service.seats.find(s => s.number === seatNumber);
                        return {
                            ...seatData.toObject(),
                            price: service.seatPrices?.secondFloor || service.price || 0,
                            floor: 'floor2'
                        };
                    });
                if (rowSeats.length) structuredSeats.secondFloor.push(rowSeats);
            }
        }

        res.json({
            serviceId: service._id,
            layout: service.layout,
            busTypeDescription: service.busTypeDescription,
          //  seatDescriptionFirst: service.seatDescriptions?.firstFloor || "",
          //  seatDescriptionSecond: service.seatDescriptions?.secondFloor || "",
          //  seatPrices: service.seatPrices || {},
            seats: structuredSeats
        });

    } catch (err) {
        console.error("Error en GET /api/services/:id/seats:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


module.exports = router;

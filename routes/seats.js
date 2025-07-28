const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');
const { holdSeat, confirmSeat, releaseSeat } = require('../utils/seatManager');

const verifyToken = require('../middlewares/auth');

// GET /api/seats/paid-only-seats
router.get('/paid-only-seats',  async (req, res) => {
    try {
        const paidSeats = await GeneratedService.aggregate([
            {
                // Paso 1: Filtra documentos que tengan el campo 'seats' Y que 'seats' sea un array
                // y que contenga al menos un elemento con 'paid: true'.
                // Esto maneja documentos donde 'seats' podría no existir o no ser un array.
                $match: {
                    "seats": { $exists: true, $type: "array" },
                    "seats.paid": true
                }
            },
            {
                // Paso 2: Descompone el array 'seats'.
                // Esto creará un nuevo documento para cada asiento.
                $unwind: "$seats"
            },
            {
                // Paso 3: Después de unwinding, filtra para obtener SOLO los asientos que están pagados.
                // Aquí 'seats' se refiere al objeto de asiento individual.
                $match: {
                    "seats.paid": true
                }
            },
            {
                // Paso 4: Proyecta los campos deseados y renombra 'seats' a 'seat'.
                $project: {
                    _id: 1, // Excluye el ID del documento principal
                    origin: 1,
                    destination: 1,
                    date:1,
                    departureTime:1,
                    seat: "$seats" // El asiento individual que estaba dentro del array
                }
            }
        ]);
        res.json(paidSeats);
    } catch (error) {
        console.error("Error al obtener solo asientos pagados:", error);
        res.status(500).json({ error: 'Error interno del servidor al obtener solo asientos pagados.' });
    }
});

router.get('/:serviceId', async (req, res) => {
    const service = await GeneratedService.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

    res.json(service.seats);
});

router.post('/:serviceId/reserve',verifyToken, async (req, res) => {
    const { seatNumber, userId } = req.body;

    try {
        const result = await holdSeat(req.params.serviceId, seatNumber, userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/:serviceId/confirm', verifyToken, async (req, res) => {
    const { seatNumber, userId, authCode } = req.body;

    try {
        const result = await confirmSeat(req.params.serviceId, seatNumber, authCode);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// 🚀 NUEVA RUTA PARA LIBERAR UN ASIENTO RESERVADO
router.post('/:serviceId/release', verifyToken, async (req, res) => {
    const { seatNumber } = req.body; // El cuerpo de la petición solo necesita el número del asiento

    if (!seatNumber) {
        return res.status(400).json({ error: 'El número de asiento (seatNumber) es requerido.' });
    }

    try {
        // Llama a la nueva función del seatManager

        console.log(req.params.serviceId);
        console.log(seatNumber);
        const result = await releaseSeat(req.params.serviceId, seatNumber);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});




module.exports = router;
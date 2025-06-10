const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');
const { holdSeat, confirmSeat, releaseSeat } = require('../utils/seatManager');

const verifyToken = require('../middlewares/auth');

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
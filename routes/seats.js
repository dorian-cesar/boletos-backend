const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');
const { holdSeat, confirmSeat } = require('../utils/seatManager');

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

module.exports = router;
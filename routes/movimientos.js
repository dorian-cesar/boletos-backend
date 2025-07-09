const express = require('express');
const Movimiento = require('../models/movimientos');
const Caja = require('../models/caja');
const router = express.Router();

// Registrar movimiento
router.post('/', async (req, res) => {
    try {
        const { caja: cajaId } = req.body;

        // Buscar la caja
        const caja = await Caja.findById(cajaId);
        if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });

        // Validar estado
        if (caja.estado === 'cerrada') {
            return res.status(400).json({ error: 'No se pueden registrar movimientos en una caja cerrada' });
        }

        // Guardar movimiento
        const mov = new Movimiento(req.body);
        const guardado = await mov.save();
        res.status(201).json(guardado);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener movimientos por caja
router.get('/caja/:cajaId', async (req, res) => {
    try {
        const movimientos = await Movimiento.find({ caja: req.params.cajaId });
        res.json(movimientos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

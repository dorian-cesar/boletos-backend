const express = require('express');
const Caja = require('../models/caja');
const router = express.Router();

// Abrir caja
router.post('/', async (req, res) => {
  try {
    const caja = new Caja({
      usuario: req.body.usuario,
      saldoInicial: req.body.saldoInicial || 0
    });
    const guardada = await caja.save();
    res.status(201).json(guardada);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cerrar caja
router.put('/:id/cerrar', async (req, res) => {
  try {
    const caja = await Caja.findById(req.params.id);
    if (!caja) return res.status(404).json({ error: 'Caja no encontrada' });
    if (caja.estado === 'cerrada') return res.status(400).json({ error: 'Caja ya cerrada' });

    caja.estado = 'cerrada';
    caja.fechaCierre = new Date();
    await caja.save();

    res.json(caja);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

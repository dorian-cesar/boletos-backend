const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// Crear un bus
router.post('/', async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos los buses
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find().populate('layout');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un bus por ID
router.get('/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('layout');
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un bus por ID
router.put('/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });
    res.json(bus);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar un bus por ID
router.delete('/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });
    res.json({ mensaje: 'Bus eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

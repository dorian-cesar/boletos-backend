const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');
const Bus = require('../models/Bus');
const User = require('../models/User');
const mongoose = require('mongoose');

router.post('/asignar', async (req, res) => {
  const { servicioId, busId, tripulacion } = req.body;

  console.log('Asignacion');

  if (!mongoose.Types.ObjectId.isValid(servicioId) || !mongoose.Types.ObjectId.isValid(busId)) {
    return res.status(400).json({ error: 'ID de servicio o bus no válido.' });
  }

  try {
    // Verificar existencia de servicio
    const servicio = await GeneratedService.findById(servicioId);
    if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado.' });

    // Verificar existencia de bus
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado.' });

    // Validar tripulación
    if (!Array.isArray(tripulacion) || tripulacion.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un integrante en la tripulación.' });
    }

    const usuarios = await User.find({ _id: { $in: tripulacion } });

    if (usuarios.length !== tripulacion.length) {
      return res.status(400).json({ error: 'Uno o más miembros de la tripulación no existen.' });
    }

    const roles = usuarios.map(u => u.role);
    const choferes = roles.filter(r => r === 'chofer').length;
    const auxiliares = roles.filter(r => r === 'auxiliar').length;

    if (choferes < 1 || choferes > 2 || auxiliares !== 1) {
      return res.status(400).json({ 
        error: 'Debe asignar entre 1 y 2 choferes, y exactamente 1 auxiliar.'
      });
    }

    // Asignar
    servicio.bus = busId;
    servicio.crew = tripulacion;
    await servicio.save();

    res.json({ mensaje: 'Bus y tripulación asignados correctamente.', servicio });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Endpoint GET /api/servicios/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID de servicio no válido.' });
  }

  try {
    const servicio = await GeneratedService.findById(id)
      .populate('bus')   // Poblar los datos del bus
      .populate('crew'); // Poblar los datos de los usuarios (choferes/auxiliares)

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/routeMasterController');

// Crear nueva Ruta Maestra
router.post('/', controller.createRouteMaster);

// Obtener todas
router.get('/', controller.getAllRouteMasters);

// Obtener una por ID
router.get('/:id', controller.getRouteMasterById);

router.delete('/:id', controller.deleteRouteMaster);


module.exports = router;

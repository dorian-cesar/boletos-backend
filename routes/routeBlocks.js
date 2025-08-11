const express = require('express');
const router = express.Router();
const controller = require('../controllers/routeBlockController');

// Crear bloque
router.post('/', controller.createRouteBlock);

// Obtener todos los bloques
router.get('/', controller.getAllRouteBlocks);

// Obtener por ID
router.get('/:id', controller.getRouteBlockById);

// Editar
router.put('/:id', controller.updateRouteBlock);

// Eliminar
router.delete('/:id', controller.deleteRouteBlock);

router.get('/byRouteMaster/:routeMasterId', controller.getRouteBlocksByRouteMaster);

module.exports = router;

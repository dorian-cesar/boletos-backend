const express = require('express');
const router = express.Router();
const routeMasterController = require('../controllers/routeMasterController');

router.post('/', routeMasterController.createRouteMaster);
router.get('/', routeMasterController.getAllRoutes);
router.get('/:id', routeMasterController.getRouteById);
router.put('/:id', routeMasterController.updateRoute);
router.delete('/:id', routeMasterController.deleteRoute);

module.exports = router;

const express = require('express');
const router = express.Router();
const routeBlockController = require('../controllers/routeBlockController');

router.post('/', routeBlockController.createRouteBlock);
router.get('/route/:routeMasterId', routeBlockController.getBlocksByRoute);
router.get('/:id', routeBlockController.getBlockById);
router.put('/:id', routeBlockController.updateBlock);
router.delete('/:id', routeBlockController.deleteBlock);

module.exports = router;

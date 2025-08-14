const express = require('express');
const router = express.Router();
const routeBlockGeneratedController = require('../controllers/routeBlockGeneratedController');

// POST /api/route-block-generated/generate
router.post('/generate', routeBlockGeneratedController.generateRouteBlock);

//router.get('/generate', routeBlockGeneratedController.getAvailability);

router.get('/:id/availability', routeBlockGeneratedController.getAvailability);

router.post('/:id/reserve', routeBlockGeneratedController.reserveSeat);
router.get('/:id/seat-matrix', routeBlockGeneratedController.getSeatMatrix);
router.post('/:id/release-seat', routeBlockGeneratedController.releaseSeat);
router.get('/search', routeBlockGeneratedController.searchServices);

router.get('/city-combinations', routeBlockGeneratedController.getCityCombinationsByDate);

router.put('/routeBlockGenerated/:id/updateSegments', routeBlockGeneratedController.updateSegments);

// Confirmar pago (añade userId y authorizationCode)
router.post('/:id/confirm-payment', routeBlockGeneratedController.confirmPayment);

router.post('/generate-future', routeBlockGeneratedController.generateRouteBlockFuture);


module.exports = router;
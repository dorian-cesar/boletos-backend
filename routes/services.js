const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');

const BusLayout = require('../models/Layout');
const moment = require('moment');





const ServiceTemplate = require('../models/ServiceTemplate');


router.get('/', async (req, res) => {
    const { origin, destination, date } = req.query;

    const services = await GeneratedService.find({
        origin,
        destination,
        date,
        cancelado: { $ne: true } // ⬅️ este filtro es clave
    });

    const results = await Promise.all(services.map(async (s) => {
        const layoutDoc = await BusLayout.findOne({ name: s.layout });
        return {
            id: s._id,
            origin: s.origin,
            destination: s.destination,
            date: s.date,
            departureTime: s.departureTime,
            arrivalDate: s.arrivalDate,
            arrivalTime: s.arrivalTime,
            layout: s.layout,
            price: s.price,
            priceFirst: s.priceFirst,
            priceSecond: s.priceSecond,
            company: s.company,
            busTypeDescription: s.busTypeDescription,
            seatDescriptionFirst: s.seatDescriptionFirst,
            seatDescriptionSecond: s.seatDescriptionSecond,
            terminalOrigin: s.terminalOrigin,
            terminalDestination: s.terminalDestination,
            availableSeats: s.seats.filter(seat => seat.status === 'available').length,
            seatLayout: layoutDoc || null
        };
    }));

    res.json(results);
});


router.get('/all', async (req, res) => {
    try {
        const services = await GeneratedService.find({});
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los servicios.' });
    }
});

const verifyToken = require('../middlewares/auth');

// Revertir asiento reservado
router.patch('/revert-seat', async (req, res) => {
    const { serviceId, seatNumber } = req.body;

    if (!serviceId || !seatNumber) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos (serviceId, seatNumber).' });
    }

    try {
        const service = await GeneratedService.findById(serviceId);
        if (!service) return res.status(404).json({ error: 'Servicio no encontrado.' });

        const seat = service.seats.find(s => s.number === seatNumber);
        if (!seat) return res.status(404).json({ error: 'Asiento no encontrado.' });

        // Solo revertimos si estaba reservado o no disponible
        seat.status = "available";
        seat.holdUntil = null;
        seat.reserved = false;
        seat.paid = false;
        seat.authCode = null;

        await service.save();
        res.json({ message: 'Asiento revertido correctamente.' });
    } catch (error) {
        console.error("Error revirtiendo asiento:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// GET /api/services/:id/seats
router.get('/:id/seats-detail', async (req, res) => {
    try {
        const service = await GeneratedService.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const layoutDoc = await BusLayout.findOne({ name: service.layout }); // ✅ ahora sí válido dentro de async
        if (!layoutDoc) return res.status(404).json({ error: 'Layout no encontrado en base de datos' });

        const structuredSeats = { firstFloor: [], secondFloor: [] };

        // Piso 1
        if (layoutDoc.floor1?.seatMap) {
            for (let row of layoutDoc.floor1.seatMap) {
                const rowSeats = row
                    .filter(seatNumber => seatNumber !== "")
                    .map(seatNumber => {
                        const seatData = service.seats.find(s => s.number === seatNumber);
                        return {
                            ...seatData.toObject(),
                            price: service.seatPrices?.firstFloor || service.price || 0,
                            floor: 'floor1'
                        };
                    });
                if (rowSeats.length) structuredSeats.firstFloor.push(rowSeats);
            }
        }

        // Piso 2
        if (layoutDoc.floor2?.seatMap) {
            for (let row of layoutDoc.floor2.seatMap) {
                const rowSeats = row
                    .filter(seatNumber => seatNumber !== "")
                    .map(seatNumber => {
                        const seatData = service.seats.find(s => s.number === seatNumber);
                        return {
                            ...seatData.toObject(),
                            price: service.seatPrices?.secondFloor || service.price || 0,
                            floor: 'floor2'
                        };
                    });
                if (rowSeats.length) structuredSeats.secondFloor.push(rowSeats);
            }
        }

        res.json({
            serviceId: service._id,
            layout: service.layout,
            pisos: layoutDoc.pisos,
            capacidad: layoutDoc.capacidad,
            busTypeDescription: service.busTypeDescription,
            tipo_Asiento_piso_1: layoutDoc.tipo_Asiento_piso_1,
            tipo_Asiento_piso_2: layoutDoc.tipo_Asiento_piso_2,

            seats: structuredSeats
        });

    } catch (err) {
        console.error("Error en GET /api/services/:id/seats-detail:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/servicios/terminar?origen=Santiago&destino=Valparaiso&hora=14:00&desde=2025-07-20



router.patch('/cancelar', async (req, res) => {
  const { origen, destino, hora, desde } = req.body;

  if (!origen || !destino || !hora || !desde) {
    return res.status(400).json({
      error: 'Faltan parámetros. Se requieren: origen, destino, hora y desde.'
    });
  }

  if (!moment(desde, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Fecha "desde" inválida. Usa formato YYYY-MM-DD.' });
  }

  try {
    // 1. Cancelar servicios desde la fecha indicada
    const serviciosCancelados = await GeneratedService.updateMany(
      {
        origin: origen,
        destination: destino,
        departureTime: hora,
        date: { $gte: desde }
      },
      { $set: { cancelado: true } }
    );

    // 2. Cancelar la plantilla correspondiente
    const plantillaCancelada = await ServiceTemplate.updateOne(
      {
        origin: origen,
        destination: destino,
        time: hora
      },
      { $set: { cancelado: true } }
    );

    res.json({
      message: `✅ ${serviciosCancelados.modifiedCount} servicios cancelados desde ${desde}`,
      plantillaCancelada: plantillaCancelada.modifiedCount > 0,
      filtros: { origen, destino, hora, desde }
    });
  } catch (error) {
    console.error('❌ Error al cancelar servicios y plantilla:', error);
    res.status(500).json({ error: 'Error interno al cancelar servicios y plantilla' });
  }
});

module.exports = router;


module.exports = router;

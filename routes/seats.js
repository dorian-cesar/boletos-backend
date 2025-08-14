const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const GeneratedService = require("../models/GeneratedService");
const BusLayout = require('../models/Layout');
const { holdSeat, confirmSeat, releaseSeat } = require("../utils/seatManager");

const verifyToken = require("../middlewares/auth");

// GET /api/seats/paid-only-seats
router.get("/paid-only-seats", async (req, res) => {
  const { userId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "userId no es un ObjectId válido" });
  }
  console.log("userId de /paid-only-seats", userId);
  try {
    // Buscar servicios que tengan al menos un asiento pagado por este usuario
    const services = await GeneratedService.find({
      "seats.paid": true,
      "seats.userId": new mongoose.Types.ObjectId(userId),
    });
    const results = await Promise.all(
      services.map(async (service) => {
        const layoutDoc = await BusLayout.findOne({ name: service.layout });
        if (!layoutDoc) {
          return null; // Si no hay layout, lo saltamos
        }

        const structuredSeats = { firstFloor: [], secondFloor: [] };

        // Piso 1
        if (layoutDoc.floor1?.seatMap) {
          for (let row of layoutDoc.floor1.seatMap) {
            const rowSeats = row
              .filter((seatNumber) => seatNumber !== "")
              .map((seatNumber) => {
                const seatData = service.seats.find(
                  (s) =>
                    s.number === seatNumber &&
                    s.paid === true &&
                    String(s.userId) === userId
                );
                return seatData
                  ? {
                      ...seatData.toObject(),
                      price: service.priceFirst || service.price || 0,
                      floor: "floor1",
                    }
                  : null;
              })
              .filter(Boolean); // quitar nulos
            if (rowSeats.length) structuredSeats.firstFloor.push(rowSeats);
          }
        }

        // Piso 2
        if (layoutDoc.floor2?.seatMap) {
          for (let row of layoutDoc.floor2.seatMap) {
            const rowSeats = row
              .filter((seatNumber) => seatNumber !== "")
              .map((seatNumber) => {
                const seatData = service.seats.find(
                  (s) =>
                    s.number === seatNumber &&
                    s.paid === true &&
                    String(s.userId) === userId
                );
                return seatData
                  ? {
                      ...seatData.toObject(),
                      price: service.priceSecond || service.price || 0,
                      floor: "floor2",
                    }
                  : null;
              })
              .filter(Boolean);
            if (rowSeats.length) structuredSeats.secondFloor.push(rowSeats);
          }
        }

        return {
          serviceId: service._id,
          origin: service.origin,
          destination: service.destination,
          terminalOrigin: service.terminalOrigin,
          terminalDestination: service.terminalDestination,
          date: service.date,
          departureTime: service.departureTime,
          arrivalDate: service.arrivalDate,
          arrivalTime: service.arrivalTime,
          company: service.company,
          busTypeDescription: service.busTypeDescription,
          tipo_Asiento_piso_1: layoutDoc.tipo_Asiento_piso_1,
          tipo_Asiento_piso_2: layoutDoc.tipo_Asiento_piso_2,
          layout: layoutDoc.name,
          pisos: layoutDoc.pisos,
          capacidad: layoutDoc.capacidad,
          seats: structuredSeats,
        };
      })
    );

    res.json(results.filter(Boolean)); // quitar nulls por layouts no encontrados
  } catch (error) {
    console.error("Error en /paid-only-seats:", error);
    res.status(500).json({
      error: "Error interno del servidor al obtener asientos pagados.",
    });
  }
});

router.get("/:serviceId", async (req, res) => {
  const service = await GeneratedService.findById(req.params.serviceId);
  if (!service)
    return res.status(404).json({ error: "Servicio no encontrado" });

  res.json(service.seats);
});

router.post("/:serviceId/reserve", verifyToken, async (req, res) => {
  const { seatNumber, userId } = req.body;

  try {
    const result = await holdSeat(req.params.serviceId, seatNumber, userId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:serviceId/confirm", verifyToken, async (req, res) => {
  const { seatNumber, userId, authCode } = req.body;

  try {
    const result = await confirmSeat(
      req.params.serviceId,
      seatNumber,
      authCode,
      userId
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🚀 NUEVA RUTA PARA LIBERAR UN ASIENTO RESERVADO
router.post("/:serviceId/release", verifyToken, async (req, res) => {
  const { seatNumber } = req.body; // El cuerpo de la petición solo necesita el número del asiento

  if (!seatNumber) {
    return res
      .status(400)
      .json({ error: "El número de asiento (seatNumber) es requerido." });
  }

  try {
    // Llama a la nueva función del seatManager

    console.log(req.params.serviceId);
    console.log(seatNumber);
    const result = await releaseSeat(req.params.serviceId, seatNumber);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

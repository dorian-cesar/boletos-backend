const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const GeneratedService = require("../models/GeneratedService");
const User = require("../models/User");
const { holdSeat, confirmSeat, releaseSeat } = require("../utils/seatManager");

const verifyToken = require("../middlewares/auth");

// GET /api/seats/paid-only-seats
router.get("/paid-only-seats", async (req, res) => {
  const { userId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "userId no es un ObjectId válido." });
  }

  try {
    const paidSeats = await GeneratedService.aggregate([
      {
        // Filtrar documentos que tengan 'seats' como array y al menos un asiento pagado
        $match: {
          seats: { $exists: true, $type: "array" },
          "seats.paid": true,
        },
      },
      {
        // Descomponer array seats
        $unwind: "$seats",
      },
      {
        // Filtrar asientos pagados y con el userId especificado
        $match: {
          "seats.paid": true,
          "seats.userId": new mongoose.Types.ObjectId(userId),
        },
      },
      {
        // Proyectar los campos necesarios
        $project: {
          _id: 1,
          origin: 1,
          destination: 1,
          date: 1,
          departureTime: 1,
          seat: "$seats",
        },
      },
    ]);

    res.json(paidSeats);
  } catch (error) {
    console.error("Error al obtener solo asientos pagados:", error);
    res.status(500).json({
      error: "Error interno del servidor al obtener solo asientos pagados.",
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

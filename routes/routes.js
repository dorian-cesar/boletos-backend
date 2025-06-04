const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');

// GET /api/routes/origins - Lista de orígenes con sus destinos únicos
router.get('/origins', async (req, res) => {
    try {
        const rutas = await GeneratedService.aggregate([
            {
                $group: {
                    _id: "$origin",
                    destinos: { $addToSet: "$destination" }
                }
            },
            {
                $project: {
                    _id: 0,
                    origen: "$_id",
                    destinos: 1
                }
            },
            {
                $sort: { origen: 1 }
            }
        ]);

        res.json(rutas);
    } catch (error) {
        console.error("❌ Error al obtener orígenes y destinos:", error);
        res.status(500).json({ error: "Error al obtener datos" });
    }
});

module.exports = router;

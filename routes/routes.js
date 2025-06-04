const express = require('express');
const router = express.Router();
const GeneratedService = require('../models/GeneratedService');

// GET /api/routes/origins - Devuelve origenes con sus destinos
router.get('/origins', async (req, res) => {
    try {
        const result = await GeneratedService.aggregate([
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
            { $sort: { origen: 1 } }
        ]);

        res.json(result);
    } catch (err) {
        console.error("❌ Error al obtener rutas:", err);
        res.status(500).json({ error: "Error al obtener rutas" });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const ServiceTemplate = require('../models/ServiceTemplate');
const GeneratedService = require('../models/GeneratedService');
const moment = require('moment');
const layoutData = require('../layout.json');

router.post('/create', async (req, res) => {
    try {
        const {
            origin,
            destination,
            startDate, // formato esperado: 'YYYY-MM-DD'
            days,      // array de días: [1, 2, 3, 4, 5, 6, 7]
            time,      // formato: 'HH:mm'
            busLayout,
            price
        } = req.body;

        // Validación básica
        if (!origin || !destination || !startDate || !days || !time || !busLayout || !price) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }


        const existingTemplate = await ServiceTemplate.findOne({
            origin,
            destination,
            time,
            busLayout,
            days: { $in: days } // coincide al menos un día
        });

        if (existingTemplate) {
            return res.status(400).json({ error: 'Ya existe una plantilla con estos datos.' });
        }


        // Crear plantilla
        await ServiceTemplate.create({
            origin,
            destination,
            days,
            time,
            busLayout,
            price
        });

        // Generar servicios iniciales a partir de la fecha de inicio
        const layout = layoutData.layouts[busLayout];
        const seatNumbers = layout.seatMap.flat().filter(seat => seat !== "");

        const seats = seatNumbers.map(number => ({
            number,
            status: 'available',
            holdUntil: null,
            reserved: false,
            paid: false,
            authCode: null
        }));

        const today = moment(startDate);
        const daysToGenerate = 14;

        for (let i = 0; i < daysToGenerate; i++) {
            const targetDate = today.clone().add(i, 'days');
            const dayOfWeek = targetDate.isoWeekday(); // 1 (Lunes) a 7 (Domingo)

            if (days.includes(dayOfWeek)) {
                const exists = await GeneratedService.findOne({
                    origin,
                    destination,
                    date: targetDate.format('YYYY-MM-DD'),
                    departureTime: time
                });

                if (!exists) {
                    await GeneratedService.create({
                        origin,
                        destination,
                        date: targetDate.format('YYYY-MM-DD'),
                        departureTime: time,
                        layout: busLayout,
                        seats,
                        price
                    });
                }
            }
        }

        res.json({ success: true, message: 'Plantilla y servicios iniciales creados.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la plantilla de servicio' });
    }
});

module.exports = router;

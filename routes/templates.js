const express = require('express');
const router = express.Router();
const ServiceTemplate = require('../models/ServiceTemplate');
const GeneratedService = require('../models/GeneratedService');
const moment = require('moment');
//const layoutData = require('../layout.json');

const layoutData = require('../models/Layout');

router.post('/create', async (req, res) => {
    try {
        const {
            origin,
            destination,
            startDate, // formato: 'YYYY-MM-DD'
            days, // array de días: [1, 2, 3, 4, 5, 6, 7]
            time, // formato: 'HH:mm'
            busLayout,
            company,
            busTypeDescription,
            seatDescriptionFirst,
            seatDescriptionSecond,
            priceFirst,
            priceSecond,
            terminalOrigin,
            terminalDestination,
            arrivalDate,  // formato: 'YYYY-MM-DD'
            arrivalTime   // formato: 'HH:mm'
        } = req.body;

        if (!origin || !destination || !startDate || !days || !time || !busLayout || !company || !busTypeDescription || !terminalOrigin || !terminalDestination || !arrivalDate || !arrivalTime) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const existingTemplate = await ServiceTemplate.findOne({
            origin,
            destination,
            time,
            busLayout,
            days: { $in: days }
        });

        if (existingTemplate) {
            return res.status(400).json({ error: 'Ya existe una plantilla con estos datos.' });
        }

        await ServiceTemplate.create({
            origin,
            destination,
            days,
            time,
            busLayout,
            priceFirst,
            priceSecond,

            seatDescriptionFirst,
            seatDescriptionSecond,
            terminalOrigin,
            terminalDestination,
            arrivalDate,
            arrivalTime,
            company,
            startDate  // <-- ✅ Esto es importante
        });

        const layout = layoutData.layouts[busLayout];
       



        let seatNumbers = [];

        if (layout.seatMap) {
            // Layout plano
            seatNumbers = layout.seatMap.flat().filter(seat => seat !== "");
        } else if (layout.floor1 || layout.floor2) {
            // Layout con pisos
            if (layout.floor1 && layout.floor1.seatMap) {
                seatNumbers = seatNumbers.concat(layout.floor1.seatMap.flat().filter(seat => seat !== ""));
            }
            if (layout.floor2 && layout.floor2.seatMap) {
                seatNumbers = seatNumbers.concat(layout.floor2.seatMap.flat().filter(seat => seat !== ""));
            }
        }

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
            const dayOfWeek = targetDate.isoWeekday(); // 1 = Lunes, 7 = Domingo

            if (days.includes(dayOfWeek)) {
                const exists = await GeneratedService.findOne({
                    origin,
                    destination,
                    date: targetDate.format('YYYY-MM-DD'),
                    departureTime: time
                });

                if (!exists) {
                        const dynamicArrivalDate = moment(arrivalDate).clone().add(i, 'days').format('YYYY-MM-DD');

                    await GeneratedService.create({
                        origin,
                        destination,
                        date: targetDate.format('YYYY-MM-DD'),
                        departureTime: time,
                        layout: busLayout,
                        seats,
                        company,
                        busTypeDescription,
                        seatDescriptionFirst,
                        seatDescriptionSecond,
                        priceFirst,
                        priceSecond,
                        terminalOrigin,
                        terminalDestination,
                        arrivalDate :dynamicArrivalDate,
                        arrivalTime
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

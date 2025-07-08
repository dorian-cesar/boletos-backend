const express = require('express');
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');
const moment = require('moment');
const ServiceTemplate = require('../models/ServiceTemplate');
const GeneratedService = require('../models/GeneratedService');
//const layoutData = require('../layout.json');

const layoutData = require('../models/Layout');

const verifyToken = require('../middlewares/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const generateFromTemplate = async (template, startDate, daysToGenerate = 14) => {
    for (let i = 0; i < daysToGenerate; i++) {
        const targetDate = moment(startDate).add(i, 'days');
        const dayOfWeek = targetDate.isoWeekday();

        if (!template.days.includes(dayOfWeek)) continue;

        const exists = await GeneratedService.findOne({
            date: targetDate.format('YYYY-MM-DD'),
            origin: template.origin,
            destination: template.destination,
            departureTime: template.time,
        });

        if (!exists) {
             const layout = layoutData.layouts[template.busLayout];
            // const seatNumbers = layout.seatMap.flat().filter(seat => seat !== "");

           // const layout = layoutData.layouts[template.busLayout];

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
                status: "available",
                holdUntil: null,
                reserved: false,
                paid: false,
                authCode: null
            }));

            await GeneratedService.create({
                date: targetDate.format('YYYY-MM-DD'),
                origin: template.origin,
                destination: template.destination,
                departureTime: template.time,
                layout: template.busLayout,
                seats,
                company: template.company,
                busTypeDescription: template.busTypeDescription,
                seatDescriptionFirst: template.seatDescriptionFirst,
                seatDescriptionSecond: template.seatDescriptionSecond,
                priceFirst: parseInt(template.priceFirst, 10),
                priceSecond: parseInt(template.priceSecond, 10),
                terminalOrigin: template.terminalOrigin,
                terminalDestination: template.terminalDestination,
                arrivalDate: template.arrivalDate,
                arrivalTime: template.arrivalTime
            });
        }
    }
};

router.post('/upload-services', verifyToken, upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const templates = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            try {
                const parsedDays = JSON.parse(row.days);
                templates.push({
                    origin: row.origin,
                    destination: row.destination,
                    startDate: row.startDate,
                    days: parsedDays,
                    time: row.time,
                    busLayout: row.busLayout,
                    company: row.company,
                    busTypeDescription: row.busTypeDescription,
                    seatDescriptionFirst: row.seatDescriptionFirst,
                    seatDescriptionSecond: row.seatDescriptionSecond,
                    priceFirst: row.priceFirst,
                    priceSecond: row.priceSecond,
                    terminalOrigin: row.terminalOrigin,
                    terminalDestination: row.terminalDestination,
                    arrivalDate: row.arrivalDate,
                    arrivalTime: row.arrivalTime
                });
            } catch (err) {
                console.error("Error procesando fila:", row, err.message);
            }
        })
        .on('end', async () => {
            for (const tpl of templates) {
                await ServiceTemplate.create({
                    origin: tpl.origin,
                    destination: tpl.destination,
                    days: tpl.days,
                    time: tpl.time,
                    startDate: tpl.startDate,
                    busLayout: tpl.busLayout,
                    company: tpl.company,
                    busTypeDescription: tpl.busTypeDescription,
                    seatDescriptionFirst: tpl.seatDescriptionFirst,
                    seatDescriptionSecond: tpl.seatDescriptionSecond,
                    priceFirst: parseInt(tpl.priceFirst, 10),
                    priceSecond: parseInt(tpl.priceSecond, 10),
                    terminalOrigin: tpl.terminalOrigin,
                    terminalDestination: tpl.terminalDestination,
                    arrivalDate: tpl.arrivalDate,
                    arrivalTime: tpl.arrivalTime
                });

                await generateFromTemplate(tpl, tpl.startDate);
            }

            fs.unlinkSync(filePath);
            res.json({ message: 'Servicios cargados y generados con éxito', count: templates.length });
        });
});

module.exports = router;

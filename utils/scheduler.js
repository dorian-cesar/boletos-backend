const cron = require('node-cron');
const ServiceTemplate = require('../models/ServiceTemplate');
const GeneratedService = require('../models/GeneratedService');
const moment = require('moment');
//const layoutData = require('../layout.json');

const layoutData = require('../models/Layout');

const generateServices = async () => {
    console.log("📦 generateServices() iniciado", new Date().toISOString());
    const daysToGenerate = 7;

    // Buscar todas las plantillas
    //const allTemplates = await ServiceTemplate.find({});
    const allTemplates = await ServiceTemplate.find({ cancelado: { $ne: true } });

    for (const tpl of allTemplates) {
        // Buscar último servicio generado para esta plantilla específica
        const lastGenerated = await GeneratedService.findOne({
            origin: tpl.origin,
            destination: tpl.destination,
            departureTime: tpl.time,
            cancelado: { $ne: true } // ⬅️ aquí se ignoran los cancelados
        }).sort({ date: -1 }).limit(1);

        const startDate = lastGenerated
            ? moment(lastGenerated.date).add(1, 'days') // Siguiente día
            : moment(); // Si no hay servicios generados aún

        console.log(`🛠️ Procesando plantilla: ${tpl.origin} → ${tpl.destination} @ ${tpl.time}`);
        console.log(`🗓️ Generando desde: ${startDate.format('YYYY-MM-DD')} por ${daysToGenerate} días`);

        for (let i = 0; i < daysToGenerate; i++) {
            const targetDate = startDate.clone().add(i, 'days');
            const dayOfWeek = targetDate.isoWeekday();

            // Solo generar si la plantilla indica que ese día debe operar
            if (!tpl.days.includes(dayOfWeek)) continue;

            const existing = await GeneratedService.findOne({
                date: targetDate.format('YYYY-MM-DD'),
                origin: tpl.origin,
                destination: tpl.destination,
                departureTime: tpl.time
            });

            if (existing) {
                console.log(`⚠️ Ya existe servicio para ${targetDate.format('YYYY-MM-DD')}`);
                continue;
            }

            // Buscar layout asociado
           // console.log(`🔎 Buscando layout: ${tpl.busLayout}`);
            const layout = await layoutData.findOne({ name: tpl.busLayout });

            if (!layout) {
                console.error(`❌ Layout no encontrado en DB: ${tpl.busLayout}`);
                continue;
            }

            // Armar mapa de asientos
            let seatNumbers = [];

            if (layout.floor1 && layout.floor1.seatMap) {
                seatNumbers = seatNumbers.concat(layout.floor1.seatMap.flat().filter(seat => seat !== ""));
            }

            if (layout.floor2 && layout.floor2.seatMap) {
                seatNumbers = seatNumbers.concat(layout.floor2.seatMap.flat().filter(seat => seat !== ""));
            }

            const seats = seatNumbers.map(number => ({
                number,
                status: "available",
                holdUntil: null,
                reserved: false,
                paid: false,
                authCode: null
            }));

            // Crear el servicio generado
            await GeneratedService.create({
                date: targetDate.format('YYYY-MM-DD'),
                origin: tpl.origin,
                destination: tpl.destination,
                departureTime: tpl.time,
                layout: tpl.busLayout,
                seats,
                company: tpl.company,
                busTypeDescription: tpl.busTypeDescription,
                seatDescriptionFirst: tpl.seatDescriptionFirst,
                seatDescriptionSecond: tpl.seatDescriptionSecond,
                priceFirst: tpl.priceFirst,
                priceSecond: tpl.priceSecond,
                terminalOrigin: tpl.terminalOrigin,
                terminalDestination: tpl.terminalDestination,
                arrivalDate: tpl.arrivalDate,
                arrivalTime: tpl.arrivalTime
            });

            console.log(`✅ Servicio generado para ${targetDate.format('YYYY-MM-DD')}`);
        }
    }

    console.log("✅ Finalizó generateServices", new Date().toISOString());
};


const cleanExpiredHolds = async () => {
    const now = new Date();
    const services = await GeneratedService.find({ 'seats.holdUntil': { $lt: now } });

    for (const service of services) {
        let modified = false;

        service.seats.forEach(seat => {
            if (seat.holdUntil && seat.holdUntil < now && !seat.paid) {
                seat.status = "available";
                seat.holdUntil = null;
                seat.reserved = false;
                seat.authCode = null;
                modified = true;
            }
        });

        if (modified) await service.save();
    }
};

const startScheduler = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log("⏰ Ejecutando generateServices desde cron...", new Date().toISOString());
        await generateServices();
    });

    cron.schedule('* * * * *', async () => {
        console.log("🧹 Ejecutando cleanExpiredHolds desde cron...", new Date().toISOString());
        await cleanExpiredHolds();
    });

    console.log("⏳ Scheduler iniciado.", new Date().toISOString());
};

module.exports = {
    startScheduler,
    generateServices
};

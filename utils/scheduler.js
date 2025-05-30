const cron = require('node-cron');
const ServiceTemplate = require('../models/ServiceTemplate');
const GeneratedService = require('../models/GeneratedService');
const moment = require('moment');

const generateServices = async () => {
     console.log("📦 generateServices() iniciado", new Date().toISOString());
    const today = moment();
    const daysToGenerate = 14;

    for (let i = 0; i < daysToGenerate; i++) {
        const targetDate = today.clone().add(i, 'days');
        const dayOfWeek = targetDate.isoWeekday();

        const templates = await ServiceTemplate.find({ days: dayOfWeek });

        for (const tpl of templates) {
            const alreadyExists = await GeneratedService.findOne({
                date: targetDate.format('YYYY-MM-DD'),
                origin: tpl.origin,
                destination: tpl.destination,
                departureTime: tpl.time,
            });

            if (!alreadyExists) {
                const layout = require('../layout.json').layouts[tpl.busLayout];
                const seatNumbers = layout.seatMap.flat().filter(seat => seat !== "");
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
                    origin: tpl.origin,
                    destination: tpl.destination,
                    departureTime: tpl.time,
                    layout: tpl.busLayout,
                    seats,
                    price: tpl.price
                });
            }
        }
    }
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
    cron.schedule('0 0,12 * * * ', async () => {
        console.log("⏰ Ejecutando generateServices desde cron...",new Date().toISOString());
        await generateServices();
    });

    cron.schedule('* * * * *', async () => {
        console.log("🧹 Ejecutando cleanExpiredHolds desde cron...",new Date().toISOString());
        await cleanExpiredHolds();
    });

    console.log("⏳ Scheduler iniciado.",new Date().toISOString());
};

//module.exports = { startScheduler };
module.exports = { 
  startScheduler, 
  generateServices // Asegúrate de incluir esto
};

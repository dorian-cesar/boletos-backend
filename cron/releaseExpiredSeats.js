const cron = require('node-cron');
const RouteBlockGenerated = require('../models/RouteBlockGenerated');

async function releaseExpiredSeats() {
  try {
    const expirationMinutes = 10;
    const expirationMs = expirationMinutes * 60 * 1000;
    const now = Date.now();

    const services = await RouteBlockGenerated.find();
    let totalReleased = 0;

    for (const service of services) {
      let changed = false;

      for (const [seatNumber, segments] of service.seatMatrix.entries()) {
        segments.forEach(segment => {
          if (segment.occupied && segment.reservedAt) {
            const reservedTime = new Date(segment.reservedAt).getTime();
            if (now - reservedTime > expirationMs) {
              segment.occupied = false;
              segment.passengerName = null;
              segment.passengerDocument = null;
              segment.reservedAt = null;
              changed = true;
              totalReleased++;
            }
          }
        });

        if (changed) {
          service.seatMatrix.set(seatNumber, segments);
        }
      }

      if (changed) {
        await service.save();
      }
    }

    if (totalReleased > 0) {
      console.log(`[CRON] Liberados ${totalReleased} asientos reservados hace más de ${expirationMinutes} minutos`);
    }

  } catch (error) {
    console.error('[CRON] Error al liberar asientos expirados:', error);
  }
}

// Ejecutar cada minuto
cron.schedule('* * * * *', releaseExpiredSeats);

module.exports = releaseExpiredSeats;

const mongoose = require('mongoose');
const ServiceTemplate = require('./models/ServiceTemplate');

mongoose.connect('mongodb://localhost:27017/bus_transport', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Conectado a MongoDB. Cargando datos de prueba...');

    await ServiceTemplate.deleteMany({});

    await ServiceTemplate.insertMany([
        {
            origin: "Santiago",
            destination: "Valparaíso",
            time: "08:00",
            days: [1, 2, 3, 4, 5, 6, 7],
            busLayout: "bus_42_seats"
        },
        {
            origin: "Santiago",
            destination: "Concepción",
            time: "10:00",
            days: [1, 3, 5],
            busLayout: "bus_42_seats"
        }
    ]);

    console.log('Datos de prueba cargados.');
    process.exit();
}).catch(err => console.error(err));
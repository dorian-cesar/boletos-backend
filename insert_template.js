const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ServiceTemplate = require('./models/ServiceTemplate');

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bus_db';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log("Conectado a MongoDB");

    const template = new ServiceTemplate({
      origin: "Santiago",
      destination: "Rancagua",
      time: "9:00",
      days: [ 1, 2, 3, 4, 5, 6, 7], // Domingo a sábado
      busLayout: "bus_42_seats",
      price: 3000
    });

    await template.save();
    console.log("✅ Plantilla insertada con éxito");

    process.exit();
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

// runGenerateServices.js

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect('mongodb://54.81.20.90:27017/bus_transport',
  {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Importa la función generateServices del archivo que tienes
const { generateServices } = require('./utils/scheduler');

// Ejecuta la función cuando corras este script
(async () => {
  try {
    await generateServices();
    console.log("La generación de servicios se completó con éxito.");
  } catch (error) {
    console.error("Ocurrió un error al generar servicios:", error);
  }
})();

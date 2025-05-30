require('dotenv').config();
const mongoose = require('mongoose');
const { generateServices } = require('./utils/scheduler');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Conectado a MongoDB');
  await generateServices();
  console.log('Servicios generados manualmente');
  mongoose.disconnect();
}).catch(err => {
  console.error('Error conectando a MongoDB:', err.message);
});

const mongoose = require('mongoose');
const RouteMaster = require('../models/RouteMaster');

// Conexión a tu base de datos MongoDB
mongoose.connect('mongodb://54.81.20.90:27017/ruta_maestra', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB', err));

const seedData = [
  {
    name: 'Santiago - Puerto Montt',
    stops: [
      { name: 'Santiago', order: 1 },
      { name: 'Rancagua', order: 2 },
      { name: 'San Fernando', order: 3 },
      { name: 'Curicó', order: 4 },
      { name: 'Talca', order: 5 },
      { name: 'San Javier', order: 6 },
      { name: 'Parral', order: 7 },
      { name: 'Chillán', order: 8 },
      { name: 'Concepción', order: 9 },
      { name: 'Los Ángeles', order: 10 },
      { name: 'Osorno', order: 11 },
      { name: 'Puerto Montt', order: 12 }
    ]
  },
  {
    name: 'Arica - Valparaíso',
    stops: [
      { name: 'Arica', order: 1 },
      { name: 'Iquique', order: 2 },
      { name: 'Antofagasta', order: 3 },
      { name: 'Copiapó', order: 4 },
      { name: 'Vallenar', order: 5 },
      { name: 'La Serena', order: 6 },
      { name: 'Coquimbo', order: 7 },
      { name: 'Ovalle', order: 8 },
      { name: 'Illapel', order: 9 },
      { name: 'Quillota', order: 10 },
      { name: 'Viña del Mar', order: 11 },
      { name: 'Valparaíso', order: 12 }
    ]
  }
];

async function seedRouteMasters() {
  try {
    await RouteMaster.deleteMany({});
    console.log('🧹 Rutas anteriores eliminadas.');

    const inserted = await RouteMaster.insertMany(seedData);
    console.log(`✅ ${inserted.length} rutas maestras insertadas con éxito.`);
  } catch (error) {
    console.error('❌ Error al insertar rutas:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedRouteMasters();

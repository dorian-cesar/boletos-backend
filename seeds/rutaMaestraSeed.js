require('dotenv').config(); // Cargar variables del .env
const mongoose = require('mongoose');
const RouteMaster = require('../models/RouteMaster');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ No se encontró MONGO_URI en el archivo .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
  seedRoutes();
}).catch(err => {
  console.error('❌ Error de conexión a MongoDB:', err);
});

const routes = [
  {
    name: 'Santiago - Puerto Montt',
    origin: 'Santiago',
    destination: 'Puerto Montt',
    stops: [
      { city: 'Rancagua', order: 1 },
      { city: 'Talca', order: 2 },
      { city: 'Chillán', order: 3 },
      { city: 'Concepción', order: 4 },
      { city: 'Temuco', order: 5 },
      { city: 'Valdivia', order: 6 }
    ]
  },
  {
    name: 'Arica - Iquique',
    origin: 'Arica',
    destination: 'Iquique',
    stops: [
      { city: 'Azapa', order: 1 },
      { city: 'Cuya', order: 2 },
      { city: 'Huara', order: 3 },
      { city: 'Alto Hospicio', order: 4 }
    ]
  },
  {
    name: 'Valparaíso - La Serena',
    origin: 'Valparaíso',
    destination: 'La Serena',
    stops: [
      { city: 'Viña del Mar', order: 1 },
      { city: 'Quillota', order: 2 },
      { city: 'La Calera', order: 3 },
      { city: 'Ovalle', order: 4 }
    ]
  }
];

async function seedRoutes() {
  try {
    await RouteMaster.deleteMany({});
    console.log('🗑️ Rutas anteriores eliminadas.');

    const createdRoutes = await RouteMaster.insertMany(routes);
    console.log(`✅ ${createdRoutes.length} rutas maestras insertadas.`);
  } catch (err) {
    console.error('❌ Error al insertar rutas maestras:', err);
  } finally {
    mongoose.connection.close();
  }
}

const mongoose = require('mongoose');
const RouteBlock = require('../models/RouteBlock'); // Asegúrate de que el path sea correcto

mongoose.connect('mongodb://54.81.20.90:27017/bus_transport', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedBlocks = async () => {
  await RouteBlock.deleteMany(); // Opcional: limpia los bloques existentes

  const data = [
    {
      routeMaster: '68921f7e567244dd88ea5904',
      name: 'Bloque Centro Sur',
      segments: [
        { from: 'Santiago', to: 'Rancagua', order: 1 },
        { from: 'Rancagua', to: 'Talca', order: 2 }
      ]
    },
    {
      routeMaster: '68921f7e567244dd88ea5904',
      name: 'Bloque Sur Chico',
      segments: [
        { from: 'Talca', to: 'Concepción', order: 1 },
        { from: 'Concepción', to: 'Temuco', order: 2 }
      ]
    },
    {
      routeMaster: '68921f7e567244dd88ea5904',
      name: 'Bloque Sur Extendido',
      segments: [
        { from: 'Temuco', to: 'Valdivia', order: 1 },
        { from: 'Valdivia', to: 'Puerto Montt', order: 2 }
      ]
    },
    {
      routeMaster: '689219af983da3a2125ce28b',
      name: 'Bloque Costa Norte',
      segments: [
        { from: 'Valparaíso', to: 'Viña del Mar', order: 1 },
        { from: 'Viña del Mar', to: 'Coquimbo', order: 2 }
      ]
    },
    {
      routeMaster: '689219af983da3a2125ce28b',
      name: 'Bloque Coquimbo Norte',
      segments: [
        { from: 'Coquimbo', to: 'La Serena', order: 1 }
      ]
    },
    {
      routeMaster: '689219af983da3a2125ce28b',
      name: 'Bloque Costero Completo',
      segments: [
        { from: 'Valparaíso', to: 'Viña del Mar', order: 1 },
        { from: 'Viña del Mar', to: 'La Serena', order: 2 }
      ]
    },
    {
      routeMaster: '689219af983da3a2125ce286',
      name: 'Bloque Desierto Norte',
      segments: [
        { from: 'Arica', to: 'Azapa', order: 1 },
        { from: 'Azapa', to: 'Cuya', order: 2 }
      ]
    },
    {
      routeMaster: '689219af983da3a2125ce286',
      name: 'Bloque Intermedio Norte',
      segments: [
        { from: 'Cuya', to: 'Huara', order: 1 },
        { from: 'Huara', to: 'Alto Hospicio', order: 2 }
      ]
    },
    {
      routeMaster: '689219af983da3a2125ce286',
      name: 'Bloque Terminal Norte',
      segments: [
        { from: 'Alto Hospicio', to: 'Iquique', order: 1 }
      ]
    }
  ];

  for (const block of data) {
    await RouteBlock.create(block);
  }

  console.log('✅ Seed completado.');
  mongoose.disconnect();
};

seedBlocks();

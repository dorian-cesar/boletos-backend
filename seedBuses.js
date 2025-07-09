// seedBuses.js
const mongoose = require('mongoose');
const Bus = require('./models/Bus');

mongoose.connect('mongodb://54.81.20.90:27017/bus_transport', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const buses = [
  {
    patente: 'ABCD12',
    marca: 'Mercedes-Benz',
    modelo: 'O500',
    anio: 2019,
    revision_tecnica: new Date('2025-06-10'),
    permiso_circulacion: new Date('2025-03-01'),
    disponible: true
  },
  {
    patente: 'EFGH34',
    marca: 'Volvo',
    modelo: '9800',
    anio: 2020,
    revision_tecnica: new Date('2025-07-01'),
    permiso_circulacion: new Date('2025-04-01'),
    disponible: false
  },
  {
    patente: 'IJKL56',
    marca: 'Scania',
    modelo: 'K440',
    anio: 2021,
    revision_tecnica: new Date('2025-05-15'),
    permiso_circulacion: new Date('2025-02-28'),
    disponible: true
  },
  {
    patente: 'MNOP78',
    marca: 'Irizar',
    modelo: 'i8',
    anio: 2022,
    revision_tecnica: new Date('2025-06-20'),
    permiso_circulacion: new Date('2025-05-05'),
    disponible: true
  },
  {
    patente: 'QRST90',
    marca: 'MAN',
    modelo: 'Lion’s Coach',
    anio: 2018,
    revision_tecnica: new Date('2025-04-30'),
    permiso_circulacion: new Date('2025-03-15'),
    disponible: false
  },
  {
    patente: 'UVWX11',
    marca: 'Volkswagen',
    modelo: 'Marcopolo Paradiso',
    anio: 2020,
    revision_tecnica: new Date('2025-05-01'),
    permiso_circulacion: new Date('2025-02-15'),
    disponible: true
  },
  {
    patente: 'YZAB22',
    marca: 'Hyundai',
    modelo: 'Universe',
    anio: 2023,
    revision_tecnica: new Date('2025-06-01'),
    permiso_circulacion: new Date('2025-04-20'),
    disponible: true
  },
  {
    patente: 'CDEF33',
    marca: 'Renault',
    modelo: 'Master Bus',
    anio: 2017,
    revision_tecnica: new Date('2025-03-10'),
    permiso_circulacion: new Date('2025-01-25'),
    disponible: false
  },
  {
    patente: 'GHIJ44',
    marca: 'Isuzu',
    modelo: 'Turquoise',
    anio: 2021,
    revision_tecnica: new Date('2025-05-30'),
    permiso_circulacion: new Date('2025-03-10'),
    disponible: true
  },
  {
    patente: 'KLMN55',
    marca: 'Hino',
    modelo: 'Selega',
    anio: 2022,
    revision_tecnica: new Date('2025-07-05'),
    permiso_circulacion: new Date('2025-05-30'),
    disponible: true
  }
];

async function seed() {
  try {
    await Bus.insertMany(buses);
    console.log('✅ Buses insertados correctamente');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error insertando buses:', error);
    mongoose.connection.close();
  }
}

seed();

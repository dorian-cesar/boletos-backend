const City = require('../models/City');

// Obtener todas las ciudades
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las ciudades' });
  }
};

// Obtener una ciudad por ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ error: 'Ciudad no encontrada' });
    res.json(city);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar la ciudad' });
  }
};

// Crear una nueva ciudad
exports.createCity = async (req, res) => {
  try {
    const { name, region, country } = req.body;

    if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

    const existing = await City.findOne({ name });
    if (existing) return res.status(400).json({ error: 'La ciudad ya existe' });

    const city = new City({ name, region, country });
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la ciudad' });
  }
};

// Actualizar una ciudad
exports.updateCity = async (req, res) => {
  try {
    const updated = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Ciudad no encontrada' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la ciudad' });
  }
};

// Eliminar una ciudad
exports.deleteCity = async (req, res) => {
  try {
    const deleted = await City.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Ciudad no encontrada' });
    res.json({ message: 'Ciudad eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la ciudad' });
  }
};

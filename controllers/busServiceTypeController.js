// controllers/busServiceTypeController.js
const BusServiceType = require('../models/BusServiceType');

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const exists = await BusServiceType.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Ya existe un tipo con ese nombre.' });

    const serviceType = new BusServiceType({ name, description });
    await serviceType.save();
    res.status(201).json(serviceType);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el tipo de servicio.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const types = await BusServiceType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tipos de servicio.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const type = await BusServiceType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'No encontrado' });
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el tipo.' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await BusServiceType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await BusServiceType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Tipo eliminado.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar.' });
  }
};

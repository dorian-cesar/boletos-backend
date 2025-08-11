const RouteMaster = require('../models/RouteMaster');

exports.createRouteMaster = async (req, res) => {
  try {
    const { name, stops } = req.body;

    if (!name || !stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({ error: 'Nombre y al menos dos paradas son requeridas.' });
    }

    // Ordenar las paradas por el campo "order"
    const sortedStops = stops.sort((a, b) => a.order - b.order);

    const route = new RouteMaster({ name, stops: sortedStops });
    await route.save();

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la ruta maestra.', details: error.message });
  }
};

exports.getAllRouteMasters = async (req, res) => {
  try {
    const routes = await RouteMaster.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las rutas.' });
  }
};

exports.getRouteMasterById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id);
    if (!route) return res.status(404).json({ error: 'Ruta no encontrada' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la ruta.' });
  }
};
// 🗑 Eliminar ruta maestra por ID
exports.deleteRouteMaster = async (req, res) => {
  try {
    const route = await RouteMaster.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json({ message: 'Ruta maestra eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la ruta.' });
  }
};


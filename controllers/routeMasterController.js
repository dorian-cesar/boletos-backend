const RouteMaster = require('../models/RouteMaster');

// Crear ruta maestra
exports.createRouteMaster = async (req, res) => {
  try {
    const { name, origin, destination, stops } = req.body;

    if (!name || !origin || !destination || !Array.isArray(stops)) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    // Validar que los stops tengan ciudad y orden
    const validStops = stops.every(stop => stop.city && typeof stop.order === 'number');
    if (!validStops) {
      return res.status(400).json({ message: 'Cada stop debe tener ciudad y orden' });
    }

    const newRoute = new RouteMaster({ name, origin, destination, stops });
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear ruta', error });
  }
};

// Obtener todas las rutas
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await RouteMaster.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener rutas', error });
  }
};

// Obtener ruta por ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await RouteMaster.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ruta', error });
  }
};

// Actualizar ruta
exports.updateRoute = async (req, res) => {
  try {
    const updated = await RouteMaster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar ruta', error });
  }
};

// Eliminar ruta
exports.deleteRoute = async (req, res) => {
  try {
    const deleted = await RouteMaster.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json({ message: 'Ruta eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar ruta', error });
  }
};

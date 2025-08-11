const RouteBlock = require('../models/RouteBlock');
const RouteMaster = require('../models/RouteMaster');

// Crear nuevo bloque
exports.createRouteBlock = async (req, res) => {
  try {
    const { routeMasterId, name, stops, layoutId } = req.body;

    if (!routeMasterId || !stops || stops.length < 2 || !layoutId) {
      return res.status(400).json({ error: 'Campos obligatorios: routeMasterId, stops[2+], layoutId' });
    }

    const routeMaster = await RouteMaster.findById(routeMasterId);
    if (!routeMaster) return res.status(404).json({ error: 'Ruta maestra no encontrada.' });

    const sortedStops = stops.sort((a, b) => a.order - b.order);

    const block = new RouteBlock({
      routeMaster: routeMasterId,
      name,
      stops: sortedStops,
      layout: layoutId
    });
    console.log(block);
    await block.save();
    res.status(201).json(block);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el bloque de ruta', details: error.message });
  }
};

// Obtener todos los bloques
exports.getAllRouteBlocks = async (req, res) => {
  try {
    const blocks = await RouteBlock.find();
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los bloques.' });
  }
};

// Obtener un bloque por ID
exports.getRouteBlockById = async (req, res) => {
  try {
    const block = await RouteBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ error: 'Bloque no encontrado' });
    res.json(block);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el bloque.' });
  }
};

// Editar un bloque
exports.updateRouteBlock = async (req, res) => {
  try {
    const { name, stops, layoutId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (stops && Array.isArray(stops)) {
      updateData.stops = stops.sort((a, b) => a.order - b.order);
    }
    if (layoutId) updateData.layout = layoutId;

    const updated = await RouteBlock.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    });

    if (!updated) return res.status(404).json({ error: 'Bloque no encontrado para actualizar.' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el bloque.', details: error.message });
  }
};

// Eliminar un bloque
exports.deleteRouteBlock = async (req, res) => {
  try {
    const deleted = await RouteBlock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Bloque no encontrado para eliminar.' });

    res.json({ message: 'Bloque eliminado exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el bloque.', details: error.message });
  }
};

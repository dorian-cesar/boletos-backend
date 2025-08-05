const RouteBlock = require('../models/RouteBlock');
const RouteMaster = require('../models/RouteMaster');

exports.createRouteBlock = async (req, res) => {
  try {
    const { routeMaster, name, segments } = req.body;

    if (!routeMaster || !name || !Array.isArray(segments)) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const route = await RouteMaster.findById(routeMaster);
    if (!route) return res.status(404).json({ message: 'Ruta maestra no encontrada' });

    const cityOrder = {};
    route.stops.forEach(stop => {
      cityOrder[stop.city] = stop.order;
    });
    cityOrder[route.origin] = 0;
    cityOrder[route.destination] = Math.max(...Object.values(cityOrder)) + 1;

    // Validar y ordenar segmentos
    for (let seg of segments) {
      if (!(seg.from in cityOrder) || !(seg.to in cityOrder)) {
        return res.status(400).json({ message: `Segmento inválido: ${seg.from} → ${seg.to}` });
      }
      if (cityOrder[seg.from] >= cityOrder[seg.to]) {
        return res.status(400).json({ message: `Orden inválido en el segmento: ${seg.from} → ${seg.to}` });
      }
    }

    // Asignar orden automático
    const sortedSegments = segments.sort((a, b) => cityOrder[a.from] - cityOrder[b.from])
      .map((seg, i) => ({ ...seg, order: i + 1 }));

    const newBlock = new RouteBlock({ routeMaster, name, segments: sortedSegments });
    await newBlock.save();

    res.status(201).json(newBlock);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear bloque', error });
  }
};

exports.getBlocksByRoute = async (req, res) => {
  try {
    const blocks = await RouteBlock.find({ routeMaster: req.params.routeMasterId });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener bloques', error });
  }
};

exports.getBlockById = async (req, res) => {
  try {
    const block = await RouteBlock.findById(req.params.id);
    if (!block) return res.status(404).json({ message: 'Bloque no encontrado' });
    res.json(block);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener bloque', error });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const updated = await RouteBlock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Bloque no encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar bloque', error });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const deleted = await RouteBlock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Bloque no encontrado' });
    res.json({ message: 'Bloque eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar bloque', error });
  }
};

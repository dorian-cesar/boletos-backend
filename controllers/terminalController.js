const Terminal = require('../models/Terminal');

// GET /api/terminals
exports.getAll = async (_req, res) => {
  try {
    const terminals = await Terminal.find();
    res.json(terminals);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los terminales' });
  }
};

// GET /api/terminals/:id
exports.getById = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id);
    if (!terminal) return res.status(404).json({ error: 'Terminal no encontrado' });
    res.json(terminal);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar el terminal' });
  }
};

// POST /api/terminals
exports.create = async (req, res) => {
  try {
    const { name, address, city, region } = req.body;

    if (!name || !city)
      return res.status(400).json({ error: 'Los campos name y city son obligatorios' });

    const exists = await Terminal.findOne({ name });
    if (exists) return res.status(400).json({ error: 'El terminal ya existe' });

    const terminal = await Terminal.create({ name, address, city, region });

    res.status(201).json(terminal);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el terminal' });
  }
};

// PUT /api/terminals/:id
exports.update = async (req, res) => {
  try {
    const { name, address, city, region } = req.body;

    const updated = await Terminal.findByIdAndUpdate(
      req.params.id,
      { name, address, city, region },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: 'Terminal no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el terminal' });
  }
};

// DELETE /api/terminals/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await Terminal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Terminal no encontrado' });
    res.json({ message: 'Terminal eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el terminal' });
  }
};

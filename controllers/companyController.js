const TransportCompany = require('../models/TransportCompany');

// GET /api/companies
exports.getAll = async (_req, res) => {
  try {
    const companies = await TransportCompany.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las empresas' });
  }
};

// GET /api/companies/:id
exports.getById = async (req, res) => {
  try {
    const company = await TransportCompany.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar la empresa' });
  }
};

// POST /api/companies
exports.create = async (req, res) => {
  try {
    const { name, rut, address, phone, email, website, logoUrl } = req.body;

    if (!name || !rut)
      return res.status(400).json({ error: 'Los campos name y rut son obligatorios' });

    const exists = await TransportCompany.findOne({ $or: [{ name }, { rut }] });
    if (exists) return res.status(400).json({ error: 'La empresa ya existe' });

    const company = await TransportCompany.create({
      name, rut, address, phone, email, website, logoUrl
    });

    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la empresa' });
  }
};

// PUT /api/companies/:id
exports.update = async (req, res) => {
  try {
    const company = await TransportCompany.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la empresa' });
  }
};

// DELETE /api/companies/:id
exports.remove = async (req, res) => {
  try {
    const deleted = await TransportCompany.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la empresa' });
  }
};

const express = require('express');
const router = express.Router();
const Layout = require('../models/Layout');

// Obtener todos los layouts
// Obtener todos los layouts con campos específicos
router.get('/', async (req, res) => {
  try {
    const layouts = await Layout.find({}, {
      name: 1,
      rows: 1,
      columns: 1,
      pisos: 1,
      capacidad: 1,
      tipo_Asiento_piso_1: 1,
      tipo_Asiento_piso_2: 1,
      _id: 0 // Opcional: omitir _id si no lo necesitas
    });

    res.json(layouts);
  } catch (error) {
    console.error('Error al obtener los layouts:', error);
    res.status(500).json({ error: 'Error al obtener los layouts' });
  }
});

// Obtener un layout por nombre
router.get('/:name', async (req, res) => {
    try {
        const layout = await Layout.findOne({ name: req.params.name });
        if (!layout) return res.status(404).json({ error: 'Layout no encontrado.' });
        res.json(layout);
    } catch (err) {
        res.status(500).json({ error: 'Error al buscar el layout.' });
    }
});

// Crear un nuevo layout
router.post('/', async (req, res) => {
    try {
        const layout = new Layout(req.body);
        await layout.save();
        res.status(201).json({ message: 'Layout creado exitosamente', layout });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Error al crear el layout.', details: err.message });
    }
});

// Actualizar un layout existente por nombre
router.put('/:name', async (req, res) => {
    try {
        const layout = await Layout.findOneAndUpdate(
            { name: req.params.name },
            req.body,
            { new: true, runValidators: true }
        );
        if (!layout) return res.status(404).json({ error: 'Layout no encontrado para actualizar.' });
        res.json({ message: 'Layout actualizado exitosamente.', layout });
    } catch (err) {
        res.status(400).json({ error: 'Error al actualizar el layout.', details: err.message });
    }
});

// Eliminar un layout por nombre
router.delete('/:name', async (req, res) => {
    try {
        const result = await Layout.findOneAndDelete({ name: req.params.name });
        if (!result) return res.status(404).json({ error: 'Layout no encontrado para eliminar.' });
        res.json({ message: 'Layout eliminado exitosamente.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el layout.' });
    }
});

module.exports = router;

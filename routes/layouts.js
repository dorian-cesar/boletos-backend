const express = require('express');
const router = express.Router();
const layouts = require('../layout.json');

router.get('/:layoutId', (req, res) => {
    const layout = layouts.layouts[req.params.layoutId];
    if (!layout) return res.status(404).json({ error: 'Layout no encontrado' });
    res.json(layout);
});

module.exports = router;
// routes/email.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

require('dotenv').config();

// Transporter de ejemplo con Gmail (puedes cambiarlo por otro proveedor o SMTP empresarial)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // tu correo Gmail
        pass: process.env.EMAIL_PASS  // tu clave de aplicación (no la contraseña normal)
    }
});

// POST /api/email
router.post('/', async (req, res) => {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const mailOptions = {
        from: `"Boletos" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Correo enviado correctamente' });
    } catch (err) {
        console.error('❌ Error enviando correo:', err);
        res.status(500).json({ error: 'Error enviando correo' });
    }
});

module.exports = router;

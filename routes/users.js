const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middlewares/auth');

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// Obtener todos los usuarios (protegido, solo admin)
router.get('/', verifyToken, async (req, res) => {
 // if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const users = await User.find().select('-password');
  res.json(users);
});

// Registro de invitados
router.post('/register-guest', async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({
        message: 'El usuario ya está enrolado',
        user_id: existingUser._id
      });
    }

    const user = new User({ name, email, role: 'invitado' });
    await user.save();

    res.status(201).json({
      message: 'Invitado registrado correctamente',
      user_id: user._id
    });

  } catch (err) {
    res.status(500).json({ error: 'Error al registrar invitado', details: err.message });
  }
});

// Eliminar un usuario por ID (protegido, opcionalmente solo admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
  }
});

// Editar un usuario por ID (protegido, opcionalmente solo admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const updateData = { name, email, role };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: err.message });
  }
});

// Base temporal en memoria (idealmente usar una DB o Redis)
const passwordResetTokens = {};

// Solicitar restablecimiento de contraseña

const crypto = require('crypto');
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: 'Correo no encontrado' });

  const token = crypto.randomBytes(32).toString('hex');
  passwordResetTokens[token] = { userId: user._id, expires: Date.now() + 15 * 60 * 1000 }; // 15 min

  // Aquí deberías enviar el token por correo en producción
  // Por ahora lo devolvemos en la respuesta:
  res.json({ message: 'Token generado', token });
});

// Restablecer contraseña con token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const data = passwordResetTokens[token];

  if (!data || data.expires < Date.now()) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
  }

  const user = await User.findById(data.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  delete passwordResetTokens[token];

  res.json({ message: 'Contraseña restablecida correctamente' });
});

module.exports = router;

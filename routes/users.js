const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middlewares/auth");

// Registro
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, rut } = req.body;
    const user = new User({ name, email, password, role, rut });
    await user.save();
    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al registrar usuario", details: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      rut: user.rut,
    },
  });
});

// Obtener todos los usuarios (protegido, solo admin)
router.get("/", verifyToken, async (req, res) => {
  // if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const users = await User.find();
  // const users = await User.find().select("-password");
  res.json(users);
});

// Registro de invitados
router.post("/register-guest", async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({
        message: "El usuario ya está enrolado",
        user_id: existingUser._id,
      });
    }

    const user = new User({ name, email, role: "invitado" });
    await user.save();

    res.status(201).json({
      message: "Invitado registrado correctamente",
      user_id: user._id,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al registrar invitado", details: err.message });
  }
});

// Eliminar un usuario por ID (protegido, opcionalmente solo admin)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al eliminar usuario", details: err.message });
  }
});

// Editar un usuario por ID (protegido, opcionalmente solo admin)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const updateData = { name, email, role };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al actualizar usuario", details: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Correo no encontrado" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `https://boletos-com.netlify.app/reset-password?token=${token}`;
    // const resetLink = `http://localhost:3001/reset-password?token=${token}`;

    const response = await fetch("https://boletos.dev-wit.com/api/email", {
      // const response = await fetch("http://localhost:3000/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Recupera tu contraseña",
        message: `
          <p>Hola ${user.name || ""},</p>
          <p>Para restablecer tu contraseña haz clic en el siguiente enlace:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>El enlace expira en 15 minutos.</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error enviando correo: ${response.statusText}`);
    }

    res.json({ success: true, message: "Correo de recuperación enviado" });
  } catch (err) {
    console.error("Error en forgot-password:", err);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Contraseña restablecida correctamente" });
  } catch (err) {
    console.error("Error en reset-password:", err);
    res.status(400).json({ error: "Token inválido o expirado" });
  }
});

module.exports = router;

const jwt = require("jsonwebtoken");
const User = require("./models/User");

const user = User.findOne({ "email": "dwigodski@wit.la"});
if (!user) return res.status(404).json({ error: "Correo no encontrado" });
console.log("user", user)

const token = jwt.sign({ userId: user._id }, 'clave-ultra-secreta', {
  expiresIn: "15m",
});

console.log(token);

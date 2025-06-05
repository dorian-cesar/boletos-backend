const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ error: 'Token requerido' });

  const parsedToken = token.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(parsedToken, process.env.JWT_SECRET);
    req.user = decoded; // Puedes acceder al payload si lo necesitas
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;

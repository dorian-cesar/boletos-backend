const jwt = require('jsonwebtoken');

const token = jwt.sign({ username: 'admin' }, 'clave-ultra-secreta', {
  expiresIn: '1h',
});

console.log(token);

const jwt = require('jsonwebtoken');

const token = jwt.sign({ username: 'admin' }, 'clave-ultra-secreta', {
  expiresIn: '9h',
});

console.log(token);

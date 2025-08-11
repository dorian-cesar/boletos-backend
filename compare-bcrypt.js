const bcrypt = require('bcrypt');

const plainPassword = '112233';
const storedHash = '$2b$10$UGclZFQwLkXiYgflNdMMV.WGPu91d6ix.VnpuT6G70b4dnu7z4xcG'

bcrypt.compare(plainPassword, storedHash, (err, result) => {
  if (err) {
    console.error(err);
    return;
  }
  if (result) {
    console.log('Contraseña correcta');
  } else {
    console.log('Contraseña incorrecta');
  }
});
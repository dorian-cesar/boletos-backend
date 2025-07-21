const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
   password: { type: String, required: function() { return this.role !== 'invitado'; } },
  role: { 
    type: String, 
    enum: ['admin', 'chofer', 'auxiliar', 'caja', 'invitado'], 
    required: true 
  }
}, { timestamps: true });

// Encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);

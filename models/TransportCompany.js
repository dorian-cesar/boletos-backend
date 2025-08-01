const mongoose = require('mongoose');

const transportCompanySchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, unique: true },
    rut:       { type: String, required: true, unique: true },   // RUT o taxId
    address:   { type: String },
    phone:     { type: String },
    email:     { type: String },
    website:   { type: String },
    logoUrl:   { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TransportCompany', transportCompanySchema);

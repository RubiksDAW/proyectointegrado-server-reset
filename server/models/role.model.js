// Importamos mongoose
const mongoose = require("mongoose");

// Creamos un modelo para la gestión de los roles
const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: String
  })
);

module.exports = Role;
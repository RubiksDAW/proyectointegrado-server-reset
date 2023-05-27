
// Importa la biblioteca Mongoose, que permite interactuar con MongoDB de una manera más fácil y estructurada.
const mongoose = require('mongoose');

// Crea un objeto vacío llamado db.
const db = {}

// Agrega la instancia de Mongoose al objeto db.
db.mongoose = mongoose;

// Agrega al objeto db el modelo de datos de usuario definido en el archivo user.model.js.
db.user = require("./user.model")

// Agrega al objeto db el modelo de datos de roles definido en el archivo role.model.js.
db.role = require("./role.model")

// db.route = require("./route.model")
db.route = require("./route.model")

db.message = require("./message.model")
// Define un array de roles disponibles para los usuarios de la aplicación.
db.ROLES = ["user","admin"];

// Exportamos el modulo
module.exports = db;
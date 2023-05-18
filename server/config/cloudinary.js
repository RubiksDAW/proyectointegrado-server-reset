// Importamos cloudinary para la carga de imagenes
// y lo exportamos
const cloudinary = require('cloudinary').v2;


// Configuración del plugin
cloudinary.config({
  cloud_name: "djjnl6f14",
  api_key: "868314972729792",
  api_secret: "nmJyTlBljMYmT7GKdmVvqgyCtnE"
});

module.exports = cloudinary
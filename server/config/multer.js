// Importamos multer para el procesamiento de imagenes desde el front
const multer = require('multer');

// Comentamos destinatión ya que no nos interesa ahora mismo por problemas de espacio
// almacenar las imagenes en nuestro servidor. Delegamos esa tarea en cloudinary
const multerStorage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'uploads/'); // No se usa la ruta de destino en este caso
  // },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Declaramos la variable en la que almacenaremos el nombre de las imagenes
    const filename = uniqueSuffix + '-' + file.originalname;
    cb(null, filename);
  }
});

// Confifuramos un limite a la hora de cargar las imagenes para subirlas
const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Tamaño máximo del archivo en bytes
  }
});

module.exports = {
    upload: upload
  };

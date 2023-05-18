

//Cambios realizados implementando multer
const express = require('express');
const router = express.Router();
const path = require('path');

const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const db = require("./models");

// definen un objeto corsOptions que se 
// utiliza para configurar el middleware de CORS (Cross-Origin Resource Sharing) en Express.
const corsOptions = {
  credentials: true,
  origin: true,
};

// Hacemos uso como middleware de cors
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Parsea peticiones de contenido json
app.use(express.json());

// analizar las solicitudes HTTP que utilizan esta codificación de datos,
// para extraer y procesar los datos enviados desde el formulario HTML.
app.use(express.urlencoded({ extended: true }));

// Middleware de Multer para hacer de enlace entre cliente y servidor a la hora de mostrar las
// imagenes
app.use(router)

// Llamamos a nuestros distintos 
require("./routes/auth.routes")(app);
require("./routes/route.routes")(app);
require("./routes/event.routes")(app)

// Para comprobar que funciona 
// app.get("/", (req, res) => {
//   res.json({ message: "Bienvenido a la aplicación" });
// });

// Actualmente no guardamos las imagenes en nuestro servidor por lo que esta ruta se encuentra comentada

// // Mediante esta ruta obtenemos las imagenes almacenadas en nuestro servidor 
// // gracias a que almacenamos el nombre de las imagenes adjuntadas a la ruta.
// router.get('/uploads/:filename', (req, res) => {
//   // Recibimos el nombre de la imagen que viene en la petición
//   const filename = req.params.filename;
//   // Buscamos en la cartpeta donde se almacenan
//   const imagePath = path.join(__dirname, 'uploads', filename);

//   res.sendFile(imagePath);
// });

// Importamos nuestra variable de entorno para establecer el puerto
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});

// //Guardamos las variables de entorno relacionadas con la BBDD en este objeto
const db_access = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
};

// // Opciones de configuración de MongoDB
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Conexion a MongoDb con mi usuario y contraseña
db.mongoose
  .connect(
    `mongodb+srv://${db_access.user}:${db_access.password}@approutes.yj6s2i4.mongodb.net/bikebros?retryWrites=true&w=majority`,
    options
  )
  .then(() => console.log("Conexión realizada con exito a la BBDD"))
  .catch((error) => console.log("Error al conectar con la BBDD", error));

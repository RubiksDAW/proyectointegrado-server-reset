// Importamos mongoose
const mongoose = require("mongoose");

const Event = require('./event.model')
// Declaramos un schema para la creación de rutas.
const RouteSchema = new mongoose.Schema({
  // Nombre de la ruta
  name: { type: String, required: true },
  // Dificultad de la ruta a realizar. (El usuario podrá puntuar la ruta en base a este array)
  difficulty_level: { type: String, enum: ['Bajo', 'Intermedio', 'Alto'] },
  // Distancia aproximada indicada por el usuario
  distance: { type: Number, required: true },
  // Nombre del lugar donde se encuentra la ruta
  location: { type: String, required: true },
  // Descripción de la ruta proporcionada por el usuario
  description: { type: String, required: true },
  // Ubicación del inicio de la ruta
  origin: { type: String, required: true },
  // Ubicación del final de la ruta
  destination: { type: String, required: true },
  // Array de imagenes proporcionadas por el usuario para compartir
  images: [{ type: String, required: false }],
  // Id del usuario que ha creado la ruta
  author: { type: String, required: false },
  // Array de comentarios asociados a la ruta
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", required:false}],

  reports:[{ type: mongoose.Schema.Types.ObjectId, ref: "Report", required:false}]
});

RouteSchema.pre("remove", async function (next) {
  const route = this;
  await Event.deleteMany({ ruta: route._id });
  next();
});

const Route = mongoose.model("Route", RouteSchema);

module.exports = Route;

// Importamos mongoose
const mongoose = require("mongoose");

// Creamos un schema indicando el nombre de la propiedad y el typo de propiedad.
// La lista de participantes no se requiere porque se inicializará una vez creado el objeto 
const Event = mongoose.model(
  "Event",
  new mongoose.Schema({
    // Ruta asociada al evento
    ruta: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    // Fecha en la que se celebrará el evento
    fecha: { type: Date, required: true },
    // Ubicación donde se convocará el evento
    ubicacion:{type:String, required: true},
    // Array con los participantes
    participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    // Variable numerica para controlar el máximo de participantes. No se establecerá un mínimo
    maxParticipantes: { type: Number, required: true },
    // Id del creador. Solo se guarda la id como String
    creador: { type: String, required: true }
  })
);

module.exports = Event;

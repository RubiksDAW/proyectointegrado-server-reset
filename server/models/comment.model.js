// Importamos mongoose
const mongoose = require("mongoose");

// Creamos un schema indicando el nombre de la propiedad y el typo de propiedad.
// En este caso son obligatorias todas ppara realizar una instancia del modelo. 
const CommentSchema = new mongoose.Schema({
  // Comentario en sí
  content: { type: String, required: true },
  // Id del autor del comentario
  authorId: { type: String, required: true },
  // Nick del creador del comentario
  authorNick: { type: String, required: true }
});
// Creamos un modelo para luego exportarlo
const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;

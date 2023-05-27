const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  // ID del remitente del mensaje
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // ID del destinatario del mensaje
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Contenido del mensaje
  content: {
    type: String,
    required: true
  },
  // Fecha de creación del mensaje
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;

const mongoose = require("mongoose");

const usuariosSchema = new mongoose.Schema({
  nome_usuario: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("usuarios", usuariosSchema);
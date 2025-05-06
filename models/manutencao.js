const mongoose = require("mongoose");
const computadores = require("./computadores");
const usuarios = require("./usuarios");

const manutencaoSchema = new mongoose.Schema({
  _id: { type: String,},
  id_computador: computadores.id_computador,
  id_usuarios: usuarios.id_usuarios,
  chamado: { type: Number, required: true },
  status_manutencao: { type: String, required: true },
  data_manutencao_anterior: { type: Date, required: true },
  data_manutencao: { type: Date, required: true },
  tipo_manutencao: { type: String, required: true },
  descricao_manutencao: { type: String, required: true },
});

module.exports = mongoose.model("manutencao", manutencaoSchema);
const mongoose = require("mongoose");
const computadores = require("./computadores");
const usuarios = require("./usuarios");

const manutSchema = new mongoose.Schema({
  id_computador: { type:mongoose.Schema.Types.ObjectId, ref: 'computadores', required: true },
 servicetag: { type: mongoose.Schema.Types.servicetag, ref: 'computadores', required: true },
  id_usuarios: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true   },
  chamado: { type: Number, required: true },
  status_manutencao: { type: String, required: true },
  data_manutencao_anterior: { type: Date, required: true, validate: {
    validator: (value) => !isNaN(Date.parse(value)), // Valida se é uma data válida
    message: "Formato de data inválido. Use o formato ISO 8601."
  } },
  data_manutencao: { type: Date, required: true, validate: {
    validator: (value) => !isNaN(Date.parse(value)), // Valida se é uma data válida
    message: "Formato de data inválido. Use o formato ISO 8601."
  } },
  tipo_manutencao: { type: String , required: true },
  descricao_manutencao: { type: String, required: true },
});

module.exports = mongoose.model("manut", manutSchema);
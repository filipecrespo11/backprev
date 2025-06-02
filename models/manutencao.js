const mongoose = require("mongoose");
const computadores = require("./computadores");
const usuarios = require("./usuarios");

const manutSchema = new mongoose.Schema({
  id_computador: { type: mongoose.Schema.Types.ObjectId, ref: 'computadores', required: true },
 serviceTag: { type: String, required: true },
 setor: { type: String, required: true },
  id_usuarios: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true   },
  chamado: { type: Number, required: true, unique: true },
  status_manutencao: { type: String, required: true },
  data_manutencao_anterior: { type: Date, required: true
},
  data_manutencao: { type: Date, required: true },
  tipo_manutencao: { type: String , required: true },
  descricao_manutencao: { type: String, required: true },
});

module.exports = mongoose.model("manut", manutSchema);
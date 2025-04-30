const mongoose = require("mongoose");

const manutencaoSchema = new mongoose.Schema({
  id_computador: { type: Number, required: true },
  id_usuarios: { type: String, required: true },
  chamado: { type: Number, required: true },
  status_manutencao: { type: String, required: true },
  data_manutencao_anterior: { type: Date, required: true },
  data_manutencao: { type: Date, required: true },
  tipo_manutencao: { type: String, required: true },
  descricao_manutencao: { type: String, required: true },
});

module.exports = mongoose.model("manutencao", manutencaoSchema);
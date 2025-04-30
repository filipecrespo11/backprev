const mongoose = require('mongoose');

const computadoresSchema = new mongoose.Schema({
  id_computador: { type: Number, required: true },
  nome_computador: { type: String, required: true },
  fabricante: { type: String, required: true },
  modelo: { type: String, required: true },
  serviceTag: { type: String, required: true },
  patrimonio: { type: Number, required: true },
  unidade: { type: String, required: true },
  setor: { type: String, required: true },
  estado: { type: String, required: true },
});

module.exports = mongoose.model('computadores', computadoresSchema);
// const mongoose = require('mongoose');
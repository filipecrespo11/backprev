const mongoose = require('mongoose');

const computadoresSchema = new mongoose.Schema({
  nome_computador: { type: String, required: true },
  fabricante: { type: String, required: true },
  modelo: { type: String, required: true },
  serviceTag: { type: String, required: true, unique: true },
  patrimonio: { type: String, required: true, unique: true },
  unidade: { type: String, required: true },
  setor: { type: String, required: true },
  estado: { type: String, required: true },
});

module.exports = mongoose.model('computadores', computadoresSchema);
// const mongoose = require('mongoose');
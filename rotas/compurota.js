const express = require('express');
const computadores = require('../models/computadores'); 
const rotas = express.Router();
const { criarComputador,
        listarComputadores,
        atualizarComputador,
        deletarComputador } = require('../controllers/compucontrol');
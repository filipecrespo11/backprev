require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const autecontrol = require('./controllers/autecontrol');
const manurota = require('./rotas/manurota');
const auterota = require('./rotas/auterota');
const bd = require('./config/bd');

const bdman = express();

bdman.use(cors());
bdman.use(bodyParser.json()); 

bd();

bdman.use('/auterota', auterota); // Rota para autenticação de usuários
     

const PORT = process.env.PORT || 3000; // Porta padrão ou porta definida no ambiente
bdman.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


module.exports = bdman;

// Teste de conexão com o banco de dados MongoDB
// const mongoose = require('mongoose');


require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const bodyParser = require('body-parser');
const autecontrol = require('./controllers/autecontrol');
const manurota = require('./rotas/manurota');
const auterota = require('./rotas/auterota');
const compurota = require('./rotas/compurota');
const bd = require('./config/bd');

const app = express();

// Configuração do middleware
app.use(cors());
app.use(express.json());

//banco de dados
// Conexão com o banco de dados MongoDB
bd();

//rota para autenticação de usuários
app.use('/auterota', auterota);
app.use('/manurota', manurota);
app.use('/compurota', compurota);

     

const PORT = process.env.PORT || 3000; // Porta padrão ou porta definida no ambiente
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


module.exports = app;

// Teste de conexão com o banco de dados MongoDB
// const mongoose = require('mongoose');


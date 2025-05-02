const computadores = require('../models/computadores');
const rotas = express.Router();
const { criarComputador, listarComputadores, atualizarComputador, deletarComputador } = require('../controllers/compucontrol');
const { verificarToken } = require('../controllers/autecontrol');
const { verificarUsuario } = require('../controllers/autecontrol');






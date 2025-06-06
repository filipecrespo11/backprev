const express = require('express');
const usuarios = require('../models/usuarios');

const rotas = express.Router();

const {login} = require('../controllers/autecontrol');
rotas.post('/login', login);


// Rota para criar um novo usuário
rotas.post('/criausuarios', async (req, res) => {
    const { nome_usuario, username, password } = req.body;
    try {
        const novoUsuario = new usuarios({
            nome_usuario,
            username,
            password
        });
        await novoUsuario.save();
        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário', error });
    }
}
);

// Rota para consultar usuários
rotas.get('/usuarios', async (req, res) => {
    try {
        const listaUsuarios = await usuarios.find({});
        res.status(200).json(listaUsuarios);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao consultar usuários', error });
    }
});
    module.exports = rotas;
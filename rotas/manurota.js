const express = require('express');
const manutencao = require('../models/manutencao');
const { protect } = require('../middlewares/autenmid');
const rotas = express.Router();

// Rota para criar uma nova manutenção
rotas.post('/criamanutencao', protect, async (req, res) => {
    const {
        id_computador,
        id_usuarios,
        chamado,
        status_manutencao,
        data_manutencao_anterior,
        data_manutencao,
        tipo_manutencao,
        descricao_manutencao
    } = req.body;
    console.log(req.body);
    

    try {
        const novaManutencao = new manutencao({
            id_computador,
            id_usuarios,
            chamado,
            status_manutencao,
            data_manutencao_anterior,
            data_manutencao,
            tipo_manutencao,
            descricao_manutencao
        });
        await novaManutencao.save();
        res.status(201).json({ message: 'Manutenção criada com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar manutenção', error });
    }

});

// Rota para listar todas as manutenções
rotas.get('/manutencao', protect, async (req, res) => {
    try {
        const listaManutencao = await manutencao.find();
        res.status(200).json(listaManutencao);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar manutenções', error });
    }
});

// Rota para listar uma manutenção específica pelo ID
rotas.get('/manutencao/:_id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const manutencaoItem = await manutencao.findById(id);
        if (!manutencaoItem) {
            return res.status(404).json({ message: 'Manutenção não encontrada' });
        }
        res.status(200).json(manutencaoItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar manutenção', error });
    }
});

// Rota para listar manutenções por ID do computador
rotas.get('/manutencao/computador/:_id', protect, async (req, res) => {
    const { id_computador } = req.params;
    try {
        const manutencaoItem = await manutencao.find({ id_computador });
        if (!manutencaoItem || manutencaoItem.length === 0) {
            return res.status(404).json({ message: 'Manutenção não encontrada' });
        }
        res.status(200).json(manutencaoItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar manutenção', error });
    }
});

// Rota para atualizar uma manutenção específica pelo ID
rotas.put('/manutencao/:_id', protect, async (req, res) => {
    const { id } = req.params;
    const {
        id_computador,
        id_usuarios,
        chamado,
        status_manutencao,
        data_manutencao_anterior,
        data_manutencao,
        tipo_manutencao,
        descricao_manutencao
    } = req.body;

    try {
        const manutencaoItem = await manutencao.findByIdAndUpdate(
            id,
            {
                id_computador,
                id_usuarios,
                chamado,
                status_manutencao,
                data_manutencao_anterior,
                data_manutencao,
                tipo_manutencao,
                descricao_manutencao
            },
            { new: true }
        );

        if (!manutencaoItem) {
            return res.status(404).json({ message: 'Manutenção não encontrada' });
        }
        res.status(200).json(manutencaoItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar manutenção', error });
    }
});


module.exports = rotas;

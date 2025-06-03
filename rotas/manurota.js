const express = require('express');
const ManutencaoModel = require('../models/manutencao');
const { protect } = require('../middlewares/autenmid');
const manutencao = require('../models/manutencao');
const rotas = express.Router();

// Rota para criar uma nova manutenção
rotas.post('/criamanutencao', protect, async (req, res) => {
    const {
        id_computador,
        serviceTag,
        setor,
        id_usuarios,
        chamado,
        status_manutencao,
        data_manutencao_anterior,
        data_manutencao,
        tipo_manutencao,
        descricao_manutencao
    } = req.body;
    
    

    try {
        const novaManutencao = new ManutencaoModel({
            id_computador,
            serviceTag,
            setor,
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

rotas.get('/manurota/manutencoes', async (req, res) => {
    try {
      const manutencoes = await buscarManutencoesDoBanco(); // Função que busca as manutenções
      res.status(200).json(manutencoes); // Retorna as manutenções com status 200
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
      res.status(500).json({ error: 'Erro ao buscar manutenções' }); // Retorna erro com status 500
    }
  });

// Rota para listar todas as manutenções
rotas.get('/manutencoes', async (req, res) => {
    try {
        const listaManutencao = await manutencao.find();
        res.status(200).json(listaManutencao);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar manutenções', error });
    }
});
// Rota para listar uma manutenção específica pelo ID
rotas.get('/manut/:id', protect, async (req, res) => {
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
rotas.get('/manutencoes/por-computador/:id_computador_param', protect, async (req, res) => {
    const { id_computador_param } = req.params; // Pega o parâmetro da URL
    try {
        const manutencoes = await ManutencaoModel.find({ id_computador: id_computador_param });
        if (!manutencoes || manutencoes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma manutenção encontrada para este computador' });
        }
        res.status(200).json(manutencoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar manutenções por computador', error });
    }
});

// Rota para atualizar uma manutenção específica pelo ID
rotas.put('/manut/:_id', protect, async (req, res) => {
    const { id } = req.params;
    const {
        id_computador,
        serviceTag,    
        id_usuarios,
        chamado,
        status_manutencao,
        data_manutencao_anterior,
        data_manutencao,
        tipo_manutencao,
        descricao_manutencao
    } = req.body;

    try {
        const manutItem = await manut.findByIdAndUpdate(
            id,
            {
                id_computador,
                serviceTag,
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

        if (!manutItem) {
            return res.status(404).json({ message: 'Manutenção não encontrada' });
        }
        res.status(200).json(manutItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar manutenção', error });
    }
});


module.exports = rotas;

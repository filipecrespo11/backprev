const express = require('express');
const ManutencaoModel = require('../models/manutencao');
const { protect } = require('../middlewares/autenmid');
const { enviarEmail } = require('../controllers/emailService');
const rotas = express.Router();
const { lerRespostaChamado } = require('../controllers/imapService');


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

// Rota para listar todas as manutenções
rotas.get('/manutencoes', async (req, res) => {
    try {
        const listaManutencao = await ManutencaoModel.find();
        res.status(200).json(listaManutencao);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar manutenções', error });
    }
});

// Rota para listar uma manutenção específica pelo ID
rotas.get('/manut/:id', protect, async (req, res) => {
    const { id } = req.params;
    console.log(`Buscando manutenção com ID: ${id}`); // <--- Adicione esta linha
    try {
        const manutencaoItem = await ManutencaoModel.findById(id);
        console.log('Resultado da busca:', manutencaoItem); // <--- Adicione esta linha
        if (!manutencaoItem) {
            return res.status(404).json({ message: 'Manutenção não encontrada' });
        }
        res.status(200).json(manutencaoItem);
    } catch (error) {
        console.error('Erro na rota /manut/:id:', error); // <--- Adicione ou melhore esta linha
        res.status(500).json({ message: 'Erro ao listar manutenção', error: error.message }); // Envie error.message para mais detalhes no cliente
    }
});

// Rota para listar manutenções por ID do computador
rotas.get('/manutencoes/por-computador/:id_computador_param', async (req, res) => {
    const { id_computador_param } = req.params;
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
rotas.put('/manut/:id', async (req, res) => {
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
        const manutItem = await ManutencaoModel.findByIdAndUpdate(
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

// Rota para atualizar o número do chamado pelo serviceTag
rotas.put('/manutencao/servicetag/:serviceTag', async (req, res) => {
    const { serviceTag } = req.params;
    const { chamado } = req.body;
    try {
        const manutItem = await ManutencaoModel.findOneAndUpdate(
            { serviceTag },
            { chamado },
            { new: true }
        );
        if (!manutItem) {
            return res.status(404).json({ message: 'Manutenção não encontrada para o serviceTag fornecido' });
        }
        res.status(200).json({ message: 'Número do chamado atualizado com sucesso', manutItem });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar número do chamado', error });
    }
});

// Rota para buscar manutenção por serviceTag
rotas.get('/manutencao/servicetag/:serviceTag', async (req, res) => {
    const { serviceTag } = req.params;
    try {
        const manutencaoItem = await ManutencaoModel.findOne({ serviceTag });
        if (!manutencaoItem) {
            return res.status(404).json({ message: 'Manutenção não encontrada' });
        }
        res.status(200).json(manutencaoItem);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar manutenção pelo serviceTag', error });
    }
});

// Rota para enviar e-mail


rotas.post('/enviaremail', async (req, res) => {
    const { destinatario, assunto, texto, serviceTag, chamado } = req.body;
    try {
        await enviarEmail(destinatario, assunto, texto, serviceTag);
        const resposta = await lerRespostaChamado(chamado);
        res.status(200).json({ message: 'E-mail enviado e resposta lida!', resposta });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao enviar e-mail ou ler resposta', error });
    }
});
module.exports = rotas;
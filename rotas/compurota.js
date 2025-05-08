const express = require('express');
const computadores = require('../models/computadores'); 
const {protect} = require('../middlewares/autenmid');
const rotas = express.Router(); 


// Rota para criar um novo computador
rotas.post('/criacomputador', protect, async (req, res) => {
    const {  nome_computador, fabricante, modelo, serviceTag, patrimonio, unidade, setor, estado } = req.body;
    try {
        const novoComputador = new computadores({
           
            nome_computador,
            fabricante,
            modelo,
            serviceTag,
            patrimonio,
            unidade,
            setor,
            estado
        });
        await novoComputador.save();
        res.status(201).json({ message: 'Computador criado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar computador', error });
    }
});
// Rota para listar todos os computadores   
rotas.get('/computadores', protect, async (req, res) => {
    try {
        const listaComputadores = await computadores.find();
        res.status(200).json(listaComputadores);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computadores', error });
    }
});
// Rota para listar um computador específico pelo ID    
rotas.get('/computadores/:_id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const computador = await computadores.findById(id);
        if (!computador) {
            return res.status(404).json({ message: 'Computador não encontrado' });
        }
        res.status(200).json(computador);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computador', error });
    }
});
// Rota para atualizar um computador específico pelo ID
rotas.put('/computadores/:_id', protect, async (req, res) => {
    const { id } = req.params;
    const { id_computador, nome_computador, fabricante, modelo, serviceTag, patrimonio, unidade, setor, estado } = req.body;
    try {
        const computador = await computadores.findByIdAndUpdate(id, {
            id_computador,
            nome_computador,
            fabricante,
            modelo,
            serviceTag,
            patrimonio,
            unidade,
            setor,
            estado
        }, { new: true });
        if (!computador) {
            return res.status(404).json({ message: 'Computador não encontrado' });
        }
        res.status(200).json({ message: 'Computador atualizado com sucesso', computador });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar computador', error });
    }
});

// Rota para deletar um computador específico pelo ID
rotas.delete('/computadores/:_id', protect, async (req, res) => {
    const { id } = req.params;
    try {
        const computador = await computadores.findByIdAndDelete(id);
        if (!computador) {
            return res.status(404).json({ message: 'Computador não encontrado' });
        }
        res.status(200).json({ message: 'Computador deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar computador', error });
    }
});


// Rota para listar computadores por unidade

rotas.get('/computadores/unidade/:unidade', protect, async (req, res) => {
    const { unidade } = req.params;
    try {
        const computadoresUnidade = await computadores.find({ unidade });
        if (computadoresUnidade.length === 0) {
            return res.status(404).json({ message: 'Nenhum computador encontrado para esta unidade' });
        }
        res.status(200).json(computadoresUnidade);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computadores por unidade', error });
    }
});
// Rota para listar computadores por setor  

rotas.get('/computadores/setor/:setor', protect, async (req, res) => {
    const { setor } = req.params;
    try {
        const computadoresSetor = await computadores.find({ setor });
        if (computadoresSetor.length === 0) {
            return res.status(404).json({ message: 'Nenhum computador encontrado para este setor' });
        }
        res.status(200).json(computadoresSetor);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computadores por setor', error });
    }
});

// Rota para listar computadores por estado

rotas.get('/computadores/estado/:estado', protect, async (req, res) => {
    const { estado } = req.params;
    try {
        const computadoresEstado = await computadores.find({ estado });
        if (computadoresEstado.length === 0) {
            return res.status(404).json({ message: 'Nenhum computador encontrado para este estado' });
        }
        res.status(200).json(computadoresEstado);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computadores por estado', error });
    }
});
// Rota para listar computadores por fabricante 

rotas.get('/computadores/fabricante/:fabricante', protect, async (req, res) => {
    const { fabricante } = req.params;
    try {
        const computadoresFabricante = await computadores.find({ fabricante });
        if (computadoresFabricante.length === 0) {
            return res.status(404).json({ message: 'Nenhum computador encontrado para este fabricante' });
        }
        res.status(200).json(computadoresFabricante);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computadores por fabricante', error });
    }
});
// Rota para listar computadores por modelo
rotas.get('/computadores/modelo/:modelo', protect, async (req, res) => {
    const { modelo } = req.params;
    try {
        const computadoresModelo = await computadores.find({ modelo });
        if (computadoresModelo.length === 0) {
            return res.status(404).json({ message: 'Nenhum computador encontrado para este modelo' });
        }
        res.status(200).json(computadoresModelo);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar computadores por modelo', error });
    }   
}
);

module.exports = rotas;
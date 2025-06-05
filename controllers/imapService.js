const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Manutencao = require('../models/manutencao');

async function lerRespostaChamado(chamado, timeoutMs = 300000, intervalMs = 10000) {
  const start = Date.now();

  async function tentarBuscar() {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: process.env.URIusername,
        password: process.env.URIpassword,
        host: process.env.URIimaphost,
        port: process.env.URIimapport,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      });

      function openInbox(cb) {
        imap.openBox('INBOX', false, cb);
      }

      imap.once('ready', function() {
        openInbox(function(err, box) {
          if (err) {
            imap.end();
            return reject('Erro ao abrir a caixa de entrada: ' + err);
          }
          imap.search([
            'UNSEEN',
            ['HEADER', 'SUBJECT', `[Chamado#${chamado}]`]
          ], function(err, results) {
            if (err) {
              imap.end();
              return reject('Erro ao buscar e-mails: ' + err);
            }
            if (!results.length) {
              imap.end();
              return resolve(null); // Não encontrou ainda
            }
            // Adiciona markSeen: true para marcar e-mails como lidos após o fetch
            const f = imap.fetch(results, { bodies: '', markSeen: true });
            let resposta = null;
            let ultimoTexto = null;
            let processPromises = []; 

            f.on('message', function(msg) {
              msg.on('body', function(stream) {
                // Envolve o processamento de cada mensagem em uma nova Promise
                // para garantir que o Promise.all aguarde as operações assíncronas internas.
                const mailProcessingPromise = new Promise((resolveMailPromise, rejectMailPromise) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (err) {
                      console.error('Erro ao parsear e-mail:', err.message);
                      return rejectMailPromise(err); // Rejeita a promise desta mensagem
                    }
                    
                    ultimoTexto = parsed.text; // Pode ser sobrescrito se várias mensagens forem processadas
                    const regexServiceTag = /Service Tag: (\w+)/i;
                    const matchServiceTag = parsed.text?.match(regexServiceTag) || parsed.subject?.match(regexServiceTag);
                    
                    if (!matchServiceTag) {
                      return resolveMailPromise(); // Nenhuma tag de serviço encontrada, resolve sem fazer nada
                    }
                    
                    const serviceTag = matchServiceTag[1];
                    try {
                      const updatedManutencao = await Manutencao.findOneAndUpdate(
                        { serviceTag },
                        { chamado },
                        { new: true }
                      );
                      if (updatedManutencao) {
                        resposta = `Registro atualizado para serviceTag ${serviceTag} com chamado ${chamado}`;
                      } else {
                        resposta = `Nenhum registro encontrado para serviceTag ${serviceTag}`;
                      }
                      resolveMailPromise();
                    } catch (dbError) {
                      console.error('Erro ao atualizar registro de manutenção:', dbError.message);
                      resposta = 'Erro ao atualizar registro de manutenção: ' + dbError.message;
                      // Decide se um erro de DB deve rejeitar a promise da mensagem ou apenas registrar
                      resolveMailPromise(); // ou rejectMailPromise(dbError) se preferir que falhe o Promise.all
                    }
                  });
                });
                processPromises.push(mailProcessingPromise);
              });
            });

            f.once('end', function() {
              Promise.all(processPromises)
                .then(() => resolve(resposta || ultimoTexto || 'E-mail processado, mas nenhum registro atualizado.'))
                .catch(err => reject('Erro no processamento de uma ou mais mensagens: ' + err.message))
                .finally(() => imap.end());
            });
          });
        });
      });

      imap.once('error', function(err) {
        // Tenta fechar a conexão IMAP se ainda estiver aberta e um erro ocorrer.
        if (imap && imap.state !== 'disconnected') imap.end();
        reject('Erro IMAP: ' + err.message);
      });

      imap.connect();
    });
  }

  // Polling loop
  while (Date.now() - start < timeoutMs) {
    const resultado = await tentarBuscar();
    // Se 'tentarBuscar' retornar um resultado (não nulo), significa que um e-mail foi processado
    // (seja com sucesso, com erro de atualização no DB, ou nenhum registro encontrado).
    // A condição original '!resultado.startsWith('Nenhum e-mail')' é um pouco confusa,
    // pois 'tentarBuscar' retorna 'null' se nenhum e-mail for encontrado na tentativa atual.
    // Um 'resultado' não nulo indica que o processamento de e-mail ocorreu.
    if (resultado !== null) { 
      return resultado;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return 'Nenhuma resposta encontrada para o chamado após 5 minutos.';
}

module.exports = { lerRespostaChamado };
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Manutencao = require('../models/manutencao');

// Modificado para receber serviceTagEsperada, manutencaoIdEsperado (para DB) e emailSubjectIdEsperado (para busca no assunto)
async function lerRespostaChamado(serviceTagEsperada, manutencaoIdEsperado, emailSubjectIdEsperado, timeoutMs = 300000, intervalMs = 10000) {
  console.log(`[IMAP Service] Iniciando busca de resposta para Subject ID: ${emailSubjectIdEsperado}, Service Tag: ${serviceTagEsperada}, Manutenção ID (DB): ${manutencaoIdEsperado}, timeout: ${timeoutMs}ms, intervalo: ${intervalMs}ms`);
  const start = Date.now();

  async function tentarBuscar() {
    // Log ajustado
    console.log(`[IMAP Service] Tentando buscar e-mail de resposta com Subject ID: ${emailSubjectIdEsperado} na caixa de entrada.`);
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: process.env.URIusername,
        password: process.env.URIpassword,
        host: process.env.URIimaphost,
        port: process.env.URIimapport,
        // tls: true, // Remova ou comente se estiver usando autotls para uma porta como 143
        autotls: 'always', // Tente 'always' ou 'required'. 'always' tentará STARTTLS.
        tlsOptions: { 
          rejectUnauthorized: false, // Use com cautela, idealmente configure certificados válidos
        } 
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
          // Busca por todos os e-mails não lidos. A filtragem por Service Tag e Chamado será feita após o parse.
          imap.search(['UNSEEN'], function(err, results) {
            if (err) {
              imap.end();
              return reject('Erro ao buscar e-mails: ' + err);
            }
            if (!results.length) {
              imap.end();
              return resolve(null); // Não encontrou ainda
            }            
            const f = imap.fetch(results, { bodies: '', markSeen: true });
            let respostaFinal = null; // Para armazenar a mensagem de sucesso se um e-mail for processado
            let emailEncontradoEProcessado = false; // Flag para parar após o primeiro e-mail relevante
            let processPromises = [];
            
            f.on('message', function(msg) {
              msg.on('body', function(stream) {
                const mailProcessingPromise = new Promise((resolveMailPromise, rejectMailPromise) => {
                  simpleParser(stream, async (err, parsed) => {
                    if (err) {
                      console.error('Erro ao parsear e-mail:', err.message);
                      return rejectMailPromise(err); // Rejeita a promise desta mensagem
                    }                    
                    console.log(`[IMAP Service] E-mail parseado com sucesso. Assunto: "${parsed.subject}"`);
                    // console.log(`[IMAP Service] Corpo do e-mail (texto): "${parsed.text ? parsed.text.substring(0, 100) + '...' : 'N/A'}"`);

                    if (emailEncontradoEProcessado) { // Se já processamos o e-mail relevante, ignoramos os demais deste fetch
                      return resolveMailPromise();
                    }

                    // Tenta encontrar o emailSubjectIdEsperado no assunto do e-mail
                    // Assumindo que emailSubjectIdEsperado não contém caracteres especiais de regex ou que são simples (alfanuméricos)
                    // Se puder ter caracteres especiais, precisaria de escape: emailSubjectIdEsperado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regexEmailSubject = new RegExp(`\\[ID:${emailSubjectIdEsperado}\\]`, "i");
                    const matchEmailBySubjectId = parsed.subject?.match(regexEmailSubject);

                    if (matchEmailBySubjectId) {
                      console.log(`[IMAP Service] E-mail correspondente encontrado pelo ID no Assunto: ${emailSubjectIdEsperado}. (Service Tag de contexto: ${serviceTagEsperada}, Manutenção ID para DB: ${manutencaoIdEsperado})`);
                      
                      // Tenta extrair o número do chamado do assunto
                      const regexChamadoAssunto = /\[Chamado#(\d+)\]/i; // Captura o número do chamado
                      const matchChamado = parsed.subject?.match(regexChamadoAssunto);
                      // Poderia adicionar uma verificação opcional da serviceTag no corpo/assunto se desejado para maior robustez:
                      // const matchServiceTag = parsed.text?.includes(serviceTagEsperada) || parsed.subject?.includes(serviceTagEsperada);

                      if (matchChamado && matchChamado[1]) {
                        const chamadoExtraido = matchChamado[1];
                        console.log(`[IMAP Service] Chamado extraído: ${chamadoExtraido} do assunto: "${parsed.subject}"`);
                        
                        try {
                          // Atualiza a manutenção usando o manutencaoIdEsperado
                          const updatedManutencao = await Manutencao.findByIdAndUpdate(
                            manutencaoIdEsperado,
                            { chamado: chamadoExtraido },
                            { new: true } // Retorna o documento atualizado
                          );

                          if (updatedManutencao) {
                            respostaFinal = `Registro de Manutenção ID ${manutencaoIdEsperado} (Service Tag ${serviceTagEsperada}) atualizado com chamado ${chamadoExtraido}.`;
                            console.log(`[IMAP Service] ${respostaFinal}`);
                            emailEncontradoEProcessado = true; 
                          } else {
                            // Isso seria inesperado se o manutencaoIdEsperado for válido
                            respostaFinal = `Nenhum registro de manutenção encontrado para ID ${manutencaoIdEsperado} para atualizar com chamado ${chamadoExtraido}.`;
                            console.log(`[IMAP Service] ${respostaFinal}`);
                          }
                        } catch (dbError) {
                          console.error('[IMAP Service] Erro ao atualizar registro de manutenção:', dbError.message);
                          respostaFinal = `Erro DB ao tentar atualizar Manutenção ID ${manutencaoIdEsperado} com chamado ${chamadoExtraido}: ${dbError.message}`;
                          emailEncontradoEProcessado = true; 
                        }
                      } else {
                        console.log(`[IMAP Service] E-mail com Subject ID ${emailSubjectIdEsperado} encontrado, mas sem [Chamado#NUMERO] no assunto: "${parsed.subject}"`);
                      }
                    }
                    // Resolve a promise individual do e-mail
                    resolveMailPromise();
                  });
                });
                processPromises.push(mailProcessingPromise);
              });
            });

            f.once('end', function() {
              Promise.all(processPromises)
                .then(() => {
                  // Se um e-mail relevante foi encontrado e processado, resolve com a respostaFinal.
                  // Caso contrário (nenhum e-mail relevante neste fetch), resolve com null para continuar o polling.
                  resolve(emailEncontradoEProcessado ? respostaFinal : null);
                })
                .catch(err => {
                  console.error('[IMAP Service] Erro no Promise.all ao processar mensagens:', err.message);
                  reject('Erro no processamento de uma ou mais mensagens: ' + err.message);
                })
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

  while (Date.now() - start < timeoutMs) {
    const resultado = await tentarBuscar();
    // Se 'resultado' não for nulo, significa que o e-mail relevante foi encontrado e processado (ou houve tentativa).
    if (resultado !== null) { 
      console.log(`[IMAP Service] Resultado final para Subject ID ${emailSubjectIdEsperado}, Manutenção ID (DB) ${manutencaoIdEsperado}: ${resultado}`);
      return resultado;
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  // Timeout
  console.log(`[IMAP Service] Timeout para Subject ID ${emailSubjectIdEsperado}. Nenhuma resposta de e-mail contendo o chamado foi encontrada.`);
  return `Nenhuma resposta de e-mail contendo o chamado para Subject ID ${emailSubjectIdEsperado} (Manutenção ID DB: ${manutencaoIdEsperado}) foi encontrada após o tempo limite.`;
}

module.exports = { lerRespostaChamado };
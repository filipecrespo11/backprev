const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Manutencao = require('../models/manutencao');

const imap = new Imap({
  user: process.env.URIusername,
  password: process.env.URIpassword,
  host: process.env.URIimaphost, // ex.: imap.campos.unimed.com.br
  port: process.env.URIimapport || 993, // Padrão para IMAP seguro
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) {
      console.error('Erro ao abrir a caixa de entrada:', err);
      throw err;
    }
    imap.search(['UNSEEN'], function(err, results) {
      if (err) {
        console.error('Erro ao buscar e-mails:', err);
        imap.end();
        return;
      }
      if (!results.length) {
        console.log('Nenhum e-mail não lido encontrado.');
        imap.end();
        return;
      }
      const f = imap.fetch(results, { bodies: '' });
      f.on('message', function(msg) {
        msg.on('body', function(stream) {
          simpleParser(stream, async (err, parsed) => {
            if (err) {
              console.error('Erro ao parsear e-mail:', err);
              return;
            }
            // Extrair número do chamado do assunto
            const regexChamado = /\[Chamado#(\d+)\]/;
            const matchChamado = parsed.subject?.match(regexChamado);
            if (!matchChamado) {
              console.log('Nenhum número de chamado encontrado no assunto:', parsed.subject);
              return;
            }
            const chamado = matchChamado[1];

            // Extrair serviceTag do corpo ou assunto
            const regexServiceTag = /Service Tag: (\w+)/i;
            const matchServiceTag = parsed.text?.match(regexServiceTag) || parsed.subject?.match(regexServiceTag);
            if (!matchServiceTag) {
              console.log('Nenhum serviceTag encontrado no e-mail:', parsed.subject);
              return;
            }
            const serviceTag = matchServiceTag[1];

            try {
              // Atualizar o registro de manutenção com base no serviceTag
              const updatedManutencao = await Manutencao.findOneAndUpdate(
                { serviceTag },
                { chamado },
                { new: true }
              );
              if (updatedManutencao) {
                console.log(`Registro de manutenção atualizado para serviceTag ${serviceTag} com chamado ${chamado}`);
              } else {
                console.log(`Nenhum registro de manutenção encontrado para serviceTag ${serviceTag}`);
              }
            } catch (error) {
              console.error('Erro ao atualizar registro de manutenção:', error);
            }
          });
        });
      });
      f.once('end', function() {
        console.log('Finalizada a busca de e-mails.');
        imap.end();
      });
    });
  });
});

imap.once('error', function(err) {
  console.error('Erro IMAP:', err);
});

imap.once('end', function() {
  console.log('Conexão IMAP encerrada');
});

imap.connect();
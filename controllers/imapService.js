const Imap = require('imap');
const { simpleParser } = require('mailparser');
const Manutencao = require('../models/manutencao'); // ajuste para seu model

const imap = new Imap({
  user: process.env.URIusername,
  password: process.env.URIpassword,
  host: process.env.URIimaphost, // adicione no .env: URIimaphost=imap.campos.unimed.com.br
  port: 143 , // adicione no .env: URIimapport=993
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    imap.search(['UNSEEN'], function(err, results) {
      if (err || !results.length) {
        imap.end();
        return;
      }
      const f = imap.fetch(results, { bodies: '' });
      f.on('message', function(msg) {
        msg.on('body', function(stream) {
          simpleParser(stream, async (err, parsed) => {
            if (err) return;
            // Extrai o número do chamado do assunto
            const regex = /\[Chamado#(\d+)\]/;
            const match = parsed.subject.match(regex);
            if (match) {
              const chamado = match[1];
              // Salva no banco (ajuste o schema conforme necessário)
              await Manutencao.create({ chamado });
              console.log('Chamado salvo:', chamado);
            }
          });
        });
      });
      f.once('end', function() {
        imap.end();
      });
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Conexão IMAP encerrada');
});

imap.connect();
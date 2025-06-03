const Imap = require('imap');
const { simpleParser } = require('mailparser');
const mongoose = require('mongoose');
const Manutencao = require('../models/manutencao'); // ajuste para seu model

const imap = new Imap({
  user: process.env.URIusername,
  password: process.env.URIpassword,
  host: process.env.URIhost,
  port: 993,
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
            // Exemplo: extrair um código do corpo do e-mail
            const match = parsed.text.match(/Código:\s*(\w+)/); // ajuste sua regex
            if (match) {
              const codigo = match[1];
              // Salvar no banco
              await Manutencao.create({ codigo });
              console.log('Código salvo:', codigo);
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

// Para rodar: require('./controllers/imapService');
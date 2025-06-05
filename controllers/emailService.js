const nodemailer = require('nodemailer');

async function enviarEmail(destinatario, assunto, texto, serviceTag) {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.URIhost,
            port: process.env.URIport,
            auth: {
                user: process.env.URIusername,
                pass: process.env.URIpassword
            },
            tls: {
                rejectUnauthorized: false // Permite certificados autoassinados
            }
        });

        let mailOptions = {
            from: process.env.URIemail,
            to: destinatario || process.env.URIemailfrom,
            subject: assunto,
            text: `${texto}\nService Tag: ${serviceTag}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado:', info.response);
        return info;
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error.message);
        throw error;
    }
}

module.exports = { enviarEmail };
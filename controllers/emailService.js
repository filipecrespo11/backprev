const nodemailer = require('nodemailer');

async function enviarEmail(destinatario, assunto, texto) {
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
            to: process.env.URIemailfrom,
            subject: assunto,
            text: texto
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw error; // Re-throw to let the calling function handle it
    }
}

module.exports = { enviarEmail };
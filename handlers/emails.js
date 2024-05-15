const nodemailer = require('nodemailer');
const emailConfig = require('../config/emails');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
})

exports.sendEmail = async(options) => {
    console.log(options);

    const file = __dirname + `/../views/emails/${options.template}.ejs`;

    const compiled = ejs.compile(fs.readFileSync(file, 'utf8'));

    const html = compiled({ url : options.url });

    const emailOptions = {
        from: 'LocalLink <noreply@locallink.com>',
        to: options.user.email,
        subject: options.subject,
        html
    }

    const sendMailAsync = util.promisify(transport.sendMail, transport);

    return sendMailAsync.call(transport, emailOptions);
}
const nodemailer = require('nodemailer');
require('dotenv').config()


const GMAIL_PASS = process.env.GMAIL_PASS;
const GMAIL_ACCOUNT = process.env.GMAIL_ACCOUNT;


let transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    // service: 'gmail',
    auth: {
        user: GMAIL_ACCOUNT,
        pass: GMAIL_PASS
    }
});


module.exports = function send_notification() {

    console.log("Sending Email");
    const mailOptions = {
        from: 'majid.dev.shockoohi@gmail.com',
        to: 'majid.shockoohi@gmail.com',         // List of recipients
        subject: 'Oracle updated', // Subject line
        html: '<h1>Nice module you are using</h1><p>Thank you for using this account</p>' // Plain text body
        ,
    };

    // verify connection configuration
    transport.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
            transport.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info);
                }
            })
        }
    });

}
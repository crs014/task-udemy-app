const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "cristonohaklon@gmail.com",
        subject: "Thanks for register",
        text: `welcome to the app ${name}`
    })
};

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "cristonohaklon@gmail.com",
        subject: "Good bye",
        text: `good bye ${name}`
    })
};


module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}

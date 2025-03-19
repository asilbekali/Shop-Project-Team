const nodemailer = require("nodemailer");
const { totp } = require("otplib");
const taransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bozorboyevazizjon56@gmail.com",
        pass: "rgqh wpaa xgwg kwna",
    },
});

totp.options = {
    step: 50000,
};

async function sendEmail(email, otp) {
    await taransporter.sendMail({
        to: email,
        subject: "Your password",
        from: "bozorboyevazizjon56@gmail.com",
        html: `Salom bu sizning parolingiz uni hechkimga bermang ! <h1>${otp}</h1>`,
    });
    console.log("jonatildi");
}

module.exports = { sendEmail };

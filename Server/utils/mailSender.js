const nodemailer = require('nodemailer');

const mailSender = async(email, title, body) => {
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST, //  smtp.gmail.com
            auth: {
                user: process.env.MAIL_USER, // Your email address
                pass: process.env.MAIL_PASS  // Your email password or app password
            }
        });

        let info = await transporter.sendMail({
            from: `StudyNotion`, // sender address
            to: email, // list of receivers
            subject: `${title}`, // Subject line
            html: `<p>${body}</p>` // html body
        });
        console.log(info);

        return info; // Return the info object if needed
    }

    catch(error) {
        console.log("Error in mailSender:", error);
        throw new Error("Failed to send email");
    }
}

module.exports = mailSender;
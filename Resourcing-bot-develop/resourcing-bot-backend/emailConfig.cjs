const nodemailer = require('nodemailer');

// Create a Nodemailer transporter with your email provider's configuration
const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com",   
  port: 2525,       
  secure: false,         
  auth: {
    user: "indu18002@gmail.com", 
    pass: "7A85D06AFEBB013BBFF1F6AD147F2F8E908B",  
  },
});
module.exports = transporter;
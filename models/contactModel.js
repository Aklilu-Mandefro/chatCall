const mongoose = require('mongoose');
const validator = require('validator');
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    user_id: {
        type: String,
        require: true
    },
    created_by: {
        type: String,
        require: true
    },
    last_msg_date:Date
})

const Contact = mongoose.model('contact', contactSchema);
module.exports = Contact;
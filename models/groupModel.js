const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        require: true
    },
    userId: {
        type: String,
        require: true
    },
})

const Groups = mongoose.model('groups', groupSchema);
module.exports = Groups;
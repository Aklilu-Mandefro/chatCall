const mongoose = require('mongoose');
const groupUserSchema = new mongoose.Schema({
    contact_id: {
        type: String,
        required: true
    },
    group_id: {
        type: String,
        require: true
    },
    unread: {
        type:Object,
        default: 0
    },
    is_admin: {
        type:Object,
        default: 0
    }
},{
    timestamps: {
    }
})

const GroupUsers = mongoose.model('group_users', groupUserSchema);
module.exports = GroupUsers;
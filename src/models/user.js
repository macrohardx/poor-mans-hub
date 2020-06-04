const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user_schema = new Schema({
    username: { type: String, required: true, unique: true },
    roles: [{
        name: String
    }],
    claims: [{
        name: String
    }]
})

module.exports = mongoose.model('User', user_schema, 'users')
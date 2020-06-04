const mongoose = require('mongoose')
const config = require('./config.js')

module.exports.connect = async () => {
    let connection_url = `${config.mongo_url}/${config.db_name}`
    await mongoose.connect(connection_url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    console.log(`connected to mongo at: ${connection_url}`)
}
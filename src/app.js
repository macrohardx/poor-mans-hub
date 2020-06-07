const express    = require('express')
const app        = express()
const HttpStatus = require('http-status-codes')
const database   = require('./database-connection')
const config     = require('./config')

module.exports.startApp = async () => {

    // Try connecting to database
    await database.connect()

    // Health check endpoint
    app.get('/api/admin/hc', (req, res) => {
        res.status(HttpStatus.OK).send( { status: 'Online' })
    })
    
    const processController = require('./controllers/process.controller')
    app.use('/api/admin/process', processController)

    // Start app
    app.listen(config.port, () => {
        console.log(`::::${config.service_name}:::: listening to ${config.service_url}:${config.port}`)
    })

    return app
}
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const HttpStatus = require('http-status-codes')
const pm2Wrapper = require('../utils/pm2-wrapper')
const path = require('path')

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())


// refresh available processes

// list processes
router.get('/list', async (_req, res) => {
    let list = await pm2Wrapper.pm2_list()
    return res.status(HttpStatus.OK).send(list)
})

// start process
router.post('/create', async (req, res) => {
    const serverPath = `D:\\Git\\macrohard` //TODO: Do Something about it
    let pid = await pm2Wrapper.pm2_start_process({
        script: path.join(serverPath, req.body.script),
        name: req.body.alias,
        watch: req.body.watch || false
    })
    res.status(HttpStatus.CREATED).send(pid)
    
})

// pause process
router.post('/pause', async (req, res) => {
    await pm2Wrapper.pm2_stop_process(req.body.pid)
    res.sendStatus(HttpStatus.OK)
})

// restart process
router.post('/restart', async (req, res) => {
    await pm2Wrapper.pm2_restart_process(req.body.pid)
    res.sendStatus(HttpStatus.OK)
})

// kill process
router.post('/kill', async (req, res) => {
    await pm2Wrapper.pm2_kill_process(req.body.pid)
    res.sendStatus(HttpStatus.OK)
})

const git = require('simple-git/promise')
const npm = require('npm')
router.post('faz', async (req, res) => {
    const serverPath = `D:\\Git\\macrohard\\clone_here` //TODO: Do Something about it
    git().clone('', serverPath)


    // 1- clone repo inside publish folder

    // 2- install dependencies

    // 2.1- run tests ? (CI)

    // 3- get main file from package.json

    // 4- add main file to reference table

    // 5- start process with pm2 (optional)
})

module.exports = router
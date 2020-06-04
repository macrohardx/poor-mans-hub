const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const HttpStatus = require('http-status-codes')
const User = require('./models/user')
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

// /api/admin/me
router.get('/me', async (req, res) => {

    if (!req.userId) {
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'user not found' })
    }

    let user = await User.findById(req.userId)
    user.password = '******'
    return res.status(HttpStatus.OK).send({ data: user })
})






module.exports = router
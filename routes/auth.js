const express = require('express')
const {check, body} = require('express-validator')

const User = require('../models/user')

const authenticationController = require('../controllers/authenticationController')

const router = express.Router()

router.put('/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please Enter a valid email')
            .custom((value, {req}) => {
                return User.findOne({email: req.body.email})
                    .then(user => {
                        if (user) {
                            return Promise.reject("This Email is Already Used")
                        }
                    })
            }).normalizeEmail(),
        body(['password','name'])
            .trim()
            .isLength({min: 5}),
    ],
    authenticationController.signup)

router.put('/signin', authenticationController.signIn)

module.exports = router
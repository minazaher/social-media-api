const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

const User = require('../models/user')


const handleInternalServerErrors = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
};

const handleValidationErrors = (req, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationError = new Error('Validation Failed, entered data is incorrect');
        validationError.statusCode = 422;
        validationError.data = errors.array();
        throw validationError;
    }
};

exports.signup = async (req, res, next) => {

    handleValidationErrors(req, next);

    const {email, name, password} = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email: email, password: hashedPassword, name: name})

        const saveUser = await user.save()

        res.status(201).json({message: "Successfully signed up!", userId: saveUser._id})

    } catch (err) {
        handleInternalServerErrors(err, next);
    }
}

exports.signIn = async (req, res, next) => {

    handleValidationErrors(req, next);

    const {email, password} = req.body

    try {
        const user = await User.findOne({email: email})
        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password)
            if (isPasswordMatch) {
                console.log(user._id.toString())
                const token = jwt.sign({
                    userEmail: user.email,
                    userId: user._id.toString()
                },"SECRET KEY", {expiresIn: '1h'})
                res.status(200).json({message: "Logged In", token: token})
            }
        } else {
            res.status(404).json({message: "User Not Found"})
        }
    } catch (err) {
        handleInternalServerErrors(err, next)
    }
}
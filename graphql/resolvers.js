const User = require("../models/user")

const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const validator = require('validator')

module.exports = {
    async createUser({user}, req) {
        const {email, password, name} = user

        const errors = []
        if (!validator.isEmail(email)) {
            errors.push({message: "invalid E-mail"})
        }

        if (validator.isEmpty(password) || !validator.isLength(password, {min: 5})) {
            errors.push({message: "invalid Password"})
        }
        if (errors.length > 0) {
            const error = new Error("Invalid Input")
            error.code = 422
            error.data = errors
            throw error
        }

        const existingUser = await User.findOne({email: email})

        if (existingUser) {
            throw new Error("User Already Exists")
        }
        const hashedPassword = await bcrypt.hash(password, 12)

        const createdUser = new User({
            email: email,
            password: hashedPassword,
            name: name
        })

        const savedUser = await createdUser.save()
        return {...savedUser._doc, id: savedUser._id.toString()}
    },
    async login({email, password}, req) {
        const user = await User.findOne({email: email})
        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password)
            if (isPasswordMatch) {
                console.log(user._id.toString())
                const token = jwt.sign({
                    userEmail: user.email,
                    userId: user._id.toString()
                }, "SECRET KEY", {expiresIn: '1h'})
                return {token: token, id: user._id.toString()}
            } else {
                const error = new Error("Password is incorrect")
                error.code = 401
                throw error
            }
        } else {
            const error = new Error("User Not Found")
            error.code = 404
            throw error
        }

    }


}

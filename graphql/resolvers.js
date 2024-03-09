const User = require("../models/user")
const Post = require("../models/post")

const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const validator = require('validator')
const POSTS_PER_PAGE = 2


const handleAuthenticationError = (req) =>{
    if (!req.isAuth) {
        const error = new Error('Not Authenticated')
        error.code = 401
        throw error
    }
}

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

    },

    async createPost({post}, req) {
        const {title, content, imageUrl} = post

        handleAuthenticationError(req)

        const errors = []
        if (!validator.isLength(title, {min: 5})) {
            errors.push({message: "invalid title"})
        }

        if (errors.length > 0) {
            const error = new Error("Invalid Input")
            error.code = 422
            error.data = errors
            throw error
        }

        const user = await User.findById(req.userId)
        if (!user) {
            const error = new Error("Invalid User")
            error.code = 401
            throw error
        }

        const createdPost = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator : user
        })

        const savedPost = await createdPost.save()

        user.posts.push(savedPost)
        await user.save()

        return {
            ...savedPost._doc,
            _id: savedPost._id.toString(),
            createdAt: savedPost.createdAt.toISOString(),
            updatedAt: savedPost.updatedAt.toISOString()
        }



},

    async getAllPosts({pageNumber},req) {
        handleAuthenticationError(req)
        const currentPage = pageNumber || 1

        const totalItems = await Post.find().countDocuments()
        let posts = await Post.find().populate('creator').skip((currentPage - 1) * POSTS_PER_PAGE).limit(POSTS_PER_PAGE).sort({createdAt : -1})

        posts = posts.map(p => {
            return {
                ...p._doc,
                _id: p._id,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString()
            }
        })

        return {posts: posts, totalItems: totalItems}
    }
}

const User = require("../models/user")
const Post = require("../models/post")

const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const validator = require('validator')
const {clearImage} = require("../util/fileHelper");
const POSTS_PER_PAGE = 2


const handleAuthenticationError = (req) =>{
    if (!req.isAuth) {
        const error = new Error('Not Authenticated')
        error.code = 401
        throw error
    }
}

const handlePostValidationError = (title, content) =>{

    const errors = []
    if (!validator.isLength(title, {min: 5})) {
        errors.push({message: "invalid title"})
    }
    if (!validator.isLength(content, {min: 5})) {
        errors.push({message: "invalid Content"})
    }

    if (errors.length > 0) {
        const error = new Error("Invalid Input")
        error.code = 422
        error.data = errors
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
        handlePostValidationError(title, content)

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
    },

    async getPost({id}, req){
        handleAuthenticationError(req)
        const post = await Post.findById(id).populate('creator')

        if (!post) {
            const error = new Error("Post Not Found")
            error.statusCode = 404
            throw error
        }
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },
    async updatePost({id, postInput}, req){
        handleAuthenticationError(req)

        const post = await Post.findById(id).populate('creator')
        const {title, content, imageUrl} = postInput

        handlePostValidationError(title, content)
        post.title = title
        post.content = content

        if(imageUrl !== 'undefined'){
            post.imageUrl = imageUrl
        }

        const savedPost =  await post.save()

        return {
            ...savedPost._doc,
            id: savedPost._id.toString(),
            createdAt: savedPost.createdAt.toISOString(),
            updatedAt: savedPost.updatedAt.toISOString()}

    },
    async deletePost({id}, req, b: boolean = false) {
        try
        {
            handleAuthenticationError(req)
            const post = await Post.findByIdAndDelete(id)
            if (post.imageUrl) {
                clearImage(post.imageUrl)
            }
            const creatorId = post.creator.toString()
            const user = await User.findById(creatorId)
            user.posts.pull(id)
            await user.save()
            return true
        }catch (e) {
            return false
        }
    }
}

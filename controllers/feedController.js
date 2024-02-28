const {validationResult} = require('express-validator')
const fs = require('fs')
const path = require('path')

const mongoose = require("mongoose");

const Post = require('../models/post')
const User = require('../models/user')

const POSTS_PER_PAGE = 2
const handleValidationErrors = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationError = new Error('Validation Failed, entered data is incorrect');
        validationError.statusCode = 422;
        validationError.data = errors.array();
        throw validationError;
    }
};

const handleImageAttachmentErrors = (req) => {
    if (!req.file) {
        const error = new Error("No Image Attached")
        error.statusCode = 422
        throw error
    }
}
const handlePostNotFoundError = (post) => {
    if (!post) {
        const error = new Error("Post Not Found")
        error.statusCode = 404
        throw error
    }
}

const handleInternalServerErrors = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
};

const handleAuthorizationError = (req, post) => {
    if (post.creator.toString() !== req.userId.toString()) {
        const error = new Error('Not Authorized!')
        error.statusCode = 403
        throw error
    }
};
const handlePostCreationErrors = (req) => {
    handleValidationErrors(req)
    handleImageAttachmentErrors(req)
}

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1
    try {
        const totalItems = await Post.find().countDocuments()
        const posts = await Post.find().skip((currentPage - 1) * POSTS_PER_PAGE).limit(POSTS_PER_PAGE)
        res.status(200).json({message: "Fetched Successfully", posts: posts, totalItems: totalItems})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

exports.createPost = async (req, res, next) => {
    handlePostCreationErrors(req)

    const {title, content} = req.body
    const imageUrl = req.file.path

    const post = new Post({
        title: title, content: content, imageUrl: imageUrl.replaceAll('\\', '/'), creator: req.userId,
    })

    try {
        const savedPost = await post.save()
        const postCreator = await User.findById(req.userId)
        postCreator.posts.push(savedPost)
        await postCreator.save()
        res.status(201).json({
            message: "Successfully Posted!", post: post, creator: {_id: postCreator._id, name: postCreator.name}
        })
    } catch (err) {
        handleInternalServerErrors(err, next)
    }

}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId
    try {
        const post = await Post.findById(postId)
        handlePostNotFoundError(post)
        res.status(200).json({
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            creator: post.creator,
            createdAt: post.createdAt
        })
    } catch (err) {
        handleInternalServerErrors(err, next)
    }

}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId
    handleValidationErrors(req)
    const {title, content} = req.body
    let imageUrl = req.body.image
    if (req.file) {
        imageUrl = req.file.path
    }
    try {
        const post = await Post.findOne({_id: postId})
        if (!post) handlePostNotFoundError(post)
        handleAuthorizationError(req, next)
        handleImageAttachmentErrors(req)
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl)
        }
        post.title = title
        post.content = content
        post.imageUrl = imageUrl.replaceAll('\\', '/')

        await post.save()

        res.status(200).json({message: 'Updated Successfully'})
    } catch (err) {
        handleInternalServerErrors(err, next)
    }

}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId

    try {
        const post = await Post.findById(postId)
        if (post.imageUrl) {
            clearImage(post.imageUrl)
        }
        handleAuthorizationError(req, post)
        await Post.deleteOne({_id: postId})
        const user = await User.findById(req.userId)
        user.posts.pull(postId)
        await user.save()
        res.status(200).json({message: 'Deleted Successfully'})
    } catch (err) {
        handleInternalServerErrors(err, next)
    }

}
const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", filePath.replaceAll('/', '\\'))
    fs.unlink(filePath, err => console.log(err))
}

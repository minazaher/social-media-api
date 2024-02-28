const {validationResult} = require('express-validator')
const fs = require('fs')
const path = require('path')
const Post = require('../models/post')
const mongoose = require("mongoose");

const POSTS_PER_PAGE = 2

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    let totalItems;

    Post.find().countDocuments()
        .then(count => {
            totalItems = count
            return Post.find().skip((currentPage - 1) * POSTS_PER_PAGE).limit(POSTS_PER_PAGE)
        }).then(posts => {
        res.status(200).json({message: "Fetched Successfully", posts: posts, totalItems: totalItems})
    })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!req.file) {
        const error = new Error("No Image Attached")
        error.statusCode = 422
        throw error
    }
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed, entered data in incorrect')
        error.statusCode = 422
        throw error
    }

    console.log(req.file)

    const title = req.body.title
    const content = req.body.content
    const imageUrl = req.file.path

    const post = new Post({
        title: title, content: content, imageUrl: imageUrl.replaceAll('\\', '/'), creator: {name: 'Mina'},
    })

    post.save().then(post => {
        res.status(201).json({
            message: "Successfully Posted!", post: post
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })


}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post Not Found")
                error.statusCode(404)
                throw error
            }
            console.log(post.imageUrl)
            res.status(200).json({
                title: post.title,
                content: post.content,
                imageUrl: post.imageUrl,
                creator: post.creator,
                createdAt: post.createdAt
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed, entered data in incorrect')
        error.statusCode = 422
        throw error
    }

    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.body.image

    if (req.file) {
        imageUrl = req.file.path
    }
    if (!imageUrl) {
        const error = new Error("Image Not Found")
        error.statusCode(422)
        throw error
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error("Post Not Found")
                error.statusCode(404)
                throw error
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title
            post.content = content
            post.imageUrl = imageUrl.replaceAll('\\', '/')
            return post.save()
        }).then(result => {
        res.status(200).json({
            post: result, message: 'Updated Successfully'
        })

    })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId

    Post.findByIdAndDelete(postId)
        .then(post => {
            if (post.imageUrl) {
                clearImage(post.imageUrl)
            }
        }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}
const clearImage = (filePath) => {
    filePath = path.join(__dirname, "..", filePath.replaceAll('/', '\\'))
    fs.unlink(filePath, err => console.log(err))
}

const getNumberOfPosts = (callback) => {
    let postsNumber
    Post.find().countDocuments()
        .then(count => {
            postsNumber = count
            callback(null, postsNumber)
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            callback(err)
        })
}
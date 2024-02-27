const {validationResult} = require('express-validator')

const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts:
            [{
                _id: "1",
                title: "Post Title",
                content: "This is the first post",
                imageUrl: 'images/image.png',
                creator: {
                    name: 'Mina'
                },
                createdAt: new Date()
            }]
    })
}

exports.createPost = (req, res, next) => {
    const title = req.body.title
    const content = req.body.content
    const imageUrl = req.file
    const errors = validationResult(req)

    if (!errors.isEmpty()){
        const error = new Error('Validation Failed, entered data in incorrect')
        error.statusCode = 422
        throw error
    }

    const post = new Post({
        title: title,
        content: content,
        creator: {name: 'Mina'},
        imageUrl: 'images/image.png'
    })

    post.save().then(post =>{
        res.status(201).json({
            message: "Successfully Posted!",
            post: post
        })
    }).catch(err =>{
        if (!err.statusCode){
            err.statusCode = 500
        }
        throw err
    })


}
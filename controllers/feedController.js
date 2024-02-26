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

    res.status(201).json({
        message: "Successfully Posted!",
        post: {
            _id: new Date().toISOString(),
            title: title,
            content: content,
            creator: {
                name: 'Mina'
            },
            createdAt: new Date()
        }
    })
    console.log("Successfully Posted!")
}
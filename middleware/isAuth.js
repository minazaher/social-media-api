const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')
    const token = authHeader.split(' ')[1]
    let decodedToken
    try {
        decodedToken = jwt.verify(token, 'SECRET KEY')
    } catch (err) {
        err.statusCode = 500
        throw err
    }
    if (!decodedToken) {
        const error = new Error('Not Authenticated')
        error.statusCode = 401
        throw error
    }
    console.log("We Reached this point and the user id is ", decodedToken.userId)
    req.userId = decodedToken.userId
    next()
}
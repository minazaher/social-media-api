const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')

const DatabaseUri = 'mongodb+srv://MinaZaher:QvyBUi6Oq7TbXpks@cluster0.mysoorl.mongodb.net/RESTfulAPI'

const multerStorage = new multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images'),
    filename: (req, file, cb) => cb(null, file.originalname)
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png')
        cb(null, true)
    else
        cb(null, false)
}

const app = express()
// app.use(bodyParser.json())
app.use(multer({storage: multerStorage, fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS'){
        return res.sendStatus(200) // for graphql, because it only works with get and post requests
    }
    next()
})

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
        if (!err.originalError){
            return err
        }
        const data = err.originalError.data
        const message = err.message || "An error occured"
        const code = err.originalError.code || 500
        return {data: data, message: message, code: code}
    }
}))

app.use((err, req, res, next) => {
    console.log(err)
    const status = err.statusCode || 500
    const message = err.statusMessage
    const data = err.data
    res.status(status).json({message: message, data: data})
})

mongoose.connect(DatabaseUri)
    .then(() => {
        app.listen(8080)
    })
    .catch(err => {
        console.log(err)
    })


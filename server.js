const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')

const DatabaseUri = 'mongodb+srv://MinaZaher:QvyBUi6Oq7TbXpks@cluster0.mysoorl.mongodb.net/RESTfulAPI'

const multerStorage = new multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images'),
    filename: (req, file, cb) => cb(null, file.originalname)
})
const  fileFilter = (req,file,cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png')
        cb(null, true)
    else
        cb(null, false)
}


const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const app = express()
app.use(bodyParser.json())
app.use(multer({storage: multerStorage, fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/auth', authRoutes)
app.use('/feed', feedRoutes)

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


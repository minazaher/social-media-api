const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const DatabaseUri = 'mongodb+srv://MinaZaher:QvyBUi6Oq7TbXpks@cluster0.mysoorl.mongodb.net/RESTfulAPI'

const feedRoutes = require('./routes/feed')

const app = express()
app.use(bodyParser.json())

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use((req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)

app.use((err, req, res, next) =>{
    console.log(err)
    const status = err.statusCode || 500
    const message = err.statusMessage
    res.status(status).json({message: message})
})

mongoose.connect(DatabaseUri)
    .then(() =>{
        app.listen(8080)
    })
    .catch(err =>{
        console.log(err)
    })


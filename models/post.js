const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
        title: {
            type: Schema.Types.String,
            required: true
        },
        imageUrl: {
            type: Schema.Types.String,
            required: true
        },
        content: {
            type: Schema.Types.String,
            required: true
        },
        creator: {
            type: Object,
            required: true
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('Post', postSchema)
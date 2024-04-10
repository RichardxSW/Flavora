const {Schema, model} = require('mongoose')

const recipesSchema = new Schema({
    recipeID: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: [String],
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    featured: {
        type: String
    },
    time: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    serving: {
        type: String,
        required: true
    },
    length: {
        type: String,
        required: true
    },
    minutes: {
        type: String,
        required: true
    },
    calories: {
        type: String,
        required: true
    },
    bahan: {
        type: [String],
        required: true
    },
    cara: {
        type: [String],
        required: true
    },
    reviews: [{
        name: {
            type: String,
            required: true
        },
        photo: {
            type: String,
            required: true
        },
        rating: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        review: {
            type: String,
            required: true
        }
    }],
    totalReviews: { 
        type: Number 
    },
    averageRating: {
        type: Number 
    }
})

module.exports = model('Recipe', recipesSchema)
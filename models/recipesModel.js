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
        // required: true
    },
    url: {
        type: String,
        required: true,
        default: '/detail'
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
        type: Number,
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
        type: Number,
        default: 0 
    },
    averageRating: {
        type: Number,
        default: 0
    },
    pinnedBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "LocalUser"
        },
        status: {
            type: String,
            enum: ['pinned', 'unpinned'], 
            default: 'unpinned'
        }
    }],
    pinnedByGoogle: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "User" 
        },
        status: {
            type: String,
            enum: ['pinned', 'unpinned'], 
            default: 'unpinned'
        }
    }]
})

module.exports = model('Recipe', recipesSchema)
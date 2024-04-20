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
        type: String,
        default: 'no'
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
    }],
    lastSeenBy: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: "LocalUser"
        },
        lastSeenAt: {
            type: Date,
            // default: Date.now
        }
    }]
})

// Hook pre-save untuk menghitung averageRating
recipesSchema.pre('save', function(next) {
    const totalReviews = this.reviews.length;
    let totalRating = 0;
    for (const review of this.reviews) {
        totalRating += parseInt(review.rating);
    }
    this.totalReviews = totalReviews;
    this.averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
    next();
});

module.exports = model('Recipe', recipesSchema)
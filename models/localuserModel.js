const {Schema, model} = require('mongoose')

const LocalUserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    // password: {
    //     type: String,
    //     required: true
    // },
    hashedPassword: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String, 
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    savedRecipes: [{
        type: Schema.Types.ObjectId, 
        ref: "Recipe"
    }],
    folders: [{
        name: {
            type: String,
            required: true,
        },
        desc: {
            type: String
        },
        url: {
            type: String,
            required: true,
            default: '/folder'
        },
        recipes: [{
            type: Schema.Types.ObjectId,
            ref: "Recipe"
        }]
    }]
})

module.exports = model('LocalUser', LocalUserSchema)
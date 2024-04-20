const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    googleId: {
        type: String,
        required: true, // Jika setiap akun Google harus unik
    },
    displayName: {
        type: String,
    },
    email: {
        type: String,
    },
    profilePicture: {
        type: String, // Anda dapat menggunakan tipe String untuk menyimpan URL gambar profil
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

module.exports = model('User', userSchema)
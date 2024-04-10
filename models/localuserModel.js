const {Schema, model} = require('mongoose')

const LocalUserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String, // Anda dapat menggunakan tipe String untuk menyimpan URL gambar profil
    }
})

module.exports = model('LocalUser', LocalUserSchema)
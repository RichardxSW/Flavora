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
    }
})

module.exports = model('User', userSchema)
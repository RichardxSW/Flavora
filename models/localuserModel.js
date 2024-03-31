const {Schema, model} = require('mongoose')

const localuserSchema = new Schema({
    fullName: {
        type: String,
        required: true, // Jika setiap akun Google harus unik
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNum: {
        type: String,
        required: true, 
        unique: true // Anda dapat menggunakan tipe String untuk menyimpan URL gambar profil
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = model('Localuser', localuserSchema)
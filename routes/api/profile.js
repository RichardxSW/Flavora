const {Router} = require('express');
const multer = require('multer');
const LocalUser = require("../../models/localuserModel");
const profileRouter = Router();

// Route untuk redirect ke page profile
profileRouter.get('/profile', (req, res) => {
    let userData = req.session.freshUserData || {}; // Inisialisasi objek userData
    let errorMsg = req.flash('error');
    let successMsg = req.flash('success');

    if (!req.user) {
        // Jika pengguna belum login, hapus session.freshUserData jika ada
        if (req.session.freshUserData) {
            delete req.session.freshUserData;
        }
    } else {
        // Jika pengguna sudah login
        if (!userData || Object.keys(userData).length === 0) {
            // Jika userData kosong, isi dengan data pengguna dari req.user
            if (req.user.username) { 
                // Data local user
                userData = {
                    name: req.user.username || '', 
                    profilePicture: req.user.profilePicture,
                    email: req.user.email || '',
                    password: maskPassword(req.user.password || ''),
                    _id: req.user._id
                };
            } else {
                // Data google user
                userData = {
                    name: req.user.displayName || '',
                    profilePicture: req.user.profilePicture || '',
                    email: req.user.email || '',
                    password: maskPassword(req.user.password || ''),
                    _id: req.user._id
                };
            }
        } else {
            // Jika userData sudah terisi, ubah nama-nama properti sesuai keinginan
            userData.name = userData.username;
            userData.password = maskPassword(userData.password || ''); // Ubah password menjadi masked version
        }
    }

    res.render('profile', {
        user: userData,
        errorMsg: errorMsg,
        successMsg: successMsg,
        title: 'Profile', 
        layout: 'accountLayout'
    });
});

// Fungsi untuk mengubah password menjadi *
function maskPassword(password) {
    return '*'.repeat(password.length);
}

// Route untuk redirect ke page edit
profileRouter.get('/edit', async(req, res) => {
    try {
        const id = req.query.id;
        const userData = await LocalUser.findById(id);

        if(userData){
            res.render('edit', {
                user: userData,
                title: 'Edit', 
                layout: "accountLayout"});
        }
        else{
            // Menampilkan pesan akun tidak bisa dimodifikasi untuk google user
            req.flash('errorMsg', 'Account can not be modified.');
            res.redirect('/profile');
        }
    } catch (error) {
        console.log(error.message);
    }
});

// Konfigurasi penyimpanan file user profile dengan multer
const storage = multer.diskStorage({
    destination:  './public/userImages', // Menentukan direktori penyimpanan file
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name) // Menentukan nama file yang diunggah
    }
});

// Inisialisasi multer dengan konfigurasi penyimpanan
const upload = multer({ storage: storage });

// Route untuk handle edit profile
profileRouter.post('/edit', upload.single('image'), async(req, res) => {
    try {
        let userData = {};
        const id = req.body.user_id;

        if (req.file) {
            // Jika ada file yang diunggah, simpan informasi file ke dalam userData
            userData = {
                username: req.body.name,
                email: req.body.email,
                password: req.body.password,
                profilePicture: req.file.filename // Gunakan req.file.filename untuk mendapatkan nama file yang disimpan oleh multer
            };

            // Menghapus foto lama jika ada dan bukan 'profilepic.jpg'
            const oldUserData = await LocalUser.findById(id);
            if (oldUserData.profilePicture && oldUserData.profilePicture !== 'profilepic.jpg') {
                const oldImagePath = path.join(__dirname, '/public/userImages', oldUserData.profilePicture);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`File ${oldUserData.profilePicture} telah dihapus.`);
                }
            }
        } else {
            // Jika tidak ada file yang diunggah, hanya simpan informasi pengguna
            userData = {
                username: req.body.name,
                email: req.body.email,
                password: req.body.password
            };
        }

        // Update data pengguna di MongoDB
        const updatedUserData = await LocalUser.findByIdAndUpdate(id, { $set: userData }, { new: true });

        // Ambil data terbaru dari MongoDB
        const freshUserData = await LocalUser.findById(id);

        // Simpan freshUserData di dalam sesi atau cookie
        req.session.freshUserData = freshUserData;

        // Menampilkan pesan akun berhasil diupdate dan redirect ke halaman profil
        req.flash('successMsg', 'Account updated successfully.');
        res.redirect('/profile');

    } catch (error) { 
        console.log(error.message);
    }
});

module.exports = profileRouter;
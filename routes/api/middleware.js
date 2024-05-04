const bcrypt = require("bcrypt");
const LocalUser = require("../../models/localuserModel");

async function createAdmin() {
    try {
        // Check if there is an existing admin
        const existingAdmin = await LocalUser.findOne({ isAdmin: true });
        if (!existingAdmin) {
            // If no admin found, create one
            const adminData = {
                email: 'admin@admin',
                password: 'admin', // Use raw password
                username: 'Admin',
                profilePicture: 'profilepic.jpg',
                isAdmin: true
            };

            // Hash password
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            adminData.hashedPassword = hashedPassword; // Store hashed password

            // Create new admin object
            const newAdmin = new LocalUser(adminData);

            // Save admin object to the database
            await newAdmin.save();
        }
    } catch (error) {
        throw error;
    }
}

function checkUser(req, res, next) {
    // Check if the user is accessing login or register page
    if (req.path === '/' || req.path === '/local' || req.path === '/register') {
        return next();
    }

    // Initialize userData object
    let userData = req.session.freshUserData || {};

    if (!req.user) {
        // If user is not logged in, redirect to home page
        return res.redirect('/');
    } else {
        // If user is logged in
        if (!userData || Object.keys(userData).length === 0) {
            // If userData is empty, populate it with user data from req.user
            userData = {
                name: req.user.username || req.user.displayName || '',
                profilePicture: req.user.profilePicture || '',
                _id: req.user._id
            };
        } else {
            // If userData is already populated, modify property names as desired
            userData.name = userData.username;
        }
    }

    req.userData = userData;
    next();
}

function redirectTrailingSlash(req, res, next) {
    if (req.path.slice(-1) === '/' && req.path.length > 1) {
        const query = req.url.slice(req.path.length);
        const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
        return res.redirect(301, safepath + query);
    }
    next();
}

// Middleware untuk memeriksa apakah pengguna terautentikasi dan jenis otentikasi
function isAuthenticated(req, res, next) {
    if (req.user) {
        // Jika pengguna terautentikasi dan objek req.user ada
        return next();
    } else {
    // Jika pengguna tidak terautentikasi atau req.user tidak ada, redirect ke halaman login
    res.redirect('/');
    }
}

function isLoggedIn(req,res,next){
    req.user? next(): res.sendStatus(401);
}

module.exports = { createAdmin, checkUser, redirectTrailingSlash, isAuthenticated, isLoggedIn};
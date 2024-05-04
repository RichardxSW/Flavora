const {Router} = require('express');
const pinRouter = Router();
const Recipes = require('../../models/recipesModel');
const User = require("../../models/userModel");
const LocalUser = require("../../models/localuserModel");
const { isAuthenticated } = require('./middleware');

// Endpoint untuk mem-pin resep
pinRouter.post('/pinrecipe', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.body.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);
        const gUser = await User.findById(userId);

        if (user) {
            // Tambahkan pengguna ke daftar yang mem-pin resep
            await Recipes.findByIdAndUpdate(recipeId, { $addToSet: { pinnedBy: { user: userId, status: 'pinned' } } });
            user.savedRecipes.addToSet(recipeId);
            await user.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe pinned successfully' });
        } else if (gUser) {
            await Recipes.findByIdAndUpdate(recipeId, { $addToSet: { pinnedByGoogle: { user: userId, status: 'pinned' } } });
            gUser.savedRecipes.addToSet(recipeId);
            await gUser.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe pinned successfully' });
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk meng-unpin resep
pinRouter.post('/unpinrecipe', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.body.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);
        const gUser = await User.findById(userId);

        if (user) {
            // Hapus pengguna dari daftar yang mem-pin resep
            await Recipes.findByIdAndUpdate(recipeId, { $pull: { pinnedBy: { user: userId } } });
            user.savedRecipes.pull(recipeId);
            await user.save();

            // Loop melalui setiap folder pengguna
            for (const folder of user.folders) {
                // Jika resep ada dalam folder, hapus dari folder
                if (folder.recipes.includes(recipeId)) {
                    folder.recipes.pull(recipeId);
                }
            }
            // Simpan perubahan
            await user.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe unpinned successfully' });
        } else if (gUser) {
            await Recipes.findByIdAndUpdate(recipeId, { $pull: { pinnedByGoogle: { user: userId } } });
            gUser.savedRecipes.pull(recipeId);
            await gUser.save();

            // Loop melalui setiap folder pengguna
            for (const folder of gUser.folders) {
                // Jika resep ada dalam folder, hapus dari folder
                if (folder.recipes.includes(recipeId)) {
                    folder.recipes.pull(recipeId);
                }
            }
            // Simpan perubahan
            await gUser.save();

            // Kirim balasan sukses
            res.status(200).json({ message: 'Recipe pinned successfully' });
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk memeriksa status pin resep
pinRouter.get('/checkpinstatus/:recipeId', async (req, res) => {
    try {
        const userId = req.user._id;
        const recipeId = req.params.recipeId;

        // Temukan pengguna berdasarkan ID
        const user = await LocalUser.findById(userId);
        const gUser = await User.findById(userId);

        if (user) {
            const recipe = await Recipes.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ error: 'Recipe not found' });
            }

            const pinStatus = recipe.pinnedBy.find(pin => pin.user.equals(userId));
            const isPinned = pinStatus && pinStatus.status === 'pinned';

            res.status(200).json({ isPinned });
        } else if (gUser) {
            const recipe = await Recipes.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ error: 'Recipe not found' });
            }

            const pinStatus = recipe.pinnedByGoogle.find(pin => pin.user.equals(userId));
            const isPinned = pinStatus && pinStatus.status === 'pinned';

            res.status(200).json({ isPinned });
        } else {
            // Jika pengguna tidak ditemukan
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Halaman Pinned
pinRouter.get('/pinned', isAuthenticated, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        let userId;
        if (req.user.googleId) {
            userId = req.user._id; // Jika pengguna Google
        } else {
            userId = req.user._id; // Jika pengguna lokal
        }

        let user;
        if (req.user.googleId) {
            user = await User.findById(userId).populate('savedRecipes'); // Jika pengguna Google
        } else {
            user = await LocalUser.findById(userId).populate('savedRecipes'); // Jika pengguna lokal
        }

        if (user) {
            // Ambil daftar resep yang disimpan oleh pengguna
            const savedRecipes = user.savedRecipes;

            // Ambil semua resep
            const allRecipes = await Recipes.find();

            // Hitung jumlah total halaman
            const totalPages = Math.ceil( (savedRecipes.length) / limit);

            const folders = user.folders;

            // Ambil resep untuk halaman saat ini menggunakan skip dan limit
            const paginatedRecipes = savedRecipes.slice(skip, skip + limit);

            res.render('pinned', {
                savedRecipes: paginatedRecipes,
                savedRecipesCount: savedRecipes,
                folders: folders,
                recipes: allRecipes,
                title: 'Pinned',
                layout: "mainlayout",
                user: req.userData,
                isAdmin: req.user.isAdmin,
                totalPages: totalPages,
                limit: limit,
                currentPage: page
            });
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
});

module.exports = pinRouter;
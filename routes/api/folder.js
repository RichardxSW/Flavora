const {Router} = require('express');
const folderRouter = Router();
const Recipes = require('../../models/recipesModel');
const { isAuthenticated, findUser } = require('./middleware');

// Endpoint untuk menyimpan folder baru
folderRouter.post('/folders', isAuthenticated, findUser, async (req, res) => {
    try {
        const { folderName, description } = req.body;

        // Tambahkan folder ke daftar folder pengguna
        req.user.folders.push({ name: folderName, desc: description });
        await req.user.save();

        // Kirim respons sukses
        res.status(201).json({ message: 'Folder created successfully', folder: req.user.folders[req.user.folders.length - 1] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Menambahkan resep ke folder
folderRouter.post('/addToFolder', isAuthenticated, findUser, async (req, res) => {
    try {
        const { recipeId, folders } = req.body;

        // Perbarui setiap folder yang dipilih dengan menambahkan recipeId ke dalam array recipes
        for (const folderId of folders) {
            const folder = req.user.folders.find(folder => folder._id == folderId);
            if (folder) {
                folder.recipes.addToSet(recipeId);
            }
        }

        // Simpan perubahan pada pengguna
        await req.user.save();

        // Kirim respons sukses
        res.status(200).json({ message: 'Recipe added to folder(s) successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint untuk menampilkan halaman folder
folderRouter.get('/folder/:folderId', isAuthenticated, findUser, async (req, res) => {
    try {
        const folderId = req.params.folderId;
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        const resep = await Recipes.find();

        const folders = req.user.folders;

        // Temukan folder dengan ID yang sesuai dalam daftar folder pengguna
        const folder = req.user.folders.find(folder => folder._id.toString() === folderId);
        if (!folder) {
            return res.status(404).send("Folder not found");
        }

        // Dapatkan detail resep yang terkait dengan folder
        const recipeIds = folder.recipes;
        const recipes = await Recipes.find({ _id: { $in: recipeIds } });

        // Hitung jumlah total halaman
        const totalPages = Math.ceil(recipes.length / limit);

        // Ambil resep untuk halaman saat ini menggunakan skip dan limit
        const paginatedRecipes = recipes.slice(skip, skip + limit);

        // Kirimkan detail folder dan resep ke tampilan
        res.render('folder', {
            selectedFolder: folder,
            resep: resep,
            folders: folders,
            title: folder.name,
            recipes: paginatedRecipes,
            layout: "mainlayout",
            user: req.userData,
            isAdmin: req.user.isAdmin,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        });
    } catch (error) {
        // Tangani kesalahan internal server
        res.status(500).send("Internal Server Error");
    }
});


// Endpoint untuk menyimpan perubahan pada folder ke MongoDB
folderRouter.put('/folder/:folderId', isAuthenticated, findUser, async (req, res) => {
    try {
        const folderId = req.params.folderId;

        // Temukan folder dengan ID yang sesuai dalam daftar folder pengguna
        const folderIndex = req.user.folders.findIndex(folder => folder._id.toString() === folderId);
        if (folderIndex === -1) {
            return res.status(404).send("Folder not found");
        }

        // Update data folder dengan data yang dikirimkan dari client
        req.user.folders[folderIndex].name = req.body.folderName || req.user.folders[folderIndex].name;
        req.user.folders[folderIndex].desc = req.body.description || req.user.folders[folderIndex].description;

        // Simpan perubahan ke MongoDB
        await req.user.save();

        res.json({ message: 'Folder updated successfully' });
    } catch (error) {
        // Tangani kesalahan internal server
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint untuk menghapus folder dari MongoDB
folderRouter.delete('/folder/:folderId', isAuthenticated, findUser, async (req, res) => {
    try {
        const folderId = req.params.folderId;

        // Temukan folder dengan ID yang sesuai dalam daftar folder pengguna
        const folderIndex = req.user.folders.findIndex(folder => folder._id.toString() === folderId);
        if (folderIndex === -1) {
            return res.status(404).send("Folder not found");
        }

        // Hapus folder dari daftar folder pengguna
        req.user.folders.splice(folderIndex, 1);

        // Simpan perubahan ke MongoDB
        await req.user.save();

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        // Tangani kesalahan internal server
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint untuk menghapus resep dari folder
folderRouter.delete('/removeFromFolder', isAuthenticated, findUser, async (req, res) => {
    try {
        const { recipeId, folderId } = req.body;

        // Temukan folder yang sesuai dengan ID
        const folder = req.user.folders.find(folder => folder._id == folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Hapus recipeId dari array recipes di folder
        folder.recipes.pull(recipeId);

        // Simpan perubahan
        await req.user.save();

        // Kirim respons sukses
        res.status(200).json({ message: 'Recipe removed from folder successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = folderRouter;
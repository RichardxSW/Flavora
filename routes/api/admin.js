const {Router} = require('express');
const multer = require('multer');
const fs = require('fs');
const adminRouter = Router();
const Recipes = require('../../models/recipesModel');

// Route untuk redirect ke page dashboard
adminRouter.get('/dashboard', async(req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('dashboard', {
            recipes: recipes, 
            title: 'Dashboard', 
            layout: "mainlayout",
            user: req.userData,
            isAdmin: req.user.isAdmin,
        });
        } else {
            res.status(404).send("Recipe not found")
        }
        } catch (error) { 
            res.status(500).send("Internal Server Error")
        }
    });

// Route untuk handle delete recipe
adminRouter.delete('/deleteRecipe/:recipeID', async (req, res) => {
    try {
        // Ambil ID resep dari parameter route
        const recipeID = req.params.recipeID;

        // Cari resep di database
        const recipe = await Recipes.findOne({recipeID: recipeID});

        if (!recipe) {
            return res.status(404).send("Recipe not found");
        }

        // Hapus file gambar
        const imagePath = './public' + recipe.img;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Hapus resep dari database
        await Recipes.deleteOne({recipeID: recipeID});

        // Kirim respon yang berhasil
        req.flash('deletedMsg','Recipe deleted successfully');
        res.status(200).end();
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route untuk redirect ke page add recipe
adminRouter.get('/addRecipe', async(req, res) => {
    try {
        const recipes = await Recipes.find();
        if (recipes) {
            res.render('addRecipe', {
            recipes: recipes, 
            title: 'Add new Recipe', 
            layout: "mainlayout", 
            user: req.userData,
            isAdmin: req.user.isAdmin,
        });
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Konfigurasi penyimpanan file recipe photo dengan multer
const storageRecipe = multer.diskStorage({
    destination: './public/img', // Menentukan direktori penyimpanan file
    filename: function (req, file, cb) {
        const name = file.originalname;
        cb(null, name) // Menentukan nama file yang diunggah
    }
});

// Inisialisasi multer dengan konfigurasi penyimpanan
const uploadRecipe = multer({ storage: storageRecipe });
    
// Route untuk handle penambahan resep
adminRouter.post('/addRecipe', uploadRecipe.single('img') , async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send("No image uploaded");
        }
        
        const lastRecipe = await Recipes.findOne().sort({ recipeID: -1 });

        const recipeID = lastRecipe ? lastRecipe.recipeID + 1 : 1;
        // Masukkan data dari input admin
        const {
            title,
            category,
            nationality,
            featured,
            img = '/img/' + req.file.filename,
            desc,
            serving,
            length,
            minutes,
            time = minutes + ' Minutes',
            calories,
            bahan,
            cara 
        } = req.body;

        const newRecipe = new Recipes({
            recipeID,
            title,
            category,
            nationality,
            featured,
            img,
            desc,
            serving,
            length,
            time,
            minutes,
            calories,
            bahan,
            cara
        });
        await newRecipe.save();
        // Menampilkan pesan recipe berhasil ditambahkan
        req.flash('successAddMsg', 'Recipe Added')
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

// Route untuk redirect ke page edit recipe
adminRouter.get('/editRecipe/:recipeID', async (req, res) => {
    try {
        const recipeID = req.params.recipeID
        // const resep = await Recipes.find()
        const recipes = await Recipes.findOne({ recipeID })
        if (recipes) {
            res.render('editRecipe', {
                // resep: resep,
                recipes: recipes ,
                user: req.userData,
                isAdmin: req.user.isAdmin,
                title: 'Edit Recipe' + ` ${recipes.title}`, 
                layout: "mainlayout"})
        } else {
            res.status(404).send("Recipe not found")
        }
    } catch (error) { 
        res.status(500).send("Internal Server Error")
    }
})

// Route untuk handle pengeditan resep
adminRouter.post('/editRecipe/:recipeID', uploadRecipe.single('img') , async (req, res) => {
    try {
        const { recipeID } = req.params;

        // Temukan resep yang akan diupdate
        const existingRecipe = await Recipes.findOne({recipeID});

        if (!existingRecipe) {
            return res.status(404).send("Recipe not found");
        }

        const updatedRecipeData = {};
        
        // Check changes for each field
        ['title', 'category', 'nationality', 'featured', 'desc', 'serving', 'length', 'minutes', 'calories'].forEach(field => {
            if (req.body[field] && req.body[field] !== existingRecipe[field]) {
                updatedRecipeData[field] = req.body[field];
            }
        });
        
        // Temukan bahan yang ditambahkan
        const addedBahan = req.body.bahan.filter(bahan => !existingRecipe.bahan.includes(bahan));
        // Temukan bahan yang dihapus
        const removedBahan = existingRecipe.bahan.filter(bahan => !req.body.bahan.includes(bahan));

        // Sama seperti untuk langkah, temukan langkah yang ditambahkan dan dihapus
        const addedCara = req.body.cara.filter(cara => !existingRecipe.cara.includes(cara));
        const removedCara = existingRecipe.cara.filter(cara => !req.body.cara.includes(cara));

        // Perbarui data resep di MongoDB untuk menambah dan menghapus bahan yang sesuai
        if (addedBahan.length > 0) {
            await Recipes.findOneAndUpdate({ recipeID }, { $push: { bahan: { $each: addedBahan } } });
        }
        if (removedBahan.length > 0) {
            await Recipes.findOneAndUpdate({ recipeID }, { $pull: { bahan: { $in: removedBahan } } });
        }

        // Perbarui data resep di MongoDB untuk menambah dan menghapus cara yang sesuai
        if (addedCara.length > 0) {
            await Recipes.findOneAndUpdate({ recipeID }, { $push: { cara: { $each: addedCara } } });
        }
        if (removedCara.length > 0) {
            await Recipes.findOneAndUpdate({ recipeID }, { $pull: { cara: { $in: removedCara } } });
        }

        const newTime = req.body.minutes + ' Minutes';
        if (newTime !== existingRecipe.time) {
            updatedRecipeData.time = newTime;
        }

        if (req.file) {
            const oldImagePath = './public' + existingRecipe.img;
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            updatedRecipeData.img = '/img/' + req.file.filename;
        }

        // Jika ada perubahan yang harus dilakukan, lakukan pembaruan
    if (Object.keys(updatedRecipeData).length > 0) {
         await Recipes.findOneAndUpdate({recipeID}, updatedRecipeData, { new: true });
        res.status(200).end()
    } else {
        req.flash('noChangeMsg','No changes to update');
    }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = adminRouter;
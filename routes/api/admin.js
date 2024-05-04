const {Router} = require('express');
const multer = require('multer');
const adminRouter = Router();
const Recipes = require('../../models/recipesModel');

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

adminRouter.delete('/deleteRecipe/:recipeID', async (req, res) => {
    try {
        // Ambil ID resep dari parameter route
        const recipeID = req.params.recipeID;

        // Lakukan operasi penghapusan resep di database (contoh: menggunakan model Recipes)
        await Recipes.findOneAndDelete({recipeID: recipeID});

        // Kirim respon yang berhasil
        req.flash('deletedMsg','Recipe deleted successfully');
        res.status(200).end();
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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

const storageRecipe = multer.diskStorage({
    destination: './public/img', // Menentukan direktori penyimpanan file
    filename: function (req, file, cb) {
        const name = file.originalname;
        cb(null, name) // Menentukan nama file yang diunggah
    }
});

// Inisialisasi multer dengan konfigurasi penyimpanan
const uploadRecipe = multer({ storage: storageRecipe });
    

adminRouter.post('/addRecipe', uploadRecipe.single('img') , async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send("No image uploaded");
        }
        
        const lastRecipe = await Recipes.findOne().sort({ recipeID: -1 });

    let recipeID;

    if (lastRecipe) {
        // Jika ada recipe terakhir, tambahkan 1 ke recipeID terakhir
        recipeID = lastRecipe.recipeID + 1;
    } else {
        // Jika tidak ada recipe, set recipeID menjadi 1
        recipeID = 1;
    }
        const {
            title,
            category,
            nationality,
            featured,
            desc,
            serving,
            length,
            minutes,
            calories,
            bahan,
            cara 
        } = req.body;

        const img = '/img/' + req.file.filename;

        const time = minutes + ' Minutes';

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
        req.flash('successAddMsg', 'Recipe Added')
        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

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

adminRouter.post('/editRecipe/:recipeID', uploadRecipe.single('img') , async (req, res) => {
    try {
        const { recipeID } = req.params;

        // Temukan resep yang akan diupdate
        const existingRecipe = await Recipes.findOne({recipeID});

        if (!existingRecipe) {
            return res.status(404).send("Recipe not found");
        }

        // Persiapan data pembaruan resep
        const updatedRecipeData = {};

        // Periksa perubahan untuk setiap bidang
        if (req.body.title && req.body.title !== existingRecipe.title) {
            updatedRecipeData.title = req.body.title;
        }
        if (req.body.category && req.body.category !== existingRecipe.category) {
            updatedRecipeData.category = req.body.category;
        }
        if (req.body.nationality && req.body.nationality !== existingRecipe.nationality) {
            updatedRecipeData.nationality = req.body.nationality;
        }
        if (req.body.featured && req.body.featured !== existingRecipe.featured) {
            updatedRecipeData.featured = req.body.featured;
        }
        if (req.body.desc && req.body.desc !== existingRecipe.desc) {
            updatedRecipeData.desc = req.body.desc;
        }
        if (req.body.serving && req.body.serving !== existingRecipe.serving) {
            updatedRecipeData.serving = req.body.serving;
        }
        if (req.body.length && req.body.length !== existingRecipe.length) {
            updatedRecipeData.length = req.body.length;
        }
        if (req.body.minutes && req.body.minutes !== existingRecipe.minutes) {
            updatedRecipeData.minutes = req.body.minutes;
        }
        if (req.body.calories && req.body.calories !== existingRecipe.calories) {
            updatedRecipeData.calories = req.body.calories;
        }
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
            updatedRecipeData.img = '/img/' + req.file.filename;
        }

        // Jika ada perubahan yang harus dilakukan, lakukan pembaruan
    if (Object.keys(updatedRecipeData).length > 0) {
        const updatedRecipe = await Recipes.findOneAndUpdate({recipeID}, updatedRecipeData, { new: true });
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
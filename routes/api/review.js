const {Router} = require('express');
const reviewRouter = Router();
const Recipes = require('../../models/recipesModel');

reviewRouter.post('/postReview/:recipeID', async (req, res) => {
    try {
        const { recipeID } = req.params;
        const { rating, review, date, name , photo } = req.body;

        // Lakukan sesuatu dengan data yang diterima, misalnya menyimpan ke database menggunakan Mongoose
        // Contoh:
        const recipe = await Recipes.findOne({ recipeID });
        if (!recipe) {
            return res.status(404).send("Recipe not found");
        }
        // Menambahkan review ke resep
        recipe.reviews.push({
            rating,
            review,
            date,
            name,
            photo
        });

        // Hitung totalRating, totalReviews, dan averageRating yang baru
        const totalReviews = recipe.reviews.length;
        let totalRating = 0;
        let averageRating = 0;
        if (totalReviews > 0) {
            for (let i = 0; i < totalReviews; i++) {
                totalRating += parseInt(recipe.reviews[i].rating);
            }
            averageRating = totalRating / totalReviews;
            averageRating = averageRating.toFixed(1);
        }

        // Simpan totalReviews dan averageRating ke dalam dokumen resep
        recipe.totalReviews = totalReviews;
        recipe.averageRating = averageRating;

        await recipe.save();

        res.status(201).send("Review added successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk menghapus komentar dari resep
reviewRouter.delete('/deleteComment/:recipeID/:commentID', async (req, res) => {
    try {
        // Ambil ID resep dan ID komentar dari parameter route
        const recipeID = req.params.recipeID;
        const commentID = req.params.commentID;

        // Lakukan operasi penghapusan komentar dari resep di database
        // Misalnya, menggunakan model Recipes
        await Recipes.updateOne({ recipeID: recipeID }, { $pull: { reviews: { _id: commentID } } });

        // Kirim respon yang berhasil
        res.status(200).end();
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

reviewRouter.put('/editComment/:commentID', async (req, res) => {
    try {
        const commentID = req.params.commentID;
        const { newComment } = req.body;

        // Lakukan operasi pengeditan komentar di database (contoh: menggunakan model Recipes)
        const updatedReview = await Recipes.findOneAndUpdate(
            { 'reviews._id': commentID },
            { $set: { 'reviews.$.review': newComment } },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Kirim respon yang berhasil
        res.status(200).json({ message: 'Comment updated successfully', updatedReview });
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error('Error editing comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = reviewRouter;
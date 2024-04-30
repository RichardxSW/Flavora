const {Router} = require('express');
const router = Router()
const Recipes = require('../../models/recipesModel');
const User = require('../../models/userModel');

router.get('/', async (req, res) => {
    try {
        const recipes = await Recipes.find()
        if (!recipes) {
            return res.status(404).json({ message: 'Not found' })
        } 
        res.status(200).json(recipes) // Mengirim data JSON jika pencarian berhasil
    } catch (error) { 
        res.status(500).json({ message: error.message })
    }
})


router.post('/', async (req, res) => {
    const recipes = new Recipes(req.body)
    try {
        // const userId = req.user._id;
        const newRecipe = await recipes.save()
        if (!newRecipe) {
            return res.status(400).json({message: 'Bad request'})
        }
        res.status(201).json(newRecipe)
        // res.status(201).json({userID : userId});
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

module.exports = router


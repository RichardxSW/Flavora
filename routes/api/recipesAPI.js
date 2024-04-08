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

// router.put('/home', async (req, res) => {
//     try {
//         const recipes = await Recipes.findById(req.body.recipeID);
//         const user = await User.findById(req.body.googleId);
//         user.savedRecipes.push(recipes);
//         await user.save();
//         res.json({savedRecipes: user.savedRecipes});
//         // if (recipes) {
//         //     res.render('index', {recipes: recipes, name: req.user.displayName, pic: req.user.profilePicture , title: 'Home', layout: "mainlayout"})
//         // } else {
//         //     res.status(404).send("Recipe not found")
//         // }
//     } catch (error) { 
//         res.status(500).send("Internal Server Error")
//     }
// })

// router.get("/savedRecipes/ids", async(req, res)=>{
//     try{
//         const user = await User.findById(req.body.userID);
//         res.json({savedRecipes: user?.savedRecipes});
//     } catch (err){
//         res.json(err)
//     }
// })

// router.get("/savedRecipes", async(req, res)=>{
//     try{
//         const user = await User.findById(req.body.userID);
//         const savedRecipes =  await Recipes.find({
//             _id: { $in: user.savedRecipes},
//         });
//         res.json({savedRecipes});
//     } catch (err){
//         res.json(err)
//     }
// })


module.exports = router


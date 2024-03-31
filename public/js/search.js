// let recipes = [];
const recipesObject = JSON.parse(recipes);
// Menggunakan variabel recipesObject untuk melakukan pencarian
function performSearch(event) {
    if (event.key === 'Enter') {
        const searchKeyword = event.target.value.toLowerCase(); // Mendapatkan kata kunci pencarian dari input

        // Pastikan bahwa recipesObject adalah array sebelum mencari
        if (Array.isArray(recipesObject)) {
            // Cari resep yang sesuai dengan kata kunci pencarian
            const matchedRecipe = recipesObject.find(recipe => 
                recipe.title.toLowerCase().includes(searchKeyword)
            );

            if (matchedRecipe) {
                // Jika resep cocok ditemukan, arahkan pengguna ke halaman detail resep tersebut
                const recipeID = matchedRecipe.recipeID;
                window.location.href = `/detail/${recipeID}`;
            } else {
                // Jika tidak ada resep yang cocok, beri tahu pengguna atau lakukan tindakan lainnya
                alert('Recipe not found!');
            }
        } else {
            console.error('recipesObject is not an array:', recipesObject);
        }
    }
}

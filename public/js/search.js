// let recipes = [];
const recipesObject = JSON.parse(recipes);
// Mendaftarkan event listener untuk tombol pencarian
const searchButton = document.querySelector('.navbar__search-button');
if (searchButton) {
    searchButton.addEventListener('click', function(event) {
        // Memanggil fungsi performSearch saat tombol pencarian ditekan
        performSearch(event);
    });
}

// Fungsi performSearch yang diperbarui
function performSearch(event) {
    const searchKeyword = document.querySelector('.navbar__search-input').value.toLowerCase();

    if (event.key === 'Enter' || event.type === 'click') {
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

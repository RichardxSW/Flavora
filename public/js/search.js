// // Mendapatkan input pencarian
// const searchBar = document.querySelector('.navbar__search-input');

// // Menambahkan event listener untuk input pencarian
// searchBar.addEventListener('keypress', function(event) {
//     // Periksa apakah tombol yang ditekan adalah tombol "Enter" (kode 13)
//     if (event.key === 'Enter') {
//         // Lakukan pencarian
//         performSearch();
//     }
// });

// // Fungsi untuk melakukan pencarian
// function performSearch() {
//     const searchKeyword = searchBar.value.toLowerCase(); // Mendapatkan kata kunci pencarian dari input

//     // Cari resep yang sesuai dengan kata kunci pencarian
//     const matchedRecipe = recipes.find(recipe => 
//         recipe.title.toLowerCase().includes(searchKeyword) ||
//         recipe.description.toLowerCase().includes(searchKeyword)
//     );

//     if (matchedRecipe) {
//         // Jika resep cocok ditemukan, arahkan pengguna ke halaman detail resep tersebut
//         const recipeID = matchedRecipe.recipeID;
//         window.location.href = `/detail/${recipeID}`;
//     } else {
//         // Jika tidak ada resep yang cocok, beri tahu pengguna atau lakukan tindakan lainnya
//         alert('Recipe not found!');
//     }
// }

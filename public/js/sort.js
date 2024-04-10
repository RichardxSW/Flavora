// const recipesObj = JSON.parse(recipes);

// // Fungsi untuk memfilter resep berdasarkan kata kunci pencarian
// function filterRecipes(keyword) {
//     return recipesObj.filter(recipe => 
//         recipe.title.toLowerCase().includes(keyword.toLowerCase())
//     );
// }

// // Fungsi untuk melakukan sorting resep
// function sortRecipes(sortBy, keyword) {
//     let sortedRecipes = [];
//     let filteredRecipes = []; // Deklarasi variabel filteredRecipes di sini

//     if (keyword) {
//         // Filter resep berdasarkan kata kunci pencarian
//         filteredRecipes = filterRecipes(keyword);
//     }

//     if (sortBy === 'relevance') {
//         // Tidak perlu sortir karena hasil sudah relevan
//         sortedRecipes = filteredRecipes;
//     } else if (sortBy === 'name') {
//         // Sortir berdasarkan nama
//         sortedRecipes = filteredRecipes.slice().sort((a, b) => a.title.localeCompare(b.title));
//     } else if (sortBy === 'time') {
//         // Sortir berdasarkan waktu
//         sortedRecipes = filteredRecipes.slice().sort((a, b) => a.time - b.time);
//     }

//     // Tampilkan jumlah total hasil pencarian setelah disortir
//     totalResultsElement.textContent = `${sortedRecipes.length} Results`;

//     // Render ulang resep yang sudah disortir
//     renderRecipes(sortedRecipes);
// }

// function renderRecipes(filteredRecipes) {
//     const searchResultsDiv = document.getElementById('searchResults');
//     searchResultsDiv.innerHTML = ''; // Membersihkan hasil pencarian sebelumnya

//     if (filteredRecipes.length > 0) {
//         filteredRecipes.forEach(recipe => {
//             const recipeCard = document.createElement('div');
//             recipeCard.classList.add('recipe-card');

//             // Buat struktur HTML untuk card resep
//             recipeCard.innerHTML = `
//                 <div class="recipe-title">${recipe.title}</div>
//                 <div class="recipe-details">
//                     <p>Ingredients: ${recipe.ingredients}</p>
//                     <p>Instructions: ${recipe.instructions}</p>
//                 </div>
//             `;

//             // Tambahkan card resep ke dalam hasil pencarian
//             searchResultsDiv.appendChild(recipeCard);
//         });
//     } else {
//         // Jika tidak ada resep yang ditemukan, tampilkan pesan
//         searchResultsDiv.innerHTML = '<p>No recipes found with that keyword</p>';
//     }
// }


// // Event listener untuk select dropdown sorting
// sortSelect.addEventListener('change', function() {
//     const sortBy = sortSelect.value;
//     const keyword = searchInput.value.trim().toLowerCase(); // Mendapatkan keyword pencarian
//     sortRecipes(sortBy, keyword); // Memanggil fungsi sortRecipes dengan sortBy dan keyword sebagai argumen
// });

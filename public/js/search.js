const recipesObject = JSON.parse(recipes);

// Ambil kata kunci pencarian dari URL (misalnya, dari parameter query string)
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('q') || '';  // 'q' adalah parameter untuk kata kunci pencarian

// Mengambil elemen DOM untuk menampilkan total hasil pencarian
const totalResultsElement = document.getElementById('totalResults');

// Mengambil elemen DOM untuk menampilkan hasil pencarian
const searchResultsContainer = document.getElementById('searchResults');

// Ambil elemen select dropdown sorting
const sortSelect = document.getElementById('sortSelect');

// Event listener untuk select dropdown sorting
if (sortSelect) {
    sortSelect.addEventListener('change', function(event) {
        const sortBy = event.target.value; // Ambil nilai sorting yang dipilih
        const keyword = searchInput.value.trim().toLowerCase(); // Ambil kata kunci pencarian saat ini
        
        // Panggil fungsi sortRecipes dengan nilai sorting yang dipilih dan kata kunci pencarian saat ini
        sortRecipes(sortBy, keyword);
    });
}


// Fungsi untuk melakukan pencarian dan menampilkan hasilnya
let debounceTimer;

function performKey(event) {
    // Mendapatkan nilai input pencarian
    const keyword = event.target.value.trim().toLowerCase();

    // Mendapatkan kontainer hasil pencarian
    const searchResultsContainer = document.getElementById("searchResults");

    // Buat elemen ul untuk menyimpan hasil pencarian
    const resultList = document.createElement('ul');

    // Menunda pencarian dengan debounce
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        // Menghapus hasil pencarian sebelumnya
        resultList.innerHTML = '';

        // Pastikan bahwa input tidak kosong sebelum mencari
        if (keyword !== '') {
            // Pastikan bahwa recipesObject adalah array sebelum mencari
            if (Array.isArray(recipesObject)) {
                // Membuat daftar hasil pencarian
                let searchResults = recipesObject.filter(function(recipe) {
                    return recipe.title.toLowerCase().includes(keyword);
                });

                // Lakukan sorting jika diperlukan
                const sortBy = document.getElementById('sortSelect').value;
                searchResults = sortRecipes(sortBy, searchResults);

                // Menambahkan hasil pencarian ke elemen ul
                if (searchResults.length > 0) {
                    searchResults.forEach(function(recipe) {
                        const listItem = document.createElement('li');
                        listItem.classList.add('search-item'); // Tambahkan kelas untuk styling CSS
                    
                        const thumbnail = document.createElement('img');
                        thumbnail.src = recipe.img;
                        thumbnail.classList.add('thumbnail'); // Tambahkan kelas untuk styling CSS
                        listItem.appendChild(thumbnail);

                        const link = document.createElement('a');
                        link.href = `/detail/${recipe.recipeID}`;
                        link.textContent = recipe.title;
                        listItem.appendChild(link);
                    
                        // Tambahkan event listener ke setiap elemen <li> untuk mengarahkan pengguna ke halaman detail yang sesuai
                        listItem.addEventListener('click', function() {
                            window.location.href = link.href;
                        });
                    
                        // Tambahkan elemen list ke dalam elemen ul
                        resultList.appendChild(listItem);
                    });
                } else {
                    // Tampilkan pesan "No recipes found with that name"
                    const noResultMessage = document.createElement('li');
                    noResultMessage.textContent = "No recipes found with that name";
                    noResultMessage.classList.add('no-result-message'); // Tambahkan kelas untuk styling CSS
                    resultList.appendChild(noResultMessage);
                }

                // Menampilkan kontainer hasil pencarian
                searchResultsContainer.style.display = 'block';
            } else {
                console.error('recipesObject is not an array:', recipesObject);
            }
        } else {
            // Jika input kosong, sembunyikan kontainer hasil pencarian
            searchResultsContainer.style.display = 'none';
        }

        // Setelah menambahkan semua hasil pencarian ke dalam elemen ul, tambahkan ul ke dalam kontainer hasil pencarian
        searchResultsContainer.innerHTML = ''; // Bersihkan kontainer sebelumnya
        searchResultsContainer.appendChild(resultList);
    }, 800); // Mengatur waktu debounce (misalnya 300ms)
}

// Mendaftarkan event listener untuk input pencarian
const searchInput = document.querySelector('.navbar__search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(event) {
        // Memanggil fungsi performKey saat nilai input berubah
        performKey(event);
    });
}

// Filter resep berdasarkan kata kunci pencarian
function sortRecipes(sortBy, recipes) {
    let sortedRecipes = [];

    if (sortBy === 'relevance') {
        // Tidak perlu sortir karena hasil sudah relevan
        sortedRecipes = recipes;
    } else if (sortBy === 'name') {
        // Sortir berdasarkan nama
        sortedRecipes = recipes.slice().sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'time') {
        // Sortir berdasarkan waktu
        sortedRecipes = recipes.slice().sort((a, b) => a.time - b.time);
    }

    return sortedRecipes;
}

// Fungsi performSearch yang diperbarui
function performSearch(event) {
    const searchKeyword = document.querySelector('.navbar__search-input').value.trim();

    if (event.key === 'Enter' || event.type === 'click') {
        if (searchKeyword !== '') {
            // Arahkan pengguna ke halaman pencarian dengan kata kunci yang dimasukkan
            window.location.href = `/search?q=${searchKeyword}`;
        }
    }
}

// Mendaftarkan event listener untuk tombol pencarian
const searchButton = document.querySelector('.navbar__search-button');
if (searchButton) {
    searchButton.addEventListener('click', function(event) {
        // Memanggil fungsi performSearch saat tombol pencarian ditekan
        performSearch(event);
    });
}

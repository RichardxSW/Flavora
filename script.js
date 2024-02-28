document.addEventListener('DOMContentLoaded', function () {
    const categories = document.querySelectorAll('.categories__item');
    const recipesContainer = document.querySelector('.recipes');
  
    categories.forEach(category => {
      category.addEventListener('click', function () {
        const selectedCategory = this.dataset.category;
        showRecipes(selectedCategory);
      });
    });
  
    function showRecipes(category) {
      // Bersihkan konten sebelum menambahkan card baru
      recipesContainer.innerHTML = '';
  
      // Buat card resep sesuai dengan kategori yang dipilih
      const recipes = [
        { title: 'Nasi Goreng', category: 'lunch' },
        { title: 'Pancake', category: 'breakfast' },
        { title: 'Spaghetti Bolognese', category: 'dinner' },
        { title: 'Popcorn', category: 'snack' },
      ];
  
      const filteredRecipes = recipes.filter(recipe => recipe.category === category);
  
      filteredRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.textContent = recipe.title;
        recipesContainer.appendChild(card);
      });
    }
  });
  
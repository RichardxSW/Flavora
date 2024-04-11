function changeCategory(category) {
    var categoryItems = document.querySelectorAll('.categories__item');
    
    // Remove 'active' class from all categories
    categoryItems.forEach(function(item) {
        item.classList.remove('active');
    });
    
    // Add 'active' class to the clicked category
    var clickedCategory = document.querySelector('[data-id="' + category + '"]');
    clickedCategory.parentElement.classList.add('active');

    // // Tampilkan tulisan 'Your recent recipe will show here'
    // var recentRecipesContainer = document.querySelector('.recent-recipes');
    // recentRecipesContainer.innerHTML = '<p>Your pinned recipes will show here.</p>';
}
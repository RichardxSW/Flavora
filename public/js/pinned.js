function changeCategory(category) {
    var categoryItems = document.querySelectorAll('.categories__item');
    
    // Remove 'active' class from all categories
    categoryItems.forEach(function(item) {
        item.classList.remove('active');
    });
    
    // Add 'active' class to the clicked category
    var clickedCategory = document.querySelector('[data-id="' + category + '"]');
    clickedCategory.parentElement.classList.add('active');
}  

document.querySelectorAll('.pin').forEach(button => {
    button.addEventListener('click', () => {
        // Dapatkan ID resep dari atribut dataset tombol
        const recipeId = button.dataset.id;

        // Hapus kartu dari DOM saat tombol pin ditekan
        const cardToRemove = document.querySelector(`.card[data-id="${recipeId}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        } else {
            console.error('Card not found');
        }
        setTimeout(() => {
            window.location.reload();
        }, 100);
    });
});
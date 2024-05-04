// Fungsi menghapus resep yang di-pin dari halaman saat tombol pin ditekan lagi di halaman pinned
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
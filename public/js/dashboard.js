//tutup flash message
const alertElement = document.querySelector('.alert');

    // Periksa apakah elemen ada sebelum melanjutkan
    if (alertElement) {
        // Tunggu 3 detik sebelum menyembunyikan pesan
        setTimeout(function() {
            alertElement.style.display = 'none';
        }, 3000); // Waktu dalam milidetik (3 detik)
    }

    // Fungsi untuk menghapus resep
    async function deleteRecipe(recipeID) {
        // Tampilkan SweetAlert untuk konfirmasi
        Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete the recipe',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Kirim permintaan DELETE ke server
                try {
                    const response = await fetch(`/admin/deleteRecipe/${recipeID}`, {
                        method: 'DELETE'
                    });
    
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
    
                    // Tampilkan SweetAlert untuk memberi tahu pengguna bahwa resep telah dihapus dengan sukses
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'The recipe has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Reload halaman setelah menutup SweetAlert
                        location.reload(); // Reload halaman setelah menghapus resep
                    });
                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                    alert('An error occurred while deleting the recipe'); // Tampilkan pesan kesalahan
                }
            }
        });
    }
    
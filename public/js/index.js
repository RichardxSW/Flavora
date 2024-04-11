$(document).ready(function() {
  // Event listener untuk tombol yang memiliki kelas "pin"
  $('.pin').on('click', function(e) {
    e.preventDefault(); // Mencegah aksi default dari tombol

    // Simpan konteks tombol dalam variabel
    const button = $(this);

    // Ambil ID resep dari atribut data-id tombol yang diklik
    const recipeId = $(this).data('id');

    // Periksa apakah tombol sebelumnya di-toggle atau tidak
    const isPinned = button.hasClass('pinned');

    // Kirim permintaan AJAX ke server untuk menyimpan atau menghapus resep
    $.ajax({
      method: 'POST', // Gunakan metode POST untuk mengirim permintaan
      url: '/save-recipe', // Tentukan URL endpoint untuk menyimpan atau menghapus resep
      data: { recipeId: recipeId, isPinned: !isPinned }, // Kirim ID resep dan status toggle
      success: function(response) {
        // Tampilkan pesan sukses atau lakukan tindakan lain yang sesuai
        console.log(response);
        
        // Update button state based on response
        if (!isPinned) {
          console.log('Tombol telah dipinned');
          button.addClass('pinned');
          button.find('i').removeClass('fa-regular').addClass('fa-solid');
        }
      },
      error: function(err) {
        // Tangani kesalahan jika permintaan gagal
        console.error('Error:', err);
      }
    });
  });

  // Event listener untuk tombol yang memiliki kelas "unpin"
  $('.pin').on('click', function(e) {
    e.preventDefault(); // Mencegah aksi default dari tombol

    // Simpan konteks tombol dalam variabel
    const button = $(this);

    // Ambil ID resep dari atribut data-id tombol yang diklik
    const recipeId = $(this).data('id');

    const isPinned = button.hasClass('pinned');

    // Kirim permintaan AJAX ke server untuk menghapus resep yang dipin
    $.ajax({
      method: 'DELETE', // Gunakan metode DELETE untuk menghapus resep
      url: `/unpin-recipe`, 
      data: { recipeId: recipeId, isPinned: isPinned },// Tentukan URL endpoint untuk menghapus resep
      success: function(response) {
        // Tampilkan pesan sukses atau lakukan tindakan lain yang sesuai
        console.log(response);

        if (isPinned) {
          console.log('Tombol telah diunpinned');
          button.removeClass('pinned');
          button.find('i').removeClass('fa-solid').addClass('fa-regular');
        }
      },
      error: function(err) {
        // Tangani kesalahan jika permintaan gagal
        console.error('Error:', err);
      }
    });
  });
});

$(document).ready(function() {
  // Event listener untuk tombol yang memiliki kelas "pin"
  $('.pin').on('click', function(e) {
    e.preventDefault(); // Mencegah aksi default dari tombol

    // Simpan konteks tombol dalam variabel
    const button = $(this);

    // Ambil ID resep dari atribut data-id tombol yang diklik
    const recipeId = button.data('id');

    // Periksa apakah tombol sebelumnya di-toggle atau tidak
    const isPinned = button.hasClass('pinned');

    // Tentukan metode HTTP berdasarkan status isPinned
    const method = isPinned ? 'DELETE' : 'POST';

    // Tentukan action berdasarkan status isPinned
    const action = isPinned ? 'unpin' : 'pin';

    // Kirim permintaan AJAX ke server untuk menyimpan atau menghapus resep
    $.ajax({
      method: method, // Gunakan metode POST atau DELETE sesuai kondisi
      url: '/save-recipe', // Tentukan URL endpoint untuk menyimpan atau menghapus resep
      data: { recipeId: recipeId, isPinned: !isPinned, action: action }, // Kirim ID resep, status toggle, dan action
      success: function(response) {
        // Tampilkan pesan sukses atau lakukan tindakan lain yang sesuai
        console.log(response);
        
        // Update button state based on response
        if (!isPinned) {
          console.log('Tombol telah dipinned');
          button.addClass('pinned');
          button.find('i').removeClass('fa-regular').addClass('fa-solid');
        } else {
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

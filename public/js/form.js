// Fungsi untuk membuka popup tambah folder
function openPopup() {
  document.getElementById('popup').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
  document.body.classList.add('popup-open'); 
}

// Fungsi untuk menutup popup tambah folder
function closePopup() {
  document.getElementById('folderName').value = '';
  document.getElementById('description').value = '';
  document.getElementById('popup').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  document.body.classList.remove('popup-open'); 
}

// Fungsi untuk membuka popup add to folder
function closeAddPopup() {
  uncheckAll();
  document.getElementById('folderPopup').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  document.body.classList.remove('popup-open'); 
}

// Fungsi untuk membuka popup edit
function openEditPopup() {
    const selectedFolderData = document.getElementById('editFolderForm');
    const folderName = selectedFolderData.getAttribute('data-name');
    const folderDesc = selectedFolderData.getAttribute('data-desc');
  
    // Mengisi nilai input dengan nilai dari folder yang dipilih
    document.getElementById('editFolderName').value = folderName;
    document.getElementById('editDescription').value = folderDesc;
  
    // Memeriksa apakah deskripsi sudah ada isi
    if (folderDesc.trim() !== '') {
        // Jika deskripsi sudah ada isi, hitung jumlah karakter dan tampilkan count-nya
        const charCount = folderDesc.length;
        $('#editCharCount').text(charCount + '/300 characters');
    } else {
        // Jika deskripsi masih kosong, tidak perlu menampilkan count
        $('#editCharCount').text('0/300 characters');
    }
  
    document.getElementById('editPopup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.body.classList.add('popup-open'); 
}

// Fungsi untuk menutup popup edit
function closeEditPopup() { 
    document.getElementById('editFolderName').value = '';
    document.getElementById('editDescription').value = '';
    document.getElementById('editPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.body.classList.remove('popup-open'); 
}

// Fungsi untuk membuka popup penghapusan
function openRemovePopup() {
    $('#removePopup').show();
}

// Fungsi untuk menutup popup penghapusan
function closeRemovePopup() {
    $('#removePopup').hide();
}

// Fungsi untuk menghilangkan ceklis pada semua checkbox
function uncheckAll() {
  // Dapatkan semua elemen input dengan tipe 'checkbox' di dalam div 'addContent'
  var checkboxes = document.querySelectorAll('.folderPopup .addContent input[type="checkbox"]');
  
  // Iterasi melalui setiap checkbox dan hapus ceklisnya
  checkboxes.forEach(function(checkbox) {
    checkbox.checked = false;
  });
}

  // Ganti pemanggilan fungsi openPopup() menjadi openEditPopup()
  $('.edit-folder').click(function() {
    openEditPopup();
  });

// Tangkap klik tombol hapus
$('.remove-button').on('click', function() {
    const recipeId = $(this).data('id');
    const folderId = $(this).data('folder-id');

    // Tampilkan konfirmasi SweetAlert2
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this recipe!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then((result) => {
        if (result.isConfirmed) {
            // Jika pengguna menekan tombol "Yes", kirim permintaan DELETE
            deleteRecipeFromFolder(recipeId, folderId);
        }
    });
});

// Fungsi untuk menghapus resep dari folder
function deleteRecipeFromFolder(recipeId, folderId) {
    // Data yang akan dikirimkan
    const data = {
        recipeId: recipeId,
        folderId: folderId
    };

    // Kirim permintaan AJAX
    $.ajax({
        type: 'DELETE',
        url: '/removeFromFolder',
        data: data,
        success: function(response) {
            console.log(response.message); // Tampilkan pesan sukses
            // Tampilkan SweetAlert2 setelah resep dihapus dan halaman direfresh
            Swal.fire({
                title: 'Deleted!',
                text: 'Your recipe has been deleted.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Refresh halaman setelah menutup SweetAlert2
                location.reload();
            });
        },
        error: function(xhr, status, error) {
            console.error('Error:', error); // Tampilkan pesan kesalahan
            // Tangani kesalahan jika ada
        }
    });
}

document.getElementById('folderForm').addEventListener('submit', function(event) {
  event.preventDefault();
  let folderName = document.getElementById('folderName').value;
  let description = document.getElementById('description').value;
});

// Mengambil elemen textarea dan elemen untuk menampilkan jumlah karakter
const descriptionInput = document.getElementById('description');
const charCountDisplay = document.getElementById('charCount');

// Menambahkan event listener untuk input pada textarea
descriptionInput.addEventListener('input', function() {
  // Mengambil jumlah karakter yang diketik
  const charCount = descriptionInput.value.length;
  // Menampilkan jumlah karakter di dalam elemen
  charCountDisplay.textContent = charCount + '/300 characters' ;
});


// Menggunakan jQuery untuk melakukan AJAX request, Anda dapat menyesuaikan dengan metode lain jika diperlukan
$('#folderForm').submit(function(event) {
    event.preventDefault();
    let folderName = $('#folderName').val();
    let description = $('#description').val();
    
    // Mendapatkan daftar nama folder yang sudah ada
    let existingFolders = $('.created .folder').map(function() {
        return $(this).text().trim();
    }).get();

    // Memeriksa apakah nama folder sudah ada sebelumnya
    if (existingFolders.includes(folderName)) {
        // Jika nama folder sudah ada, tampilkan SweetAlert untuk memberitahu pengguna
        Swal.fire({
            title: 'Error!',
            text: 'Folder with the same name already exists.',
            icon: 'error',
            confirmButtonText: 'OK'
        }).then(() => {
            // Hapus nilai input nama folder dan deskripsi
            $('#folderName').val('');
            $('#description').val('');
        });
        return; // Menghentikan eksekusi selanjutnya
    }  
    else if (folderName.trim() === '') {
        // Jika kosong, tampilkan alert
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a folder name.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    // Jika nama folder belum ada sebelumnya, lanjutkan proses pembuatan folder
    $.ajax({
        type: 'POST',
        url: '/folders', // Ganti URL dengan endpoint Anda yang sesuai
        data: { folderName, description },
        success: function(response) {
            closePopup();
            // Tampilkan SweetAlert2 setelah folder berhasil dibuat
            Swal.fire({
                title: 'Folder Created!',
                text: 'Your folder has been created.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Refresh halaman setelah menutup SweetAlert2
                window.location.reload();
            });
        },
        error: function(error) {
            console.error(error);
            // Handle error jika ada
        }
    });
});

// Fungsi untuk mengirim data folder yang diperbarui ke server
$('#editFolderForm').submit(async function(event) {
    event.preventDefault();
    
    // Dapatkan folderId dari input tersembunyi dalam form
    let folderId = $('#editFolderId').val(); // Pastikan input id="editFolderId" sudah ada pada form
    let folderName = $('#editFolderName').val();
    let description = $('#editDescription').val();
    
    try {
        const response = await $.ajax({
            type: 'PUT',
            url: `/folder/${folderId}`, // Ganti URL dengan endpoint Anda yang sesuai
            data: { folderName, description }
        });

        // Tutup popup sebelum menampilkan SweetAlert2
        closeEditPopup();

        // Tampilkan SweetAlert2 setelah folder berhasil diperbarui
        Swal.fire({
            title: 'Folder Edited!',
            text: 'Your folder has been edited.',
            icon: 'success',
            confirmButtonText: 'OK'
        }).then(() => {
            // Refresh halaman setelah menutup SweetAlert2
            location.reload(true);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

// Fungsi untuk menampilkan SweetAlert2 konfirmasi penghapusan folder
function showDeleteFolderConfirmation() {
    // Tampilkan konfirmasi SweetAlert2
    document.getElementById('overlay').style.display = 'block';
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this folder!',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
    }).then((result) => {
        if (result.isConfirmed) {
            // Jika pengguna menekan tombol "Yes", kirim permintaan DELETE
            deleteFolder();
        }
        document.getElementById('overlay').style.display = 'none';
    });
}

// Fungsi untuk menghapus folder
function deleteFolder() {
    const folderId = $('#deleteFolderId').val(); // Mendapatkan folderId dari input tersembunyi

    // Kirim permintaan AJAX DELETE
    $.ajax({
        type: 'DELETE',
        url: `/folder/${folderId}`, // Ganti URL dengan endpoint Anda yang sesuai
        success: function(response) {
            console.log('Folder deleted successfully');
            // Tampilkan SweetAlert2 setelah folder dihapus dan halaman direfresh
            Swal.fire({
                title: 'Deleted!',
                text: 'Your folder has been deleted.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                // Refresh halaman setelah menutup SweetAlert2
                window.location.href = '/pinned'; // true untuk melakukan reload dari server, false atau tanpa argumen untuk cache
            });
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
            // Tangani kesalahan jika ada
        }
    });
}

// Menambahkan event listener untuk input pada textarea untuk menghitung jumlah karakter
$('#editDescription').on('input', function() {
    // Mengambil jumlah karakter yang diketik
    const charCount = $(this).val().length;
    // Menampilkan jumlah karakter di dalam elemen
    $('#editCharCount').text(charCount + '/300 characters');
});

// Fungsi untuk menampilkan popup add to folder
$('.add-button').click(function() {
    // Periksa apakah ada folder yang tersedia
    if ($('.addContent input[type="checkbox"]').length === 0) {
        // Jika tidak ada folder tersedia, tampilkan SweetAlert untuk membuat folder pertama kali
        Swal.fire({
            title: 'Make a folder first!',
            text: 'There are no folders available. Please create a folder first.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return; // Menghentikan eksekusi selanjutnya
    }
    // Ambil recipeId dari tombol yang diklik
    var recipeId = $(this).data('id');

    // Tampilkan popup
    $('#folderPopup').show().data('id', recipeId);
    document.getElementById('overlay').style.display = 'block';
});

// Fungsi untuk menangani klik pada tombol "Done" pada popup add to folder
$('#doneButton').click(async function() {
    // Ambil recipeId dari data-id pada popup
    var recipeId = $('#folderPopup').data('id');

    // Ambil folder yang dipilih
    var selectedFolders = [];
    $('input[type=checkbox]:checked').each(function() {
        selectedFolders.push($(this).val());
    });

    try {
        // Kirim data ke server
        const response = await fetch('/addToFolder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipeId: recipeId, folders: selectedFolders })
        });

        if (response.ok) {
            // Sembunyikan popup setelah pengiriman data berhasil
            uncheckAll();
            $('#folderPopup').hide();
            document.getElementById('overlay').style.display = 'none';
            // Tampilkan SweetAlert2 untuk memberi tahu pengguna bahwa resep telah ditambahkan ke folder
            Swal.fire({
                title: 'Success!',
                text: 'Your recipe has been added to the selected folder(s).',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } else {
            // Handle error
            console.error('Error:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
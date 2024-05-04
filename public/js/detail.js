document.addEventListener("DOMContentLoaded", function () {
        var detailsElements = document.querySelectorAll('details');

        detailsElements.forEach(function(detailsElement) {
            detailsElement.addEventListener('toggle', function() {
            if (detailsElement.open) {
                addAnimation(detailsElement); // Meneruskan elemen <details> sebagai argumen
            }
            });
        });

        function addAnimation(detailsElement) {
            var siblingElements = detailsElement.querySelectorAll('*:not(summary)');
          
            siblingElements.forEach(function(siblingElement) {
              siblingElement.classList.add('animate');
            });
          
            setTimeout(function() {
              siblingElements.forEach(function(siblingElement) {
                siblingElement.classList.remove('animate');
              });
            }, 500); // Adjust according to your animation duration
          }

          //rating control
          const stars = document.querySelectorAll('.rating-star label');
          const text = document.querySelector('.rating-text .rtext');
          let value = '';
        
          stars.forEach(function(star) {

            star.addEventListener('mouseover', function() {

              const value = this.getAttribute('for').replace('star', '');

              if (value === '5') {
                text.textContent = 'Perfect';
              } else if (value === '4') {
                text.textContent = 'Good';
              } else if (value === '3') {
                text.textContent = 'OK';
              } else if (value === '2') {
                text.textContent = 'Not bad';
              } else if (value === '1') {
                text.textContent = 'Very Bad';
              } 
              text.classList.remove('hide');
            });
        
            star.addEventListener('mouseout', function() {
                text.classList.add('hide');
            });

            star.addEventListener('click', function() {
              value = this.getAttribute('for').replace('star', '');
            });
          });
          

            // komen
            const submitButton = document.querySelector('.submit-button');
            const reviewTextarea = document.querySelector('.review-textarea');
            const submissionsContainer = document.querySelector('.submission-container');
            const imgContainer = document.querySelector('.sub-img-name');
            
            submitButton.addEventListener('click', async () => {
              const recipeID = idValue;
              // const rating = this.getAttribute('for').replace('star', '');
              const reviewText = reviewTextarea.value.trim();
              const currentDate = new Date().toLocaleDateString();
              const photo = picValue;
              const name = nameValue;

              const reviewData = {
                rating: value,
                review: reviewText,
                date: currentDate,
                photo: photo,
                name: name,
              }

              try {
                const response = await fetch(`/postReview/${recipeID}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit review');
                } else {
                  Swal.fire({
                    title: 'Success',
                    text: 'Your review has been submitted successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                  }).then(() => {
                    // Refresh halaman untuk memperbarui daftar review
                    location.reload();
                  })
                }
              } catch (error) {
                  console.error(error);
                  alert('Failed to submit review');
              }
            });
})
async function deleteComment(recipeID, commentID) {
  Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan dapat mengembalikan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus saja!',
      cancelButtonText: 'Batal'
  }).then(async (result) => {
      if (result.isConfirmed) {
          try {
              const response = await fetch(`/deleteComment/${recipeID}/${commentID}`, {
                  method: 'DELETE'
              });

              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              // Menampilkan alert bahwa komentar telah dihapus
              Swal.fire({
                  title: "Deleted!",
                  text: "The comment has been deleted.",
                  icon: "success"
              }).then(() => {
                  // Reload halaman setelah menutup alert kedua
                  location.reload(); // Reload halaman setelah menghapus komentar
              });
          } catch (error) {
              console.error('There was a problem with the fetch operation:', error);
              Swal.fire(
                  'Gagal!',
                  'Terjadi kesalahan saat menghapus komentar.',
                  'error'
              );
          }
      }
  });
}

async function editComment(commentID, currentReview) {
  Swal.fire({
      title: 'Edit Your Comment',
      input: 'text',
      inputPlaceholder: 'Enter your new comment',
      inputValue: currentReview, // Nilai awal input teks
      showCancelButton: true,
      confirmButtonText: 'Edit',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: (newComment) => {
          // Kirim permintaan PUT ke server untuk memperbarui komentar
          return fetch(`/editComment/${commentID}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ newComment })
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              // Jika berhasil, perbarui tampilan atau lakukan tindakan lain
              return response.json();
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
              Swal.showValidationMessage('An error occurred while editing the comment');
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
      if (result.isConfirmed) {
          Swal.fire({
              title: 'Success',
              text: 'Your comment has been edited successfully!',
              icon: 'success',
              confirmButtonText: 'OK'
          }).then(() => {
              // Reload halaman untuk memperbarui daftar komentar
              window.location.reload();
          });
      }
  });
}





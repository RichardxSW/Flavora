var app = angular.module('myApp', []);

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
                const response = await fetch(`/detail/${recipeID}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit review');
                } else {
                  console.log('succes')
                }

                // Refresh halaman untuk memperbarui daftar review
                window.location.reload();
              } catch (error) {
                  console.error(error);
                  alert('Failed to submit review');
              }
              });
          })
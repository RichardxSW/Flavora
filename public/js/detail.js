var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
    var username = localStorage.getItem('username');
    $scope.username = username;
});

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    fetch("/recipes.json") // Path menuju recipes.json di luar folder
        .then(response => response.json())
        .then(data => {
            const foodItem = data.find(item => item.id === parseInt(id)); 
            if (foodItem) {
                document.querySelector('.recipe-image img').src = foodItem.img;
                document.querySelector('.recipe-image .desc').textContent = foodItem.desc;
                document.querySelector('.recipe-title .foodName').textContent = foodItem.title;

                // Mengisi detail-stats
                document.querySelector('.detail-stats .stats-item .ingr').textContent = foodItem.length;
                document.querySelector('.detail-stats .stats-item .mnt').textContent = foodItem.minutes;
                document.querySelector('.detail-stats .stats-item .clr').textContent = foodItem.calories;

                // Mengisi tag-list
                const tagList = document.querySelector('.tag-list');
                tagList.innerHTML = ''; 
                foodItem.category.forEach(category => {
                    const tagChip = document.createElement('div');
                    tagChip.className = 'filter-chip';
                    tagChip.textContent = category;
                    tagList.appendChild(tagChip);
                });

                document.querySelector('.serving').textContent = foodItem.serving;

                // Mengisi Ingredients
                const ingrList = document.querySelector('.ingr-list');
                ingrList.innerHTML = ''; 
                foodItem.bahan.forEach(bahan => {
                    const ingrItem = document.createElement('li');
                    ingrItem.className = 'ingr-item';
                    ingrItem.textContent = bahan;
                    ingrList.appendChild(ingrItem);
                });

                // Mengisi Instructions
                const instList = document.querySelector('.inst-list');
                instList.innerHTML = ''; 
                foodItem.cara.forEach(cara => {
                    const instItem = document.createElement('li');
                    instItem.className = 'inst-item';
                    instItem.textContent = cara;
                    instList.appendChild(instItem);
                });

                document.querySelector('.review-name img').src = foodItem.img;
                document.querySelector('.review-name .name-text').textContent = foodItem.title;

            } else {
                console.log("Makanan tidak ditemukan");
            }
        })
        .catch(error => console.error("Error fetching data:", error));

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

            submitButton.addEventListener('click', function() {
              const reviewText = reviewTextarea.value.trim();
              const currentDate = new Date().toLocaleDateString();
              const bintang = "\u2605".repeat(5);

              if (reviewText !== '' && value !== '') {
                const submissionContainer = document.createElement('div');
                submissionContainer.classList.add('submission');

                const ratingContainer = document.createElement('div');
                ratingContainer.classList.add('rating-container');
                
                const nameElement = document.createElement('h2');
                nameElement.textContent = username;
                // Create elements for the submission details
                const ratingElement = document.createElement('span');
                ratingElement.textContent = `${bintang}`;
                ratingElement.className = 'sub-rating-date';

                const bintangArray = ratingElement.textContent.split('');
                for (let i = 0; i < parseInt(value); i++) {
                    bintangArray[i] = '<span style="color: #ffc107;">\u2605</span>'; // Ubah warna bintang yang dipilih
                }
                ratingElement.innerHTML = bintangArray.join('');


                const dateElement = document.createElement('span');
                dateElement.textContent = `${currentDate}`;
                dateElement.className = 'sub-date';
    
                const reviewElement = document.createElement('p');
                reviewElement.textContent = `${reviewText}`;
    
                // Append elements to the container
                ratingContainer.appendChild(ratingElement);
                ratingContainer.appendChild(dateElement);
                submissionContainer.appendChild(ratingContainer);
                submissionContainer.appendChild(reviewElement);

                submissionsContainer.innerHTML = '';
    
                // Append the container to the submissions container
                submissionsContainer.appendChild(submissionContainer);
    
                // Clear the textarea
                reviewTextarea.value = reviewText;
              } else {
                  // submissionsContainer.textContent = 'Please select a rating and provide a review.';
                  alert('Please select a rating and provide a review.');
              }
              });
          })
"use strict";

var app = angular.module('myApp', []);

// Mendefinisikan controller untuk navbar
app.controller('myCtrl', function($scope) {
    var username = localStorage.getItem('username');
    $scope.username = username;
});

const swiperWrapper = document.querySelector(".swiper-wrapper"); // Menambahkan ini di sini untuk mengakses elemen swiper-wrapper

document.addEventListener("DOMContentLoaded", function () {
    // Mendapatkan data dari file JSON
    fetch("recipes.json")
    .then(response => response.json())
    .then(data => {
        const foodData = data;

         // Memanggil fungsi displayFoodData dengan semua data makanan saat halaman dimuat pertama kali
         displayFoodData(foodData);

         // Inisialisasi Swiper untuk konten default saat halaman dimuat
         initializeSwiper();

         document.querySelectorAll(".categories__item a").forEach(function(link) {
            link.addEventListener("click", function(e) {
                e.preventDefault();
                const category = this.getAttribute("data-id");
        
                // Ubah menjadi array jika kategori merupakan array
                const categories = Array.isArray(category) ? category : [category];
        
                let filteredFood;
                if (categories.includes("All")) {
                    displayFoodData(foodData); 
                } else {
                    filteredFood = foodData.filter(function(item) {
                        // Periksa apakah setiap kategori ada dalam array kategori makanan
                        return categories.some(cat => item.category.includes(cat));
                    });
                    displayFoodData(filteredFood);
                }
            });
        });
           
        function displayFoodData(food) {
            let displayData = food.map(function(cat_items) {
                return `<div class="swiper-slide">
                <div class="card">
                    <a href="${cat_items.url}?id=${cat_items.id}">
                        <img src="${cat_items.img}">
                        <h5>${cat_items.title}</h5>
                        <div class="time row">
                            <div class="row">
                                <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>
                                <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i> 
                                <div class="bookmark">
                                    <i class="fa fa-bookmark"></i>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            `; 
            });
            swiperWrapper.innerHTML = displayData.join("");
        }
        
        function initializeSwiper() {
            var productSwiper = new Swiper(".swiper-product", {
                slidesPerView: 4,
                spaceBetween: 3,
                runCallbacksOnInit: true,
                observer: true,
                // updateOnImagesReady: true,
            });
        
            // Update Swiper dan scrollbar
            document.querySelectorAll(".categories__item").forEach(function(item) {
                item.addEventListener("click", function() {
                    productSwiper.slideTo(0);
                });
            });
        }
        
            // Mendefinisikan fungsi separateByNationality
function separateByNationality(food) {
    const separatedFoods = {
        Western: [],
        Asian: [],
    };

    food.forEach(item => {
        separatedFoods[item.nationality].push(item);
    });

    return separatedFoods;
}

            function displaySeparatedFoodData(food) {
                const separatedFoods = separateByNationality(food);
            
                // Tampilkan makanan Asia dalam swiper
                if (separatedFoods.Asian.length > 0) {
                    const asianDisplayData = separatedFoods.Asian.map(cat_items => {
                        return `<div class="swiper-slide">
                        <div class="card">
                                <a href="${cat_items.url}?id=${cat_items.id}">
                                    <img src="${cat_items.img}">
                                    <h5>${cat_items.title}</h5>
                                    <div class="time row">
                                        <div class="row">
                                            <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>`; 
                    });
                    document.querySelector(".asian .swiper-wrapper").innerHTML = asianDisplayData.join("");
                }
            
                // Tampilkan makanan Barat dalam swiper
                if (separatedFoods.Western.length > 0) {
                    const westernDisplayData = separatedFoods.Western.map(cat_items => {
                        return `<div class="swiper-slide">
                        <div class="card">
                                <a href="${cat_items.url}?id=${cat_items.id}">
                                    <img src="${cat_items.img}">
                                    <h5>${cat_items.title}</h5>
                                    <div class="time row">
                                        <div class="row">
                                            <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>`; 
                    });
                    document.querySelector(".western .swiper-wrapper").innerHTML = westernDisplayData.join("");
                }
            }

              // Inisialisasi Swiper setelah memperbarui konten swiper-wrapper
              var swiper2 = new Swiper(".MySwiper", {
                slidesPerView: 4,
                spaceBetween: 10,
            });

            // Inisialisasi Swiper setelah memperbarui konten swiper-wrapper
            var swiper3 = new Swiper(".MySwiper", {
                slidesPerView: 4,
                spaceBetween: 10,
            });
            
            // Panggil fungsi displaySeparatedFoodData dengan menggunakan foodData
            displaySeparatedFoodData(foodData);
            
            // Pisahkan makanan berdasarkan waktu persiapannya
            function separateByTime(food) {
                const separatedFoods = {
                    UpTo5Minutes: [],
                    Other: []
                };

        food.forEach(item => {
            if (parseInt(item.time) <= 5) {
                separatedFoods.UpTo5Minutes.push(item);
            } else {
                separatedFoods.Other.push(item);
            }
        });

        return separatedFoods;
    }

    function displaySeparatedTimeFoodData(food) {
        const separatedFoods = separateByTime(food);

                // Tampilkan makanan dengan waktu persiapan <= 5 menit dalam carousel dengan id carousel-5
                if (separatedFoods.UpTo5Minutes.length > 0) {
                    const quickPrepDisplayData = separatedFoods.UpTo5Minutes.map(cat_items => {
                        return `<div class="swiper-slide">
                        <div class="card">
                                <a href="${cat_items.url}?id=${cat_items.id}">
                                    <img src="${cat_items.img}">
                                    <h5>${cat_items.title}</h5>
                                    <div class="time row">
                                        <div class="row">
                                            <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>`; 
                    });
                    // Update konten swiper-wrapper dengan data makanan
                    const swiperWrapper = document.querySelector(".under .swiper-wrapper");
                    swiperWrapper.innerHTML = quickPrepDisplayData.join("");
                }
                var swiper1 = new Swiper(".MySwiper", {
                    slidesPerView: 4,
                    spaceBetween: 10,
                });
            }

            // Panggil fungsi untuk menampilkan makanan berdasarkan waktu persiapan
            displaySeparatedTimeFoodData(foodData);
            
           // Pisahkan makanan berdasarkan properti featured
function separateByFeatured(food) {
    const featuredFoods = food.filter(item => item.featured === "yes");
    return featuredFoods;
}

function displayFeaturedFoodData(food) {
    const featuredFoods = separateByFeatured(food);

    // Tampilkan makanan yang ditandai sebagai fitur dalam carousel dengan id carousel-2
    if (featuredFoods.length > 0) {
        const featuredDisplayData = featuredFoods.map(cat_items => {
            return `<div class="swiper-slide">
            <div class="card">
                    <a href="${cat_items.url}?id=${cat_items.id}">
                        <img src="${cat_items.img}">
                        <h5>${cat_items.title}</h5>
                        <div class="time row">
                            <div class="row">
                                <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                            </div>
                        </div>
                    </a>
                </div>
            </div>`; 
        });
        const swiperWrapper = document.querySelector(".featured .swiper-wrapper");
        swiperWrapper.innerHTML = featuredDisplayData.join(""); // Menggunakan featuredDisplayData, bukan quickPrepDisplayData
    }
    var swiperFeatured = new Swiper(".MySwiper", {
        slidesPerView: 4,
        spaceBetween: 10,
    });

}

// Menampilkan makanan berdasarkan properti featured
displayFeaturedFoodData(foodData);
        })
        .catch(error => console.log("Error fetching data:", error));
});
"use strict";

var app = angular.module('myApp', []);

// Mendefinisikan controller untuk navbar
app.controller('myCtrl', function($scope) {

    var username = localStorage.getItem('username');

    $scope.username = username;
});

document.addEventListener("DOMContentLoaded", function () {
    // Mendapatkan data dari file JSON
    fetch("recipes.json")
        .then(response => response.json())
        .then(data => {
            const foodData = data;
            const swiperWrapper = document.querySelector(".swiper-wrapper");
            const links = document.querySelectorAll(".categories__item a");

// Menampilkan semua data pada awalnya
displayFoodData(foodData);

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = e.target.dataset.id;
        let filteredFood;
        if (category === "All") {
            // Tampilkan semua data makanan jika kategori "All" dipilih
            filteredFood = foodData;
        } else {
            // Filter data berdasarkan kategori yang dipilih
            filteredFood = foodData.filter((item) => item.category === category);
        }
        displayFoodData(filteredFood);
    });
});

function displayFoodData(food) {
    let displayData = food.map((cat_items) => {
        return `<div class="swiper-slide">
                <div class="card">
                        <a href="${cat_items.url}" target="_blank">
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
    displayData = displayData.join("");
    swiperWrapper.innerHTML = displayData;
}


            // Mendefinisikan fungsi separateByNationality
function separateByNationality(food) {
    const separatedFoods = {
        Western: [],
        Asian: []
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
                                <a href="${cat_items.url}" target="_blank">
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
                                <a href="${cat_items.url}" target="_blank">
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
            
            // Panggil fungsi displaySeparatedFoodData dengan menggunakan foodData
            displaySeparatedFoodData(foodData);

            // Inisialisasi Swiper setelah memperbarui konten swiper-wrapper
            var swiper2 = new Swiper(".asian .swiper", {
                slidesPerView: 4,
                spaceBetween: 10,
                pagination: {
                    el: ".asian .swiper-pagination",
                    clickable: true,
                },
            });

            // Inisialisasi Swiper setelah memperbarui konten swiper-wrapper
            var swiper3 = new Swiper(".western .swiper", {
                slidesPerView: 4,
                spaceBetween: 10,
                pagination: {
                    el: ".western .swiper-pagination",
                    clickable: true,
                },
            });
            
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
                                <a href="${cat_items.url}" target="_blank">
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
            }

            // Panggil fungsi untuk menampilkan makanan berdasarkan waktu persiapan
            displaySeparatedTimeFoodData(foodData);

            // Inisialisasi Swiper setelah memperbarui konten swiper-wrapper
            var swiper1 = new Swiper(".under .swiper", {
                slidesPerView: 4,
                spaceBetween: 10,
                pagination: {
                    el: ".under .swiper-pagination",
                    clickable: true,
                },
            });
            

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
                    <a href="${cat_items.url}" target="_blank">
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
}

// Menampilkan makanan berdasarkan properti featured
displayFeaturedFoodData(foodData);

var swiperFeatured = new Swiper(".featured .swiper", {
    slidesPerView: 4,
    spaceBetween: 10,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});

        })
        .catch(error => console.log("Error fetching data:", error));
});

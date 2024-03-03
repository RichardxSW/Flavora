"use strict";

// Menginisialisasi AngularJS app
var app = angular.module('myApp', []);

// Mendefinisikan controller untuk navbar
app.controller('myCtrl', function($scope) {
    // Mendapatkan nilai username dari localStorage
    var username = localStorage.getItem('username');
    // Menetapkan nilai username ke dalam scope
    $scope.username = username;
});

document.addEventListener("DOMContentLoaded", function () {
    
    const foodData = [
        {
            id: 1,
            title: "Nasi Goreng",
            category: "Lunch",
            nationality: "Asian",
            featured: "yes", // Ditambahkan properti featured
            time: "10 Minutes",
            img: "nasgor.png",
            url: "nasgorDetail.html"
        },
        {
            id: 2,
            title: "Pancake",
            category: "Breakfast",
            nationality: "Western",
            featured: "yes", // Ditambahkan properti featured
            time: "5 Minutes",
            img: "pancake.png",
            url: "nasgorDetail.html"
        },
        {
            id: 3,
            title: "Spaghetti Bolognese",
            category: "Dinner",
            nationality: "Western",
            time: "7 Minutes",
            img: "spaget.png",
            url: "nasgorDetail.html"
        },
        {
            id: 4,
            title: "Popcorn",
            category: "Snack",
            nationality: "Western",
            featured: "yes", // Ditambahkan properti featured
            time: "2 Minutes",
            img: "pop.png",
            url: "nasgorDetail.html"
        },
        // {
        //     id: 5,
        //     title: "Indian Butter Chicken",
        //     category: "Lunch",
        //     nationality: "Asian",
        //     featured: "yes", // Ditambahkan properti featured
        //     time: "14 Minutes",
        //     img: "indianbc.jpg",
        //     url: "nasgorDetail.html"
        // },
        // {
        //     id: 6,
        //     title: "Pad Thai",
        //     category: "Breakfast",
        //     nationality: "Asian",
        //     featured: "yes", // Ditambahkan properti featured
        //     time: "10 Minutes",
        //     img: "padthai.jpg",
        //     url: "nasgorDetail.html"
        // },
        // Anda dapat menambahkan data lebih lanjut di sini
    ];

    const cardContainer = document.querySelector(".card-wrapper");
const links = document.querySelectorAll(".categories__item a");

// display all
window.addEventListener("DOMContentLoaded", () => {
    displayFoodData(foodData);
});

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = e.target.dataset.id;
        const filteredFood = category === "All" ? foodData : foodData.filter((item) => item.category === category);
        displayFoodData(filteredFood);
    });
});

function displayFoodData(food) {
    let displayData = food.map((cat_items) => {
        return `<div class="card">
                    <a href="${cat_items.url}">
                    <img src="${cat_items.img}">
                    <h5>${cat_items.title}</h5>
                    <div class="time row">
                        <div class="row">
                            <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                        </div>
                    </div>
                </div>`;
    });
    displayData = displayData.join("");
    cardContainer.innerHTML = displayData;
}

    // Pisahkan makanan berdasarkan nationality
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

        // Tampilkan makanan Barat dalam carousel dengan id carousel-4
        if (separatedFoods.Western.length > 0) {
            const westernDisplayData = separatedFoods.Western.map(cat_items => {
                return `
                <div class="card">
                    <a href="${cat_items.url}">
                        <img src="${cat_items.img}">
                        <h5>${cat_items.title}</h5>
                        <div class="time row">
                            <div class="row">
                                <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                            </div>
                        </div>
                    </a>
                </div>`;
            });
            document.querySelector("#carousel-4 .card-wrapper").innerHTML = westernDisplayData.join("");
        }

        // Tampilkan makanan Asia dalam carousel dengan id carousel-3
        if (separatedFoods.Asian.length > 0) {
            const asianDisplayData = separatedFoods.Asian.map(cat_items => {
                return `
                <div class="card">
                    <a href="${cat_items.url}">
                        <img src="${cat_items.img}">
                        <h5>${cat_items.title}</h5>
                        <div class="time row">
                            <div class="row">
                                <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                            </div>
                        </div>
                    </a>
                </div>`;
            });
            document.querySelector("#carousel-3 .card-wrapper").innerHTML = asianDisplayData.join("");
        }
    }

    // Menampilkan makanan berdasarkan asalnya
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
                return `
                <div class="card">
                    <a href="${cat_items.url}">
                        <img src="${cat_items.img}">
                        <h5>${cat_items.title}</h5>
                        <div class="time row">
                            <div class="row">
                                <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                            </div>
                        </div>
                    </a>
                </div>`;
            });
            document.querySelector("#carousel-5 .card-wrapper").innerHTML = quickPrepDisplayData.join("");
        }
    }

    // Menampilkan makanan berdasarkan waktu persiapannya
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
                return `
                <div class="card">
                    <a href="${cat_items.url}">
                        <img src="${cat_items.img}">
                        <h5>${cat_items.title}</h5>
                        <div class="time row">
                            <div class="row">
                                <i class="fa fa-clock-o" style="font-size:15px"><p>${cat_items.time}</p></i>   <i class="fa fa-cutlery" style="font-size:15px"><p>${cat_items.category}</p></i>
                            </div>
                        </div>
                    </a>
                </div>`;
            });
            document.querySelector("#carousel-2 .card-wrapper").innerHTML = featuredDisplayData.join("");
        }
    }

    // Menampilkan makanan berdasarkan properti featured
    displayFeaturedFoodData(foodData);
});
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const foodData = [
    {
        id: 1,
        title: "Nasi Goreng", 
        category: "Lunch",
        time: "10 Minutes",
        img: "nasgor.png",
    },
    {
        id: 2,
        title: "Pancake", 
        category: "Breakfast",
        time: "5 Minutes",
        img: "pancake.png",
    },
    {
        id: 3,
        title: "Spagetthi", 
        category: "Dinner",
        time: "7 Minutes",
        img: "spaget.png",
    },
    {
        id: 4,
        title: "Popcorn", 
        category: "Snack",
        time: "2 Minutes",
        img: "pop.png",
    },
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
});



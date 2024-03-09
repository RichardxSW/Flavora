 function changeCategory(category) {
    // Mengambil data kategori dari JSON
    fetch("recipes.json")
        .then(response => response.json())
        .then(categories => {
            var categoryItems = document.querySelectorAll('.categories__item');

            // Menghapus kelas 'active' dari semua kategori
            categoryItems.forEach(function(item) {
                item.classList.remove('active');
            });

            // Menambahkan kelas 'active' ke kategori yang diklik
            var clickedCategory = document.querySelector('[data-id="' + category + '"]');
            clickedCategory.parentElement.classList.add('active');
        })
        .catch(error => console.log("Error fetching categories:", error));
}



//   document.addEventListener("DOMContentLoaded", function() {
//     var mySwiper = new Swiper('.mySwiper', {
//         // konfigurasi Swiper Anda disini
//         // Misalnya:
//         slidesPerView: 4,
//         spaceBetween: 10,
//         pagination: {
//             el: '.swiper-pagination',
//             clickable: true,
//         },
//         // scrollbar: {
//         //     el: '.swiper-scrollbar',
//         //     hide: false,
//         // },
//     });
// });



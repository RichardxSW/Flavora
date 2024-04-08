"use strict";

// window.addEventListener('beforeunload', () => {
//     sessionStorage.setItem('scrollPosition', window.scrollY);
// });

// window.addEventListener('load', () => {
//     const scrollPosition = sessionStorage.getItem('scrollPosition');
//     if (scrollPosition) {
//         window.scrollTo(0, scrollPosition);
//         sessionStorage.removeItem('scrollPosition');
//     }
// });

const swiperWrapper = document.querySelector(".swiper-wrapper"); // Menambahkan ini di sini untuk mengakses elemen swiper-wrapper
document.addEventListener("DOMContentLoaded", function () {
    // Inisialisasi Swiper untuk konten default saat halaman dimuat
    initializeSwiper();

    // Tambahkan event listener untuk setiap link kategori
    document.querySelectorAll(".categories__item a").forEach(function(link) {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const category = this.getAttribute("data-id");
            changeCategory(category); // Panggil fungsi changeCategory saat kategori dipilih
        });
    });

    function initializeSwiper() {
        var productSwiper = new Swiper(".swiper-product", {
            slidesPerView: 4,
            spaceBetween: 3,
            runCallbacksOnInit: true,
            observer: true,
            observeParents: true,
            observeSlideChildren: true,
            updateOnImagesReady: true,
        });
    
        // Update Swiper dan scrollbar
        document.querySelectorAll(".categories__item").forEach(function(item) {
            item.addEventListener("click", function() {
                productSwiper.slideTo(0);
                productSwiper.updateSize();
                productSwiper.updateSlides();
                productSwiper.updateSlidesClasses();
            });
        });
    }

    // Inisialisasi Swiper setelah memperbarui konten swiper-wrapper
    var swiper1 = new Swiper(".swiper1", {
        slidesPerView: 4,
        spaceBetween: 3,
    });
    var swiper2 = new Swiper(".swiper2", {
        slidesPerView: 4,
        spaceBetween: 3,
    });
    var swiper3 = new Swiper(".swiper3", {
        slidesPerView: 4,
        spaceBetween: 3,
    });
    var swiper4 = new Swiper(".swiper4", {
        slidesPerView: 4,
        spaceBetween: 3,
    });
});

// Fungsi untuk mengubah kategori
function changeCategory(category) {
    // Ubah menjadi array jika kategori merupakan array
    const categories = Array.isArray(category) ? category : [category];

    var categoryItems = document.querySelectorAll('.categories__item');
    
    // Menghapus kelas 'active' dari semua kategori
    categoryItems.forEach(function(item) {
        item.classList.remove('active');
    });

    // Menambahkan kelas 'active' ke kategori yang diklik
    var clickedCategory = document.querySelector('[data-id="' + category + '"]');
    clickedCategory.parentElement.classList.add('active');

    // Menampilkan atau menyembunyikan kartu makanan sesuai dengan kategori yang dipilih
    var foodCards = document.querySelectorAll('.swiper-slide'); // Menggunakan kelas prodslide untuk mencari kartu makanan
    foodCards.forEach(function(card) {
        var cardCategories = card.getAttribute('data-category');

        // Mengecek apakah kategori kartu makanan termasuk dalam kategori yang dipilih
        var match = categories.includes('All') || categories.some(cat => cardCategories.includes(cat));
        card.style.display = match ? 'block' : 'none';
    });
}

"use strict";

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
            // autoHeight: true,
            slidesPerView: 1,
            spaceBetween: 3,
            runCallbacksOnInit: true,
            observer: true,
            breakpoints: {
                768: {
                    slidesPerView: 2
                },
                1024: {
                    slidesPerView: 3
                },
                1440: {
                    slidesPerView: 4
                }
            }
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
        //autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 3,
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3
            },
            1440: {
                slidesPerView: 4
            }
        }
    });
    var swiper2 = new Swiper(".swiper2", {
        //autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 3,
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3
            },
            1440: {
                slidesPerView: 4
            }
        }
    });
    var swiper3 = new Swiper(".swiper3", {
        //autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 3,
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3
            },
            1440: {
                slidesPerView: 4
            }
        }
    });
    var swiper4 = new Swiper(".swiper4", {
        //autoHeight: true,
        slidesPerView: 1,
        spaceBetween: 3,
        breakpoints: {
            768: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3
            },
            1440: {
                slidesPerView: 4
            }
        }
    });    
});

// Fungsi untuk mengubah kategori
function changeCategory(category) {
    // Ubah menjadi array jika kategori merupakan string
    const categories = typeof category === 'string' ? [category] : category;

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

        // Mengecek apakah cardCategories tidak null atau undefined sebelum menggunakan includes()
        if (cardCategories) {
            // Mengecek apakah kategori kartu makanan termasuk dalam kategori yang dipilih
            var match = categories.includes('All') || categories.some(cat => cardCategories.includes(cat));
            card.style.display = match ? 'block' : 'none';
        }
    });
}
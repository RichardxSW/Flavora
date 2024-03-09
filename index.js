$(document).ready(function(){
    // Array yang berisi id carousel
    var carouselIds = ['carousel-1','carousel-2', 'carousel-3', 'carousel-4', 'carousel-5'];

    // Iterasi melalui setiap carousel
    carouselIds.forEach(function(carouselId) {
        var $carousel = $('#' + carouselId);
        var $carouselPrev = $carousel.find('.carousel-control-prev');
        var $firstItem = $carousel.find('.carousel-item:first');

        // Inisialisasi carousel dan sembunyikan tombol "Previous" jika carousel-item pertama aktif
        new bootstrap.Carousel(document.querySelector('#' + carouselId), {
            wrap: false,
            interval: 0
        });

        if ($firstItem.hasClass('active')) {
            $carouselPrev.hide();
        }

        // Event handler untuk menangani peristiwa slid.bs.carousel
        $carousel.on('slid.bs.carousel', function(event) {
            var $this = $(this);
            var $firstItem = $this.find('.carousel-item:first');
            var $lastItem = $this.find('.carousel-item:last');

            $carouselPrev.show();
            $carousel.find('.carousel-control-next').show();

            if($firstItem.hasClass('active')) {
                $carouselPrev.hide();
            } else if($lastItem.hasClass('active')) {
                $this.find('.carousel-control-next').hide();
            }
        });
    });
});

function changeCategory(category) {
    var categoryItems = document.querySelectorAll('.categories__item');
    
    // Remove 'active' class from all categories
    categoryItems.forEach(function(item) {
      item.classList.remove('active');
    });
    
    // Add 'active' class to the clicked category
    var clickedCategory = document.querySelector('[data-id="' + category + '"]');
    clickedCategory.parentElement.classList.add('active');
  }
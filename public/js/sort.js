$(document).ready(function() {
    $('#sortSelect').change(function() {
      const selectedSort = $(this).val();
      const searchQuery = getParameterByName('q');
      let sortParam = '';
      switch (selectedSort) {
        case '2':
          sortParam = 'time';
          break;
        case '3':
          sortParam = 'averageRating';
          break;
        case '4':
          sortParam = 'totalReviews';
          break;
        default:
          sortParam = ''; 
      }
      window.location.href = sortParam ? `/search?q=${searchQuery}&sort=${sortParam}` : `/search?q=${searchQuery}`;
    });
  
    // Menentukan opsi sort berdasarkan nilai 'sort' pada URL saat halaman dimuat
    const sortParam = getParameterByName('sort');
    if (sortParam === 'time') {
        $('#sortSelect').val('2'); 
    } else if (sortParam === 'averageRating') {
        $('#sortSelect').val('3'); 
    } else if (sortParam === 'totalReviews') {
        $('#sortSelect').val('4'); 
    }
  });

  function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
  
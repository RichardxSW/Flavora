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
                document.querySelector('.recipe-title h2').textContent = foodItem.title;

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
            } else {
                console.log("Makanan tidak ditemukan");
            }
        })
        .catch(error => console.error("Error fetching data:", error));
});

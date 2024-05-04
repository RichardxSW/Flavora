document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pin').forEach(button => {
        const recipeId = button.dataset.id;
        const isPinned = sessionStorage.getItem('isPinned_' + recipeId) === 'true';

        if (isPinned) {
            button.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
        } else {
            button.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
        }
        button.dataset.isPinned = isPinned.toString();
    });
});

document.querySelectorAll('.pin').forEach(button => {
    button.addEventListener('click', async () => {
        const recipeId = button.dataset.id;
        const isPinned = button.dataset.isPinned === 'true';
        const url = isPinned ? '/unpinrecipe' : '/pinrecipe';
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipeId })
            });
    
            const data = await response.json();
            if (response.ok) {
                // Perbarui tampilan tombol pin
                button.innerHTML = isPinned ? '<i class="fa-regular fa-bookmark"></i>' : '<i class="fa-solid fa-bookmark"></i>';
                button.dataset.isPinned = !isPinned;
                sessionStorage.setItem('isPinned_' + recipeId, !isPinned);
    
                // Perbarui tampilan kartu sesuai status pin
                updateCard(recipeId, !isPinned);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

// Fungsi untuk memperbarui tampilan kartu berdasarkan status pin yang baru
function updateCard(recipeId, isPinned) {
    const cardButtons = document.querySelectorAll(`.pin[data-id="${recipeId}"]`);
    cardButtons.forEach(button => {
        button.innerHTML = isPinned ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
        button.dataset.isPinned = isPinned.toString();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const recipeButtons = document.querySelectorAll('.pin');
    recipeButtons.forEach(async button => {
        const recipeId = button.dataset.id;

        try {
            const response = await fetch(`/checkpinstatus/${recipeId}`);
            const data = await response.json();

            if (response.ok) {
                const isPinned = data.isPinned;
                const iconClass = isPinned ? 'fa-solid' : 'fa-regular';
                button.innerHTML = `<i class="${iconClass} fa-bookmark"></i>`;
                button.dataset.isPinned = isPinned ? 'true' : 'false';
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
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
      const url = isPinned ? '/delete-recipe' : '/save-recipe';

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
              button.innerHTML = isPinned ? '<i class="fa-regular fa-bookmark"></i>' : '<i class="fa-solid fa-bookmark"></i>';
              button.dataset.isPinned = !isPinned;
              sessionStorage.setItem('isPinned_' + recipeId, !isPinned);
          } else {
              console.error(data.error);
          }
      } catch (error) {
          console.error('Error:', error);
      }
  });
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('pin')) {
      const recipeId = event.target.dataset.id;
      const isPinned = event.target.dataset.isPinned === 'true';
      
      // Pemicuan Custom Event
      const pinEvent = new CustomEvent('recipePinToggle', { detail: { recipeId, isPinned } });
      document.dispatchEvent(pinEvent);
  }
});

document.addEventListener('recipePinToggle', (event) => {
    const { recipeId, isPinned } = event.detail;

    // Temukan tombol pin dengan resepId yang cocok dan sesuaikan status pin
    document.querySelectorAll(`.pin[data-id="${recipeId}"]`).forEach(button => {
        button.innerHTML = isPinned ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
        button.dataset.isPinned = isPinned.toString();
    });
});
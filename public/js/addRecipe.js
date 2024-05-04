document.getElementById('addIngredient').addEventListener('click', function() {
    const ingredientsDiv = document.getElementById('ingredients');
    const ingredientCount = ingredientsDiv.children.length;

    const newDiv = document.createElement('div');
    newDiv.classList.add('input-box' ,'long');

    const newLabel = document.createElement('label');
    newLabel.classList.add('input-label');
    newLabel.textContent = 'Ingredient ' + (ingredientCount + 1);
    newLabel.htmlFor = 'bahan' + (ingredientCount + 1);

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.name = 'bahan[]';
    newInput.id = 'bahan' + (ingredientCount + 1);
    newInput.placeholder = 'Enter ingredient';
    newInput.required = true;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
    ingredientsDiv.removeChild(newDiv);
    });

    newDiv.appendChild(newLabel);
    newDiv.appendChild(newInput);
    newDiv.appendChild(deleteButton);

    ingredientsDiv.appendChild(newDiv);
});

function removeInputBox(button) {
    const ingredientsDiv = document.getElementById('ingredients');
    const inputBox = button.parentNode;
    ingredientsDiv.removeChild(inputBox);
}

document.getElementById('addInstruction').addEventListener('click', function() {
    const instructionsDiv = document.getElementById('instructions');
    const instructionCount = instructionsDiv.children.length;

    const newDiv = document.createElement('div');
    newDiv.classList.add('input-box', 'long');

    const newLabel = document.createElement('label');
    newLabel.classList.add('input-label');
    newLabel.textContent = 'Instruction ' + (instructionCount + 1);
    newLabel.htmlFor = 'cara' + (instructionCount + 1);

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.name = 'cara[]';
    newInput.id = 'cara' + (instructionCount + 1);
    newInput.placeholder = 'Enter instruction';
    newInput.required = true;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        instructionsDiv.removeChild(newDiv);
    });

    newDiv.appendChild(newLabel);
    newDiv.appendChild(newInput);
    newDiv.appendChild(deleteButton);

    instructionsDiv.appendChild(newDiv);
});

function removeInputBox(button) {
    const instructionsDiv = document.getElementById('instructions');
    const inputBox = button.parentNode;
    instructionsDiv.removeChild(inputBox);
}

// Tangkap formulir
const form = document.querySelector('form');

// Tambahkan event listener untuk meng-handle submit formulir
form.addEventListener('submit', async (event) => {

    event.preventDefault();
    // Tampilkan SweetAlert untuk konfirmasi sebelum mengirimkan formulir
    Swal.fire({
        title: 'Confirmation',
        text: 'Are you sure you want to add this recipe?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Mengumpulkan data formulir menggunakan FormData
            const formData = new FormData(form);

            try {
                // Kirim data formulir menggunakan fetch
                const response = await fetch('/admin/addRecipe', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Tampilkan SweetAlert bahwa resep telah berhasil ditambahkan
                Swal.fire({
                    title: 'Success',
                    text: 'Your recipe has been added successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Arahkan ke halaman dashboard setelah menekan tombol "OK"
                    window.location.href = '/admin/dashboard';
                });
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
                // Tampilkan pesan kesalahan jika terjadi masalah dengan fetch
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while adding the recipe',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
});

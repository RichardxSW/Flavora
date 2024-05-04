document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('addIngredient').addEventListener('click', function() {

        //ingredients
        const ingredientsDiv = document.getElementById('ingredients');
        const ingredientCount = ingredientsDiv.children.length;

        const newDiv = document.createElement('div');
        newDiv.classList.add('input-box', 'long');

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

    //insruction
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

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentDiv = this.parentNode;
            parentDiv.parentNode.removeChild(parentDiv);
        });
    });


    //confirmation
    document.getElementById('editForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Hentikan perilaku bawaan dari form
    
        // Tampilkan SweetAlert untuk konfirmasi
        Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to submit the form',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Kirim form secara asynchronous
                try {
                    const form = event.target;
                    const formData = new FormData(form);
    
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData
                    });
    
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
    
                    // Tampilkan SweetAlert untuk memberi tahu pengguna bahwa form telah berhasil disubmit
                    Swal.fire({
                        title: 'Success',
                        text: 'Your form has been submitted successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Refresh halaman
                        window.location.href = '/admin/dashboard';
                    });
                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                    alert('An error occurred while submitting the form'); // Tampilkan pesan kesalahan
                }
            }
        });
    });
    
})
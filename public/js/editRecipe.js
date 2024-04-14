document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('addIngredient').addEventListener('click', function() {

        //ingredients
        const ingredientsDiv = document.getElementById('ingredients');
        const ingredientCount = ingredientsDiv.children.length;

        const newDiv = document.createElement('div');
        newDiv.classList.add('input-box');

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

    // const deleteButtons = document.querySelectorAll('.delete-button');
    // deleteButtons.forEach(button => {
    //     button.addEventListener('click', function() {
    //         removeInputBox(this);
    //     });
    // });

    // function removeInputBox(button) {
    //     const ingredientsDiv = document.getElementById('ingredients');
    //     const inputBox = button.parentNode;
    //     ingredientsDiv.removeChild(inputBox);
    // }

    //insruction
    document.getElementById('addInstruction').addEventListener('click', function() {
        const instructionsDiv = document.getElementById('instructions');
        const instructionCount = instructionsDiv.children.length;

        const newDiv = document.createElement('div');
        newDiv.classList.add('input-box');

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

    // function removeInputBox(button) {
    //     const instructionsDiv = document.getElementById('instructions');
    //     const inputBox = button.parentNode;
    //     instructionsDiv.removeChild(inputBox);
    // }

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentDiv = this.parentNode;
            parentDiv.parentNode.removeChild(parentDiv);
        });
    });
})
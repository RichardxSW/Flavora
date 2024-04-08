const toggleBookmark = async (recipeID) => { 
    try {
        const response = await fetch(`/detail/${recipeID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipeID
            }),
        });
        console.log(response);
        // Lakukan tindakan lain yang diperlukan dengan respons, jika diperlukan
    } catch (err) {
        console.error(err);
    }
}

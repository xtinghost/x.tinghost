document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('cute-character');
    let isDragging = false;
    let offsetX, offsetY;

    // --- 1. Start Dragging (Mouse Down) ---
    character.addEventListener('mousedown', (e) => {
        isDragging = true;
        // Calculate the initial offset (where the mouse clicked relative to the element's top-left corner)
        offsetX = e.clientX - character.getBoundingClientRect().left;
        offsetY = e.clientY - character.getBoundingClientRect().top;
        character.style.cursor = 'grabbing';
    });

    // --- 2. Move Element (Mouse Move) ---
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        // Calculate the new position based on the mouse position and the initial offset
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Apply the new position
        character.style.left = newX + 'px';
        character.style.top = newY + 'px';
    });

    // --- 3. Stop Dragging (Mouse Up) ---
    document.addEventListener('mouseup', () => {
        isDragging = false;
        character.style.cursor = 'grab';
    });
});

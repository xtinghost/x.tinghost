document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('cute-character');
    if (!character) return; // Exit if the element isn't found

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    // --- Get the boundaries for dragging (the journal page) ---
    const journalPage = document.querySelector('.journal-page');
    const bounds = journalPage ? journalPage.getBoundingClientRect() : document.body.getBoundingClientRect();
    
    // Calculate the offset (distance from the document's top-left to the journal's top-left)
    const offsetX = bounds.left + window.scrollX;
    const offsetY = bounds.top + window.scrollY;

    // --- Helper function to get the correct coordinates (mouse or touch) ---
    function getCoords(e) {
        if (e.touches) {
            // Mobile: Use the first touch point
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else {
            // Desktop: Use mouse position
            return {
                x: e.clientX,
                y: e.clientY
            };
        }
    }

    // --- START DRAGGING (Common Logic for Mouse and Touch) ---
    function dragStart(e) {
        // Prevent default behavior to avoid issues like accidental scrolling on mobile
        e.preventDefault(); 
        
        const coords = getCoords(e);
        initialX = coords.x - currentX;
        initialY = coords.y - currentY;
        
        isDragging = true;
        character.style.cursor = 'grabbing';
    }

    // --- STOP DRAGGING (Common Logic) ---
    function dragEnd() {
        isDragging = false;
        character.style.cursor = 'grab';
    }

    // --- DRAG MOVE (Common Logic) ---
    function drag(e) {
        if (!isDragging) return;
        
        // Prevent default behavior during move
        e.preventDefault();

        const coords = getCoords(e);
        
        // Calculate the new position relative to the initial drag
        currentX = coords.x - initialX;
        currentY = coords.y - initialY;

        // Apply transformation
        character.style.left = currentX + 'px';
        character.style.top = currentY + 'px';
    }
    
    // --- 1. MOUSE EVENTS (Desktop) ---
    character.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mouseup', dragEnd, false);
    document.addEventListener('mousemove', drag, false);

    // --- 2. TOUCH EVENTS (Mobile) ---
    character.addEventListener('touchstart', dragStart, false);
    document.addEventListener('touchend', dragEnd, false);
    document.addEventListener('touchmove', drag, false);

    // --- Initial Positioning Setup (Run once) ---
    // Get the character's initial position set in CSS (e.g., top: 50px; left: 10px;)
    // and initialize currentX/Y for accurate dragging start.
    const rect = character.getBoundingClientRect();
    currentX = rect.left;
    currentY = rect.top;
});

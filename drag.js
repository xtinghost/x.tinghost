document.addEventListener('DOMContentLoaded', () => {
    const characters = document.querySelectorAll('.draggable.collectible');
    const popup = document.getElementById('great-job-popup');
    const targets = {
        'char-1': document.getElementById('target-1'),
        'char-2': document.getElementById('target-2'),
        'char-3': document.getElementById('target-3'),
    };
    
    // Tracks which characters are collected (initially all false)
    const collected = { 'char-1': false, 'char-2': false, 'char-3': false };

    // Set initial positions from HTML data attributes
    characters.forEach(char => {
        const initialX = char.getAttribute('data-initial-x') + 'px';
        const initialY = char.getAttribute('data-initial-y') + 'px';
        char.style.left = initialX;
        char.style.top = initialY;
        
        // Initialize currentX/Y for the script to use
        char.currentX = parseFloat(initialX);
        char.currentY = parseFloat(initialY);
        char.isDragging = false;
        char.canDrag = true; // Can be set to false after collection if desired

        // Add the character's unique ID to its dataset for easy mapping
        char.dataset.id = char.id; 
    });


    // --- Dragging Logic (Unified for Mouse and Touch) ---

    function getCoords(e) {
        // ... (The same getCoords function as before)
        if (e.touches) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            return { x: e.clientX, y: e.clientY };
        }
    }

    function dragStart(e) {
        let char = e.currentTarget;
        if (!char.canDrag) return; 

        e.preventDefault(); 
        
        const coords = getCoords(e);
        char.initialX = coords.x - char.currentX;
        char.initialY = coords.y - char.currentY;
        
        char.isDragging = true;
        char.style.zIndex = 1001; // Bring the active cat to the front
        char.style.cursor = 'grabbing';
    }

    function dragEnd(e) {
        let char = e.currentTarget;
        if (!char.isDragging) return;
        
        char.isDragging = false;
        char.style.zIndex = 1000;
        char.style.cursor = 'grab';
        
        // --- CHECK FOR SNAP ON DROP ---
        const target = targets[char.dataset.id];
        if (target) {
            checkForSnap(char, target);
        }
    }

    function drag(e) {
        let char = e.currentTarget;
        if (!char.isDragging) return;
        
        e.preventDefault();

        const coords = getCoords(e);
        
        char.currentX = coords.x - char.initialX;
        char.currentY = coords.y - char.initialY;

        char.style.left = char.currentX + 'px';
        char.style.top = char.currentY + 'px';
    }


    // --- COLLECTION LOGIC ---

    function checkForSnap(char, target) {
        const charRect = char.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        // Define a snap tolerance (e.g., 50 pixels)
        const snapTolerance = 50; 

        // Calculate the center of the character and the center of the target spot
        const charCenterX = charRect.left + (charRect.width / 2);
        const charCenterY = charRect.top + (charRect.height / 2);
        const targetCenterX = targetRect.left + (targetRect.width / 2);
        const targetCenterY = targetRect.top + (targetRect.height / 2);
        
        // Check if the centers are within tolerance
        const isNearX = Math.abs(charCenterX - targetCenterX) <= snapTolerance;
        const isNearY = Math.abs(charCenterY - targetCenterY) <= snapTolerance;

        if (isNearX && isNearY) {
            // SNAP TO TARGET!
            char.style.transition = 'top 0.3s, left 0.3s'; // Smooth snap animation
            char.style.left = targetRect.left + 'px'; 
            char.style.top = targetRect.top + 'px';
            
            // Lock the collected status
            collected[char.dataset.id] = true;
            char.canDrag = false; // Lock movement after snapping

            // Apply collected style to the target spot
            target.classList.add('target-collected'); 

            // Check if all characters are collected
            checkCollectionComplete();
        } else {
            // If not snapped, clear any existing snap transition style
            char.style.transition = 'none';
        }
    }
    
    function checkCollectionComplete() {
        // Use Object.values to check if ALL values are true
        const allCollected = Object.values(collected).every(isCollected => isCollected === true);

        if (allCollected) {
            popup.classList.remove('hidden');
            // Re-enable dragging after the popup appears (if the user wants to keep moving them)
            characters.forEach(char => { char.canDrag = true; }); 

            // Optional: Hide the popup after a few seconds
            setTimeout(() => {
                popup.classList.add('hidden');
            }, 5000); 
        }
    }

    // --- Attach Event Listeners ---
    characters.forEach(char => {
        // Mouse Events
        char.addEventListener('mousedown', dragStart, false);
        char.addEventListener('mouseup', dragEnd, false);
        // Note: Mousemove/Mouseup are attached to the document for safety in `drag.js`
        
        // Touch Events
        char.addEventListener('touchstart', dragStart, false);
        char.addEventListener('touchend', dragEnd, false);
        char.addEventListener('touchmove', drag, false);
    });

    // We must attach drag/end to the document, not the character itself
    // to ensure events aren't missed when the mouse moves off the element.
    document.addEventListener('mouseup', (e) => {
        characters.forEach(char => dragEnd({ currentTarget: char }));
    }, false);
    
    document.addEventListener('mousemove', (e) => {
        characters.forEach(char => {
            if (char.isDragging) drag({ currentTarget: char, ...e });
        });
    }, false);

    document.addEventListener('touchend', (e) => {
        characters.forEach(char => dragEnd({ currentTarget: char }));
    }, false);

    document.addEventListener('touchmove', (e) => {
        characters.forEach(char => {
            if (char.isDragging) drag({ currentTarget: char, ...e });
        });
    }, false);
});

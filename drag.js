document.addEventListener('DOMContentLoaded', () => {
    const characters = document.querySelectorAll('.draggable.collectible');
    const popup = document.getElementById('great-job-popup');
    
    // Create map of targets and initialize collected status
    const targets = {};
    const collected = {};
    document.querySelectorAll('.target-spot').forEach(target => {
        const charId = target.id.replace('target-', 'char-');
        targets[charId] = target;
        collected[charId] = false;
    });

    const snapTolerance = 50; 
    let activeDragChar = null; // Tracks the character currently being dragged

    // --- Initialization (Sets initial position and internal coordinates) ---
    characters.forEach(char => {
        const initialX = parseInt(char.getAttribute('data-initial-x'));
        const initialY = parseInt(char.getAttribute('data-initial-y'));

        char.style.left = initialX + 'px';
        char.style.top = initialY + 'px';
        
        char.currentX = initialX;
        char.currentY = initialY;
        char.canDrag = true;
        char.dataset.id = char.id; 
    });


    // --- Helper function to get the correct coordinates (mouse or touch) ---
    function getCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            return { x: e.clientX, y: e.clientY };
        }
    }

    // --- START DRAGGING ---
    function dragStart(e) {
        let char = e.currentTarget;
        if (!char.canDrag) return; 

        e.preventDefault(); 
        
        const coords = getCoords(e);
        const charRect = char.getBoundingClientRect();
        
        // Calculate the offset from the cursor to the character's top-left corner
        char.offsetX = coords.x - charRect.left;
        char.offsetY = coords.y - charRect.top;
        
        activeDragChar = char; // Set the currently dragged character
        char.style.zIndex = 1001;
        char.style.cursor = 'grabbing';
    }

    // --- STOP DRAGGING ---
    function dragEnd(e) {
        if (!activeDragChar) return;
        
        let char = activeDragChar;
        activeDragChar = null; // Clear the active character
        
        char.style.zIndex = 1000;
        char.style.cursor = 'grab';
        
        // Check for snap only if the character is not already collected
        if (!collected[char.dataset.id]) {
            const target = targets[char.dataset.id];
            if (target) {
                checkForSnap(char, target);
            }
        }
    }

    // --- DRAG MOVE ---
    function drag(e) {
        if (!activeDragChar) return;
        
        let char = activeDragChar;
        e.preventDefault();

        const coords = getCoords(e);
        
        // Calculate new position based on cursor and initial offset
        char.currentX = coords.x - char.offsetX;
        char.currentY = coords.y - char.offsetY;

        char.style.left = char.currentX + 'px';
        char.style.top = char.currentY + 'px';
    }


    // --- COLLECTION LOGIC (Same as before) ---
    function checkForSnap(char, target) {
        // ... (The code for checking snap remains the same)
        const charRect = char.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        const charCenterX = charRect.left + (charRect.width / 2);
        const charCenterY = charRect.top + (charRect.height / 2);
        const targetCenterX = targetRect.left + (targetRect.width / 2);
        const targetCenterY = targetRect.top + (targetRect.height / 2);
        
        const isNearX = Math.abs(charCenterX - targetCenterX) <= snapTolerance;
        const isNearY = Math.abs(charCenterY - targetCenterY) <= snapTolerance;

        if (isNearX && isNearY) {
            char.style.transition = 'top 0.3s, left 0.3s';
            char.style.left = targetRect.left + window.scrollX + 'px'; // Use window scroll to fix position
            char.style.top = targetRect.top + window.scrollY + 'px';

            collected[char.dataset.id] = true;
            char.canDrag = false; 
            target.classList.add('target-collected'); 
            checkCollectionComplete();
        } else {
            char.style.transition = 'none';
        }
    }
    
    function checkCollectionComplete() {
        const allCollected = Object.values(collected).every(isCollected => isCollected === true);

        if (allCollected) {
            popup.classList.remove('hidden');
            characters.forEach(char => { char.canDrag = true; }); 

            setTimeout(() => {
                popup.classList.add('hidden');
            }, 5000); 
        }
    }

    // --- Attach Event Listeners ---
    characters.forEach(char => {
        // Mouse Start
        char.addEventListener('mousedown', dragStart, false);
        // Touch Start
        char.addEventListener('touchstart', dragStart, false);
    });
    
    // Global Listeners (Attach to document for reliability)
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', dragEnd, false);
    document.addEventListener('touchmove', drag, false);
    document.addEventListener('touchend', dragEnd, false);
});

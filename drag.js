document.addEventListener('DOMContentLoaded', () => {
    const characters = document.querySelectorAll('.draggable.collectible');
    const popup = document.getElementById('great-job-popup');
    
    const targets = {};
    document.querySelectorAll('.target-spot').forEach(target => {
        const charId = target.id.replace('target-', 'char-');
        targets[charId] = target;
    });

    const collected = { 'char-1': false, 'char-2': false, 'char-3': false };
    const snapTolerance = 50; 

    // --- Initialization (Sets initial position and internal coordinates) ---
    characters.forEach(char => {
        const initialX = parseInt(char.getAttribute('data-initial-x'));
        const initialY = parseInt(char.getAttribute('data-initial-y'));

        char.style.left = initialX + 'px';
        char.style.top = initialY + 'px';
        
        // Internal tracking variables
        char.currentX = initialX;
        char.currentY = initialY;
        char.isDragging = false;
        char.canDrag = true;
        char.dataset.id = char.id; 
    });


    // --- Helper function to get the correct coordinates (mouse or touch) ---
    function getCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        } else {
            return {
                x: e.clientX,
                y: e.clientY
            };
        }
    }

    // --- START DRAGGING ---
    function dragStart(e) {
        let char = e.currentTarget;
        if (!char.canDrag) return; 

        e.preventDefault(); 
        
        const coords = getCoords(e);
        
        // Calculate the offset from the cursor to the character's top-left corner
        const charRect = char.getBoundingClientRect();
        char.offsetX = coords.x - charRect.left;
        char.offsetY = coords.y - charRect.top;
        
        char.isDragging = true;
        char.style.zIndex = 1001;
        char.style.cursor = 'grabbing';
    }

    // --- STOP DRAGGING ---
    function dragEnd(e) {
        let char = e.currentTarget;
        if (!char.isDragging) return;
        
        char.isDragging = false;
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
        let char = e.currentTarget;
        if (!char.isDragging) return;
        
        e.preventDefault();

        const coords = getCoords(e);
        
        // Calculate new position based on cursor and initial offset
        char.currentX = coords.x - char.offsetX;
        char.currentY = coords.y - char.offsetY;

        char.style.left = char.currentX + 'px';
        char.style.top = char.currentY + 'px';
    }


    // --- COLLECTION LOGIC ---

    function checkForSnap(char, target) {
        const charRect = char.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        const charCenterX = charRect.left + (charRect.width / 2);
        const charCenterY = charRect.top + (charRect.height / 2);
        const targetCenterX = targetRect.left + (targetRect.width / 2);
        const targetCenterY = targetRect.top + (targetRect.height / 2);
        
        const isNearX = Math.abs(charCenterX - targetCenterX) <= snapTolerance;
        const isNearY = Math.abs(charCenterY - targetCenterY) <= snapTolerance;

        if (isNearX && isNearY) {
            // SNAP TO TARGET!
            char.style.transition = 'top 0.3s, left 0.3s';
            
            // Lock the character's absolute position relative to the viewport
            char.style.left = targetRect.left + 'px'; 
            char.style.top = targetRect.top + 'px';
            
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
            // Re-enable dragging after the popup appears if the user wants to keep moving them
            characters.forEach(char => { char.canDrag = true; }); 

            setTimeout(() => {
                popup.classList.add('hidden');
            }, 5000); 
        }
    }

    // --- Attach Event Listeners ---
    characters.forEach(char => {
        // Mouse Events
        char.addEventListener('mousedown', dragStart, false);
        
        // Touch Events
        char.addEventListener('touchstart', dragStart, false);
        char.addEventListener('touchmove', drag, false);
        char.addEventListener('touchend', dragEnd, false);
    });
    
    // Attach drag and end listeners to the document (safest method)
    document.addEventListener('mousemove', (e) => {
        characters.forEach(char => {
            if (char.isDragging) drag({ currentTarget: char, ...e });
        });
    }, false);
    
    document.addEventListener('mouseup', (e) => {
        characters.forEach(char => dragEnd({ currentTarget: char }));
    }, false);
    
    // Fallback for touchmove on document (might be needed for complex layouts)
    document.addEventListener('touchmove', (e) => {
        characters.forEach(char => {
            if (char.isDragging) drag({ currentTarget: char, ...e });
        });
    }, false);

    document.addEventListener('touchend', (e) => {
        characters.forEach(char => dragEnd({ currentTarget: char }));
    }, false);
});

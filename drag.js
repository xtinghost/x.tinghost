document.addEventListener('DOMContentLoaded', () => {
    const characters = document.querySelectorAll('.draggable.collectible');
    const popup = document.getElementById('great-job-popup');
    
    // Create map of targets and collected status
    const targets = {};
    const collected = {};
    document.querySelectorAll('.target-spot').forEach(target => {
        const charId = target.id.replace('target-', 'char-');
        targets[charId] = target;
        collected[charId] = false;
    });

    const snapTolerance = 50; 
    let activeDragChar = null; 

    // --- Initialization (Sets initial position) ---
    characters.forEach(char => {
        const initialX = parseInt(char.getAttribute('data-initial-x'));
        const initialY = parseInt(char.getAttribute('data-initial-y'));

        char.style.left = initialX + 'px';
        char.style.top = initialY + 'px';
        
        // Internal tracking variables now track the CSS value
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
        
        // Calculate the mouse/touch position relative to the document, 
        // accounting for the scroll offset (window.scrollX/Y)
        const documentX = coords.x + window.scrollX;
        const documentY = coords.y + window.scrollY;
        
        // Calculate the offset (distance from cursor to the character's top-left corner)
        char.offsetX = documentX - char.currentX;
        char.offsetY = documentY - char.currentY;
        
        activeDragChar = char; 
        char.style.zIndex = 1001;
        char.style.cursor = 'grabbing';
    }

    // --- STOP DRAGGING ---
    function dragEnd(e) {
        if (!activeDragChar) return;
        
        let char = activeDragChar;
        activeDragChar = null; 
        
        char.style.zIndex = 1000;
        char.style.cursor = 'grab';
        
        // CRITICAL: Update the internal coordinates based on the final CSS position
        char.currentX = parseFloat(char.style.left);
        char.currentY = parseFloat(char.style.top);
        
        // Check for snap 
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
        
        // Calculate document position
        const documentX = coords.x + window.scrollX;
        const documentY = coords.y + window.scrollY;

        // Calculate new position (Document position minus initial offset)
        char.currentX = documentX - char.offsetX;
        char.currentY = documentY - char.offsetY;

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
            
            // Set position relative to the document using target Rect and scroll position
            char.style.left = targetRect.left + window.scrollX + 'px'; 
            char.style.top = targetRect.top + window.scrollY + 'px';

            // Lock the collected status
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
            // Re-enable dragging only for unlocked fun after collection
            characters.forEach(char => { char.canDrag = true; }); 

            setTimeout(() => {
                popup.classList.add('hidden');
            }, 5000); 
        }
    }

    // --- Attach Event Listeners ---
    characters.forEach(char => {
        // Start events (Mouse and Touch)
        char.addEventListener('mousedown', dragStart, false);
        char.addEventListener('touchstart', dragStart, false);
    });
    
    // Global Listeners (Crucial for continuous drag when off element)
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', dragEnd, false);
    document.addEventListener('touchmove', drag, false);
    document.addEventListener('touchend', dragEnd, false);
});

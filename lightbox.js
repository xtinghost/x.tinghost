function openLightbox(imageSrc, captionText) {
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightbox-image');
    var lightboxCaption = document.getElementById('lightbox-caption');

    lightboxImage.src = imageSrc;
    lightboxCaption.textContent = captionText;
    lightbox.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevents background scrolling
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    lightbox.style.display = "none";
    document.body.style.overflow = "auto"; // Re-enables background scrolling
}

// Close the lightbox when the user clicks outside the image container
window.onclick = function(event) {
    var lightbox = document.getElementById('lightbox');
    if (event.target == lightbox) {
        closeLightbox();
    }
}

// TV Trailer Player - Handles playing trailers on the 3D TV

// Flag to track if a trailer is currently playing
let isTrailerPlaying = false;
let originalTVScreenMaterial = null;
let trailerVideo = null;
let videoTexture = null;

// Function to play a trailer on the 3D TV
function playTrailerOnTV(trailerUrl) {
    if (!tv || isTrailerPlaying) return;
    
    // Store the original TV screen material for restoration later
    const tvScreen = tv.children[0];
    originalTVScreenMaterial = tvScreen.material.clone();
    
    // Extract YouTube video ID from embed URL
    const videoId = extractYouTubeId(trailerUrl);
    if (!videoId) {
        console.error("Failed to extract YouTube video ID from URL:", trailerUrl);
        return;
    }
    
    // Mark as playing
    isTrailerPlaying = true;
    
    // Create an HTML video element for the trailer
    trailerVideo = document.createElement('video');
    trailerVideo.crossOrigin = "anonymous";
    trailerVideo.loop = false;
    trailerVideo.muted = false;
    trailerVideo.style.display = "none";
    document.body.appendChild(trailerVideo);
    
    // Use a YouTube iframe API approach since direct video links aren't available
    // Add an overlay to the container with the iframe
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'tv-trailer-overlay';
    overlayContainer.innerHTML = `
        <div class="trailer-overlay-content">
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
            <button id="exit-trailer-btn">Exit Trailer</button>
        </div>
    `;
    
    // Style the overlay to cover the 3D container
    Object.assign(overlayContainer.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: '10',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    });
    
    // Style the content container
    const contentContainer = overlayContainer.querySelector('.trailer-overlay-content');
    Object.assign(contentContainer.style, {
        width: '85%',
        height: '70%',
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(229, 9, 20, 0.7)'
    });
    
    // Style the exit button
    const exitButton = document.createElement('button');
    exitButton.id = 'exit-trailer-btn';
    exitButton.textContent = 'Exit Trailer';
    Object.assign(exitButton.style, {
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        padding: '8px 15px',
        backgroundColor: '#E50914',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: '1em',
        zIndex: '11'
    });
    
    contentContainer.appendChild(exitButton);
    
    // Add the overlay to the container
    container.style.position = 'relative';
    container.appendChild(overlayContainer);
    
    // Add exit button event listener
    exitButton.addEventListener('click', stopTrailerOnTV);
    
    // Animate the TV to "zoom in" when starting a trailer
    const originalCameraPosition = camera.position.clone();
    const originalTVRotation = tv.rotation.clone();
    
    // Tween animation to focus on the TV
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(0, 0, 3);
    
    let animationFrame = 0;
    const totalFrames = 60; // 1 second at 60fps
    
    function animateCamera() {
        if (animationFrame < totalFrames) {
            // Calculate position
            const t = animationFrame / totalFrames;
            const easeT = 1 - Math.pow(1 - t, 3); // Cubic ease-out
            
            camera.position.lerpVectors(startPosition, endPosition, easeT);
            
            // Also rotate the TV to face forward
            tv.rotation.x = originalTVRotation.x * (1 - easeT) + 0 * easeT;
            tv.rotation.y = originalTVRotation.y * (1 - easeT) + 0 * easeT;
            
            animationFrame++;
            requestAnimationFrame(animateCamera);
        }
    }
    
    // Start the animation
    animateCamera();
    
    // Disable controls during trailer playback
    controls.enabled = false;
    
    console.log("Playing trailer on 3D TV:", trailerUrl);
}

// Function to stop the trailer and return to normal view
function stopTrailerOnTV() {
    if (!isTrailerPlaying) return;
    
    // Remove the overlay
    const overlay = document.getElementById('tv-trailer-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Remove the video element if it exists
    if (trailerVideo) {
        trailerVideo.pause();
        trailerVideo.remove();
        trailerVideo = null;
    }
    
    // Restore the original TV screen material
    if (originalTVScreenMaterial && tv) {
        const tvScreen = tv.children[0];
        tvScreen.material = originalTVScreenMaterial;
        tvScreen.material.needsUpdate = true;
    }
    
    // Re-enable controls
    controls.enabled = true;
    
    // Reset the camera position (animate back)
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(0, 0, 5); // Default camera position
    
    let animationFrame = 0;
    const totalFrames = 60; // 1 second at 60fps
    
    function animateCameraBack() {
        if (animationFrame < totalFrames) {
            // Calculate position
            const t = animationFrame / totalFrames;
            const easeT = 1 - Math.pow(1 - t, 3); // Cubic ease-out
            
            camera.position.lerpVectors(startPosition, endPosition, easeT);
            
            // Also return TV to its slight rotation
            tv.rotation.x = 0 * (1 - easeT) + 0.1 * easeT;
            tv.rotation.y = 0 * (1 - easeT) + (-0.2) * easeT;
            
            animationFrame++;
            requestAnimationFrame(animateCameraBack);
        }
    }
    
    // Start the animation
    animateCameraBack();
    
    // Mark as not playing
    isTrailerPlaying = false;
    
    console.log("Stopped trailer on 3D TV");
}

// Helper function to extract YouTube video ID from URL
function extractYouTubeId(url) {
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        return match[2];
    }
    
    // For embed URLs that already have the video ID
    const embedMatch = url.match(/embed\/([^\/\?]+)/);
    if (embedMatch && embedMatch[1]) {
        return embedMatch[1];
    }
    
    return null;
}

// Export functions
window.playTrailerOnTV = playTrailerOnTV;
window.stopTrailerOnTV = stopTrailerOnTV;

// Add CSS for the overlay to the document
const style = document.createElement('style');
style.textContent = `
    #tv-trailer-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .trailer-overlay-content {
        width: 85%;
        height: 70%;
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 20px rgba(229, 9, 20, 0.7);
    }
    
    #exit-trailer-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        padding: 8px 15px;
        background-color: #E50914;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1em;
        z-index: 11;
    }
    
    #exit-trailer-btn:hover {
        background-color: #B20710;
    }
`;
document.head.appendChild(style);
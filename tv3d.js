// TV 3D Model implementation

// Initialize variables
let scene, camera, renderer, tv, controls;
let filmReel1, filmReel2, movieCamera;
const container = document.getElementById('tv3d-container');

// Initialize the scene when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create gradient background - red to black to gray
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create gradient
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1a1a1a');     // Dark gray at top
    gradient.addColorStop(0.4, '#3a0505');   // Dark red in middle
    gradient.addColorStop(0.6, '#4a0a0a');   // Medium red
    gradient.addColorStop(1, '#0a0a0a');     // Almost black at bottom
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    // Set the texture as background
    scene.background = texture;

    // Create camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;

    // Create lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create spotlights for theatrical effect
    createSpotlights();

    // Create TV model
    createTV();
    
    // Create Film Reels
    createFilmReels();
    
    // Create Movie Camera
    createMovieCamera();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
    
    console.log("3D TV and cinema elements initialized");
}

// Create theatrical spotlights
function createSpotlights() {
    // Left spotlight - make it more gold/amber for classic cinema feel
    const spotLight1 = new THREE.SpotLight(0xffd700, 1.2);
    spotLight1.position.set(-5, 5, 3);
    spotLight1.angle = Math.PI / 6;
    spotLight1.penumbra = 0.3;
    spotLight1.decay = 2;
    spotLight1.distance = 20;
    scene.add(spotLight1);
    
    // Right spotlight - keep the Netflix red
    const spotLight2 = new THREE.SpotLight(0xE50914, 1.2);
    spotLight2.position.set(5, 5, 3);
    spotLight2.angle = Math.PI / 6;
    spotLight2.penumbra = 0.3;
    spotLight2.decay = 2;
    spotLight2.distance = 20;
    scene.add(spotLight2);
    
    // Add a soft blue backlight for depth
    const backLight = new THREE.SpotLight(0x4169e1, 0.5);
    backLight.position.set(0, -5, -5);
    backLight.angle = Math.PI / 4;
    backLight.penumbra = 0.5;
    backLight.decay = 2;
    backLight.distance = 20;
    scene.add(backLight);
}

// Create TV object
function createTV() {
    // TV Body - slightly more modern design
    const tvBodyGeometry = new THREE.BoxGeometry(4.2, 2.7, 0.2); // Thinner for more modern look
    const tvBodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111, 
        specular: 0x444444,
        shininess: 70 
    });
    tv = new THREE.Mesh(tvBodyGeometry, tvBodyMaterial);
    scene.add(tv);

    // Add TV bezel/frame - creates a more realistic edge around the screen
    const tvBezelGeometry = new THREE.BoxGeometry(4.0, 2.5, 0.05);
    const tvBezelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x080808, 
        specular: 0x222222,
        shininess: 50
    });
    const tvBezel = new THREE.Mesh(tvBezelGeometry, tvBezelMaterial);
    tvBezel.position.z = 0.12;
    tv.add(tvBezel);

    // TV Screen - made slightly larger
    const tvScreenGeometry = new THREE.PlaneGeometry(3.8, 2.3);
    
    // Fixed: MeshBasicMaterial doesn't have emissive properties
    const tvScreenMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xE50914  // Netflix red
        // Removed emissive and emissiveIntensity properties that were causing warnings
    });
    
    const tvScreen = new THREE.Mesh(tvScreenGeometry, tvScreenMaterial);
    tvScreen.position.z = 0.151;
    tv.add(tvScreen);

    // TV Stand - more modern design
    const tvStandGroup = new THREE.Group();
    
    // Base of stand
    const tvStandBaseGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.8);
    const tvStandBaseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x080808, 
        specular: 0x333333,
        shininess: 80 
    });
    const tvStandBase = new THREE.Mesh(tvStandBaseGeometry, tvStandBaseMaterial);
    tvStandBase.position.y = -2.0;
    tvStandBase.position.z = 0.2;
    tvStandGroup.add(tvStandBase);
    
    // Neck of stand
    const tvStandNeckGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const tvStandNeck = new THREE.Mesh(tvStandNeckGeometry, tvStandBaseMaterial);
    tvStandNeck.position.y = -1.65;
    tvStandNeck.position.z = 0.1;
    tvStandGroup.add(tvStandNeck);
    
    tv.add(tvStandGroup);
    
    // Add shadow beneath TV
    const shadowGeometry = new THREE.PlaneGeometry(5.0, 1.0);
    const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.4,
        depthWrite: false
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2; // Rotate to lie flat
    shadow.position.y = -2.05; // Just below the stand
    shadow.position.z = 0.4; // Slightly forward for visibility
    tv.add(shadow);

    // Add text to screen with canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Fill with transparent background
    context.fillStyle = 'rgba(229, 9, 20, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text with better styling
    context.font = 'bold 52px Bebas Neue, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add text shadow for better visibility
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    context.fillStyle = 'white';
    context.fillText('TV SHOW FINDER', canvas.width/2, canvas.height/2 - 24);
    
    // Reset shadow for smaller text
    context.shadowBlur = 5;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;
    
    context.font = 'bold 24px Bebas Neue, sans-serif';
    context.fillText('SEARCH FOR A SHOW', canvas.width/2, canvas.height/2 + 30);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Apply texture to plane
    const screenTextPlane = new THREE.PlaneGeometry(3.6, 2.0);
    const screenTextMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    const screenText = new THREE.Mesh(screenTextPlane, screenTextMaterial);
    screenText.position.z = 0.152;
    tvScreen.add(screenText);

    // Add initial rotation for better view
    tv.rotation.x = 0.1;
    tv.rotation.y = -0.2;
    
    // Add TV power button
    const powerButtonGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
    const powerButtonMaterial = new THREE.MeshPhongMaterial({
        color: 0xE50914,
        emissive: 0xE50914,
        emissiveIntensity: 0.3
    });
    const powerButton = new THREE.Mesh(powerButtonGeometry, powerButtonMaterial);
    powerButton.rotation.x = Math.PI / 2;
    powerButton.position.set(1.9, -1.2, 0.15);
    tv.add(powerButton);
    
    // Add subtle reflection on screen
    const reflectionGeometry = new THREE.PlaneGeometry(3.8, 2.3);
    const reflectionMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.07
    });
    const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
    reflection.position.z = 0.153;
    tvScreen.add(reflection);
}

// Create Film Reels with improved realism
function createFilmReels() {
    // Create material for film reels - make it more metallic and realistic
    const reelMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444, 
        specular: 0xeeeeee,
        shininess: 100 
    });
    
    const filmMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111, 
        specular: 0x333333,
        shininess: 40 
    });
    
    // Left Film Reel with improved detail
    filmReel1 = new THREE.Group();
    
    // Outer wheel with better geometry
    const outerWheelGeometry1 = new THREE.TorusGeometry(0.8, 0.08, 24, 60);
    const outerWheel1 = new THREE.Mesh(outerWheelGeometry1, reelMaterial);
    filmReel1.add(outerWheel1);
    
    // Inner wheel with beveled edges
    const innerWheelGeometry1 = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 32);
    const innerWheel1 = new THREE.Mesh(innerWheelGeometry1, filmMaterial);
    innerWheel1.rotation.x = Math.PI / 2;
    filmReel1.add(innerWheel1);
    
    // Center hub
    const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
    const hubMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222, 
        specular: 0x666666,
        shininess: 80 
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.rotation.x = Math.PI / 2;
    filmReel1.add(hub);
    
    // Film wrapped around the reel
    const filmWrapGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
    const filmWrapMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222, 
        specular: 0x222222,
        shininess: 10 
    });
    const filmWrap = new THREE.Mesh(filmWrapGeometry, filmWrapMaterial);
    filmWrap.rotation.x = Math.PI / 2;
    filmReel1.add(filmWrap);
    
    // Spokes with improved shape
    for (let i = 0; i < 6; i++) {
        const spokeGeometry = new THREE.BoxGeometry(0.08, 0.05, 1.2);
        const spoke = new THREE.Mesh(spokeGeometry, reelMaterial);
        spoke.rotation.z = (Math.PI / 6) * 2 * i;
        spoke.position.x = 0.6 * Math.cos((Math.PI / 6) * 2 * i);
        spoke.position.y = 0.6 * Math.sin((Math.PI / 6) * 2 * i);
        filmReel1.add(spoke);
    }
    
    // Position the left reel
    filmReel1.position.set(-6, 0, 0);
    filmReel1.rotation.y = Math.PI / 2;
    scene.add(filmReel1);
    
    // Right Film Reel (copy of left reel)
    filmReel2 = filmReel1.clone();
    filmReel2.position.set(6, 0, 0);
    scene.add(filmReel2);
    
    // Create film strip connecting the reels with improved texture
    const filmStripGeometry = new THREE.BoxGeometry(11.5, 0.3, 0.02);
    
    // Create texture for film strip with frames
    const stripCanvas = document.createElement('canvas');
    stripCanvas.width = 512;
    stripCanvas.height = 32;
    const stripContext = stripCanvas.getContext('2d');
    
    // Black background
    stripContext.fillStyle = '#111111';
    stripContext.fillRect(0, 0, 512, 32);
    
    // Draw film frames
    for (let i = 0; i < 16; i++) {
        stripContext.fillStyle = '#222222';
        stripContext.fillRect(i * 32, 4, 28, 24);
    }
    
    const stripTexture = new THREE.CanvasTexture(stripCanvas);
    stripTexture.wrapS = THREE.RepeatWrapping;
    stripTexture.repeat.set(2, 1);
    
    const filmStripMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        map: stripTexture,
        specular: 0x222222,
        shininess: 30
    });
    
    const filmStrip = new THREE.Mesh(filmStripGeometry, filmStripMaterial);
    filmStrip.position.set(0, 1.5, 0);
    scene.add(filmStrip);
    
    // Add perforations to the film strip with improved appearance
    for (let i = -5; i <= 5; i++) {
        const perforationGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.04);
        const perforation = new THREE.Mesh(perforationGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        perforation.position.set(i, 1.5, 0.01);
        scene.add(perforation);
        
        // Add a second row of perforations
        const perforation2 = perforation.clone();
        perforation2.position.y = 1.65;
        scene.add(perforation2);
        
        // Add a third row of perforations
        const perforation3 = perforation.clone();
        perforation3.position.y = 1.35;
        scene.add(perforation3);
    }
    
    // Add second film strip below
    const filmStrip2 = new THREE.Mesh(filmStripGeometry, filmStripMaterial);
    filmStrip2.position.set(0, -1.5, 0);
    scene.add(filmStrip2);
    
    // Add perforations to the second film strip
    for (let i = -5; i <= 5; i++) {
        const perforationGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.04);
        const perforation = new THREE.Mesh(perforationGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        perforation.position.set(i, -1.5, 0.01);
        scene.add(perforation);
        
        // Add a second row of perforations
        const perforation2 = perforation.clone();
        perforation2.position.y = -1.35;
        scene.add(perforation2);
        
        // Add a third row of perforations
        const perforation3 = perforation.clone();
        perforation3.position.y = -1.65;
        scene.add(perforation3);
    }
}

// Create Movie Camera
function createMovieCamera() {
    movieCamera = new THREE.Group();
    
    // Camera body
    const cameraBodyGeometry = new THREE.BoxGeometry(1, 0.8, 1.5);
    const cameraBodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222, 
        specular: 0x444444,
        shininess: 30 
    });
    const cameraBody = new THREE.Mesh(cameraBodyGeometry, cameraBodyMaterial);
    movieCamera.add(cameraBody);
    
    // Camera lens
    const cameraLensGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32);
    const cameraLensMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x111111, 
        specular: 0x999999,
        shininess: 100 
    });
    const cameraLens = new THREE.Mesh(cameraLensGeometry, cameraLensMaterial);
    cameraLens.rotation.x = Math.PI / 2;
    cameraLens.position.z = 1.15;
    movieCamera.add(cameraLens);
    
    // Camera lens glass
    const lensGlassGeometry = new THREE.CircleGeometry(0.25, 32);
    const lensGlassMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x88CCFF, 
        specular: 0xFFFFFF,
        shininess: 100,
        transparent: true,
        opacity: 0.7
    });
    const lensGlass = new THREE.Mesh(lensGlassGeometry, lensGlassMaterial);
    lensGlass.position.z = 1.56;
    movieCamera.add(lensGlass);
    
    // Camera top handle
    const handleGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
    const handle = new THREE.Mesh(handleGeometry, cameraBodyMaterial);
    handle.position.set(0, 0.7, 0);
    movieCamera.add(handle);
    
    // Camera base/tripod
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.2, 32);
    const base = new THREE.Mesh(baseGeometry, cameraBodyMaterial);
    base.position.set(0, -0.5, 0);
    movieCamera.add(base);
    
    // Position the camera to the right of the TV
    movieCamera.position.set(4, -1.2, 2);
    movieCamera.rotation.y = -Math.PI / 4;
    scene.add(movieCamera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Add subtle back and forth rotation to TV instead of full 360° rotation
    if (tv) {
        // Use sine wave for smooth back-and-forth rotation
        tv.rotation.y = -0.2 + Math.sin(Date.now() * 0.0005) * 0.1;
    }
    
    // Animate film reels
    if (filmReel1 && filmReel2) {
        filmReel1.rotation.z += 0.01;
        filmReel2.rotation.z -= 0.01;
    }
    
    // Animate movie camera
    if (movieCamera) {
        movieCamera.rotation.y = -Math.PI / 4 + Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    renderer.render(scene, camera);
}

// Function to update TV screen with current show image
function updateTVScreen(imageUrl) {
    // Load texture from selected show image
    if (!tv || !imageUrl) return;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, function(texture) {
        // Get the TV screen (which is the second child of the TV, index 1)
        // In your structure: tvBody (index 0), tvBezel (index 0), tvScreen (index 1)
        const tvScreen = tv.children[1];
        
        if (tvScreen) {
            // Remove all children from the TV screen
            while(tvScreen.children.length > 0) {
                const child = tvScreen.children[0];
                tvScreen.remove(child);
            }
            
            // Create a new material with the image texture
            tvScreen.material = new THREE.MeshBasicMaterial({
                map: texture,
                color: 0xffffff
            });
            tvScreen.material.needsUpdate = true;
            
            console.log("TV screen updated with image:", imageUrl);
        } else {
            console.error("TV screen element not found");
        }
    });
}

// Function to make elements interactive
function makeElementsInteractive() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    container.addEventListener('click', function(event) {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
        
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
            // Check what was clicked
            let clickedObject = intersects[0].object;
            
            // Check if clicked object is part of the film reels
            if (filmReel1.children.includes(clickedObject) || 
                filmReel2.children.includes(clickedObject)) {
                    
                // Speed up rotation
                const speedMultiplier = 5;
                if (clickedObject.parent === filmReel1) {
                    filmReel1.userData.rotationSpeed = (filmReel1.userData.rotationSpeed || 0.01) * speedMultiplier;
                    setTimeout(() => {
                        filmReel1.userData.rotationSpeed = 0.01;
                    }, 2000);
                } else {
                    filmReel2.userData.rotationSpeed = (filmReel2.userData.rotationSpeed || 0.01) * speedMultiplier;
                    setTimeout(() => {
                        filmReel2.userData.rotationSpeed = 0.01;
                    }, 2000);
                }
            }
            
            // Check if clicked object is part of the movie camera
            if (movieCamera.children.includes(clickedObject)) {
                // Make camera zoom in and out
                movieCamera.position.z -= 0.5;
                setTimeout(() => {
                    movieCamera.position.z += 0.5;
                }, 1000);
            }
            
            // Check if clicked object is the TV
            if (tv.children.includes(clickedObject) || clickedObject === tv) {
                // Make TV slightly bigger
                const originalScale = tv.scale.clone();
                tv.scale.multiplyScalar(1.1);
                setTimeout(() => {
                    tv.scale.copy(originalScale);
                }, 500);
            }
        }
    });
}

// Export the function to make it available to other scripts
window.updateTVScreen = updateTVScreen;

// Make elements interactive after initialization
setTimeout(makeElementsInteractive, 1000);
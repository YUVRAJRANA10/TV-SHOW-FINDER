// Mood selector functionality for random TV show recommendations based on genre

// Wait for both DOM content and window load to ensure all elements and scripts are loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - initializing mood selector");
    setTimeout(initMoodSelector, 1000); // Add a slight delay to ensure the DOM is fully ready
});

// Also try initializing on window load as a fallback
window.addEventListener('load', function() {
    console.log("Window fully loaded - initializing mood selector");
    initMoodSelector();
});

function initMoodSelector() {
    console.log("Initializing mood selector...");
    const moodButtons = document.querySelectorAll('.mood-button');
    
    console.log("Found mood buttons:", moodButtons.length);
    
    if (moodButtons.length === 0) {
        console.error("No mood buttons found. DOM may not be fully loaded.");
        return;
    }
    
    moodButtons.forEach(button => {
        console.log("Setting up button:", button.getAttribute('data-genre'));
        
        // Use inline function to avoid reference issues
        button.addEventListener('click', function() {
            console.log("Mood button clicked:", this.getAttribute('data-genre'));
            
            // Remove active class from all buttons
            document.querySelectorAll('.mood-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get the selected genre
            const genre = this.getAttribute('data-genre');
            
            // Find a random show based on genre
            findRandomShowByGenre(genre);
        });
    });
    
    console.log("Mood selector initialized successfully");
}

// Function to find random shows by genre
async function findRandomShowByGenre(genre) {
    console.log("Finding random show for genre:", genre);
    
    try {
        // First, get shows for the selected genre
        const res = await axios.get(`https://api.tvmaze.com/search/shows`, {
            params: { q: genre }
        });
        
        console.log("API response:", res.data.length, "shows found");
        
        // If we have results
        if (res.data && res.data.length > 0) {
            // Get a random index
            const randomIndex = Math.floor(Math.random() * res.data.length);
            const randomShow = res.data[randomIndex].show;
            
            console.log("Selected random show:", randomShow.name);
            
            // Display a message that we're setting the mood
            showMoodMessage(randomShow.name, genre);
            
            // Update the TV screen with the show image if available
            if (randomShow.image && window.updateTVScreen) {
                console.log("Updating TV screen with show image");
                window.updateTVScreen(randomShow.image.medium);
            } else {
                console.warn("Cannot update TV screen - missing image or updateTVScreen function");
            }
            
            // Fetch and play the trailer - use the one from new2.js through the window object
            console.log("Fetching trailer for:", randomShow.name);
            if (window.fetchTrailer) {
                const trailerUrl = await window.fetchTrailer(randomShow.name);
                
                if (trailerUrl && window.playTrailerOnTV) {
                    console.log("Playing trailer:", trailerUrl);
                    // Wait a moment to let the image load first
                    setTimeout(() => {
                        window.playTrailerOnTV(trailerUrl);
                    }, 1000);
                } else {
                    console.warn("Cannot play trailer - missing URL or playTrailerOnTV function");
                }
            } else {
                console.error("fetchTrailer function not available globally");
            }
            
            // Also update the display in the image container 
            updateDisplayWithShow(randomShow);
        } else {
            console.warn("No shows found for genre:", genre);
            showMoodMessage("No shows found", genre, true);
        }
    } catch (error) {
        console.error("Error finding shows by genre:", error);
        showMoodMessage("Error finding shows", genre, true);
    }
}

// Function to show a message when setting the mood
function showMoodMessage(showName, genre, isError = false) {
    console.log("Showing mood message:", showName, genre, isError ? "(error)" : "");
    
    // Create or get the message container
    let messageContainer = document.getElementById('mood-message');
    
    if (!messageContainer) {
        console.log("Creating new mood message container");
        messageContainer = document.createElement('div');
        messageContainer.id = 'mood-message';
        const moodContainer = document.querySelector('.mood-selector-container');
        
        if (moodContainer) {
            moodContainer.appendChild(messageContainer);
        } else {
            console.error("Could not find mood selector container");
            return;
        }
    }
    
    if (isError) {
        messageContainer.innerHTML = `<p class="error-message">😕 ${showName} for ${genre.toUpperCase()}. Please try again.</p>`;
    } else {
        messageContainer.innerHTML = `
            <p class="success-message">🎬 Setting your mood to ${genre.toUpperCase()} with "${showName}"</p>
            <div class="mood-loader">
                <div class="mood-loader-bar"></div>
            </div>
        `;
    }
    
    // Automatically clear the message after a few seconds
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Function to update the image container with the random show
function updateDisplayWithShow(show) {
    console.log("Updating display with show:", show.name);
    
    const imageContainer = document.getElementById('imagecontainer');
    
    if (!imageContainer) {
        console.error("Image container not found");
        return;
    }
    
    // Create a special container for the mood suggestion
    const moodSuggestion = document.createElement('div');
    moodSuggestion.classList.add('mood-suggestion');
    
    // Add content to the mood suggestion
    if (show.image) {
        moodSuggestion.innerHTML = `
            <div class="mood-suggestion-header">🎭 MOOD SUGGESTION</div>
            <img src="${show.image.medium}" alt="${show.name}" class="mood-image">
            <h3 class="mood-show-title">${show.name}</h3>
            <div class="mood-show-info">
                <p>${show.genres.join(', ')}</p>
                <p>Rating: ${show.rating.average || 'N/A'}/10</p>
            </div>
        `;
        
        // Prepend to the image container so it appears at the top
        imageContainer.prepend(moodSuggestion);
        console.log("Mood suggestion added to image container");
    } else {
        console.warn("Show has no image, not creating suggestion card");
    }
}

// Reuse the fetchTrailer function from your existing code
async function fetchTrailer(showName) {
    console.log("Fetching trailer for:", showName);
    
    try {
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: `${showName} trailer`,
                type: 'video',
                key: 'AIzaSyBbTRzs818idOzniM3bZy_KIyUIkYf767Y' // Your YouTube API key
            }
        });
        
        if (res.data.items && res.data.items.length > 0) {
            const videoId = res.data.items[0].id.videoId;
            console.log("Found trailer video ID:", videoId);
            return `https://www.youtube.com/embed/${videoId}`;
        } else {
            console.warn("No trailer found for:", showName);
            return null;
        }
    } catch (error) {
        console.error("Error fetching trailer:", error);
        if (error.response) {
            console.error("API error details:", error.response.data);
        }
        return null;
    }
}

// Log when script is loaded
console.log("Mood Selector script loaded");
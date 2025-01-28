const formm = document.querySelector("#searchform");
const clear = document.querySelector("#imagecontainer");
const showChartCtx = document.getElementById('showChart').getContext('2d');
const graphBox = document.getElementById('graphbox');
let showChart;

// Hide the graph box initially
graphBox.style.display = 'none';

formm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const inputsearrch = formm.elements.query.value;
    const config = { params: { q: inputsearrch } };
    const res = await axios.get(`https://api.tvmaze.com/search/shows`, config);
    const shows = res.data;
    clearimg();
    makeimg(shows);
    updateChart(shows);
    // Show the graph box after search
    graphBox.style.display = 'flex';
    // Adjust the canvas size
    showChartCtx.canvas.width = 500;
    showChartCtx.canvas.height = 200;
});

const clearimg = () => {
    clear.innerHTML = '';
}

const fetchTrailer = async (showName) => {
    try {
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: `${showName} trailer`,
                type: 'video',
                key: 'AIzaSyBbTRzs818idOzniM3bZy_KIyUIkYf767Y' // Replace with your YouTube API key
            }
        });
        const videoId = res.data.items[0].id.videoId;
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (error) {
        console.error("Error fetching trailer:", error);
        return null;
    }
};

const makeimg = async (shows) => {
    for (let result of shows) {
        if (result.show.image) {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('img-container');

            const img = document.createElement('IMG');
            img.src = result.show.image.medium;
            img.classList.add('show-image');
            imgContainer.appendChild(img);

            const trailerUrl = await fetchTrailer(result.show.name);
            if (trailerUrl) {
                const playButton = document.createElement('button');
                playButton.textContent = 'Play Trailer';
                playButton.classList.add('play-button');
                playButton.addEventListener('click', () => {
                    playTrailer(trailerUrl);
                });
                imgContainer.appendChild(playButton);
            }

            clear.appendChild(imgContainer);
        }
    }
};

const playTrailer = (trailerUrl) => {
    const trailerModal = document.createElement('div');
    trailerModal.classList.add('trailer-modal');
    trailerModal.innerHTML = `
        <div class="trailer-content">
            <span class="close-button">&times;</span>
            <iframe src="${trailerUrl}" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(trailerModal);

    const closeButton = trailerModal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(trailerModal);
    });
};

const updateChart = (shows) => {
    const labels = shows.map(show => show.show.name);
    const data = shows.map(show => show.show.rating.average || 0);

    if (showChart) {
        showChart.destroy();
    }

    showChart = new Chart(showChartCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average rating',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)', // Red
                    'rgba(54, 54, 54, 0.8)',   // Black
                    'rgba(255, 159, 64, 0.8)', // Orange
                    'rgba(75, 192, 192, 0.8)', // Teal
                    'rgba(153, 102, 255, 0.8)', // Purple
                    'rgba(255, 205, 86, 0.8)'  // Yellow
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)', // Red
                    'rgba(54, 54, 54, 1)',   // Black
                    'rgba(255, 159, 64, 1)', // Orange
                    'rgba(75, 192, 192, 1)', // Teal
                    'rgba(153, 102, 255, 1)', // Purple
                    'rgba(255, 205, 86, 1)'  // Yellow
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)' // Darken the label color
                    }
                }
            }
        }
    });
};

const voiceSearchButton = document.querySelector("#voiceSearchButton");
const voiceSearchDialog = document.querySelector("#voiceSearchDialog");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.lang = 'en-US';

voiceSearchButton.addEventListener("click", () => {
    recognition.start();
    voiceSearchButton.classList.add("listening");
    voiceSearchDialog.classList.remove("hidden");
});

recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript;
    formm.elements.query.value = transcript;
    formm.dispatchEvent(new Event("submit"));
    voiceSearchButton.classList.remove("listening");
    voiceSearchDialog.classList.add("hidden");
});

recognition.addEventListener("error", (event) => {
    console.error("Speech recognition error detected: " + event.error);
    voiceSearchButton.classList.remove("listening");
    voiceSearchDialog.classList.add("hidden");
});

recognition.addEventListener("end", () => {
    console.log("Speech recognition service disconnected");
    voiceSearchButton.classList.remove("listening");
    voiceSearchDialog.classList.add("hidden");
});
// script.js

// DOM Elements
const timeElement      = document.getElementById("current-time");
const dateElement      = document.getElementById("current-date");
const greetingElement  = document.getElementById("greeting");
const quoteText        = document.getElementById("quote-text");
const quoteAuthor      = document.getElementById("quote-author");
const container        = document.getElementById("container");
   


// Weather elements
const weatherIcon        = document.getElementById("weather-icon");
const temperatureElement = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const windSpeedElement   = document.getElementById("wind-speed");
const humidityElement    = document.getElementById("humidity");
const locationElement    = document.getElementById("location");

// Background images
const images = {
  sunrise:   document.getElementById("sunrise-image"),
  morning:   document.getElementById("morning-image"),
  afternoon: document.getElementById("afternoon-image"),
  sunset:    document.getElementById("sunset-image"),
  night:     document.getElementById("night-image")
};

// Quotes
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

// Cities
const indianCities = {
  "Prayagraj": { lat: 25.4358, lon: 81.8463 },
  "New Delhi": { lat: 28.6139, lon: 77.2090 },
  "Mumbai":    { lat: 19.0760, lon: 72.8777 },
  "Kolkata":   { lat: 22.5726, lon: 88.3639 },
  "Chennai":   { lat: 13.0827, lon: 80.2707 },
  "Bengaluru": { lat: 12.9716, lon: 77.5946 },
  "Hyderabad": { lat: 17.3850, lon: 78.4867 },
  "Pune":      { lat: 18.5204, lon: 73.8567 },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "Jaipur":    { lat: 26.9124, lon: 75.7873 },
  "Lucknow":   { lat: 26.8467, lon: 80.9462 }
};
let currentLocation = "Prayagraj";
let lastTime = "";

// Weather code maps
const weatherIcons = { /* ...same mapping as before...*/ };
const weatherDescriptions = { /* ...same mapping as before...*/ };

// Audio Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeBtn = document.getElementById('volumeBtn');
const progressBar = document.querySelector('.progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Game Elements
const sandCanvas = document.getElementById('canvas');
const clearBtn = document.getElementById('clearBtn');
const elementSelect = document.getElementById('elementSelect');

function createLocationSelector() {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'location-selector';
  const select = document.createElement('select');
  select.id = 'city-selector';
  Object.keys(indianCities).forEach(city => {
    const opt = document.createElement('option');
    opt.value = city; opt.textContent = city;
    if (city === currentLocation) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', e => {
    currentLocation = e.target.value;
    fetchWeather();
  });
  containerDiv.appendChild(select);
  document.querySelector('.weather-info').appendChild(containerDiv);
}

function getTimeOfDay(h) {
  if (h < 5) return 'night';
  if (h < 7) return 'sunrise';
  if (h < 12) return 'morning';
  if (h < 16) return 'afternoon';
  if (h < 19) return 'sunset';
  return 'night';
}
function getGreeting(h) {
  if (h < 12) return 'Good Morning';
  if (h < 16) return 'Good Afternoon';
  if (h < 19) return 'Good Evening';
  return 'Good Night';
}

function updateBackground(tod) {
  Object.values(images).forEach(img => {
    img.style.opacity = 0;
    img.style.transform = 'scale(1)';
  });
  images[tod].style.opacity = 1;
  images[tod].style.transform = 'scale(1.1)';
  container.dataset.time = tod;
}

async function fetchWeather() {
  try {
    const { lat, lon } = indianCities[currentLocation];
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=Asia%2FKolkata`
    );
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data = await res.json();
    const cur = data.current_weather;
    const idx = data.hourly.time.indexOf(cur.time);
    const hum = idx !== -1 ? Math.round(data.hourly.relativehumidity_2m[idx]) : '--';
    weatherIcon.className        = `fas ${weatherIcons[cur.weathercode]||'fa-cloud-sun'}`;
    temperatureElement.textContent   = `${Math.round(cur.temperature)}°C`;
    weatherDescription.textContent = weatherDescriptions[cur.weathercode]||'Partly cloudy';
    windSpeedElement.textContent   = `${Math.round(cur.windspeed)} km/h`;
    humidityElement.textContent    = `${hum}%`;
    locationElement.textContent    = `${currentLocation}, India`;
  } catch (e) {
    console.error(e);
    weatherIcon.className        = 'fas fa-cloud-sun';
    temperatureElement.textContent   = '--°C';
    weatherDescription.textContent = 'Unavailable';
    windSpeedElement.textContent   = '-- km/h';
    humidityElement.textContent    = '--%';
    locationElement.textContent    = `${currentLocation}, India`;
  }
}

function updateTimeAndDate() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
  if (timeString !== lastTime) {
    lastTime = timeString;
    timeElement.textContent = timeString;
    dateElement.textContent = now.toLocaleDateString('en-IN',{
      weekday:'long',year:'numeric',month:'long',day:'numeric'
    });
    const h = now.getHours();
    greetingElement.textContent = getGreeting(h);
    updateBackground(getTimeOfDay(h));
  }
}

function updateQuote() {
  const q = quotes[Math.floor(Math.random()*quotes.length)];
  quoteText.textContent   = q.text;
  quoteAuthor.textContent = `- ${q.author}`;
}

// Audio Player Functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }).catch((err) => {
            // Playback was prevented (autoplay policy, etc.)
            playPauseBtn.innerHTML = '<i class=\'fas fa-play\'></i>';
            alert('Audio playback was blocked by your browser. Please tap the play button again or check your browser settings.');
            console.warn('Audio play() failed:', err);
        });
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function toggleMute() {
    if (audioPlayer.muted) {
        audioPlayer.muted = false;
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        audioPlayer.muted = true;
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// Initialize game
function initGame() {
    // Set canvas size
    sandCanvas.width = sandCanvas.offsetWidth;
    sandCanvas.height = sandCanvas.offsetHeight;

    // Clear button functionality
    clearBtn.addEventListener('click', () => {
        const ctx = sandCanvas.getContext('2d');
        ctx.clearRect(0, 0, sandCanvas.width, sandCanvas.height);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        sandCanvas.width = sandCanvas.offsetWidth;
        sandCanvas.height = sandCanvas.offsetHeight;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createLocationSelector();
    updateTimeAndDate();
    updateQuote();
    fetchWeather();
    setInterval(updateTimeAndDate, 1000);
    setInterval(updateQuote, 30000);
    setInterval(fetchWeather, 300000);

    // Initialize game
    initGame();

    // Event Listeners
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlay);
    }
    if (volumeBtn) {
        volumeBtn.addEventListener('click', toggleMute);
    }
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });
    document.querySelector('.progress-bar').addEventListener('click', setProgress);
    if (playPauseBtn) {
        if (playPauseBtn) {
            playPauseBtn.addEventListener('touchend', togglePlay);
        }
    }

    audioPlayer.muted = false;
    audioPlayer.volume = 1.0;
});

// Elements
const breedSelect = document.getElementById('breed-select');
const chooseBtn = document.getElementById('choose-btn');
const buddyArea = document.getElementById('buddy-area');
const dogImage = document.getElementById('dog-image');
const messageDiv = document.getElementById('message');
const focusTimeSpan = document.getElementById('focus-time');
const switchCountSpan = document.getElementById('switch-count');
const backBtn = document.getElementById('back-btn');
const changeDogBtn = document.getElementById('change-dog-btn');
const pauseBtn = document.getElementById('pause-btn');
const pickerArea = document.getElementById('picker-area');
const colorBtns = document.querySelectorAll('.color-btn');
const statsPeekBtn = document.getElementById('stats-peek-btn');
const statsPanel = document.getElementById('stats-panel');
const closeStatsBtn = document.getElementById('close-stats-btn');

// State
let focusTime = 0;
let switchCount = 0;
let timer;
let quoteTimer;
let currentBreed = '';
let activeTheme = 'green';
let isPaused = false;
let quoteIndex = 0;
let currentSessionHistory = [];
const fallbackQuotes = [
    "Keep focused and fetch those goals!",
    "Stay on track - you've got this!",
    "Every great achievement starts with focused determination!",
    "Stay focused, you're doing amazing!",
    "Don't let distractions sidetrack you - stay on the scent of success!",
    "One task at a time, keep going!",
    "Persistence pays off, just like training a new trick!",
    "Every minute you stay focused, you're one paw closer to success!",
];
const dogMessages = [
    "Hey! Don't tickle me!",
    "Are you sure you're focusing right now?",
    "Play with me later, let's get back to work!",
    "Let's not distract each other, woof?",
    "I know I'm cute, but don't get distracted by it ;)"
]

// Theme management
function loadTheme() {
    const savedTheme = localStorage.getItem('selectedTheme');
    const initialTheme = savedTheme || document.body.getAttribute('data-theme') || 'green';
    activeTheme = initialTheme;
    document.body.setAttribute('data-theme', initialTheme);
    updateColorBtnStates(initialTheme);
}

function saveTheme(theme) {
    activeTheme = theme;
    localStorage.setItem('selectedTheme', theme);
    document.body.setAttribute('data-theme', theme);
    updateColorBtnStates(theme);
}

function updateColorBtnStates(activeTheme) {
    colorBtns.forEach(btn => {
        if (btn.getAttribute('data-theme') === activeTheme) {
            btn.style.borderColor = 'var(--primary-light)';
        } else {
            btn.style.border = '2px solid white';
        }
    });
}

// Load stats from localStorage
function loadStats() {
    focusTime = parseInt(localStorage.getItem('focusTime')) || 0;
    switchCount = parseInt(localStorage.getItem('switchCount')) || 0;
    updateStatsDisplay();
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('focusTime', focusTime);
    localStorage.setItem('switchCount', switchCount);
}

// Format seconds to 'X min Y sec'
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
}

// Update display
function updateStatsDisplay() {
    focusTimeSpan.textContent = formatTime(focusTime);
    switchCountSpan.textContent = switchCount;
}

// Session tracking functions
function loadAllTimeStats() {
    return JSON.parse(localStorage.getItem('allSessions')) || { sessions: [], totalFocusTime: 0, totalSwitches: 0 };
}

function saveSessionData() {
    const allStats = loadAllTimeStats();
    const sessionData = {
        breed: currentBreed,
        focusTime: focusTime,
        switches: switchCount,
        date: new Date().toLocaleDateString()
    };
    allStats.sessions.push(sessionData);
    allStats.totalFocusTime += focusTime;
    allStats.totalSwitches += switchCount;
    localStorage.setItem('allSessions', JSON.stringify(allStats));
    
    // Add to current session history (not persisted)
    currentSessionHistory.push(sessionData);
}

function getFavoriteBreed() {
    const allStats = loadAllTimeStats();
    if (allStats.sessions.length === 0) return 'None yet';
    
    const breedCount = {};
    allStats.sessions.forEach(session => {
        breedCount[session.breed] = (breedCount[session.breed] || 0) + 1;
    });
    
    let favorite = '';
    let maxCount = 0;
    for (const [breed, count] of Object.entries(breedCount)) {
        if (count > maxCount) {
            maxCount = count;
            favorite = breed.charAt(0).toUpperCase() + breed.slice(1);
        }
    }
    return favorite;
}

function updateStatsPanel() {
    const allStats = loadAllTimeStats();
    document.getElementById('total-focus').textContent = formatTime(allStats.totalFocusTime);
    document.getElementById('total-switches').textContent = allStats.totalSwitches;
    document.getElementById('favorite-breed').textContent = getFavoriteBreed();
    document.getElementById('session-count').textContent = allStats.sessions.length;
    updateSessionHistoryDisplay();
}

function updateSessionHistoryDisplay() {
    const historyList = document.getElementById('session-history-list');
    
    if (currentSessionHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: white;">No sessions yet</p>';
        return;
    }
    
    historyList.innerHTML = currentSessionHistory.map((session, index) => `
        <div style="padding: 12px; background: rgba(255, 255, 255, 0.6); border-radius: 8px; border-left: 4px solid var(--accent); margin-bottom: 10px;">
            <p style="margin: 5px 0; font-size: 0.9rem; text-transform: capitalize;"><strong>${session.breed}</strong></p>
            <p style="margin: 5px 0; font-size: 0.9rem;">Focus: ${formatTime(session.focusTime)}</p>
            <p style="margin: 5px 0; font-size: 0.9rem;">Tab Switches: ${session.switches}</p>
        </div>
    `).join('');
}

function toggleStatsPanel() {
    statsPanel.classList.toggle('open');
    statsPeekBtn.classList.toggle('open');
    updateStatsPanel();
}

// Fetch dog breeds
async function fetchBreeds() {
    try {
        const response = await fetch('https://dog.ceo/api/breeds/list/all');
        const data = await response.json();
        const breeds = Object.keys(data.message);
        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed;
            option.textContent = breed.charAt(0).toUpperCase() + breed.slice(1);
            breedSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching breeds:', error);
    }
}

// Fetch random dog image
async function fetchDogImage(breed) {
    try {
        const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
        const data = await response.json();
        dogImage.src = data.message;
    } catch (error) {
        console.error('Error fetching dog image:', error);
    }
}

// Fetch motivational quote
function fetchQuote() {
    const quote = fallbackQuotes[quoteIndex];
    messageDiv.textContent = quote;
    quoteIndex = (quoteIndex + 1) % fallbackQuotes.length;
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}

// Show notification
function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Buddy', { body: message });
    }
}

// Handle visibility change
function handleVisibilityChange() {
    if (document.hidden && buddyArea.style.display !== 'none' && isPaused==false) {
        switchCount++;
        saveStats();
        updateStatsDisplay();
        showNotification('Woof... Where did you go? Come back and stay focused with me!');
    } else if (!document.hidden && buddyArea.style.display !== 'none') {
        messageDiv.textContent = 'You came back! Don\'t leave me again!';
    }
}

// Start timer
function startTimer() {
    timer = setInterval(() => {
        if (!document.hidden && buddyArea.style.display !== 'none' && !isPaused) {
            focusTime++;
            saveStats();
            updateStatsDisplay();
        }
    }, 1000);
}

// Start quote timer (every 1 minute)
function startQuoteTimer() {
    quoteTimer = setInterval(() => {
        if (!document.hidden && buddyArea.style.display !== 'none' && !isPaused) {
            fetchQuote();
        }
    }, 60000); // 1 minute = 60,000 ms
}

// Toggle pause/resume
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
        messageDiv.textContent = 'Paused... Take a quick break!';
    } else {
        messageDiv.textContent = 'Let\'s get back to work!';
    }
}

// Event listeners
chooseBtn.addEventListener('click', () => {
    const breed = breedSelect.value;
    if (breed) {
        currentBreed = breed;
        fetchDogImage(breed);
        pickerArea.style.display = 'none';
        buddyArea.style.display = 'block';
        messageDiv.textContent = `Woof! Let's stay focused together!`;
        // Keep stats visible in buddy mode.
        updateStatsDisplay();
        // Request notifications again on user interaction if needed
        requestNotificationPermission();
        // Start quote timer if not already running
        if (!quoteTimer) {
            startQuoteTimer();
        }
        // Start focus timer in buddy mode
        if (!timer) {
            startTimer();
        }
    }
});

backBtn.addEventListener('click', () => {
    pickerArea.style.display = 'block';
    buddyArea.style.display = 'none';
    messageDiv.textContent = '';
    breedSelect.value = '';
    dogImage.removeAttribute('src');
    saveSessionData();
    focusTime = 0;
    switchCount = 0;
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    saveStats();
    updateStatsDisplay();
    // Clear quote timer when going back
    if (quoteTimer) {
        clearInterval(quoteTimer);
        quoteTimer = null;
    }
    // Clear focus timer when returning to the picker
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});

changeDogBtn.addEventListener('click', () => {
    if (currentBreed) {
        fetchDogImage(currentBreed);
    }
});

pauseBtn.addEventListener('click', togglePause);

colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        saveTheme(theme);
    });
});

//Dog image click listener
dogImage.addEventListener('click', () => {
    let random = Math.floor(Math.random() * dogMessages.length);
    const message = dogMessages[random];
    messageDiv.textContent = message;
})

// Stats panel listeners
statsPeekBtn.addEventListener('click', toggleStatsPanel);
closeStatsBtn.addEventListener('click', toggleStatsPanel);
statsPanel.addEventListener('click', (e) => {
    if (e.target === statsPanel) {
        toggleStatsPanel();
    }
});

// Close stats panel when clicking outside
document.addEventListener('click', (e) => {
    if (statsPanel.classList.contains('open') && !statsPanel.contains(e.target) && e.target !== statsPeekBtn) {
        toggleStatsPanel();
    }
});

// Initialize
loadTheme();
fetchBreeds();
requestNotificationPermission();
document.addEventListener('visibilitychange', handleVisibilityChange);
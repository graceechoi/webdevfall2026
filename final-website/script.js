document.addEventListener('DOMContentLoaded', function () {
    const dayNumberGrad = document.querySelector('.grad-day');
    const dayNumberConcert = document.querySelector('.concert-day');
    if (!dayNumberGrad || !dayNumberConcert) return;

    const targetDateGrad = new Date('2026-05-15T09:00:00');
    const targetDateConcert = new Date('2026-05-17T19:00:00');

    function getDaysUntil(event) {
        const now = new Date();
        const diff = Math.max(0, event - now);
        return Math.max(0, Math.ceil(diff / 86400000));
    }

    function renderCountdowns() {
        dayNumberGrad.textContent = getDaysUntil(targetDateGrad);
        dayNumberConcert.textContent = getDaysUntil(targetDateConcert);
    }

    renderCountdowns();
    setInterval(renderCountdowns, 60 * 1000);

    fetchStLouisWeather();

    async function fetchStLouisWeather() {
        const weatherIcon = document.getElementById('weather-icon');
        const weatherTemp = document.getElementById('weather-temp');
        const weatherCondition = document.getElementById('weather-condition');

        function setWeatherText(temp, description, iconUrl) {
            weatherTemp.textContent = temp ? `${Math.round(temp)}°` : '--°';
            weatherCondition.textContent = description || 'Weather unavailable';
            if (iconUrl) {
                weatherIcon.innerHTML = `<img src="${iconUrl}" alt="${description || 'weather icon'}" />`;
            } else {
                weatherIcon.innerHTML = '';
            }
        }

        try {
            const geoRes = await fetch('https://cse2004.com/api/geocode?address=St+Louis');
            const geoData = await geoRes.json();
            const location = geoData?.results?.[0]?.geometry?.location;
            const latitude = location?.lat;
            const longitude = location?.lng;
            if (latitude == null || longitude == null) {
                throw new Error('Unable to parse coordinates');
            }

            const weatherRes = await fetch(`https://cse2004.com/api/weather?latitude=${latitude}&longitude=${longitude}`);
            const weatherData = await weatherRes.json();

            const temp = weatherData?.temperature?.degrees ?? weatherData?.current?.temperature?.degrees ?? weatherData?.current?.temperature;
            const condition = weatherData?.weatherCondition?.description?.text ?? weatherData?.current?.weatherCondition?.description?.text ?? weatherData?.current?.condition ?? weatherData?.condition;
            const iconBase = weatherData?.weatherCondition?.iconBaseUri ?? weatherData?.current?.weatherCondition?.iconBaseUri ?? weatherData?.current?.iconBaseUri;
            const icon = iconBase ? `${iconBase}.png` : null;

            setWeatherText(temp, condition, icon);
        } catch (error) {
            console.error('Weather fetch failed:', error);
            weatherTemp.textContent = '--°';
            weatherCondition.textContent = 'Weather unavailable';
            weatherIcon.innerHTML = '';
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();

            console.log("LOGIN CLICKED");

            window.location.href = "http://127.0.0.1:4000/login";
        });
    }

    loginBtn.style.display = "none";
    loadTrack();
});

async function loadTrack() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return;


    const res = await fetch("/last-played", {
        headers: {
            "x-refresh-token": refreshToken,
        },
    });

    const data = await res.json();

    // text
    document.getElementById("track").textContent = data.track;
    document.getElementById("artist").textContent = data.artist;

    document.getElementById("track").href = data.url;
    document.getElementById("artist").href = data.url;

}
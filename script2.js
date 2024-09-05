// Your WeatherAPI Key
const apiKey = 'ca58ed17cddf465f935221402240509';

// Initialize map with Leaflet.js
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to get weather data
async function getWeatherData() {
    const location = document.getElementById('location').value;
    if (!location) {
        alert("Please enter a location.");
        return;
    }

    try {
        // Get current weather
        const currentWeatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
        const currentWeather = currentWeatherResponse.data;
        updateCurrentWeather(currentWeather);

        // Get past 7 days weather
        const pastWeatherResponse = await axios.get(`https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${location}&dt=${getPastDate(7)}`);
        const pastWeather = pastWeatherResponse.data;
        updatePastWeather(pastWeather);

        // Get forecast for 3 days
        const futureWeatherResponse = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3`);
        const futureWeather = futureWeatherResponse.data;
        updateFutureWeather(futureWeather);

        // Update map location
        const lat = currentWeather.location.lat;
        const lon = currentWeather.location.lon;
        updateMap(lat, lon);
        
    } catch (error) {
        alert('Failed to retrieve weather data. Please check the location and try again.');
    }
}

// Update real-time weather
function updateCurrentWeather(data) {
    document.getElementById('current-weather').innerHTML = `
        <h3>Current Weather in ${data.location.name}, ${data.location.country}</h3>
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Condition: ${data.current.condition.text}</p>
    `;
}

// Update past weather
function updatePastWeather(data) {
    document.getElementById('past-weather').innerHTML = `
        <h3>Past Weather (7 Days) in ${data.location.name}, ${data.location.country}</h3>
        <p>Temperature: ${data.forecast.forecastday[0].day.avgtemp_c}°C</p>
        <p>Condition: ${data.forecast.forecastday[0].day.condition.text}</p>
    `;
}

// Update future weather
function updateFutureWeather(data) {
    let futureHtml = `<h3>Future 3 Days Weather in ${data.location.name}, ${data.location.country}</h3>`;
    data.forecast.forecastday.forEach(day => {
        futureHtml += `
            <p>Date: ${day.date}</p>
            <p>Temperature: ${day.day.avgtemp_c}°C</p>
            <p>Condition: ${day.day.condition.text}</p>
            <p>Precipitation Chance: ${day.day.daily_chance_of_rain}%</p>
            <hr>
        `;
    });
    document.getElementById('future-weather').innerHTML = futureHtml;
}

// Helper functions
function getPastDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

// Update map to show location
function updateMap(lat, lon) {
    map.setView([lat, lon], 13);
    L.marker([lat, lon]).addTo(map);
}

// script.js

// Replace 'YOUR_API_KEY' with your actual WeatherAPI.com API key
const API_KEY = 'ca58ed17cddf465f935221402240509';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const locationInput = document.getElementById('location-input');
    const currentWeatherDiv = document.getElementById('current-weather');
    const pastWeatherDiv = document.getElementById('past-weather');
    const futureWeatherDiv = document.getElementById('future-weather');

    // Initialize the map
    const map = L.map('map').setView([20, 0], 2); // Default view

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const location = locationInput.value.trim();
        if (location === '') return;

        try {
            // Fetch current weather
            const currentResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(location)}`);
            if (!currentResponse.ok) throw new Error('Location not found');
            const currentData = await currentResponse.json();

            // Fetch past 7 days weather
            const today = new Date();
            const pastPromises = [];
            for (let i = 1; i <= 7; i++) {
                const pastDate = new Date();
                pastDate.setDate(today.getDate() - i);
                const dateStr = pastDate.toISOString().split('T')[0];
                pastPromises.push(fetch(`https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${encodeURIComponent(location)}&dt=${dateStr}`));
            }
            const pastResponses = await Promise.all(pastPromises);
            const pastData = await Promise.all(pastResponses.map(res => res.json()));

            // Fetch future 3 days forecast
            const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=no&alerts=no`);
            if (!forecastResponse.ok) throw new Error('Forecast data not available');
            const forecastData = await forecastResponse.json();

            // Update Map
            const lat = currentData.location.lat;
            const lon = currentData.location.lon;
            map.setView([lat, lon], 10);
            if (marker) {
                marker.setLatLng([lat, lon]);
            } else {
                marker = L.marker([lat, lon]).addTo(map);
            }

            // Display Current Weather
            currentWeatherDiv.innerHTML = `
                <h3>${currentData.location.name}, ${currentData.location.country}</h3>
                <p><strong>Temperature:</strong> ${currentData.current.temp_c}°C / ${currentData.current.temp_f}°F</p>
                <p><strong>Condition:</strong> ${currentData.current.condition.text} <img src="${currentData.current.condition.icon}" alt="${currentData.current.condition.text}"></p>
                <p><strong>Precipitation:</strong> ${currentData.current.precip_mm} mm</p>
            `;

            // Display Past 7 Days Weather
            pastWeatherDiv.innerHTML = '';
            pastData.forEach(dayData => {
                pastWeatherDiv.innerHTML += `
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${dayData.forecast.forecastday[0].date}</h5>
                                <p class="card-text">
                                    <strong>Avg Temp:</strong> ${dayData.forecast.forecastday[0].day.avgtemp_c}°C / ${dayData.forecast.forecastday[0].day.avgtemp_f}°F<br>
                                    <strong>Condition:</strong> ${dayData.forecast.forecastday[0].day.condition.text} <img src="${dayData.forecast.forecastday[0].day.condition.icon}" alt="${dayData.forecast.forecastday[0].day.condition.text}"><br>
                                    <strong>Precipitation:</strong> ${dayData.forecast.forecastday[0].day.totalprecip_mm} mm
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            });

            // Display Future 3 Days Weather
            futureWeatherDiv.innerHTML = '';
            forecastData.forecast.forecastday.forEach(dayData => {
                futureWeatherDiv.innerHTML += `
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${dayData.date}</h5>
                                <p class="card-text">
                                    <strong>Avg Temp:</strong> ${dayData.day.avgtemp_c}°C / ${dayData.day.avgtemp_f}°F<br>
                                    <strong>Condition:</strong> ${dayData.day.condition.text} <img src="${dayData.day.condition.icon}" alt="${dayData.day.condition.text}"><br>
                                    <strong>Chance of Precipitation:</strong> ${dayData.day.daily_chance_of_rain}% 
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            });

        } catch (error) {
            alert(error.message);
        }
    });
});

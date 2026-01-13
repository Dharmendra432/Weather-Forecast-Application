const API_KEY = "2f4c959574dc0a6cc0c7e4249df5c3c0";
let isCelsius = true;

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherInfo = document.getElementById("weatherInfo");
const errorMsg = document.getElementById("errorMsg");
const recentCities = document.getElementById("recentCities");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name");
  fetchWeatherByCity(city);
});

locationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  });
});

function fetchWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => handleWeather(data))
    .catch(() => showError("Unable to fetch weather data"));
}

function fetchWeatherByCoords(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => handleWeather(data))
    .catch(() => showError("Location access failed"));
}

function handleWeather(data) {
  if (data.cod !== 200) {
    showError(data.message || "Invalid city name");
    weatherInfo.classList.add("hidden");
    return;
  }

  errorMsg.textContent = "";
  weatherInfo.classList.remove("hidden");

  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temperature").textContent = `Temperature: ${data.main.temp} °C`;
  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind Speed: ${data.wind.speed} m/s`;

  if (data.main.temp > 40) {
    errorMsg.textContent = "⚠ Extreme Heat Alert!";
  }

  saveRecentCity(data.name);
  fetchForecast(data.name);
}

function fetchForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => renderForecast(data.list));
}

function renderForecast(list) {
  const forecast = document.getElementById("forecast");
  forecast.innerHTML = "";

  list.filter((_, i) => i % 8 === 0).forEach(item => {
    forecast.innerHTML += `
      <div class="bg-white text-gray-800 p-3 rounded shadow">
        <p class="font-semibold">${new Date(item.dt_txt).toDateString()}</p>
        <p>🌡 ${item.main.temp} °C</p>
        <p>💧 ${item.main.humidity}%</p>
        <p>🌬 ${item.wind.speed} m/s</p>
      </div>`;
  });
}

function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) cities.unshift(city);
  localStorage.setItem("cities", JSON.stringify(cities));
  updateDropdown(cities);
}

function updateDropdown(cities) {
  if (!cities.length) return;
  recentCities.classList.remove("hidden");
  recentCities.innerHTML = `<option>Select recent city</option>`;
  cities.forEach(c => recentCities.innerHTML += `<option>${c}</option>`);
  recentCities.onchange = () => fetchWeatherByCity(recentCities.value);
}

function showError(msg) {
  errorMsg.textContent = msg;
}
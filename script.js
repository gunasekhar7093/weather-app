const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const weatherResult = document.getElementById("weatherResult");
const emptyState = document.getElementById("emptyState");
const statusMessage = document.getElementById("statusMessage");

const weatherIcons = {
  clear: "☀️",
  clouds: "☁️",
  rain: "🌧️",
  drizzle: "🌦️",
  thunderstorm: "⛈️",
  snow: "❄️",
  mist: "🌫️",
  smoke: "🌫️",
  haze: "🌤️",
  dust: "🌫️",
  fog: "🌫️",
  sand: "🌫️",
  ash: "🌫️",
  squall: "💨",
  tornado: "🌪️"
};

function setStatus(message, kind = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${kind}`;
}

function formatLocalDate(unixSeconds, timezoneOffset) {
  const local = new Date((unixSeconds + timezoneOffset) * 1000);
  const parts = new Intl.DateTimeFormat("en", {
    weekday: "long", month: "short", day: "numeric",
    timeZone: "UTC"
  }).format(local);
  return parts;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

// Set the whole page's color atmosphere from the searched location's temperature.
function applyTemperatureTheme(temperatureCelsius) {
  let theme = "mild";
  if (temperatureCelsius < 0) theme = "freezing";
  else if (temperatureCelsius < 12) theme = "cold";
  else if (temperatureCelsius < 22) theme = "mild";
  else if (temperatureCelsius < 30) theme = "warm";
  else if (temperatureCelsius < 38) theme = "hot";
  else theme = "extreme";

  document.body.dataset.temperature = theme;
  document.body.style.setProperty("--searched-temperature", temperatureCelsius);
}

async function getWeather(cityOverride) {
  const city = (cityOverride ?? cityInput.value).trim();
  if (!city) {
    cityInput.focus();
    setStatus("Enter a city name and we’ll look it up.", "error");
    return;
  }

  const apiKey = "61e1dfd871c94fd8d4279e65251a7237";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  searchButton.disabled = true;
  searchButton.querySelector("span").textContent = "Checking…";
  setStatus(`Looking up weather in ${city}…`, "loading");

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || Number(data.cod) !== 200) {
      if (Number(data.cod) === 404) {
        throw new Error("We couldn’t find that city. Check the spelling and try again.");
      }
      if (Number(data.cod) === 401) {
        throw new Error("The weather service rejected the API key. Please check the API configuration.");
      }
      throw new Error(data.message ? data.message[0].toUpperCase() + data.message.slice(1) : "Weather couldn’t load just now. Please try again.");
    }

    const condition = data.weather?.[0];
    if (!condition || !data.main) throw new Error("The weather service returned incomplete data. Try again in a moment.");

    setText("cityName", data.name + (data.sys?.country ? `, ${data.sys.country}` : ""));
    setText("localDate", formatLocalDate(data.dt, data.timezone || 0));
    document.getElementById("weatherIcon").textContent = weatherIcons[condition.main.toLowerCase()] || "🌤️";
    document.getElementById("temperature").innerHTML = `${Math.round(data.main.temp)}<span>°</span>`;
    setText("description", condition.description || condition.main);
    setText("feelsLike", `Feels like ${Math.round(data.main.feels_like)}°C`);
    document.getElementById("humidity").innerHTML = `${data.main.humidity}<span>%</span>`;
    document.getElementById("wind").innerHTML = `${Number(data.wind?.speed ?? 0).toFixed(1)}<span> m/s</span>`;
    document.getElementById("visibility").innerHTML = `${(Number(data.visibility ?? 0) / 1000).toFixed(1)}<span> km</span>`;

    weatherResult.classList.remove("hidden");
    emptyState.classList.add("hidden");
    setStatus(`Here’s the latest for ${data.name}.`);
    document.body.dataset.weather = condition.main.toLowerCase();
    applyTemperatureTheme(Number(data.main.temp));
    cityInput.value = data.name;
  } catch (error) {
    setStatus(error.message || "Something went wrong. Check your connection and try again.", "error");
  } finally {
    searchButton.disabled = false;
    searchButton.querySelector("span").textContent = "Find weather";
  }
}

searchButton.addEventListener("click", () => getWeather());
cityInput.addEventListener("keydown", event => {
  if (event.key === "Enter") getWeather();
});

document.querySelectorAll("[data-city]").forEach(button => {
  button.addEventListener("click", () => {
    const city = button.dataset.city;
    cityInput.value = city;
    getWeather(city);
  });
});
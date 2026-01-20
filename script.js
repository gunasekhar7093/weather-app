function getWeather() {
  const city = document.getElementById("cityInput").value;

  if (city === "") {
    alert("Please enter a city name!");
    return;
  }

  const apiKey = "61e1dfd871c94fd8d4279e65251a7237";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod === "404") {
        alert("City not found!");
        return;
      }

      document.getElementById("weatherResult").classList.remove("hidden");

      document.getElementById("cityName").innerText = data.name;
      document.getElementById("temperature").innerText =
        `🌡 Temperature: ${data.main.temp} °C`;
      document.getElementById("description").innerText =
        `☁️ Condition: ${data.weather[0].description}`;
      document.getElementById("humidity").innerText =
        `💧 Humidity: ${data.main.humidity}%`;
      document.getElementById("wind").innerText =
        `💨 Wind Speed: ${data.wind.speed} m/s`;

      // 🌍 Change background based on weather
      const weather = data.weather[0].main.toLowerCase();

      if (weather.includes("rain")) {
        document.body.style.background =
          "linear-gradient(135deg, #373b44, #4286f4)";
      } 
      else if (weather.includes("cloud")) {
        document.body.style.background =
          "linear-gradient(135deg, #bdc3c7, #2c3e50)";
      } 
      else if (weather.includes("clear")) {
        document.body.style.background =
          "linear-gradient(135deg, #fbc2eb, #a6c1ee)";
      } 
      else if (weather.includes("haze") || weather.includes("mist")) {
        document.body.style.background =
          "linear-gradient(135deg, #abbaab, #ffffff)";
      } 
      else {
        document.body.style.background =
          "linear-gradient(135deg, #4facfe, #00f2fe)";
      }
    })
    .catch(error => console.log(error));
}

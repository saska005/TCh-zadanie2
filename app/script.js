document.addEventListener('DOMContentLoaded', () => {
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const weatherBtn = document.getElementById('getWeatherBtn');
    const resultDiv = document.getElementById('weatherResult');

    const cityData = {
        'PL': {
            'Lublin': { lat: 51.25, lon: 22.57 },
            'Warszawa': { lat: 52.23, lon: 21.01 },
            'Gdańsk': { lat: 54.35, lon: 18.64 },
            'Kraków': { lat: 50.06, lon: 19.94 }
        },
        'DE': {
            'Berlin': { lat: 52.52, lon: 13.41 },
            'Monachium': { lat: 48.13, lon: 11.57 },
            'Hamburg': { lat: 53.55, lon: 9.99 }
        },
        'ES': {
            'Madryt': { lat: 40.41, lon: -3.70 },
            'Barcelona': { lat: 41.38, lon: 2.17 },
            'Bilbao': { lat: 43.26, lon: -2.93 }
        }
    };

    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        citySelect.innerHTML = '<option value="">--Wybierz miasto--</option>';
        
        if (selectedCountry && cityData[selectedCountry]) {
            Object.keys(cityData[selectedCountry]).forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citySelect.disabled = false;
        } else {
            citySelect.disabled = true;
        }
    });

    weatherBtn.addEventListener('click', async () => {
        const country = countrySelect.value;
        const city = citySelect.value;

        if (!city) {
            alert('Proszę wybrać miasto!');
            return;
        }

        const coords = cityData[country][city];

        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`);
            const data = await response.json();
            
            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;

            resultDiv.innerHTML = `
                <h3>Aktualna pogoda dla: ${city}</h3> 
                <p><strong>Temperatura:</strong> ${temp}°C</p>
                <p><strong>Prędkość wiatru:</strong> ${wind} km/h</p>`; 
        } catch (error) {
            resultDiv.innerHTML = `<p style="color:red">Błąd podczas pobierania danych pogodowych.</p>`;
        }
    });
});
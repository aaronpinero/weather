// Identify page elements.
const weather_api_key_input = document.querySelector('#weather-api-key');
const geocode_api_key_input = document.querySelector('#geocode-api-key');
const location_display = document.querySelector('#ark-location');
const request_time_display = document.querySelector('#ark-request-time');
const current_temp_display = document.querySelector('#ark-current-temp');
const current_temp_low_display = document.querySelector('#ark-current-temp-low');
const current_temp_high_display = document.querySelector('#ark-current-temp-high');
const current_description = document.querySelector('#ark-current-description');

const default_unit = "imperial";
var weatherRequest;
var reverseGeocodeRequest;

function get_latlong() {
  // Handler for successful use of the Geolocation API.
  function success(position) {
    // Save the location information in local storage.
    localStorage.setItem('userlat',position.coords.latitude);
    localStorage.setItem('userlon',position.coords.longitude);
    // display the values
    document.querySelector('#location-lat').value = position.coords.latitude;
    document.querySelector('#location-lon').value = position.coords.longitude;
    // Get data based on saved location.
    get_reverse_geocode();
    get_weather();
  }
  // Handler for unsuccessful use of the Geolocation API.
  function error() {
    window.alert('Unable to retrieve your location');
    document.querySelector('#location-lat').value = '';
    document.querySelector('#location-lon').value = '';
  }
  
  // Check if location information is already stored.
  if (localStorage.getItem('userlat') && localStorage.getItem('userlon')) {
    // display the values
    document.querySelector('#location-lat').value = localStorage.getItem('userlat');
    document.querySelector('#location-lon').value = localStorage.getItem('userlon');
    // Get data based on saved location.
    get_reverse_geocode();
    get_weather();
  }
  else {
    // Check for support of the Geolocation API
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported by your browser');
    }
    else {
      navigator.geolocation.getCurrentPosition(success,error);
    }
  }
}

function get_reverse_geocode() {
  if (!localStorage.getItem('geocodeapikey')) {
    window.alert("Need LocationIQ API key.");
    return false;
  }
  if (!localStorage.getItem('userlat') || !localStorage.getItem('userlon')) {
    window.alert("Need location information.");
    return false;
  }
  
  let latitude  = localStorage.getItem('userlat');
  let longitude = localStorage.getItem('userlon');
  let geokey = localStorage.getItem('geocodeapikey');
  let geocodelink = `https://us1.locationiq.com/v1/reverse.php?key=${geokey}&lat=${latitude}&lon=${longitude}&format=json`;
    
  reverseGeocodeRequest = new XMLHttpRequest();
  reverseGeocodeRequest.onreadystatechange = process_reverse_geocode;
  reverseGeocodeRequest.open('GET',geocodelink);
  reverseGeocodeRequest.send();
}

function process_reverse_geocode() {
  if (reverseGeocodeRequest.readyState === XMLHttpRequest.DONE) {
    if (reverseGeocodeRequest.status === 200) {
      localStorage.setItem('geocoderesponse',reverseGeocodeRequest.responseText);
      let response = JSON.parse(reverseGeocodeRequest.responseText);
      
      // update display
      location_display.textContent = response.address.city;
    }
    else {
      window.alert(`Failed Geocode Request: ${reverseGeocodeRequest.status}`);
    }
  }
}

function get_weather() {
  if (!localStorage.getItem('weatherapikey')) {
    window.alert("Need OpenWeather API key.");
    return false;
  }
  if (!localStorage.getItem('userlat') || !localStorage.getItem('userlon')) {
    window.alert("Need location information.");
    return false;
  }
  document.querySelector('body').classList.add('loading');
  document.getElementsByTagName('body').item(0).setAttribute('data-icon','');
  
  let latitude  = localStorage.getItem('userlat');
  let longitude = localStorage.getItem('userlon');
  let units = localStorage.getItem('userunit');
  let apikey = localStorage.getItem('weatherapikey');
  let weatherlink = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apikey}`;
    
  weatherRequest = new XMLHttpRequest();
  weatherRequest.onreadystatechange = process_weather;
  weatherRequest.open('GET',weatherlink);
  weatherRequest.send();
}

function process_weather() {
  if (weatherRequest.readyState === XMLHttpRequest.DONE) {
    if (weatherRequest.status === 200) {
      localStorage.setItem('weatherresponse',weatherRequest.responseText);
      let response = JSON.parse(weatherRequest.responseText);
      
      // update display
      current_temp_display.textContent = Math.round(response.current.temp);
      current_temp_low_display.textContent = `${Math.round(response.daily[0].temp.min)}˚`;
      current_temp_high_display.textContent = `${Math.round(response.daily[0].temp.max)}˚`;
      request_time_display.textContent = format_time(response.current.dt);
      current_description.textContent = response.current.weather[0].main;
      
      // Is it day or night?
      let day = true;
      if (response.current.dt < response.daily[0].sunrise || response.current.dt > response.daily[0].sunset) {
        day = false;
      }
      if (!day) {
        document.getElementsByTagName('body').item(0).classList.add('night');
      }
      else {
        document.getElementsByTagName('body').item(0).classList.remove('night');
      }
      
      // Set icon through style
      document.getElementsByTagName('body').item(0).setAttribute('data-icon',response.current.weather[0].icon);
      
      // Daily forecast.
      var daily_code = '<h2 class="text-center my-3">Next 7 Days</h2><ul class="text-center mx-0 my-3 p-0">';
      var daily = response.daily;
      var x;
      for (x=1;x<daily.length;x++) {
        daily_code += '<li class="px-4 py-2">';
        daily_code += `<span class="ark-daily-date">${format_day(daily[x].dt)}</span>`;
        daily_code += `<span class="ark-daily-desc" data-icon="${daily[x].weather[0].icon}">${daily[x].weather[0].main}</span>`;
        daily_code += `<span class="ark-daily-pop">${Math.round(daily[x].pop * 100)}%</span>`;
        daily_code += `<span class="ark-daily-high">${Math.round(daily[x].temp.max)}˚</span>`;
        daily_code += `<span class="ark-daily-low">${Math.round(daily[x].temp.min)}˚</span>`;
        daily_code += '</li>';
      }
      daily_code += '</ul>';
      document.querySelector('#ark-daily-forecast').innerHTML = daily_code;
      
      // Finish loading.
      document.querySelector('body').classList.remove('loading');
    }
    else {
      window.alert(`Failed Request: ${weatherRequest.status}`);
    }
  }
}

function format_time(t) {
  let d = new Date(t * 1000);
  let hours = d.getHours();
  let minutes = d.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  let time = hours + ':' + minutes + ampm;
  return time;
}

function format_day(t) {
  let d = new Date(t * 1000);
  var options = {
    weekday: 'short',
    // month: 'short',
    // day: 'numeric',
    timeZone: 'America/New_York'
  };
  let d_formatted = new Intl.DateTimeFormat('us-EN', options).format(d);
  return d_formatted;
}

function clear_info() {
  localStorage.clear();
  localStorage.setItem('userunit','metric');
  document.querySelector('input[value="metric"]').checked = true;
}

function set_weather_api_key(e) {
  e.preventDefault();
  let key = weather_api_key_input.value;
  if (key != '') {
    localStorage.setItem('weatherapikey',key);
    get_latlong();
  }
}

function set_geocode_api_key(e) {
  e.preventDefault();
  let key = geocode_api_key_input.value;
  if (key != '') {
    localStorage.setItem('geocodeapikey',key);
    get_latlong();
  }
}

function set_units(e) {
  localStorage.setItem('userunit',this.value);
  get_weather();
}

function open_settings(e) {
  document.querySelector('aside#settings').classList.add('open');
  
  function close_settings_button() {
    document.querySelector('aside#settings').classList.remove('open');
    document.querySelector('button#close-settings').removeEventListener('click',close_settings_button);
    document.removeEventListener('click',close_settings_clickaway);
    document.removeEventListener('keydown',close_settings_key);
  }
  
  function close_settings_key(e) {
    // escape key closes
    if (e.keyCode == 27) {
      document.querySelector('aside#settings').classList.remove('open');
      document.querySelector('button#close-settings').removeEventListener('click',close_settings_button);
      document.removeEventListener('click',close_settings_clickaway);
      document.removeEventListener('keydown',close_settings_key);
    }
  }
  
  function close_settings_clickaway(e) {
    let is_open_button = e.target.isSameNode(document.querySelector('#open-settings'));
    let is_open_button_child = !!e.target.closest('#open-settings');
    let is_settings = e.target.isSameNode(document.querySelector('#settings'));
    let is_settings_child = !!e.target.closest('#settings');
    
    if (is_open_button === false && is_open_button_child === false && is_settings === false && is_settings_child === false) {
      document.querySelector('aside#settings').classList.remove('open');
      document.querySelector('button#close-settings').removeEventListener('click',close_settings_button);
      document.removeEventListener('click',close_settings_clickaway);
      document.removeEventListener('keydown',close_settings_key);
    }
  }
  
  // click away
  document.addEventListener('click',close_settings_clickaway);
  // escape key
  document.addEventListener('keydown',close_settings_key);
  // close button
  document.querySelector('#close-settings').addEventListener('click',close_settings_button);
}

document.querySelector('#ark-get-weather').addEventListener('click', get_weather);
document.querySelector('#weather-api-key-set').addEventListener('click', set_weather_api_key);
document.querySelector('#geocode-api-key-set').addEventListener('click', set_geocode_api_key);
document.querySelector('#clear-info').addEventListener('click', clear_info);
document.querySelector('#fahrenheit').addEventListener('input', set_units);
document.querySelector('#celsius').addEventListener('input', set_units);
document.querySelector('#open-settings').addEventListener('click', open_settings);

// Set units if they are not set
if (!localStorage.getItem('userunit')) {
  localStorage.setItem('userunit',default_unit);
  document.querySelector('input[value="'+default_unit+'"]').checked = true;
}
else {
  var u = localStorage.getItem('userunit');
  document.querySelector('input[value="'+u+'"]').checked = true;
}

// If there is an API key set, get the weather.
if (localStorage.getItem('weatherapikey') && localStorage.getItem('geocodeapikey')) {
  weather_api_key_input.value = localStorage.getItem('weatherapikey');
  geocode_api_key_input.value = localStorage.getItem('geocodeapikey');
  get_latlong();
}
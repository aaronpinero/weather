// Identify page elements.
const key_input = document.querySelector('#apikey');
const status_display = document.querySelector('#status');
const location_display = document.querySelector('#location');
const time_display = document.querySelector('#time');
const temp_display = document.querySelector('#temp');
const weather_description = document.querySelector('#weather-description');

const default_unit = "imperial";
var weatherRequest;

function get_location() {
  status_display.textContent = 'Getting location...';
  // Handler for successful use of the Geolocation API.
  function success(position) {
    status_display.textContent = '';
    // Save the location information in local storage.
    localStorage.setItem('userlat',position.coords.latitude);
    localStorage.setItem('userlon',position.coords.longitude);
    // Now get the weather.
    get_weather();
  }
  // Handler for unsuccessful use of the Geolocation API.
  function error() {
    status_display.textContent = 'Unable to retrieve your location';
  }
  
  // Check if location information is already stored.
  if (localStorage.getItem('userlat') && localStorage.getItem('userlon')) {
    get_weather();
  }
  else {
    // Check for support of the Geolocation API
    if (!navigator.geolocation) {
      status_display.textContent = 'Geolocation is not supported by your browser';
    }
    else {
      navigator.geolocation.getCurrentPosition(success,error);
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
  status_display.textContent = 'Getting weather...';
  
  let latitude  = localStorage.getItem('userlat');
  let longitude = localStorage.getItem('userlon');
  let units = localStorage.getItem('userunit');
  let apikey = localStorage.getItem('weatherapikey');
  let weatherlink = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apikey}`;
    
  weatherRequest = new XMLHttpRequest();
  weatherRequest.onreadystatechange = process_weather;
  weatherRequest.open('GET',weatherlink);
  weatherRequest.send();
}

function process_weather() {
  if (weatherRequest.readyState === XMLHttpRequest.DONE) {
    if (weatherRequest.status === 200) {
      localStorage.setItem('weatherresponse',weatherRequest.responseText);
      let latitude  = localStorage.getItem('userlat');
      let longitude = localStorage.getItem('userlon');
      let response = JSON.parse(weatherRequest.responseText);
      let temp = Math.round(response.main.temp);
      let location = response.name;
      let desc = response.weather[0].main;
      let time = format_time(response.dt);
      let location_link = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
      
      // update display
      status_display.textContent = '';
      location_display.textContent = location;
      location_display.href = location_link;
      temp_display.textContent = `${temp}`;
      time_display.textContent = time;
      weather_description.textContent = desc;
      
      // Is it day or night?
      let day = true;
      if (response.dt < response.sys.sunrise || response.dt > response.sys.sunset) {
        day = false;
      }
      if (!day) {
        document.getElementsByTagName('body').item(0).classList.add('night');
      }
      else {
        document.getElementsByTagName('body').item(0).classList.remove('night');
      }
    }
    else {
      status_display.textContent = `Failed Request: ${weatherRequest.status}`;
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

function clear_info() {
  localStorage.clear();
  localStorage.setItem('userunit','metric');
  document.querySelector('input[value="metric"]').checked = true;
}

function set_key(e) {
  e.preventDefault();
  let key = key_input.value;
  if (key != '') {
    localStorage.setItem('weatherapikey',key);
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

document.querySelector('#get-weather').addEventListener('click', get_weather);
document.querySelector('#apikey-set').addEventListener('click', set_key);
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
if (localStorage.getItem('weatherapikey')) {
  key_input.value = localStorage.getItem('weatherapikey');
  get_location();
}
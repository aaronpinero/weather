// Default units.
localStorage.setItem('userunit','imperial');

// Identify page elements.
const keyinput = document.querySelector('#apikey');
const status = document.querySelector('#status');
const mapLink = document.querySelector('#map-link');
const tempdisplay = document.querySelector('#temp');

function geoFindMe() {
  // Clear any previous information.
  mapLink.href = '';
  mapLink.textContent = '';

  // Handler for successful use of the Geolocation API.
  function success(position) {
    // Save the location information in local storage.
    localStorage.setItem('userlat',position.coords.latitude);
    localStorage.setItem('userlon',position.coords.longitude);
    
    // Retrieve the values for use.
    let latitude  = localStorage.getItem('userlat');
    let longitude = localStorage.getItem('userlon');

    // Display the location.
    status.textContent = '';
    mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
  }

  // Handler for unsuccessful use of the Geolocation API.
  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  // Check for support of the Geolocation API
  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  }
  else {
    // If location data is not stored, request it using the Geolocation API;
    // otherwise, pull the data from local storage.
    if (!localStorage.getItem('userlat')) {
      status.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(success,error);
    }
    else {
      let latitude  = localStorage.getItem('userlat');
      let longitude = localStorage.getItem('userlon');

      status.textContent = '';
      mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
      mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
    }
  }
}

var weatherRequest;

function getWeather() {
  if (!localStorage.getItem('weatherapikey')) {
    window.alert("Need Weather API Key");
    return false;
  }
  else if (!localStorage.getItem('userlat')) {
    window.alert("Need Location");
  }
  else {
    let latitude  = localStorage.getItem('userlat');
    let longitude = localStorage.getItem('userlon');
    let units = localStorage.getItem('userunit');
    let apikey = localStorage.getItem('weatherapikey');
    let weatherlink = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apikey}`;
    
    weatherRequest = new XMLHttpRequest();
    weatherRequest.onreadystatechange = processWeather;
    weatherRequest.open('GET',weatherlink);
    weatherRequest.send();
  }
}

function processWeather() {
  if (weatherRequest.readyState === XMLHttpRequest.DONE) {
    if (weatherRequest.status === 200) {
      let response = JSON.parse(weatherRequest.responseText);
      localStorage.setItem('weatherresponse',weatherRequest.responseText);
      let temp = Math.round(response.main.temp);
      let place = response.name;
      let time = formatTime(response.dt);
      status.textContent = `Temperature in ${place} as of ${time}`;
      tempdisplay.textContent = `${temp}°`;
      
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
      window.alert("Failed Request: "+weatherRequest.status);
    }
  }
}

function formatTime(t) {
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

function setKey(e) {
  e.preventDefault();
  let key = keyinput.value;
  if (key != '') {
    localStorage.setItem('weatherapikey',key);
  }
}

document.querySelector('#find-me').addEventListener('click', geoFindMe);
document.querySelector('#get-weather').addEventListener('click', getWeather);
document.querySelector('#apikey-set').addEventListener('click', setKey);

if (localStorage.getItem('weatherapikey')) {
  keyinput.value = localStorage.getItem('weatherapikey');
}
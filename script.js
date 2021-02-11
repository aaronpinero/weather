localStorage.setItem('userunit','imperial');
const keyinput = document.querySelector('#apikey');

function geoFindMe() {
  // Identify parts of the page.
  const status = document.querySelector('#status');
  const mapLink = document.querySelector('#map-link');
  
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
      localStorage.setItem('weatherresponse',response);
      const tempdisplay = document.querySelector('#temp');
      let temp = Math.round(response.main.temp);
      tempdisplay.textContent = `${temp}°`;
    }
    else {
      window.alert("Failed Request: "+weatherRequest.status);
    }
  }
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
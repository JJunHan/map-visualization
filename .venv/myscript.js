/**
 * Start of JS
 */

// https://www.google.com/maps/search/?api=1&query=47.5951518%2C-122.3316393

const dataBase = {0:"value"};

const info_columns = ["Organisation Name", "Postal code", "LatLong", "XY", "Operating Hours", "Type of Centre", "Age", "Bankcard"]

console.log(dataBase[0]);

// Center map according to singapore's boundaries
var center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter();
var map = L.map('mapdiv').setView([center.x, center.y], 13);

map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);
var basemap = L.tileLayer('https://maps-{s}.onemap.sg/v3/Default/{z}/{x}/{y}.png', {
    detectRetina: true,
    maxZoom: 18,
    minZoom: 12,
    tileSize: 256,
    zoomOffset: 0,
    //Do not remove this attribution
    attribution: '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
});

// Add map into website
basemap.addTo(map);

var userLat;
var userLong;
var userX;
var userY;

function getLocation() {
    geo = navigator.geolocation;
    if (geo) {
    navigator.geolocation.getCurrentPosition(showPosition,errorCallback);
    } 
}

function errorCallback(error){
    if (error.code == error.PERMISSION_DENIED) {
        // pop up dialog asking for location
        alert("Please allow location to carry on.");
        getLocation();
    }
}

function showPosition(position) {     
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;   
    convert_toSVY21(userLat,userLong);
    marker = new L.Marker([position.coords.latitude, position.coords.longitude],{icon: greenIcon}, {bounceOnAdd: false}).addTo(map);  
    marker.bindPopup("You are here!");
    map.setView([position.coords.latitude, position.coords.longitude], 16);       
    var popup = L.popup()
    .setLatLng([position.coords.latitude, position.coords.longitude]) 
    .setContent('You are here!')
    .openOn(map);  
          
}

function convert_toSVY21(lat,long) {
    //var XMLHttpRequest = require('xhr2');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        var obj = JSON.parse(xhttp.responseText);
        console.log(obj);
        userX = obj.X;
        userY = obj.Y;
        console.log(userX);
        console.log(userY);
        addAll(); 
        }
    };

    xhttp.open("GET", "https://developers.onemap.sg/commonapi/convert/4326to3414?latitude=" + lat + "&longitude="+ long, true);
    xhttp.send();
}

//https://github.com/pointhi/leaflet-color-markers
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
var violetIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var goldIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
//var marker = L.marker([1.25, 103.8]).bindPopup("<b>Hello world!</b><br>I am a popup.").addTo(map);
//marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

//var marker = L.marker([1.25, 103.8]).addTo(map);
//marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

var popup = L.popup();

function onMapClick(e) {
    popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}

//map.on('click', onMapClick);

var fullInfoLayer = L.layerGroup();
var index5closest = L.layerGroup();
var index10closest = L.layerGroup();

function addAll(){
    var circle_0 = L.circle([userLat, userLong], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.0,
        radius: 5000
    }).addTo(index5closest);

    var circle_1 = L.circle([userLat, userLong], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.0,
        radius: 10000
    }).addTo(index10closest);

    
    for (const [key, value] of Object.entries(dataBase)) {
        // console.log(key, value);
        if(value.LatLong == "nil" || value.LatLong == "no matches"){
            console.log("nil value detected");
            continue;
        }

        let latlongarray = value.LatLong.split(",");
        let text = value["Organisation Name"] + "<br>" + value["Postal code"] + "<br>" + value["Operating Hours"] + "<br>" + value["Type of Centre"] + "<br>" + value["Age"] + "<br>" + value["Bankcard"];
        L.marker([latlongarray[0], latlongarray[1]]).bindPopup(text).addTo(fullInfoLayer);

        let XYarray = value.XY.split(",");
        let approxdistance = Math.pow((XYarray[0] - userX),2) + Math.pow((XYarray[1] - userY),2);
        // console.log(approxdistance);
        if(approxdistance < 25000000){ //5000 = 5km, if i dont sqroot, must be 5km sq, = 25000000
            L.marker([latlongarray[0], latlongarray[1]],{icon: violetIcon}).bindPopup(text).addTo(index5closest);
        }
        if(approxdistance < 100000000){ //10000 = 10km
            L.marker([latlongarray[0], latlongarray[1]],{icon: goldIcon}).bindPopup(text).addTo(index10closest);
        }


    }
    // var layerGroup = L.layerGroup([outlets]);
    //fullInfoLayer.addTo(map);
}

function removeAll(){
    map.removeLayer(fullInfoLayer);
    map.removeLayer(index5closest);
    map.removeLayer(index10closest);
}

function showAll(){
    map.addLayer(fullInfoLayer);
}

function show5kmradius(){
    //console.log(index5closest);
    map.addLayer(index5closest);
}

function show10kmradius(){
    //console.log(index10closest);
    map.addLayer(index10closest);
}




// Submit button links here, and executes location grab
function verifyinputs(){
    var user_age = document.getElementById('user_age').value;
    var age_group;
    const radiobutton = document.querySelectorAll('input[name="radio"]');
    
    if(user_age.length == 0){
        alert("Sorry, you have to select an age group");
        return false;
    }
    else {
        switch(parseInt(user_age)) {
            case 0:
                age_group = "0-9";
                break;
            case 1:
                age_group = "10-19";
                break;
            case 2:
                age_group = "20-29";
                break;        
            default:
                age_group = "0-9";
        }
        document.getElementById('details_age').innerHTML = "Your age group is: " + age_group;
        //return true;
    }

    let selectedValue;
        for (const rb of radiobutton) {
            if (rb.checked) {
                selectedValue = rb.value;
                break;
            }
        }
    document.getElementById('details_card').innerHTML = "Food Bank card: " + selectedValue;
    document.getElementById('mapdiv').style.display = 'block';
    document.getElementById('control').style.display = 'block';
    //document.getElementById('user_input').style.display = 'none'; //hide the selection  box
    getLocation();
    return true;
}
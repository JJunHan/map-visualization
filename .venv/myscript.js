/**
 * Start of JS
 * By: Jun Han :)
 */

const dataSet1 = {};

const dataSet2 = {};

const dataSet3 = {};

// Center map according to singapore's boundaries
var center = L.bounds([1.56073, 104.11475], [1.16, 103.502]).getCenter();
var map = L.map('mapdiv').setView([center.x, center.y], 13);

map.setMaxBounds([[1.56073, 104.1147], [1.16, 103.502]]);
var basemap = L.tileLayer('https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png', { // Can chang to other types of base map via this png.
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
var loc = false;

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

var marker; 
var popup;

function showPosition(position) {     
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;   
    loc = true;
    // Get user location in X and Y coords to calc distance
    convert_toSVY21(userLat,userLong);
    // Insert Marker,  but remove previous marker if it exists
    if(marker){
        map.removeLayer(marker);
    }
    marker = new L.Marker([position.coords.latitude, position.coords.longitude],{icon: greenIcon}, {bounceOnAdd: false}).addTo(map);  
    marker.bindPopup("You are here!");
    map.setView([position.coords.latitude, position.coords.longitude], 13.5);    
    // Insert Text popup    
    popup = new L.popup()
    .setLatLng([position.coords.latitude, position.coords.longitude]) 
    .setContent('You are here!')
    .openOn(map);   
}

function convertWithAPI() { // Or Name...
    // var XMLHttpRequest = require('xhr2');
    let userInput = document.getElementById('searchBar').value
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var obj = JSON.parse(xhttp.responseText);
            console.log(userInput);
            console.log(obj);
            if (obj){
                userSearch(obj); // Callback
            }
        }
    };
    xhttp.open("GET", "https://developers.onemap.sg/commonapi/search?searchVal=" + userInput + "&returnGeom=Y&getAddrDetails=Y&pageNum=1",true);
    xhttp.send();
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
        //  Does all the distance conversion and calculations
        userLocAsCentral(); 
        }
    };

    xhttp.open("GET", "https://developers.onemap.sg/commonapi/convert/4326to3414?latitude=" + lat + "&longitude="+ long, true);
    xhttp.send();
}

// https://github.com/pointhi/leaflet-color-markers as reference
// You can add in your own custom icons!
var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [35, 51],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

var fullInfoLayer = L.layerGroup();
var userSpecifiedlayer = L.layerGroup();
var allNames = [];
var data1 = [];
var data2 = [];
var data3 = [];
var data4 = [];

function userLocAsCentral(){
    // Check all filters and shower centers with regards to all filters
    checkAllFilters();
    // Fill up sidebar details
    searchDBDetails();
    // Show it on map
    map.addLayer(userSpecifiedlayer);
}

function removeAll(){
    map.removeLayer(fullInfoLayer);
    map.removeLayer(userSpecifiedlayer);
}

function showAll(){
    if(loc)
        map.addLayer(fullInfoLayer);
    else
        alert("Please click get my location first!")
}

function searchDBNames(){
    let input = document.getElementById('searchBar').value
    input=input.toLowerCase();
    let x = document.getElementsByClassName('searchResults');

    let list = document.getElementById("detailsList");
    list.replaceChildren();

    for (i = 0; i < x.length; i++) { 
        if (!x[i].innerHTML.toLowerCase().includes(input)) {
            x[i].style.display="none";
        }
        else {
            x[i].style.display="list-item";                 
        }
    }
}

function searchDBDetails(){
    let x = document.getElementsByClassName('searchDetails');
    for (i = 0; i < x.length; i++) { 
            x[i].style.display="list-item";                 
    }
}

function userSearch(obj){
    let tempArray = [];
    if(obj.found == 0){
        alert("Nothing found, please try again");
    }
    else{
        tempArray.push(obj.results[0].X);
        tempArray.push(obj.results[0].Y);
        tempArray.push(obj.results[0].LATITUDE);
        tempArray.push(obj.results[0].LONGITUDE);
        checkAllFilters(tempArray);
        searchDBDetails();
        map.addLayer(userSpecifiedlayer);
    }

}

function checkAllFilters(searchedLoc = []){
    removeAll();
    userSpecifiedlayer.clearLayers();
    data1.length = 0;
    data2.length = 0;
    data3.length = 0;
    data4.length = 0;
    let searchedX = userX;
    let searchedY = userY;
    let searchedLat = userLat;
    let searchedLong = userLong;
    let distanceFilter = document.getElementById('distanceFilter').value;
    const checkboxesFilter = document.querySelectorAll('input[name="typeFilter"]');
    let boolVerifier = [];

    // Check what filters are set and push into a array to manipulate
    for(var i=0; checkboxesFilter[i]; ++i){
        if(checkboxesFilter[i].checked){
            boolVerifier.push(1);
        }
        else{
            boolVerifier.push(0);
        }
    }

    // If null array is passed through, means Get location button is being used.
    if(searchedLoc.length === 0){
        //pass
    }
    else{ // Else means that user has chose to search a custom location, set this location as new Search central location
        searchedX = searchedLoc[0];
        searchedY = searchedLoc[1];
        searchedLat = searchedLoc[2];
        searchedLong = searchedLoc[3];
    }

    for (const [key, value] of Object.entries(dataSet1)) {
        if(value.LatLong == "nil" || value.LatLong == "no matches"){
            console.log("nil value detected");
            continue;
        }

        let latlongarray = value.LatLong.split(",");
        let XYarray = value.XY.split(",");

        // Create the name to search via Google API
        let name = String("NAMEXX").replaceAll(" ","").replaceAll("\n", "");
        let url1 = "https://www.google.com/maps/search/?api=1&query=" + name;
        // Enter the text you want to be displayed on the markers
        let text = "TEXT IN MARKER <br>";
        // Pass all this info into a marker creation function
        markerInsertion(latlongarray,text,XYarray,searchedX,searchedY,distanceFilter,boolVerifier,"IDENTIFIER1");
    }

    for (const [key, value] of Object.entries(dataSet2)) {
        if(value.LatLong == "nil" || value.LatLong == "no matches"){
            console.log("nil value detected");
            continue;
        }

        let latlongarray = value.LatLong.split(",");
        let XYarray = value.XY.split(",");

        // Create the name to search via Google API
        let name = String("NAMEXX").replaceAll(" ","").replaceAll("\n", "");
        let url1 = "https://www.google.com/maps/search/?api=1&query=" + name;
        // Enter the text you want to be displayed on the markers
        let text = "TEXT IN MARKER <br>";
        // Pass all this info into a marker creation function
        markerInsertion(latlongarray,text,XYarray,searchedX,searchedY,distanceFilter,boolVerifier,"IDENTIFIER2");
    }

    for (const [key, value] of Object.entries(dataSet3)) {
        if(value.LatLong == "nil" || value.LatLong == "no matches"){
            console.log("nil value detected");
            continue;
        }

        let latlongarray = value.LatLong.split(",");
        let XYarray = value.XY.split(",");

        // Create the name to search via Google API
        let name = String("NAMEXX").replaceAll(" ","").replaceAll("\n", "");
        let url1 = "https://www.google.com/maps/search/?api=1&query=" + name;
        // Enter the text you want to be displayed on the markers
        let text = "TEXT IN MARKER <br>";
        // Pass all this info into a marker creation function
        markerInsertion(latlongarray,text,XYarray,searchedX,searchedY,distanceFilter,boolVerifier,"IDENTIFIER3");
    }

    // Switch case to add a circle parameter into the layer.
    switch(parseInt(distanceFilter)) {
        case 0:
            break;
        case 2:
            circle_2km = new L.circle([searchedLat, searchedLong], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.0,
                radius: 2000
            }).addTo(userSpecifiedlayer);
            break;
        case 5:
            circle_5km = new L.circle([searchedLat, searchedLong], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.0,
                radius: 5000
            }).addTo(userSpecifiedlayer);
            break;   
        case 10:
            circle_10km = new L.circle([searchedLat, searchedLong], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.0,
                radius: 10000
            }).addTo(userSpecifiedlayer);
            break;
        default:
            alert("No distance filter selected!");
    }
    // Check if marker previous exist before creation
    if(marker){
        map.removeLayer(marker);
    }

    marker = new L.Marker([searchedLat, searchedLong],{icon: greenIcon}, {bounceOnAdd: false}).addTo(map);  
    marker.bindPopup("You are here!");
    // Insert Text popup    
    popup = new L.popup()
    .setLatLng([searchedLat, searchedLong]) 
    .setContent('You are here!')
    .openOn(map);  

    map.setView([searchedLat, searchedLong], 13);  

    generateSearchDetails();

}

function markerInsertion(latlongarray,text,XYarray,searchedX,searchedY,distanceFilter, boolVerifier,type){

    let approxdistance = Math.pow((XYarray[0] - searchedX),2) + Math.pow((XYarray[1] - searchedY),2);
    L.marker([latlongarray[0], latlongarray[1]]).bindPopup(text).addTo(fullInfoLayer);

    switch(parseInt(distanceFilter)) {
        case 0:
            if (type == "IDENTIFIER1" && boolVerifier[0] == 1) {
                L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                data1.push(text);
            }
            else if(type == "IDENTIFIER2" && boolVerifier[1] == 1) {
                L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                data2.push(text);
            }
            else if(type == "IDENTIFIER3" && boolVerifier[2] == 1) {
                L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                data3.push(text);
            }
            else if(type == "IDENTIFIER4" && boolVerifier[3] == 1){
                L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                data4.push(text);
            }
            break;
        case 2:
            if(approxdistance < 4000000){ //2000 = 2km, if i dont sqroot, must be 2km sq, = 4000000
                if (type == "IDENTIFIER1" && boolVerifier[0] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data1.push(text);
                }
                else if(type == "IDENTIFIER2" && boolVerifier[1] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data2.push(text);
                }
                else if(type == "IDENTIFIER3" && boolVerifier[2] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data3.push(text);
                }
                else if(type == "IDENTIFIER4" && boolVerifier[3] == 1){
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data4.push(text);
                }
            }
            break;
        case 5:
            if(approxdistance < 25000000){ //5000 = 5km
                if (type == "IDENTIFIER1" && boolVerifier[0] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data1.push(text);
                }
                else if(type == "IDENTIFIER2" && boolVerifier[1] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data2.push(text);
                }
                else if(type == "IDENTIFIER3" && boolVerifier[2] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data3.push(text);
                }
                else if(type == "IDENTIFIER4" && boolVerifier[3] == 1){
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data4.push(text);
                }
            }
            break;   
        case 10:
            if(approxdistance < 100000000){ //10000 = 10km
                if (type == "IDENTIFIER1" && boolVerifier[0] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data1.push(text);
                }
                else if(type == "IDENTIFIER2" && boolVerifier[1] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data2.push(text);
                }
                else if(type == "IDENTIFIER3" && boolVerifier[2] == 1) {
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data3.push(text);
                }
                else if(type == "IDENTIFIER4" && boolVerifier[3] == 1){
                    L.marker([latlongarray[0], latlongarray[1]],{icon: greenIcon}).bindPopup(text).addTo(userSpecifiedlayer);
                    data4.push(text);
                }
            }
            break;
        default:
            alert("No distance filter selected!");
    }

    
}

function generateSearchNames(){
    let list = document.getElementById("orderedList");
    allNames.forEach((item)=>{
        let li = document.createElement("li");
        li.innerHTML = item;
        li.classList.add("searchResults");
        list.appendChild(li);
    });
}

function generateSearchDetails(){
    let list = document.getElementById("detailsList");
    list.replaceChildren();
    data1.forEach((item)=>{
        let li = document.createElement("li");
        li.innerHTML = item;
        li.classList.add("searchDetails");
        list.appendChild(li);
    });
    data2.forEach((item)=>{
        let li = document.createElement("li");
        li.innerHTML = item;
        li.classList.add("searchDetails");
        list.appendChild(li);
    });
    data3.forEach((item)=>{
        let li = document.createElement("li");
        li.innerHTML = item;
        li.classList.add("searchDetails");
        list.appendChild(li);
    });
    data4.forEach((item)=>{
        let li = document.createElement("li");
        li.innerHTML = item;
        li.classList.add("searchDetails");
        list.appendChild(li);
    });

}


// Process initial user input
function verifyinputs(){
    var user_age = document.getElementById('user_age').value;
    var age_group;
    const radiobutton = document.querySelectorAll('input[name="radio"]');
    const checkboxes = document.querySelectorAll('input[name="typeFilter"]');

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
        //document.getElementById('details_age').innerHTML = "Your age group is: " + age_group;
    }

    let selectedValue;
    for (const rb of radiobutton) {
        if (rb.checked) {
            selectedValue = rb.value;
            break;
        }
    }

    // Pre Select some filters here based on the Selection in the first frame
    if (selectedValue == "Yes"){
        for (const cb of checkboxes) {
            console.log(cb);
            if (!cb.value.includes("XX")){
                cb.checked = "checked";
            }
        }
    }
   
    
    //document.getElementById('details_card').innerHTML = "Card: " + selectedValue;
    document.getElementById('mapdiv').style.display = 'block';
    document.getElementById('sideBar').style.display = 'block';
    document.getElementById('userInput').style.display = 'none'; //hide the selection  box

    // Populate the side bar with all the relevant names which will be displayed when keypress is released on search bar
    for (const [key, value] of Object.entries(dataSet1)) {
        if(value.LatLong == "nil" || value.LatLong == "no matches"){
            console.log("nil value detected");
            continue;
        }

        allNames.push(value["NAME"]);
    }

    for (const [key, value] of Object.entries(dataSet2)) {
        if(value.LatLong == "nil" || value.LatLong == "no matches"){
            console.log("nil value detected");
            continue;
        }

        allNames.push(value["NAME"]);
    }


    // Populate hidden search bar and details
    generateSearchNames();

    return true;
}
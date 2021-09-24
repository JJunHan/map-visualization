//npm install xhr2

function conversionFunc(postal_code) {
    var XMLHttpRequest = require('xhr2');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        //document.getElementById("demo").innerHTML = this.responseText;
        var obj = JSON.parse(xhttp.responseText);
        //obj.results.LATITUDE
        console.log(obj);
        console.log(obj.results[0].LATITUDE);
        }
    };
    xhttp.open("GET", "https://developers.onemap.sg/commonapi/search?searchVal=" + postal_code + "&returnGeom=Y&getAddrDetails=Y&pageNum=1", true);
    xhttp.send();
}

conversionFunc(760707); 

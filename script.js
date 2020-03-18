/* Data points defined as an array of LatLng objects */


map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(43.6532, -79.3832), // Toronto
    zoom: 4
});

postal_code_data = JSON.parse(data_postal_code_boundaries);

confirmed_data = [
    {items: 1, coordinates: [50.782, -122.447]}
];


//Array of Google Map API polygons and markers
let polygons = [];
let markers = [];

//Loop on the postalcodePolygonArray
let polygonCount = 0;
for (let fsa in postal_code_data) {
    if (postal_code_data.hasOwnProperty(fsa)) {
        for (let i = 0; i < postal_code_data[fsa].length; i++) {
            //Add the polygon
            const p = new google.maps.Polygon({
                paths: postal_code_data[fsa][i]['coord'],
                strokeWeight: 0,
                fillColor: '#FF0000',
                fillOpacity: 0.6,
                indexID: polygonCount
            });

            p.setMap(map);


            //Initialize infowindow text
            p.info = new google.maps.InfoWindow({
                /*maxWidth : 250,*/ content: "No Cases Collected"
            });

            //Add polygon to polygon array
            polygons[polygonCount] = p;

            //Runs when user clicks on polygon
            p.addListener('click', item_pressed);


            polygonCount++;
        }
        if (polygonCount > 50){
            break;
        }
    }
}

//Loop on the confirmed cases
for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    const position = new google.maps.LatLng(confirmed_data[i].coordinates[0], confirmed_data[i].coordinates[1]);
    const marker = new google.maps.Marker({
        position: position,
        map: map
    });

    //initialize infowindow text
    marker.info = new google.maps.InfoWindow({
        //maxWidth : 250,
        content: "1 case confirmed"
    });

    //Add polygon to polygon array
    markers[i] = marker;

    //Runs when user clicks on polygon
    marker.addListener('click', item_pressed);
}


function item_pressed(event) {
    //Close all info windows
    for (let i = 0; i < polygons.length; i++) {
        polygons[i].info.close();
    }
    for (let i = 0; i < markers.length; i++) {
        markers[i].info.close();
    }

    //Open polygon infowindow
    this.info.setPosition(event.latLng);
    this.info.open(map, this);
}


let markersOn = true;
let polygonsOn = true;

function setMapOnAll(map, groups) {
    for (var i = 0; i < groups.length; i++) {
        groups[i].setMap(map);
    }
}

function ToggleMarkers() {
    if (markersOn) {
        setMapOnAll(null, markers);
    } else {
        setMapOnAll(map, markers);
    }
    markersOn = !markersOn;
}

function TogglePolygons() {
    if (polygonsOn) {
        setMapOnAll(null, polygons);
    } else {
        setMapOnAll(map, polygons);
    }
    polygonsOn = !polygonsOn;
}
     
      


map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(43.6532, -79.3832), // Toronto
    zoom: 4
});

//data_postal_code_boundaries = '{"B0S": [{"coord": [{"lat": -64.8696, "lng": 44.5928}, {"lat": -65.0615, "lng": 44.4548}, {"lat": -64.945, "lng": 44.5371}, {"lat": -64.8545, "lng": 44.4595}], "area": 5269165351}]}';

postal_code_data = JSON.parse(data_postal_code_boundaries);
in_self_isolation_data = JSON.parse(data_in_self_isolation_sample);
confirmed_data = JSON.parse(data_confirmed);

/*confirmed_data = [
    {items: 1, coordinates: [50.782, -122.447]},
    {items: 3, coordinates: [44.5928, -64.8696 ]}
];*/

//Array of Google Map API polygons and markers
let polygons = [];
let markers = [];

//Loop on the postalcodePolygonArray
let polygonCount = 0;
for (let fsa in postal_code_data) {
    if (postal_code_data.hasOwnProperty(fsa)) {
        const num_in_self_isolation = in_self_isolation_data['fsa'][fsa];

        for (let i = 0; i < postal_code_data[fsa].length; i++) {


            //Add the polygon
            const p = new google.maps.Polygon({
                paths: postal_code_data[fsa][i]['coord'],
                strokeWeight: 0.5,
                fillColor: '#FF0000',
                fillOpacity: num_in_self_isolation / in_self_isolation_data['max'] * 0.5,
                indexID: polygonCount
            });

            p.setMap(map);


            //Initialize infowindow text
            p.info = new google.maps.InfoWindow({
                /*maxWidth : 250,*/ content: "<h3>" + fsa + "</h3><p>" + num_in_self_isolation + " people in self-isolation</p>"
            });

            //Add polygon to polygon array
            polygons[polygonCount] = p;

            //Runs when user clicks on polygon
            p.addListener('click', item_pressed);


            polygonCount++;
        }
    }
}

//Loop on the confirmed cases
for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    const position = new google.maps.LatLng(confirmed_data[i].coord[0], confirmed_data[i].coord[1]);
    const marker = new google.maps.Marker({
        position: position,
        map: map
    });

    //initialize infowindow text
    marker.info = new google.maps.InfoWindow({
        //maxWidth : 250,
        content: "<h3>" + confirmed_data[i].name + "</h3><p>" + confirmed_data[i].cases + " confirmed cases in this area</p>"
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


// Set every item in group to the map specified by map. map can be null
function setMapOnAll(map, groups) {
    for (let i = 0; i < groups.length; i++) {
        groups[i].setMap(map);
    }
}

function toggleMarkers() {
    if (markersOn) {
        setMapOnAll(null, markers);
    } else {
        setMapOnAll(map, markers);
    }
    markersOn = !markersOn;
}

function togglePolygons() {
    if (polygonsOn) {
        setMapOnAll(null, polygons);
    } else {
        setMapOnAll(map, polygons);
    }
    polygonsOn = !polygonsOn;
}
     
      


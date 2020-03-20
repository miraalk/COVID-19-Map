// Create map.
map = new L.map('map').setView([53.9902, -97.8155], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

document.write(data_last_updated);

// Load data files
postal_code_data = JSON.parse(data_postal_code_boundaries);
in_self_isolation_data = JSON.parse(data_in_self_isolation_sample);
high_risk_data = JSON.parse(data_high_risk_sample);
confirmed_data = JSON.parse(data_confirmed);

// Array of Google Map API polygons for self-isolated and high-risk addresse
let selfIsolatedPolygons = L.layerGroup().addTo(map);
let highRiskPolygons = L.layerGroup().addTo(map);

for (let fsa in postal_code_data) {
    if (!postal_code_data.hasOwnProperty(fsa)) continue;
    const num_severe = in_self_isolation_data['fsa'][fsa]['severe'];
    const num_mild = in_self_isolation_data['fsa'][fsa]['mild'];
    const num_high_risk = high_risk_data['fsa'][fsa];

    for (let i = 0; i < postal_code_data[fsa].length; i++) {

        // Add the polygons.
        const selfIsolatedPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
            strokeWeight: 0.05,
            color: '#FF8800',
            fillColor: '#FF8800',
            fillOpacity: (2 * num_severe + num_mild) / in_self_isolation_data['max'] * 0.5,
            //indexID: polygonCount
        });
        const highRiskPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
            strokeWeight: 0.05,
            color: '#FF4400',
            fillColor: '#FF4400',
            fillOpacity: num_high_risk / high_risk_data['max'] * 0.5,
            //indexID: polygonCount
        });


        //Initialize infowindow text
        selfIsolatedPolygon.bindPopup("<h3>" + fsa + "</h3><p>"
            + num_severe + " with severe symptoms / " + num_mild + " with mild symptoms</p>"
            + (num_severe + num_mild) + " total people with symptoms</p>");

        highRiskPolygon.bindPopup("<h3>" + fsa + "</h3><p>" + num_high_risk + " people at high risk</p>");

        // Add polygons to polygon arrays and add click listeners.
        selfIsolatedPolygon.addTo(selfIsolatedPolygons);
        highRiskPolygon.addTo(highRiskPolygons);
        //selfIsolatedPolygon.addListener('click', item_pressed);
        //highRiskPolygon.addListener('click', item_pressed);

    }
}


// Array of Leaflet API markers for confirmed cases.
let confirmedCircles = L.layerGroup().addTo(map);

for (let i = 0; i < confirmed_data.length; i++) {
    //Add the marker
    if (confirmed_data[i].coord[0] != "N/A") {
        var rad = 10;
        if (confirmed_data[i].cases < 10) {
            rad = 5;
        } else {
            rad = 10 + confirmed_data[i].cases / 5;
        }

        const circle = new L.circleMarker(confirmed_data[i].coord, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: rad
        });

        //initialize infowindow text
        circle.bindPopup("<h3>" + confirmed_data[i].name + "</h3><p>" + confirmed_data[i].cases + " confirmed cases in this area</p>");

        //Add circle to circle array
        circle.addTo(confirmedCircles);
    }
}

// Enable marker layer
map.removeLayer(selfIsolatedPolygons);
map.removeLayer(highRiskPolygons);

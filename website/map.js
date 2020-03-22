// 1. Load config.json file and print to console
const request = new XMLHttpRequest();
request.open("GET", "config.json", false);
request.send(null);
// config = request.responseText;
const config = JSON.parse(request.responseText);

// 2. Create map.
const map = new L.map('map').setView([43.6532, -79.3832], 10);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(map);


instruction_page = document.getElementById("myModal3");
instruction_page.style.display = "block";

const postal_code_data = JSON.parse(data_postal_code_boundaries);
let confirmedCircles, selfIsolatedPolygons, highRiskPolygons, selfIso_legend, highRisk_legend;
let form_data_obj, confirmed_data;

function displayMaps() {
    document.getElementById("update_time").innerHTML = form_data_obj['time'];

    // Array of Google Map API polygons for self-isolated and high-risk addresse
    selfIsolatedPolygons = L.layerGroup();
    highRiskPolygons = L.layerGroup();

    for (let fsa in postal_code_data) {
        if (!postal_code_data.hasOwnProperty(fsa)) continue;

        let num_potential = 0;
        let num_high_risk = 0;
        if (fsa in form_data_obj['fsa']) {
            num_potential = form_data_obj['fsa'][fsa]['pot'];
            num_high_risk = form_data_obj['fsa'][fsa]['risk'];
        }

        const colour_selfIso = getColor_selfIso(num_potential);
        const colour_highRisk = getColor_highRisk(num_high_risk);

        let opacity_selfIso = 0.4;
        let opacity_highRisk = 0.4;

    let msg_selfIso = "<h3>" + fsa + "</h3><p>Received reports from " + num_potential + " potential cases</p>";
    let msg_highRisk = "<h3>" + fsa + "</h3><p>Received reports from " + num_high_risk + " vulnerable individuals</p>";

    if (num_potential === 0) {
        opacity_selfIso = 0;
        msg_selfIso = "<h3>" + fsa + "</h3><p>We haven't had enough form responses in this region yet.</p>";
    }

    if (num_high_risk === 0) {
        opacity_highRisk = 0;
        msg_highRisk = "<h3>" + fsa + "</h3><p>We haven't had enough form responses in this region yet.</p>";
    }

        for (let i = 0; i < postal_code_data[fsa].length; i++) {

            // Add the polygons.
            const selfIsolatedPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                fillColor: colour_selfIso,
                fillOpacity: opacity_selfIso,
            });
            const highRiskPolygon = new L.Polygon(postal_code_data[fsa][i]['coord'], {
                weight: 0.9,
                color: 'gray',
                dashArray: '3',
                fillColor: colour_highRisk,
                fillOpacity: opacity_highRisk,
            });


        //Initialize infowindow text
        selfIsolatedPolygon.bindPopup(msg_selfIso);
        highRiskPolygon.bindPopup(msg_highRisk);

            // Add polygons to polygon arrays and add click listeners.
            selfIsolatedPolygon.addTo(selfIsolatedPolygons);
            highRiskPolygon.addTo(highRiskPolygons);
        }
    }

    function getColor_selfIso(cases) {
        return cases > 1000 ? '#800026' :
            cases > 500 ? '#BD0026' :
                cases > 200 ? '#E31A1C' :
                    cases > 100 ? '#FC4E2A' :
                        cases > 50 ? '#FD8D3C' :
                            cases > 20 ? '#FEB24C' :
                                cases > 10 ? '#FED976' :
                                    '#FFEDA0';
    }

    function getColor_highRisk(cases) {
        return cases > 1000 ? '#7a0177' :
            cases > 500 ? '#ae017e' :
                cases > 200 ? '#dd3497' :
                    cases > 100 ? '#f768a1' :
                        cases > 50 ? '#fa9fb5' :
                            cases > 20 ? '#fcc5c0' :
                                cases > 10 ? '#fde0dd' :
                                    '#fff7f3';
    }

    //Legend for self-isolated cases
    selfIso_legend = L.control({position: 'bottomright'});

    selfIso_legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor_selfIso(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    //Legend for high risk cases
    highRisk_legend = L.control({position: 'bottomright'});

    highRisk_legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor_highRisk(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Array of Leaflet API markers for confirmed cases.
    confirmedCircles = L.layerGroup();

    const max_rad = 80;
    let confirmed_cases_data = confirmed_data['confirmed_cases'];
    for (let i = 0; i < confirmed_cases_data.length; i++) {
        //Add the marker
        if (confirmed_cases_data[i]['coord'][0] !== "N/A") {
            let rad;
            if (confirmed_cases_data[i]['cases'] < 10) {
                rad = 5;
            } else {
                rad = 5 + confirmed_cases_data[i]['cases'] / confirmed_data['max_cases'] * max_rad;
            }

            const circle = new L.circleMarker(confirmed_cases_data[i]['coord'], {
                weight: 0,
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: rad
            });

            //initialize infowindow text
            circle.bindPopup("<h3>" + confirmed_cases_data[i].name + "</h3><p>" + confirmed_cases_data[i]['cases'] + " confirmed cases in this area</p>");

            //Add circle to circle array
            circle.addTo(confirmedCircles);
        }
    }

    // Enable marker layer
    map.addLayer(confirmedCircles);
}

function getGSDownloadURL(bucket_reference, file) {
    return bucket_reference.child(file).getDownloadURL();
}

function bucketRequest(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    return JSON.parse(xhr.responseText);
}

function getGSBucketReference(bucket) {
    try {
        const storage = firebase.storage();
        return storage.refFromURL(bucket);
    } catch (error) {
        console.log("Couldn't load firebase.storage. Please use 'firebase serve' to allow Google Cloud Storage Connection");
    }
}

async function obtainAndDisplayMaps() {
    const bucket_reference = getGSBucketReference(config['bucket']);
    form_data_obj = bucketRequest(await getGSDownloadURL(bucket_reference, 'form_data.json'));
    confirmed_data = bucketRequest(await getGSDownloadURL(bucket_reference, 'confirmed_data.json'));

    displayMaps();
}

// Calls the function
obtainAndDisplayMaps();


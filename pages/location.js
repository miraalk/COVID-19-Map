// Try HTML5 geolocation. // Else Browser doesn't support Geolocation or permission not given.
var abc;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        latit = position.coords.latitude;
        longit = position.coords.longitude;

        // this is just a marker placed in that position
        abc = L.circleMarker([position.coords.latitude, position.coords.longitude], {
            color: 'white',
            fillColor: 'blue',
            fillOpacity: 1,
            radius: 5,
            weight: 2
        }).addTo(map);
        abc.bindPopup("<h3>Current Location</h3>");
        // move the map to have the location in its center
        map.setView(new L.LatLng(latit, longit), 10);
    });
}
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import attendance from './attendance';
import deleteComment from './deleteComment';

// obtener valores de la base de datos
const lat = document.querySelector('#lat').value ||  6.2476;
const lng = document.querySelector('#lng').value ||  -75.5658;
const address  = document.querySelector('#address').value || '';
const map = L.map('map').setView([lat, lng], 15);
let markers = new L.FeatureGroup().addTo(map);
let marker;
// Utilizar el provider y GeoCoder
const geocodeService = L.esri.Geocoding.geocodeService();

// Colocar el Pin en Edición
if(lat && lng ){
    // agregar el pin
    marker = new L.marker([lat, lng], {
        draggable : true,
        autoPan: true
    })
    .addTo(map)
    .bindPopup(address)
    .openPopup();

    // asignar al contenedor markers
    markers.addLayer(marker);

    // detectar movimiento del marker
    marker.on('moveend', function(e) {
        marker = e.target;
        const position = marker.getLatLng();
        map.panTo(new L.LatLng(position.lat, position.lng) );

        // reverse geocoding, cuando el usuario reubica el pin
        geocodeService.reverse().latlng(position, 15 ).run(function(error, result) {

            fillInputs(result);
        
            // asigna los valores al popup del marker
            marker.bindPopup(result.address.LongLabel);
        });
    })
}

document.addEventListener('DOMContentLoaded', () => {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // look for address
    const searchForm = document.querySelector('#searchform');
    searchForm.addEventListener('input', searchAddress);
})

function searchAddress(e) {
    if (e.target.value.length > 8) {
        // If there is a previous pin, clean it
        markers.clearLayers();

        const provider = new OpenStreetMapProvider();

        provider.search({ query: e.target.value }).then((result) => {
            // Filtrar resultados para incluir solo direcciones en Medellín
            const medellinResults = result.filter(item => item.label.includes("Medellín"));
            //console.log(`Búsqueda: ${e.target.value} - Resultados en Medellín:`, medellinResults);

            if (medellinResults.length > 0) {
                // Utilizar el primer resultado válido para mostrar en el mapa
                const medellinResult = medellinResults[0];

                geocodeService.reverse().latlng(medellinResult.bounds[0], 15 ).run(function(error, res) {
                    fillInputs(res);

                    //console.log(res);
                    // show map
                    map.setView(medellinResult.bounds[0], 15);

                    //console.log(medellinResult.bounds[0]);

                    // add the pin
                    marker = new L.marker(medellinResult.bounds[0], {
                        draggable: true,
                        autoPan: true
                    })
                    .addTo(map)
                    .bindPopup(medellinResult.label)
                    .openPopup();

                    map.panTo(L.latLng(medellinResult.bounds[0]));

                    // assign to markers container
                    markers.addLayer(marker);

                    // detect marker movement
                    marker.on('moveend', function(e) {
                        marker = e.target;
                        const position = marker.getLatLng();
                        map.panTo(new L.LatLng(position.lat, position.lng));

                        // reverse geocoding, when the user relocates the pin
                        geocodeService.reverse().latlng(position, 15 ).run(function(error, result) {
                            fillInputs(result);
                        
                            // assigns the values to the marker popup
                            marker.bindPopup(result.address.LongLabel).openPopup();;
                        });
                    })
                })
            }
        });
    }
}

function fillInputs(result) {
    document.querySelector('#address').value = result.address.Address || '';
    document.querySelector('#city').value = result.address.City || '';
    document.querySelector('#state').value = result.address.Region || '';
    document.querySelector('#country').value = result.address.CountryCode || '';
    document.querySelector('#lat').value = result.latlng.lat || '';
    document.querySelector('#lng').value = result.latlng.lng || '';
}
document.addEventListener('DOMContentLoaded', () => {
    if(document.querySelector('#show-event')) {
        showMap();
    }
})


function showMap() {

    // obtener los valores
    const lat = document.querySelector('#lat').value,
          lng = document.querySelector('#lng').value,
          address = document.querySelector('#address').value;

    var map = L.map('show-event').setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    L.marker([lat, lng]).addTo(map)
        .bindPopup(address)
        .openPopup();
}
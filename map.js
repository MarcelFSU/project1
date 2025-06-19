const map = L.map('map').setView([50.980, 11.330], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende'
}).addTo(map);

fetch('punkte.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || "Ohne Namen";
        layer.bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(map);
  });

fetch('weimar_radwege.geojson')
  .then(response => response.json())
  .then(data => {
    console.log("GeoJSON geladen:", data);
    L.geoJSON(data, {
      style: { color: 'blue', weight: 4 },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      }
    }).addTo(map);
  })
  .catch(err => console.error("Fehler beim Laden:", err));

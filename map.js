const map = L.map('map').setView([50.980, 11.330], 13);

// Hintergrundkarte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende'
}).addTo(map);

// Layer-Gruppen definieren
const punktLayer = L.layerGroup();
const radwegeLayer = L.layerGroup();

// Punkte laden
fetch('punkte.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || "Ohne Namen";
        layer.bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(punktLayer);
  });

// Radwege laden
fetch('weimar_radwege.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: 'blue', weight: 3 },
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      }
    }).addTo(radwegeLayer);
  });

// Beide Layer zur Karte hinzufügen
punktLayer.addTo(map);
radwegeLayer.addTo(map);

// Layer-Kontrollmenü hinzufügen
const overlayMaps = {
  "Punkte": punktLayer,
  "Radwege": radwegeLayer
};

L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

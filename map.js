const map = L.map('map').setView([50.980, 11.330], 13);

// Hintergrundkarte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende'
}).addTo(map);

// Layergruppen anlegen
const punkteLayer = L.layerGroup().addTo(map);
const alltagLayer = L.layerGroup().addTo(map);
const tourLayer = L.layerGroup().addTo(map);

// Punkte laden
fetch('punkte.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || "Ohne Namen";
        layer.bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(punkteLayer);
  });

// Radwege gefiltert laden
fetch('weimar_radwege.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const props = feature.properties;
      const route = L.geoJSON(feature, {
        style: {
          color: props.RVK === "Alltagstaugliche Radhauptroute" ? 'blue' : 'green',
          weight: 3
        },
        onEachFeature: (feature, layer) => {
          const info = feature.properties.strassenna || 'Unbekannte Straße';
          layer.bindPopup(info);
        }
      });

      if (props.RVK === "Alltagstaugliche Radhauptroute") {
        route.addTo(alltagLayer);
      } else {
        route.addTo(tourLayer);
      }
    });
  });

// Checkbox-Elemente selektieren
const togglePunkte = document.getElementById('togglePunkte');
const toggleAlltag = document.getElementById('toggleAlltag');
const toggleTour = document.getElementById('toggleTour');

// Event-Listener für Checkboxen
togglePunkte.addEventListener('change', e => {
  if (e.target.checked) {
    map.addLayer(punkteLayer);
  } else {
    map.removeLayer(punkteLayer);
  }
});

toggleAlltag.addEventListener('change', e => {
  if (e.target.checked) {
    map.addLayer(alltagLayer);
  } else {
    map.removeLayer(alltagLayer);
  }
});

toggleTour.addEventListener('change', e => {
  if (e.target.checked) {
    map.addLayer(tourLayer);
  } else {
    map.removeLayer(tourLayer);
  }
});

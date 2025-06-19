const map = L.map('map').setView([50.980, 11.330], 13);

// Hintergrundkarte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende'
}).addTo(map);

// Layergruppen
const punkteLayer = L.layerGroup().addTo(map);
const alltagLayer = L.layerGroup();
const tourLayer = L.layerGroup();

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


// Radwege laden
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

    // Alle Radwege in radwegeLayer hinzufügen (optional)
    alltagLayer.addTo(radwegeLayer);
    tourLayer.addTo(radwegeLayer);
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

// Alternative Layerkontrolle (falls du einzelne Radwege ein/aus schalten willst)
L.control.layers(null, {
  "Punkte": punkteLayer,
  "Radrouten – Alltag": alltagLayer,
  "Radrouten – Sonstige": tourLayer
}, { collapsed: false }).addTo(map);

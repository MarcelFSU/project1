const map = L.map('map').setView([50.980, 11.330], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende, © GDI-Th, dl-de/by-2-0'
}).addTo(map);

const punktLayer = L.layerGroup().addTo(map);
const alltagLayer = L.layerGroup().addTo(map);
const tourLayer = L.layerGroup().addTo(map);

// Punkte laden
fetch('punkte.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "red",
          color: "red",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || "Ohne Namen";
        layer.bindPopup(`<strong>${name}</strong>`);
      }
    }).addTo(punktLayer);
  });




// Radwege laden und nach Typ sortieren
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

// Layer-Kontrolle
L.control.layers(null, {
  "Punkte": punktLayer,
  "Radrouten – Alltag": alltagLayer,
  "Radrouten – Sonstige": tourLayer
}, { collapsed: false }).addTo(map);

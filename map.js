const map = L.map('map', {
  minZoom: 10,
  maxZoom: 25
}).setView([50.980, 11.330], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende, © GDI-Th, dl-de/by-2-0'
}).addTo(map);

const punktLayer = L.layerGroup().addTo(map);
const themenLayer = L.layerGroup().addTo(map);
const tourLayer = L.layerGroup().addTo(map);

// Punkte laden
fetch('knotenpunkt.geojson')
  .then(res => res.json())
  .then(data => {
    const gruppe = L.layerGroup();

    data.features.forEach(feature => {
      const coords = feature.geometry.coordinates;
      const latlng = [coords[1], coords[0]];
      const nummer = feature.properties.nummer || feature.properties.num || "–";

      // CircleMarker mit lila Füllung
      const circle = L.circleMarker(latlng, {
        radius: 8,
        fillColor: "purple",
        color: "purple",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      // DivIcon mit weißer Zahl
      const numberIcon = L.marker(latlng, {
        icon: L.divIcon({
          className: 'nummer-icon',
          html: `<div style="
            color: white; 
            font-weight: bold; 
            font-size: 12px; 
            line-height: 16px; 
            text-align: center;
            width: 16px; 
            height: 16px;
            user-select:none;
            ">
              ${nummer}
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8] // Mittelpunkt
        }),
        interactive: false // damit Klick auf Kreis klappt, nicht auf Text
      });

      // Popup an Circle binden
      circle.bindPopup(`<strong>${feature.properties.name || "Ohne Namen"}</strong>`);

      gruppe.addLayer(circle);
      gruppe.addLayer(numberIcon);
    });

    gruppe.addTo(punktLayer);
  });





// Radwege laden und nach Typ sortieren
fetch('weimar_radwege.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const props = feature.properties;
      const route = L.geoJSON(feature, {
        style: {
          color: props.netztyp === "Themenroute" ? 'orange' : 'red',
          weight: 3
        },
        onEachFeature: (feature, layer) => {
          const info = feature.properties.strassenna || 'Unbekannte Straße';
          layer.bindPopup(info);
        }
      });

      if (props.netztyp === "Themenroute") {
        route.addTo(themenLayer);
      } else {
        route.addTo(tourLayer);
      }
    });
  });

// Layer-Kontrolle
L.control.layers(null, {
  "Punkte": punktLayer,
  "Radrouten – Themen": themenLayer,
  "Radrouten – Sonstige": tourLayer
}, { collapsed: false }).addTo(map);

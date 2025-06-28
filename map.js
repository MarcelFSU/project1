const map = L.map('map', {
  preferCanvas: false,
  minZoom: 10,
  maxZoom: 18
}).setView([50.980, 11.330], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap-Mitwirkende, © GDI-Th, dl-de/by-2-0'
}).addTo(map);

const tourLayer = L.layerGroup().addTo(map);
const themenLayer = L.layerGroup().addTo(map);
const punktLayer = L.layerGroup([], { pane: 'markerPane' }).addTo(map);

// Punkte laden
fetch('knotenpunkt.geojson')
  .then(res => res.json())
  .then(data => {
    const gruppe = L.layerGroup();

    data.features.forEach(feature => {
      let coords;

      // Unterstützt Point und MultiPoint
      if (
        feature.geometry &&
        (feature.geometry.type === "Point" || feature.geometry.type === "MultiPoint") &&
        Array.isArray(feature.geometry.coordinates)
      ) {
        if (feature.geometry.type === "Point") {
          coords = feature.geometry.coordinates;
        } else if (
          feature.geometry.type === "MultiPoint" &&
          feature.geometry.coordinates.length > 0
        ) {
          coords = feature.geometry.coordinates[0]; // ersten Punkt verwenden
        }

        if (coords && coords.length >= 2) {
          const [lon, lat] = coords;
          const latlng = [lat, lon];
          const nummer = feature.properties.nummer ?? feature.properties.Nummer ?? feature.properties.num ?? "–";

          // CircleMarker
          const circle = L.circleMarker(latlng, {
            radius: 10,
            fillColor: "#85378d",
            color: "white",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          });

          // DivIcon mit Zahl
          const numberIcon = L.marker(latlng, {
            icon: L.divIcon({
              className: 'nummer-icon',
              html: `<div style="
                color: white;
                font-weight: bold;
                font-size: 12px;
                line-height: 18px;
                text-align: center;
                width: 20px;
                height: 20px;
                user-select: none;
              ">${nummer}</div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            }),
            interactive: false
          });

          // Popup mit Nummer + Koordinaten
          circle.bindPopup(`<strong>Knotenpunkt ${nummer}</strong><br/>
            Koordinaten: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);

          gruppe.addLayer(circle);
          gruppe.addLayer(numberIcon);
        }
      } else {
        console.warn("Ungültiges Feature übersprungen:", feature);
      }
    });

    gruppe.addTo(punktLayer);
  });



// Radwege laden und nach Typ sortieren
fetch('netz.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const props = feature.properties;

      // 1. Außen
      const route = L.geoJSON(feature, {
  style: {
    color: props.netztyp === "Themenroute" ? '#ffa200' : '#85378d',
    weight: 4, // wähle nach Geschmack, z. B. 4 oder 5
    lineJoin: 'round',
    lineCap: 'round',
    opacity: 1
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



fetch('verwaltungsgrenze.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      // Die Geometrie vom Polygon
      const geom = feature.geometry;

      if (geom.type === "Polygon") {
        // Für Polygone: outer ring (erste Linearring)
        const coords = geom.coordinates[0]; // Array von [lng, lat]

        // Leaflet erwartet [lat, lng], also drehen wir die Koordinaten um
        const latlngs = coords.map(c => [c[1], c[0]]);

        // Polyline erzeugen (nur der Außenring)
        L.polyline(latlngs, {
          color: 'black',
          weight: 1,
          dashArray: '10, 10'
        }).addTo(map);

      } else if (geom.type === "MultiPolygon") {
        // Falls MultiPolygon, alle Polygonringe abarbeiten
        geom.coordinates.forEach(polygon => {
          const coords = polygon[0];
          const latlngs = coords.map(c => [c[1], c[0]]);

          L.polyline(latlngs, {
            color: 'black',
            weight: 1,
            dashArray: '10, 10'
          }).addTo(map);
        });
      }
    });
  });





// Layer-Kontrolle
L.control.layers(null, {
  '<span style="background: #85378d; width: 12px; height: 12px; display: inline-block; margin-right: 6px; border-radius: 50%;"></span>Knotenpunkt': punktLayer,
  '<span style="background: #ffe601; width: 12px; height: 12px; display: inline-block; margin-right: 6px;"></span>Themenroute': themenLayer,
  '<span style="background: #efa687; width: 12px; height: 12px; display: inline-block; margin-right: 6px;"></span>Sonstige Radroute': tourLayer
},{
  collapsed: false,
  position: 'bottomright'
}).addTo(map);


// Scale Bar
L.control.scale({
  position: 'bottomleft',  // Position der Scale (kann auch 'bottomright', 'topleft', 'topright' sein)
  maxWidth: 200,           // Maximale Breite in Pixel
  metric: true,            // metrische Einheiten anzeigen (Meter/Kilometer)
  imperial: false,         // keine imperialen Einheiten (Fuß/Meilen)
  updateWhenIdle: false    // true = skaliert nur beim Beenden des Zooms, false = dynamisch während Zoomen
}).addTo(map);


punktLayer.addTo(map);

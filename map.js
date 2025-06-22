const map = L.map('map', {
  minZoom: 10,
  maxZoom: 25
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
          const nummer = feature.properties.nummer || feature.properties.num || "–";

          // CircleMarker
          const circle = L.circleMarker(latlng, {
            radius: 10,
            fillColor: "purple",
            color: "purple",
            weight: 1,
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

          circle.bindPopup(`<strong>${feature.properties.name || "Ohne Namen"}</strong>`);

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
  '<span style="background: purple; width: 12px; height: 12px; display: inline-block; margin-right: 6px; border-radius: 50%;"></span>Knotenpunkte': punktLayer,
  '<span style="background: orange; width: 12px; height: 12px; display: inline-block; margin-right: 6px;"></span>Themenroute': themenLayer,
  '<span style="background: red; width: 12px; height: 12px; display: inline-block; margin-right: 6px;"></span>Sonstige Radroute': tourLayer
},{
  collapsed: false,
  position: 'bottomright'
}).addTo(map);


punktLayer.addTo(map);

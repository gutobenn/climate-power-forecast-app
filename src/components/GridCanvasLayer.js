import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper to calculate bounds for 11x11km cell centered at lat/lon
function getCellBounds(lat, lon) {
  const halfSideKm = 1.1; // half of 11km
  const latOffset = halfSideKm / 111;
  const lonOffset = halfSideKm / (111 * Math.cos(lat * Math.PI / 180));
  return [
    [lat - latOffset, lon - lonOffset],
    [lat + latOffset, lon + lonOffset]
  ];
}

function getColorInterpolated(normalizedValue) {
  // Interpolate from light red (#ffd6d6) to dark red (#cc0000)
  const start = [255, 214, 214]; // #ffd6d6
  const end = [204, 0, 0];       // #cc0000
  const r = Math.round(start[0] + (end[0] - start[0]) * normalizedValue);
  const g = Math.round(start[1] + (end[1] - start[1]) * normalizedValue);
  const b = Math.round(start[2] + (end[2] - start[2]) * normalizedValue);
  return `rgb(${r},${g},${b})`;
}

// transparent blue
function getColor(normalizedValue) {
  const start = [0, 0, 255];
  const end = [0, 0, 255];
  const r = Math.round(start[0] + (end[0] - start[0]) * normalizedValue);
  const g = Math.round(start[1] + (end[1] - start[1]) * normalizedValue);
  const b = Math.round(start[2] + (end[2] - start[2]) * normalizedValue);
  return `rgba(${r},${g},${b}, ${normalizedValue})`;
}

const GridCanvasLayer = ({ energyData }) => {
  const map = useMap();
  const layerRef = useRef(null);

  // Legend rendering
  const legendSteps = 6;
  const legendColors = Array.from({ length: legendSteps + 1 }, (_, i) => getColor(i / legendSteps));

  useEffect(() => {
    if (!map.getPane('customGridPane')) {
      map.createPane('customGridPane');
      map.getPane('customGridPane').style.zIndex = 400; // or another value below markerPane
    }
    if (!energyData || energyData.length === 0) return;

    // Remove previous layer if exists
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    // Find min/max for normalization
    const values = energyData.map(point => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;

    let gridLayer = L.GridLayer.extend({
      options: {
        pane: 'customGridPane',
        zIndex: 400,
      },
      createTile: function(coords) {
        const tile = L.DomUtil.create('canvas', 'leaflet-tile');
        const size = this.getTileSize();
        tile.width = size.x;
        tile.height = size.y;
        const ctx = tile.getContext('2d');

        // Get tile bounds in lat/lng
        const nwPoint = coords.scaleBy(size);
        const sePoint = nwPoint.add(size);
        const nw = map.unproject(nwPoint, coords.z);
        const se = map.unproject(sePoint, coords.z);
        const latMin = Math.min(nw.lat, se.lat);
        const latMax = Math.max(nw.lat, se.lat);
        const lngMin = Math.min(nw.lng, se.lng);
        const lngMax = Math.max(nw.lng, se.lng);

        let drawn = 0;
        // Draw each cell that falls within this tile
        energyData.forEach(point => {
          // Calculate the four corners of the cell
          const halfSideKm = 11; // half of 11km
          const latOffset = halfSideKm / 111;
          const lonOffset = halfSideKm / (111 * Math.cos(point.lat * Math.PI / 180));
          const sw = [point.lat - latOffset, point.lon - lonOffset];
          const se = [point.lat - latOffset, point.lon + lonOffset];
          const ne = [point.lat + latOffset, point.lon + lonOffset];
          const nw = [point.lat + latOffset, point.lon - lonOffset];

          // Only draw if cell is in tile bounds
          if (
            ne[0] >= latMin && sw[0] <= latMax &&
            ne[1] >= lngMin && sw[1] <= lngMax
          ) {
            // Project each corner to pixel space
            const swPx = map.project(L.latLng(sw[0], sw[1]), coords.z).subtract(nwPoint);
            const sePx = map.project(L.latLng(se[0], se[1]), coords.z).subtract(nwPoint);
            const nePx = map.project(L.latLng(ne[0], ne[1]), coords.z).subtract(nwPoint);
            const nwPx = map.project(L.latLng(nw[0], nw[1]), coords.z).subtract(nwPoint);

            // Draw polygon
            ctx.beginPath();
            ctx.moveTo(swPx.x, swPx.y);
            ctx.lineTo(sePx.x, sePx.y);
            ctx.lineTo(nePx.x, nePx.y);
            ctx.lineTo(nwPx.x, nwPx.y);
            ctx.closePath();
            const normalized = (point.value - minValue) / valueRange;
            ctx.fillStyle = getColor(normalized);
            ctx.globalAlpha = 0.4;
            ctx.fill();
            drawn++;
          }
        });
        //console.log('Tile', coords, 'drawn cells:', drawn);
        ctx.globalAlpha = 1.0;
        return tile;
      }
    });
    const layer = new gridLayer({ pane: 'customGridPane', zIndex: 400 });
    layer.addTo(map);
    layerRef.current = layer;

    // Redraw on move/zoom
    const redraw = () => layer.redraw();
    map.on('moveend zoomend resize', redraw);

    return () => {
      map.off('moveend zoomend resize', redraw);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [energyData, map]);

  useEffect(() => {
    if (map.createPane) {
      if (!map.getPane('labels')) {
        map.createPane('labels');
        map.getPane('labels').style.zIndex = 650;
        map.getPane('labels').style.pointerEvents = 'none';
      }
    }
  }, [map]);

  return (
    <>
      {/* Color legend */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        background: 'rgba(255,255,255,0.85)',
        padding: '10px 16px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 2000,
        fontSize: 13
      }}>
        <div style={{ marginBottom: 4, fontWeight: 600 }}>Potential Energy</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {legendColors.map((color, i) => (
            <div key={i} style={{ width: 28, height: 14, background: color, border: '1px solid #ccc', borderRadius: 2 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ color: '#888', fontSize: 10 }}>0 kWh</span>
          <span style={{ color: '#888', fontSize: 10 }}>6000 kWh</span>
        </div>
      </div>
    </>
  );
};

export default GridCanvasLayer; 
import { useEffect, useState } from 'react';
import { createLayerComponent } from '@react-leaflet/core';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';

// OpenFreeMap: free vector tiles, no API key (https://openfreemap.org).
// Positron is the light style that CARTO's light_nolabels/light_only_labels
// raster tiles were made from; CARTO tiles now need an API key.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> ' +
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">&copy; OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';

/**
 * Loads the Positron style once and splits it in two: the base map without
 * text, and the text only. The text goes in the "labels" pane, above the data.
 */
export function usePositronStyles() {
  const [styles, setStyles] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(STYLE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`OpenFreeMap style: HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((style) => {
        if (cancelled) {
          return;
        }
        setStyles({
          base: { ...style, layers: style.layers.filter((layer) => layer.type !== 'symbol') },
          labels: { ...style, layers: style.layers.filter((layer) => layer.type === 'symbol') },
        });
      })
      .catch((error) => console.error('Error loading the base map style:', error));

    return () => {
      cancelled = true;
    };
  }, []);

  return styles;
}

/** A react-leaflet layer that draws a MapLibre style. */
export const MapLibreLayer = createLayerComponent(function createMapLibreLayer({ style, pane, attribution }, context) {
  const instance = maplibreGL({
    style,
    pane,
    attributionControl: attribution ? { customAttribution: attribution } : false,
  });
  return { instance, context };
});

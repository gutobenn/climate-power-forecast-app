'use client';

import { MapContainer, TileLayer, LayersControl, useMapEvents, Marker, ImageOverlay, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { getEnergyData } from '@/services/energyData';
import InfoDialog from './InfoDialog';

// Click handler component
const MapClickHandler = ({ onMapClick }) => {
  const clickTimeoutRef = useRef(null);
  const isDoubleClick = useRef(false);

  useMapEvents({
    click: (e) => {
      // Clear any existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      // Set a new timeout
      clickTimeoutRef.current = setTimeout(() => {
        if (!isDoubleClick.current) {
          onMapClick(e.latlng);
        }
        isDoubleClick.current = false;
      }, 250); // Wait 250ms to check for double click
    },
    dblclick: () => {
      isDoubleClick.current = true;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    }
  });
  return null;
};

const Map = forwardRef(({ selectedYear, selectedEnergyType, selectedPin, onPinChange }, ref) => {
  const heatmapLayerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [energyData, setEnergyData] = useState(null);
  const [useHeatmap, setUseHeatmap] = useState(false);  // Toggle between heatmap and image overlay

  // Expose the map instance through the forwarded ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        getMap: () => mapInstanceRef.current
      };
    }
  }, [ref]);

  useEffect(() => {
    // Fix Leaflet's icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Load energy data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEnergyData(selectedEnergyType, selectedYear);
        setEnergyData(data);
      } catch (error) {
        console.error('Error loading energy data:', error);
      }
    };
    loadData();
  }, [selectedYear, selectedEnergyType]);

  // Update heatmap when energy data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !energyData || !useHeatmap) return;

    // Remove existing heatmap layer if it exists
    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.remove();
    }

    // Convert meshgrid data to points for heatmap
    const points = [];
    const { lats, lons, values } = energyData;
    
    for (let i = 0; i < lats.length; i++) {
      for (let j = 0; j < lats[i].length; j++) {
        if (values[i][j] > 0) {
          points.push([lats[i][j], lons[i][j], values[i][j]]);
        }
      }
    }

    // Create and add new heatmap layer
    heatmapLayerRef.current = L.heatLayer(points, {
      radius: 20,    // Reduced radius for sharper boundaries
      blur: 10,      // Reduced blur for more defined areas
      maxZoom: 10,
      max: 400,
      minOpacity: 0.4,
      gradient: {
        0.0: '#ffffcc',  // Light yellow
        0.2: '#ffeda0',  // Yellow
        0.4: '#fed976',  // Orange-yellow
        0.6: '#feb24c',  // Light orange
        0.7: '#fd8d3c',  // Orange
        0.8: '#fc4e2a',  // Red-orange
        0.9: '#e31a1c',  // Red
        1.0: '#b10026'   // Dark red
      }
    }).addTo(mapInstanceRef.current);

  }, [energyData, useHeatmap]);

  // Initialize dialog state from URL
  useEffect(() => {
    if (selectedPin?.isOpen) {
      setDialogOpen(true);
    }
  }, []);

  // Function to convert lat/lng to screen coordinates
  const updateDialogPosition = (lat, lng) => {
    if (mapInstanceRef.current) {
      const point = mapInstanceRef.current.latLngToContainerPoint([lat, lng]);
      setDialogPosition({
        x: point.x,
        y: point.y
      });
    }
  };

  // Update dialog position when pin changes
  useEffect(() => {
    if (selectedPin) {
      updateDialogPosition(selectedPin.lat, selectedPin.lng);
    }
  }, [selectedPin]);

  // Add move event listener when map is ready
  useEffect(() => {
    if (mapInstanceRef.current && selectedPin) {
      const map = mapInstanceRef.current;
      const moveHandler = () => {
        updateDialogPosition(selectedPin.lat, selectedPin.lng);
      };
      
      map.on('move', moveHandler);
      
      // Cleanup
      return () => {
        map.off('move', moveHandler);
      };
    }
  }, [selectedPin, mapInstanceRef.current]);

  const handleMapClick = (latlng) => {
    // Generate some mock data for the clicked location
    const mockData = {
      wind: Math.floor(Math.random() * 1000),
      solar: Math.floor(Math.random() * 1500),
      hydro: Math.floor(Math.random() * 800),
      bestType: ['wind', 'solar', 'hydro'][Math.floor(Math.random() * 3)]
    };
    
    // Update pin with new location
    onPinChange({
      lat: latlng.lat,
      lng: latlng.lng,
      isOpen: false,
      data: mockData
    });

    // Add a small delay before opening the dialog
    setTimeout(() => {
      onPinChange({
        lat: latlng.lat,
        lng: latlng.lng,
        isOpen: true,
        data: mockData
      });
      setDialogOpen(true);
    }, 300); // 300ms delay
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Remove the pin by setting selectedPin to null
    onPinChange(null);
  };

  const handleMarkerClick = () => {
    if (selectedPin) {
      // Add a small delay before opening the dialog
      setTimeout(() => {
        onPinChange({
          ...selectedPin,
          isOpen: true
        });
        setDialogOpen(true);
      }, 300); // 300ms delay
    }
  };

  // Create a persistent marker icon
  const markerIcon = useMemo(() => 
    L.divIcon({
      className: 'pin-transition',
      html: '<div class="pin-marker"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    }), []);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        className="w-full h-full"
        ref={mapInstanceRef}
        zoomControl={false}
        doubleClickZoom={true}
      >
        <MapClickHandler onMapClick={handleMapClick} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          {/* Add the image overlay */}
          <LayersControl.Overlay checked name="Energy Data">
            <ImageOverlay
              url="/heatmap.png"
              bounds={[[-85, -180], [85, 180]]}  // Web Mercator practical bounds
              opacity={0.7}
              zIndex={10}
            />
          </LayersControl.Overlay>
          
          {/* Debug grid overlay */}
          <LayersControl.Overlay name="Debug Grid">
            {Array.from({ length: 17 }).map((_, i) => {
              const lat = -80 + i * 10;
              return (
                <Polyline
                  key={`lat-${lat}`}
                  positions={[
                    [lat, -180],
                    [lat, 180]
                  ]}
                  color="rgba(255,0,0,0.5)"
                  weight={1}
                />
              );
            })}
            {Array.from({ length: 37 }).map((_, i) => {
              const lng = -180 + i * 10;
              return (
                <Polyline
                  key={`lng-${lng}`}
                  positions={[
                    [-85, lng],
                    [85, lng]
                  ]}
                  color="rgba(255,0,0,0.5)"
                  weight={1}
                />
              );
            })}
          </LayersControl.Overlay>
        </LayersControl>

        {/* Render single marker with transition */}
        {selectedPin && (
          <Marker
            key={`${selectedPin.lat}-${selectedPin.lng}`}
            position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
            eventHandlers={{
              click: handleMarkerClick
            }}
            icon={markerIcon}
          />
        )}
      </MapContainer>
      
      {selectedPin && (
        <InfoDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          position={selectedPin}
          data={selectedPin.data}
          screenPosition={dialogPosition}
        />
      )}
    </div>
  );
});

Map.displayName = 'Map';

export default Map; 
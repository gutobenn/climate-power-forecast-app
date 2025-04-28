'use client';

import { MapContainer, TileLayer, LayersControl, useMapEvents, Marker, Polyline, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { getEnergyData } from '@/services/energyData';
import InfoDialog from './InfoDialog';
import GridCanvasLayer from './GridCanvasLayer';
import { useMap } from 'react-leaflet';
import LabelsPaneSetup from './LabelsPaneSetup';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

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
        console.log('Starting to load data...');
        setIsLoading(true);
        const data = await getEnergyData(selectedEnergyType, selectedYear);
        setEnergyData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading energy data:', error);
        setIsLoading(false);
      }
    };
    
    // Only load data if we're not currently sliding
    if (!isSliding) {
      loadData();
    }
  }, [selectedYear, selectedEnergyType, isSliding]);

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
    // Find the closest data point to the clicked location
    let closestPoint = null;
    let minDistance = Infinity;
    
    if (energyData) {
      energyData.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.lat - latlng.lat, 2) + 
          Math.pow(point.lon - latlng.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });
    }
    
    // Only update pin if we found a data point within a reasonable distance
    if (closestPoint && minDistance < 1.0) { // 1 degree is roughly 111km
      // Update pin with new location and data
      onPinChange({
        lat: latlng.lat,
        lng: latlng.lng,
        isOpen: false,
        data: {
          wind: Math.round(closestPoint.value),
          solar: 0, // These will be added when we have solar data
          hydro: 0, // These will be added when we have hydro data
          bestType: 'wind' // Default to wind since that's what we have data for
        }
      });

      // Add a small delay before opening the dialog
      setTimeout(() => {
        onPinChange({
          lat: latlng.lat,
          lng: latlng.lng,
          isOpen: true,
          data: {
            wind: Math.round(closestPoint.value),
            solar: 0,
            hydro: 0,
            bestType: 'wind'
          }
        });
        setDialogOpen(true);
      }, 300); // 300ms delay
    } else {
      // If no data point found, remove the pin
      onPinChange(null);
      setDialogOpen(false);
    }
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

  // Helper to calculate bounds for 11x11km cell centered at lat/lon
  function getCellBounds(lat, lon) {
    const halfSideKm = 5.5; // half of 11km
    const latOffset = halfSideKm / 111; // degrees
    const lonOffset = halfSideKm / (111 * Math.cos(lat * Math.PI / 180));
    return [
      [lat - latOffset, lon - lonOffset], // SW
      [lat + latOffset, lon + lonOffset]  // NE
    ];
  }

  // Helper to get color for a value
  function getColor(normalizedValue) {
    if (normalizedValue <= 0.2) return 'blue';
    if (normalizedValue <= 0.4) return 'cyan';
    if (normalizedValue <= 0.6) return 'lime';
    if (normalizedValue <= 0.8) return 'yellow';
    if (normalizedValue <= 0.9) return 'orange';
    return 'red';
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[-15, -60]}
        zoom={4}
        className="w-full h-full"
        ref={mapInstanceRef}
        zoomControl={false}
        doubleClickZoom={true}
      >
        <LabelsPaneSetup />
        <MapClickHandler onMapClick={handleMapClick} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; CartoDB'
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        {/* Labels-only tile layer in custom pane */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
          pane="labels"
        />

        {/* Add loading indicator */}
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <div>
                <span className="text-gray-800 font-medium text-lg">Loading data for {selectedYear}</span>
                <p className="text-gray-600 text-sm">Please wait while we update the map...</p>
              </div>
            </div>
          </div>
        )}

        {/* Render grid cells as rectangles */}
        {energyData && <GridCanvasLayer energyData={energyData} />}

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
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
  const [useHeatmap, setUseHeatmap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  const imageOverlayRef = useRef(null);

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
        setOverlayOpacity(0); // Hide the overlay when loading new data
        const data = await getEnergyData(selectedEnergyType, selectedYear);
        setEnergyData(data);
      } catch (error) {
        console.error('Error loading energy data:', error);
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedYear, selectedEnergyType]);

  // Handle image overlay events
  useEffect(() => {
    if (imageOverlayRef.current) {
      const imageOverlay = imageOverlayRef.current;
      
      const handleImageLoad = () => {
        console.log('Image loaded');
        // Add a small delay to ensure the image is fully rendered
        setTimeout(() => {
          setIsLoading(false);
          setOverlayOpacity(0.7); // Show the overlay once loaded
        }, 500);
      };

      const handleImageError = () => {
        console.error('Error loading image');
        setIsLoading(false);
      };

      imageOverlay.on('load', handleImageLoad);
      imageOverlay.on('error', handleImageError);

      return () => {
        imageOverlay.off('load', handleImageLoad);
        imageOverlay.off('error', handleImageError);
      };
    }
  }, [imageOverlayRef.current]);

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
    // Temporarily disabled dialog functionality
    /*
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
    */
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
              ref={imageOverlayRef}
              url={`/plots/export_wind_${selectedYear}.png`}
              bounds={[[-85, -180], [85, 180]]}
              opacity={overlayOpacity}
              zIndex={10}
            />
          </LayersControl.Overlay>
        </LayersControl>

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
      
      {/* Temporarily disabled dialog
      {selectedPin && (
        <InfoDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          position={selectedPin}
          data={selectedPin.data}
          screenPosition={dialogPosition}
        />
      )}
      */}
    </div>
  );
});

Map.displayName = 'Map';

export default Map; 
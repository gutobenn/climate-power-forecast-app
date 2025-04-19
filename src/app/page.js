'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ControlPanel from '@/components/ControlPanel';
import Header from '@/components/Header';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapRef = useRef(null);
  
  // Get initial values from URL or use defaults
  const [selectedYear, setSelectedYear] = useState(
    parseInt(searchParams.get('year')) || 2030
  );
  const [selectedEnergyType, setSelectedEnergyType] = useState(
    searchParams.get('type') || 'solar'
  );
  const [selectedPin, setSelectedPin] = useState(
    searchParams.get('pin') ? {
      lat: parseFloat(searchParams.get('lat')),
      lng: parseFloat(searchParams.get('lng')),
      isOpen: searchParams.get('pin') === 'open',
      data: {
        wind: Math.floor(Math.random() * 1000),
        solar: Math.floor(Math.random() * 1500),
        hydro: Math.floor(Math.random() * 800),
        bestType: ['wind', 'solar', 'hydro'][Math.floor(Math.random() * 3)]
      }
    } : null
  );

  // Update URL when parameters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('year', selectedYear.toString());
    params.set('type', selectedEnergyType);
    
    if (selectedPin) {
      params.set('lat', selectedPin.lat.toString());
      params.set('lng', selectedPin.lng.toString());
      params.set('pin', selectedPin.isOpen ? 'open' : 'closed');
    } else {
      params.delete('lat');
      params.delete('lng');
      params.delete('pin');
    }
    
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [selectedYear, selectedEnergyType, selectedPin, router]);

  const handleYearChange = (year) => {
    // Ensure year is within valid range
    const validYear = Math.max(2015, Math.min(2100, parseInt(year)));
    setSelectedYear(validYear);
  };

  const handleEnergyTypeChange = (type) => {
    setSelectedEnergyType(type);
  };

  const handlePinChange = (pin) => {
    setSelectedPin(pin);
  };

  const handleLocationSelect = ({ lat, lng }) => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.setView([lat, lng], 10);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <main className="flex-1 relative w-full">
        <Map 
          selectedYear={selectedYear}
          selectedEnergyType={selectedEnergyType}
          selectedPin={selectedPin}
          onPinChange={handlePinChange}
          ref={mapRef}
        />
        <div className="absolute top-4 left-4 z-[1000]">
          <ControlPanel
            selectedYear={selectedYear}
            selectedEnergyType={selectedEnergyType}
            onYearChange={handleYearChange}
            onEnergyTypeChange={handleEnergyTypeChange}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </main>
    </div>
  );
}

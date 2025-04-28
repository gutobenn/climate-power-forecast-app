// Load energy data from JSON file
const loadEnergyData = async () => {
  try {
    const response = await fetch('/data/energy_data_5.json');
    if (!response.ok) {
      throw new Error('Failed to load energy data');
    }
    const data = await response.json();
    console.log('Loaded data structure:', {
      pointsLength: data.points.length,
      samplePoint: data.points[0]
    });
    return data;
  } catch (error) {
    console.error('Error loading energy data:', error);
    return null;
  }
};

// Mock data generator for different energy types
const generateMockData = (type, year) => {
  const data = [];
  
  // Generate different patterns based on energy type
  switch (type) {
    case 'wind':
      // More wind energy in coastal and high-latitude areas
      for (let lat = -60; lat <= 70; lat += 10) {
        for (let lng = -180; lng <= 180; lng += 10) {
          const intensity = Math.abs(lat) / 90 * Math.random() * 100;
          if (intensity > 30) { // Only show significant wind areas
            data.push({ lat, lon: lng, value: intensity });
          }
        }
      }
      break;
      
    case 'solar':
      // More solar energy near the equator
      for (let lat = -60; lat <= 60; lat += 5) {
        for (let lng = -180; lng <= 180; lng += 10) {
          const intensity = (1 - Math.abs(lat) / 60) * Math.random() * 100;
          if (intensity > 30) { // Only show significant solar areas
            data.push({ lat, lon: lng, value: intensity });
          }
        }
      }
      break;
      
    case 'hydro':
      // Scattered hydro points (representing major rivers/dams)
      const hydroPoints = [
        [48.6, -121.2], // USA
        [-25.4, -54.6], // Brazil
        [30.8, 111.0],  // China
        [27.0, 91.0],   // Bhutan
        [61.0, 69.0],   // Russia
        [-6.8, -43.3],  // Brazil
      ];
      
      hydroPoints.forEach(([lat, lng]) => {
        data.push({ lat, lon: lng, value: 75 + Math.random() * 25 });
        // Add some nearby points to create clusters
        for (let i = 0; i < 3; i++) {
          data.push({
            lat: lat + (Math.random() - 0.5) * 2,
            lon: lng + (Math.random() - 0.5) * 2,
            value: 50 + Math.random() * 25
          });
        }
      });
      break;
  }
  
  // Add year variation (just for demonstration)
  const yearFactor = 1 + ((year - 2020) * 0.1); // 10% increase per year
  return data.map(point => ({
    ...point,
    value: point.value * yearFactor
  }));
};

export const getEnergyData = async (type, year) => {
  const energyData = await loadEnergyData();
  if (!energyData) {
    console.log('Using mock data as fallback');
    return generateMockData(type, year);
  }

  // Return the points array for heatmap visualization
  return energyData.points;
}; 
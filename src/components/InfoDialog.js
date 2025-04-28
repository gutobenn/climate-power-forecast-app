import { Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const InfoDialog = ({ isOpen, onClose, data, position, screenPosition, energyData }) => {
  const [yearlyData, setYearlyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchYearlyData = async () => {
      if (!position || !energyData) return;
      
      // Find the closest data point
      let closestPoint = null;
      let minDistance = Infinity;
      
      energyData.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.lat - position.lat, 2) + 
          Math.pow(point.lon - position.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });
      
      if (!closestPoint || minDistance > 1.0) return;
      
      // Format coordinates to 6 decimal places
      const lat = closestPoint.lat.toFixed(6);
      const lng = closestPoint.lon.toFixed(6);
      
      try {
        setIsLoading(true);
        const response = await fetch(`/data/detailed_locations/location_${lat}_${lng}.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch yearly data');
        }
        const rawData = await response.json();
        
        // Transform the data into the format Recharts expects
        const transformedData = Object.entries(rawData.data).map(([year, value]) => ({
          year: parseInt(year),
          value: Math.round(value)
        })).sort((a, b) => a.year - b.year);
        
        setYearlyData(transformedData);
      } catch (error) {
        setYearlyData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchYearlyData();
    }
  }, [isOpen, position, energyData]);

  if (!isOpen) return null;

  // Determine if the pin is on the left or right half of the map
  const isOnRightSide = screenPosition.x > window.innerWidth / 2;
  const offsetX = isOnRightSide ? -240 : 240; // Increased from 180 to 240
  const offsetY = -50; // Center vertically relative to pin

  return (
    <Transition
      show={isOpen}
      enter="dialog-enter"
      enterFrom="dialog-enter"
      enterTo="dialog-enter-active"
      leave="dialog-exit"
      leaveFrom="dialog-exit"
      leaveTo="dialog-exit-active"
    >
      <div 
        className="fixed z-[900] w-96 bg-white rounded-lg shadow-lg p-4"
        style={{
          left: `${screenPosition.x + offsetX}px`,
          top: `${screenPosition.y + offsetY}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Location Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Coordinates</h4>
            <p className="text-sm">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Energy Potential</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Wind Power:</span>
                <span className="font-medium">{data.wind} kWh</span>
              </div>
              {/*
              <div className="flex justify-between">
                <span>Solar Power:</span>
                <span className="font-medium">{data.solar} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Hydro Power:</span>
                <span className="font-medium">{data.hydro} MW</span>
              </div>
              */}
            </div>
          </div>
          
          {/* Yearly Data Graph */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Yearly Data</h4>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : yearlyData ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={yearlyData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="year" 
                      type="number"
                      domain={[1970, 2099]}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                      ticks={[...Array(2099 - 1970 + 1).keys()].map(i => 1970 + i).filter(y => y % 5 === 0 || y === 2099)}
                      tickFormatter={year => year}
                    />
                    <YAxis 
                      type="number"
                      domain={[0, 6000]}
                      tick={{ fontSize: 10 }}
                      label={{ value: 'KWh', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} KWh`, 'Energy Potential']}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-500 h-40 flex items-center justify-center">
                No yearly data available
              </div>
            )}
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default InfoDialog; 
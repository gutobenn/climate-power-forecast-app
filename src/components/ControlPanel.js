import { useState } from 'react';
import SearchBar from './SearchBar';

const ControlPanel = ({ selectedYear, selectedEnergyType, onYearChange, onEnergyTypeChange, onLocationSelect }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSliding, setIsSliding] = useState(false);

  const handleSliderChange = (e) => {
    const year = parseInt(e.target.value);
    onYearChange(year);
  };

  return (
    <div className="m-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4" style={{ width: '320px', position: 'fixed', top: '60px', left: 0, zIndex: 1000, backgroundColor: 'white' }}>
      <div className="border-b border-gray-300 px-4 py-3 -mx-4 -mt-4 mb-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
        <h2 className="font-medium">Map Controls</h2>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-5 h-5 text-gray-600 transform ${isMinimized ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Search Location</label>
            <SearchBar onLocationSelect={onLocationSelect} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">Year</label>
              <span className="text-sm font-medium text-blue-600">{selectedYear}</span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="2015"
                max="2100"
                value={selectedYear}
                onChange={handleSliderChange}
                onMouseDown={() => setIsSliding(true)}
                onMouseUp={() => setIsSliding(false)}
                onTouchStart={() => setIsSliding(true)}
                onTouchEnd={() => setIsSliding(false)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((selectedYear - 2015) / (2100 - 2015)) * 100}%, #e5e7eb ${((selectedYear - 2015) / (2100 - 2015)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2015</span>
                <span>2100</span>
              </div>
              {isSliding && (
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 bg-gray-900 text-white px-2 py-1 rounded text-xs">
                  {selectedYear}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Energy Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded bg-white"
              onChange={(e) => onEnergyTypeChange(e.target.value)}
              value={selectedEnergyType}
            >
              <option value="solar">Solar</option>
              <option value="wind">Wind</option>
              <option value="hydro">Hydro</option>
            </select>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showGrid"
                className="w-4 h-4 border-gray-300 rounded"
              />
              <span className="text-gray-700">Show Grid</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showLabels"
                className="w-4 h-4 border-gray-300 rounded"
              />
              <span className="text-gray-700">Show Labels</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel; 
import { useState } from 'react';
import SearchBar from './SearchBar';

const ControlPanel = ({ selectedYear, selectedEnergyType, onYearChange, onEnergyTypeChange, onLocationSelect }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [currentSliderValue, setCurrentSliderValue] = useState(selectedYear);

  const handleSliderChange = (e) => {
    const year = parseInt(e.target.value);
    setCurrentSliderValue(year);
    if (!isSliding) {
      onYearChange(year);
    }
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
                min="1970"
                max="2099"
                value={currentSliderValue}
                onChange={handleSliderChange}
                onMouseDown={() => setIsSliding(true)}
                onMouseUp={() => {
                  setIsSliding(false);
                  onYearChange(currentSliderValue);
                }}
                onTouchStart={() => setIsSliding(true)}
                onTouchEnd={() => {
                  setIsSliding(false);
                  onYearChange(currentSliderValue);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentSliderValue - 1970) / (2099 - 1970)) * 100}%, #e5e7eb ${((currentSliderValue - 1970) / (2099 - 1970)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1970</span>
                <span>2099</span>
              </div>
              {isSliding && (
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-3 bg-gray-900 text-white px-2 py-1 rounded text-xs"
                  style={{
                    left: `${((currentSliderValue - 1970) / (2099 - 1970)) * 100}%`,
                  }}
                >
                  {currentSliderValue}
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
              <option value="wind">Wind</option>
              <option value="solar" disabled>Solar</option>
              <option value="hydro" disabled>Hydro</option>
            </select>
          </div>

        </div>
      )}
    </div>
  );
};

export default ControlPanel; 
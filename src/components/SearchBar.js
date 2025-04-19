import { useState, useCallback, useRef } from 'react';

const SearchBar = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchCache = useRef(new Map());
  const debounceTimeout = useRef(null);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Check cache first
    if (searchCache.current.has(query)) {
      setSearchResults(searchCache.current.get(query));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      // Cache the results
      searchCache.current.set(query, data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((query) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      handleSearch(query);
    }, 300); // 300ms debounce
  }, [handleSearch]);

  const handleLocationSelect = (location) => {
    onLocationSelect({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      name: location.display_name
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          placeholder="Search location..."
          className="w-full p-2 pr-8 border border-gray-300 rounded bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-2 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleLocationSelect(result)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              <div className="text-sm font-medium text-gray-800">
                {result.display_name.split(',')[0]}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 
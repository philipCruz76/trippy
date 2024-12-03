import { createContext, useContext, useEffect, useState } from 'react';
import type { Map } from 'mapbox-gl';
import type { MapboxPlace } from '@/types/mapbox.types';

interface MapboxContextType {
  map: Map | null;
  setMap: (map: Map | null) => void;
  searchResults: MapboxPlace[];
  setSearchResults: (results: MapboxPlace[]) => void;
  selectedMarkerId: string | null;
  setSelectedMarkerId: (id: string | null) => void;
}

const MapboxContext = createContext<MapboxContextType | null>(null);

export function MapboxProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<Map | null>(null);
  const [searchResults, setSearchResults] = useState<MapboxPlace[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  return (
    <MapboxContext.Provider 
      value={{ 
        map, 
        setMap, 
        searchResults, 
        setSearchResults,
        selectedMarkerId,
        setSelectedMarkerId
      }}
    >
      {children}
    </MapboxContext.Provider>
  );
}

export const useMapbox = () => {
  const context = useContext(MapboxContext);
  if (!context) {
    throw new Error('useMapbox must be used within MapboxProvider');
  }
  return context;
}; 
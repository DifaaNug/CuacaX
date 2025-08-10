import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
  isCurrentLocation?: boolean;
}

interface LocationContextType {
  selectedLocation: LocationData | null;
  setSelectedLocation: (location: LocationData | null) => void;
  resetToCurrentLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const resetToCurrentLocation = () => {
    setSelectedLocation(null);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        resetToCurrentLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

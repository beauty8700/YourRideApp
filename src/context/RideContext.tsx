import React, { createContext, useContext, useState } from 'react';

export type RideStatus = 'idle' | 'selecting' | 'searching' | 'assigned' | 'ongoing' | 'completed';

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

interface RideContextType {
  pickup: Location | null;
  destination: Location | null;
  setPickup: (loc: Location | null) => void;
  setDestination: (loc: Location | null) => void;
  rideStatus: RideStatus;
  setRideStatus: (status: RideStatus) => void;
  selectedVehicle: string | null;
  setSelectedVehicle: (type: string | null) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  return (
    <RideContext.Provider value={{ 
      pickup, setPickup, 
      destination, setDestination, 
      rideStatus, setRideStatus,
      selectedVehicle, setSelectedVehicle
    }}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

import { create } from "zustand";

interface LocationState {
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  setLocation: (
    address: string,
    coords: { latitude: number; longitude: number },
  ) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  address: "Managua, Centro", // Valor por defecto inicial
  coordinates: null,
  setLocation: (address, coordinates) => set({ address, coordinates }),
}));

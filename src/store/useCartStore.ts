import { create } from "zustand";

// 1. Agregamos clearCart a la interfaz para que TypeScript la reconozca
interface CartState {
  items: any[];
  addItem: (product: any) => void;
  removeItem: (id: string) => void;
  clearCart: () => void; // <-- Declaración obligatoria para TS
  total: number;
}

// 2. Implementamos la función dentro del store
export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product: any) =>
    set((state: any) => {
      const existingItem = state.items.find((i: any) => i.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((i: any) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    }),
  removeItem: (id: string) =>
    set((state: any) => ({
      items: state.items.filter((i: any) => i.id !== id),
    })),
  clearCart: () => set({ items: [] }), // <-- Restablece el array de ítems a vacío
  total: 0,
}));

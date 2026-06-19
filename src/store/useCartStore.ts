import { create } from "zustand";
// import { persist } from 'zustand/middleware'; // (If you are using persist)

export type CartItem = {
  id: string;
  name: string;
  price_cordobas: number;   // ← matches DB column
  quantity: number;
  restaurant_id: string;
};

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  restaurantId: null,

  addItem: (item) =>
    set((state) => {
      // 1. If cart is empty, lock it to this restaurant
      const newRestaurantId = state.restaurantId || item.restaurant_id;

      // 2. Check if item already exists to increment quantity
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          restaurantId: newRestaurantId,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }

      // 3. Add new item
      return {
        restaurantId: newRestaurantId,
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),

  removeItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      // If cart becomes empty after removal, free up the restaurant lock
      return {
        items: newItems,
        restaurantId: newItems.length === 0 ? null : state.restaurantId,
      };
    }),

  clearCart: () => set({ items: [], restaurantId: null }),
}));

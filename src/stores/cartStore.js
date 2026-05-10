import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // 액션
      addItem: (product, quantity = 1, selectedOption = '') => {
        const existingItem = get().items.find(
          (item) =>
            item.productId === product.id && item.selectedOption === selectedOption
        );

        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                id: `${product.id}-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image_url || product.image_urls?.[0],
                quantity,
                selectedOption,
                stock: product.stock,
              },
            ],
          }));
        }
      },

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Getter
      getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'joli-cart-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLiveStore = create(
  persist(
    (set, get) => ({
      // 라이브 상태
      isLive: false,
      liveTitle: '',
      featuredProductId: null,
      viewerCount: 0,
      messages: [],

      // 액션
      setLiveStatus: (isLive, title = '') => set({ isLive, liveTitle: title }),
      setFeaturedProduct: (productId) => set({ featuredProductId: productId }),
      setViewerCount: (count) => set({ viewerCount: count }),
      addMessage: (message) => set((state) => ({
        messages: [...state.messages.slice(-99), message], // 최대 100개 유지
      })),
      clearMessages: () => set({ messages: [] }),

      // 미니모드 상태
      isMiniMode: false,
      miniPosition: { x: 0, y: 0 },
      setMiniMode: (isMini) => set({ isMiniMode: isMini }),
      setMiniPosition: (pos) => set({ miniPosition: pos }),

      // 상품 목록 시트
      isProductListOpen: false,
      setProductListOpen: (open) => set({ isProductListOpen: open }),

      // 상태 초기화
      reset: () => set({
        isLive: false,
        liveTitle: '',
        featuredProductId: null,
        viewerCount: 0,
        messages: [],
        isMiniMode: false,
        isProductListOpen: false,
      }),
    }),
    {
      name: 'joli-live-storage',
      partialize: (state) => ({
        isMiniMode: state.isMiniMode,
        miniPosition: state.miniPosition,
      }),
    }
  )
);

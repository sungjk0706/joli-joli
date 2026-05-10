import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSessionStore = create(
  persist(
    (set, get) => ({
      // 관리자 세션
      isAdminLoggedIn: false,
      adminPasswordHash: null,

      // 고객 정보 (주문 시 사용)
      customerInfo: {
        name: '',
        phone: '',
        address: '',
        detailAddress: '',
        zonecode: '',
      },

      // 액션 - 관리자
      loginAdmin: (passwordHash) =>
        set({
          isAdminLoggedIn: true,
          adminPasswordHash: passwordHash,
        }),

      logoutAdmin: () =>
        set({
          isAdminLoggedIn: false,
        }),

      updatePasswordHash: (newHash) =>
        set({
          adminPasswordHash: newHash,
        }),

      // 액션 - 고객
      updateCustomerInfo: (info) =>
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        })),

      clearCustomerInfo: () =>
        set({
          customerInfo: {
            name: '',
            phone: '',
            address: '',
            detailAddress: '',
            zonecode: '',
          },
        }),

      // 초기화
      reset: () =>
        set({
          isAdminLoggedIn: false,
          adminPasswordHash: null,
          customerInfo: {
            name: '',
            phone: '',
            address: '',
            detailAddress: '',
            zonecode: '',
          },
        }),
    }),
    {
      name: 'joli-session-storage',
    }
  )
);

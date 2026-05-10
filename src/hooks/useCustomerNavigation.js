import { useState, useEffect, useRef, useCallback } from 'react';

export const useCustomerNavigation = (isAdminMode) => {
  const initialState = window.history.state || {};

  const [isLiveMode, setIsLiveMode] = useState(isAdminMode || !!initialState.live);
  const [showCart, setShowCart] = useState(!!initialState.modal && initialState.modal === 'cart');
  const [showOrderHistory, setShowOrderHistory] = useState(!!initialState.modal && initialState.modal === 'history');
  const [detailProduct, setDetailProduct] = useState(initialState.modal === 'detail' ? initialState.product : null);
  const [isSheetOpen, setIsSheetOpen] = useState(!!initialState.modal && initialState.modal === 'order');
  const [showProductList, setShowProductList] = useState(!!initialState.modal && initialState.modal === 'list');
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(initialState.category || 'all');
  const [searchQuery, setSearchQuery] = useState(initialState.search || '');

  // 브라우저 뒤로가기 감지 및 처리
  useEffect(() => {
    const handlePopState = (e) => {
      if (isAdminMode) return;
      
      const state = e.state || {};
      
      // 라이브 모드 전환
      if (state.live) {
        setIsLiveMode(true);
      } else {
        setIsLiveMode(false);
        setIsMiniMode(false);
      }

      // 모달 상태 복구
      setShowCart(state.modal === 'cart');
      setShowOrderHistory(state.modal === 'history');
      setDetailProduct(state.modal === 'detail' ? state.product : null);
      setIsSheetOpen(state.modal === 'order');
      setShowProductList(state.modal === 'list');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminMode]);

  // 통합 모달 히스토리 관리 로직
  const lastModalRef = useRef(null);
  const anyModalOpen = showCart || showOrderHistory || !!detailProduct || isSheetOpen || showProductList;
  
  useEffect(() => {
    if (isAdminMode) return;

    const currentModal = showCart ? 'cart' : 
                        showOrderHistory ? 'history' : 
                        !!detailProduct ? 'detail' : 
                        isSheetOpen ? 'order' : 
                        showProductList ? 'list' : null;

    // 모달이 새로 열릴 때 히스토리 추가
    if (anyModalOpen && !lastModalRef.current) {
      window.history.pushState({ ...window.history.state, modal: currentModal, product: detailProduct }, '');
    } 
    // 모달이 수동으로(X 버튼 등) 모두 닫혔을 때 히스토리 정리
    else if (!anyModalOpen && lastModalRef.current) {
      if (window.history.state?.modal) {
        window.history.back();
      }
    }
    
    lastModalRef.current = currentModal;
  }, [showCart, showOrderHistory, detailProduct, isSheetOpen, showProductList, isAdminMode]);

  // 카테고리/검색어 변경 시 히스토리 상태 업데이트
  useEffect(() => {
    if (!isAdminMode) {
      window.history.replaceState({ 
        ...window.history.state, 
        category: selectedCategory, 
        search: searchQuery 
      }, '');
    }
  }, [selectedCategory, searchQuery, isAdminMode]);

  const openCart = () => setShowCart(true);
  const openOrderHistory = () => setShowOrderHistory(true);
  const openProductDetail = (product) => setDetailProduct(product);
  const openOrderSheet = () => setIsSheetOpen(true);
  const openProductList = () => setShowProductList(true);
  
  const closeCart = () => setShowCart(false);
  const closeOrderHistory = () => setShowOrderHistory(false);
  const closeProductDetail = () => setDetailProduct(null);
  const closeOrderSheet = () => setIsSheetOpen(false);
  const closeProductList = () => setShowProductList(false);

  return {
    isLiveMode, setIsLiveMode,
    showCart, setShowCart,
    showOrderHistory, setShowOrderHistory,
    detailProduct, setDetailProduct,
    isSheetOpen, setIsSheetOpen,
    showProductList, setShowProductList,
    isMiniMode, setIsMiniMode,
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    openCart, openOrderHistory, openProductDetail, openOrderSheet, openProductList,
    closeCart, closeOrderHistory, closeProductDetail, closeOrderSheet, closeProductList
  };
};

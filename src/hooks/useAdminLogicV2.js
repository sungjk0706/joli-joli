import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { configService } from '../services';
import { useAlert } from './useAlert';
import { useAdminNotification } from './useAdminNotification';
import { useAdminConfig } from './useAdminConfig';
import { useSessionStore } from '../stores';
import {
  useOrdersQuery,
  useProductsQuery,
  useCategoriesQuery,
  useConfigsQuery,
  useUpdateOrderStatusMutation,
  useUpdateTrackingMutation,
  useDeleteOrderMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleStockMutation,
  useUploadImageMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from './queries';
import { verifyPassword, DEFAULT_PASSWORD_HASH } from '../utils/crypto';

export const useAdminLogicV2 = (onBack) => {
  // Zustand: 세션 상태
  const { isAdminLoggedIn, loginAdmin, logoutAdmin } = useSessionStore();

  // 로컬 UI 상태
  const [showGuide, setShowGuide] = useState(false);
  const [password, setPassword] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const mainRef = useRef(null);

  // TanStack Query: 서버 상태
  const { data: orders = [], isLoading: ordersLoading } = useOrdersQuery();
  const { data: products = [] } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: config = {}, isLoading: configLoading } = useConfigsQuery();

  // TanStack Query: 뮤테이션
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const updateTrackingMutation = useUpdateTrackingMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  // Product mutations
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const toggleStockMutation = useToggleStockMutation();
  const uploadImageMutation = useUploadImageMutation();

  // Category mutations
  const createCategoryMutation = useCreateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();

  // Product/Category UI 상태
  const [newProduct, setNewProduct] = useState({ name: '', price: '', options: '', category_id: '', description: '', stock: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 기존 Hooks
  const { alert, showAlert, hideAlert, showConfirm } = useAlert();
  const adminConfig = useAdminConfig(config, configLoading, () => {}, showAlert);
  const { newOrderNotification, closeNotification } = useAdminNotification(orders, isAdminLoggedIn);

  // 실시간 시청자 추적
  useEffect(() => {
    if (!isAdminLoggedIn || !supabase) return;

    const channel = supabase
      .channel('live-realtime')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: 'admin', online_at: new Date().toISOString() });
        }
      });

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [isAdminLoggedIn]);

  // 로그인/로그아웃
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const passwordHash = localStorage.getItem('ADMIN_PASSWORD_HASH') || DEFAULT_PASSWORD_HASH;
    const isValid = await verifyPassword(password, passwordHash);

    if (isValid) {
      loginAdmin(passwordHash);
      showAlert('로그인 성공! 👋', '관리자 모드에 오신 것을 환영합니다.', 'success');
    } else {
      showAlert('비밀번호 오류 🔒', '비밀번호가 일치하지 않습니다.', 'error');
    }
  };

  const handleLogout = () => {
    showConfirm('로그아웃 🚪', '정말 로그아웃 하시겠습니까?', () => {
      logoutAdmin();
      if (onBack) onBack();
    });
  };

  // 라이브 상품 송출
  const handlePushToLive = async (product) => {
    try {
      await configService.upsert('live_featured_product_id', product.id);
      showAlert('송출 완료', `[${product.name}] 상품이 모든 시청자 화면에 고정되었습니다.`, 'success');
    } catch (error) {
      showAlert('송출 오류', error.message, 'error');
    }
  };

  // 주문 관리 (TanStack Query mutations)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
      if (newStatus === '입금완료') {
        showAlert('입금 확인', '입금 처리가 완료되었습니다.', 'success');
      }
    } catch (e) {
      showAlert('오류', '상태 변경 중 오류 발생', 'error');
    }
  };

  const handleUpdateTracking = async (orderId, num, carrier) => {
    try {
      await updateTrackingMutation.mutateAsync({ id: orderId, trackingNumber: num, carrier });
      showAlert('송장 번호 저장', '배송 정보가 저장되었습니다.', 'success');
    } catch (e) {
      showAlert('오류', '저장 중 오류 발생', 'error');
    }
  };

  const handleDeleteOrder = (id) => {
    showConfirm('주문 삭제', '정말 삭제하시겠습니까?', () => {
      deleteOrderMutation.mutate(id);
    }, 'error');
  };

  // Product/Category 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) return showAlert('파일 개수 초과', '최대 5장까지만 선택 가능합니다.', 'info');
    setImageFiles(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      options: product.options || '',
      category_id: product.category_id || '',
      description: product.description || '',
      stock: product.stock || ''
    });
    setCurrentImages(product.image_urls || [product.image_url] || []);
    setImageFiles([]);
    setImagePreviews([]);
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    setUploading(true);
    try {
      let image_urls = editingProduct ? currentImages : [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const publicUrl = await uploadImageMutation.mutateAsync(file);
          image_urls.push(publicUrl);
        }
      }
      const productData = {
        name: newProduct.name,
        price: newProduct.price,
        options: newProduct.options || '',
        category_id: newProduct.category_id,
        description: newProduct.description || '',
        stock: parseInt(newProduct.stock) || 0,
        image_url: image_urls[0],
        image_urls: image_urls
      };
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, data: productData });
        setEditingProduct(null);
        showAlert('수정 완료', '상품 정보가 성공적으로 변경되었습니다.', 'success');
      } else {
        if (imageFiles.length === 0) return showAlert('사진 누락', '사진을 1장 이상 선택해주세요.', 'info');
        await createProductMutation.mutateAsync(productData);
        showAlert('등록 완료! 🎉', '새로운 상품이 성공적으로 등록되었습니다.', 'success');
      }
      setNewProduct({ name: '', price: '', options: '', category_id: '', description: '', stock: '' });
      setImageFiles([]);
      setImagePreviews([]);
      setCurrentImages([]);
    } catch (error) {
      showAlert('오류', error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = (id) => {
    showConfirm('상품 삭제', '정말 삭제하시겠습니까?', () => {
      deleteProductMutation.mutate(id);
    }, 'error');
  };

  const handleToggleStock = (p) => {
    toggleStockMutation.mutate({ id: p.id, isOutOfStock: p.is_out_of_stock });
  };

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategoryMutation.mutateAsync(newCategoryName);
      setNewCategoryName('');
      showAlert('분류 추가 완료!', '새로운 분류가 등록되었습니다.', 'success');
    } catch (error) {
      showAlert('오류', error.message, 'error');
    }
  };

  const handleDeleteCategory = (id) => {
    showConfirm('분류 삭제', '정말 삭제하시겠습니까?', () => {
      deleteCategoryMutation.mutate(id);
    }, 'error');
  };

  return {
    // Auth
    isLoggedIn: isAdminLoggedIn,
    handleLogin,
    handleLogout,
    password,
    setPassword,

    // Core Data (TanStack Query)
    orders,
    ordersLoading,
    products,
    categories,
    config,
    configLoading,

    // UI State
    showGuide,
    setShowGuide,
    mainRef,
    alert,
    showAlert,
    hideAlert,
    showConfirm,

    // Admin Config
    ...adminConfig,

    // Notification
    newOrderNotification,
    closeNotification,

    // Order Management
    handleUpdateStatus,
    handleUpdateTracking,
    handleDeleteOrder,

    // Product Management
    newProduct,
    setNewProduct,
    imageFiles,
    setImageFiles,
    imagePreviews,
    setImagePreviews,
    currentImages,
    setCurrentImages,
    editingProduct,
    setEditingProduct,
    uploading,
    handleFileChange,
    startEditing,
    handleAddProduct,
    handleDeleteProduct,
    handleToggleStock,
    handlePushToLive,

    // Category Management
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    handleDeleteCategory,

    // Stats & Monitoring
    viewerCount,
  };
};

import React, { useMemo, useEffect } from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import { Button, Input, Card, Badge } from '../ui/Common';
import LazyImage from '../ui/LazyImage';
import { ProductCardSkeleton } from '../ui/Skeleton';
import ProductCard from '../ui/ProductCard';
import { cartService } from '../../services';

const ProductListSection = React.memo(({ 
  products = [], 
  categories = [], 
  selectedCategory = 'all', 
  setSelectedCategory, 
  searchQuery = '', 
  setSearchQuery,
  loading = false,
  onProductClick,
  showAlert,
  customerPhone
}) => {
  // 필터링 로직을 useMemo로 감싸서 안전하게 처리
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(product => {
      if (!product) return false;
      
      // 카테고리 필터
      const matchesCategory = selectedCategory === 'all' || 
        (product.category_id && String(product.category_id) === String(selectedCategory));
      
      // 검색어 필터
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (product.name && product.name.toLowerCase().includes(query));
      
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // 재주문 데이터 확인
  useEffect(() => {
    const reorderData = localStorage.getItem('REORDER_DATA');
    if (reorderData) {
      try {
        const data = JSON.parse(reorderData);
        const product = products.find(p => String(p.id) === String(data.productId));
        if (product) {
          onProductClick(product, data.selectedOption, data.quantity);
          showAlert('재주문', `${data.productName} 상품이 선택되었습니다. 주문 폼을 작성해주세요.`, 'success');
        }
        localStorage.removeItem('REORDER_DATA');
      } catch (e) {
        console.error('재주문 데이터 파싱 오류:', e);
        localStorage.removeItem('REORDER_DATA');
      }
    }
  }, [products, onProductClick, showAlert]);

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    if (!customerPhone) {
      showAlert('로그인 필요', '장바구니에 추가하려면 먼저 연락처를 입력해주세요.', 'info');
      return;
    }
    try {
      await cartService.addToCart(customerPhone, product.id, 1, '');
      showAlert('장바구니 추가 ✨', `${product.name}이 장바구니에 추가되었습니다.`, 'success');
      // 장바구니 카운트 업데이트를 위한 이벤트 발생 (부모 컴포넌트에서 처리)
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      showAlert('오류', '장바구니 추가 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <section>
      <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
        <Package size={24} className="text-brand-pink-dark" /> 상품 선택
      </h3>

      <div className="grid grid-cols-1 gap-5 mb-8">
        <Input 
          placeholder="어떤 상품을 찾으시나요?" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="pl-4"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 no-scrollbar">
          <Button 
            variant={selectedCategory === 'all' ? 'primary' : 'outline'} 
            className="flex-none px-6 py-2.5" 
            onClick={() => setSelectedCategory('all')}
          >
            전체
          </Button>
          {Array.isArray(categories) && categories.map(cat => (
            <Button 
              key={cat.id}
              variant={String(selectedCategory) === String(cat.id) ? 'primary' : 'outline'}
              className="flex-none px-6 py-2.5"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 italic">표시할 상품이 없습니다. 🛍️</p>
            {products.length > 0 && <p className="text-xs text-gray-300 mt-2">필터링 조건을 확인해 보세요.</p>}
          </div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              onActionClick={(p) => handleAddToCart(p, { stopPropagation: () => {} })}
            />
          ))
        )}
      </div>
    </section>
  );
});

ProductListSection.displayName = 'ProductListSection';

export default ProductListSection;


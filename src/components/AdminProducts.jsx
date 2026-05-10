import React, { useState } from 'react';
import { ShoppingBag, X, Edit2, Trash2, Camera, Settings, Plus, Zap, Gift, FolderPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Input, Card, Badge, Textarea, SectionHeading } from './ui/Common';
import LazyImage from './ui/LazyImage';

const AdminProducts = ({
  products, categories, newProduct, setNewProduct, imageFiles, imagePreviews, currentImages,
  editingProduct, setEditingProduct, uploading, onFileChange, onRemoveCurrentImage,
  onRemoveNewImage, onAddProduct, onToggleStock, onDeleteProduct, onStartEditing,
  setImageFiles, setImagePreviews,
  newCategoryName, setNewCategoryName, onAddCategory, onDeleteCategory
}) => {
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [selectedAdminCategory, setSelectedAdminCategory] = useState('all')
  const [optionInput, setOptionInput] = useState('')
  const [selectedZoomImage, setSelectedZoomImage] = useState(null)

  React.useEffect(() => {
    const handlePop = (e) => { if (e.state && e.state.type === 'zoom') setSelectedZoomImage(null); }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const currentOptions = newProduct.options ? newProduct.options.split(',').map(o => o.trim()).filter(o => o) : [];

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in">
      {/* Category Management Section - Collapsible */}
      <Card className="border-brand-pink-light/20 overflow-hidden">
        <button 
          onClick={() => setShowCategoryManager(!showCategoryManager)}
          className="w-full px-6 py-4 flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-pink/10 rounded-xl flex items-center justify-center text-brand-pink">
              <FolderPlus size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-zinc-900 text-sm">상품 분류 관리</h3>
              <p className="text-[10px] font-bold text-zinc-400">카테고리를 추가하거나 삭제하여 상품을 분류하세요.</p>
            </div>
          </div>
          {showCategoryManager ? <ChevronUp size={20} className="text-zinc-400" /> : <ChevronDown size={20} className="text-zinc-400" />}
        </button>

        {showCategoryManager && (
          <div className="p-6 sm:p-8 space-y-8 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add Form */}
              <div className="space-y-4">
                <Input 
                  label="새 분류 이름" 
                  placeholder="예: 상의, 하의, 액세서리..." 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)}
                />
                <Button 
                  onClick={onAddCategory}
                  variant="secondary" 
                  className="w-full py-3 h-auto text-sm font-black"
                  icon={Plus}
                >
                  분류 추가하기
                </Button>
              </div>

              {/* List */}
              <div className="space-y-3">
                <label className="admin-label block mb-2 ml-1">등록된 분류 목록 ({categories.length})</label>
                <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 scrollbar-thin">
                  {categories.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs italic bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                      등록된 분류가 없습니다.
                    </div>
                  ) : (
                    categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl hover:border-brand-pink/30 transition-all group">
                        <span className="font-bold text-zinc-800 text-sm">{cat.name}</span>
                        <button 
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Card 
        className={`p-4 sm:p-6 md:p-10 border-2 transition-all duration-500 ${
          editingProduct ? 'border-brand-blue-dark bg-brand-blue/5' : 'border-brand-pink-light/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <SectionHeading icon={editingProduct ? Edit2 : Plus}>
            {editingProduct ? '상품 정보 수정' : '새 상품 등록'}
          </SectionHeading>
          {editingProduct && (
            <Button 
              variant="outline" 
              className="px-3 py-2 sm:px-4 sm:py-2 text-[10px] sm:text-xs"
              onClick={() => {
                setEditingProduct(null)
                setNewProduct({ name: '', price: '', options: '', category_id: '', description: '', stock: '' })
                setImageFiles([]); setImagePreviews([]);
              }}
            >
              수정 취소
            </Button>
          )}
        </div>
        
        <form onSubmit={onAddProduct} className="space-y-4 sm:space-y-6">
          <Input label="상품명" placeholder="상품 이름을 입력하세요" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
          <Input label="가격" isCurrency placeholder="판매 가격 (숫자만)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
          <Input label="재고 수량" isCurrency hideSymbol placeholder="현재 재고 (숫자만)" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />
          
          <div className="space-y-3">
            <label className="admin-label block mb-2 ml-1">상품 옵션 (색상, 사이즈 등)</label>
            <div className="flex flex-col gap-3">
              <Input placeholder="예: 블랙, 화이트, XL" value={optionInput} onChange={e => setOptionInput(e.target.value)} />
              <Button variant="secondary" className="w-full py-3 sm:py-4 text-sm sm:text-base" onClick={() => {
                if (optionInput.trim() && !currentOptions.includes(optionInput.trim())) {
                  setNewProduct({ ...newProduct, options: [...currentOptions, optionInput.trim()].join(',') });
                  setOptionInput('');
                }
              }} icon={Plus}>옵션 추가하기</Button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200 min-h-[50px]">
              {currentOptions.length > 0 ? currentOptions.map((opt, idx) => (
                <Badge key={idx} variant="pink" className="pl-3 pr-2 py-1.5 flex items-center gap-2 text-[10px] sm:text-xs">
                  {opt}
                  <button type="button" onClick={() => setNewProduct({ ...newProduct, options: currentOptions.filter(o => o !== opt).join(',') })} className="hover:bg-white/20 rounded-full p-0.5">
                    <X size={10} sm:size={12} />
                  </button>
                </Badge>
              )) : <p className="admin-text-secondary text-xs m-auto italic">등록된 옵션이 없습니다.</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="admin-label block mb-2 ml-1">상품 분류</label>
            <select className="w-full bg-white border-2 border-gray-50 rounded-2xl sm:rounded-3xl py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium focus:border-brand-pink outline-none shadow-sm cursor-pointer" value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })} required>
              <option value="">-- 분류를 선택하세요 --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="admin-label block mb-2 ml-1">상품 상세 안내 메시지</label>
            <Textarea 
              placeholder="상품에 대한 상세한 설명이나 고객에게 전달할 안내 메시지를 입력하세요 (소재, 배송 등)" 
              value={newProduct.description} 
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} 
              className="min-h-[120px] sm:min-h-[150px]"
            />
          </div>

          <div className="space-y-4">
            <label className="admin-label block mb-2 ml-1">사진 업로드 (최대 5장)</label>
            <input type="file" accept="image/*" multiple onChange={onFileChange} className="text-xs sm:text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 sm:file:py-2.5 sm:file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-600" />
            <div className="grid grid-cols-5 gap-2 sm:gap-3 mt-4">
              {currentImages.map((url, idx) => (
                <div key={`cur-${idx}`} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-brand-blue/20 group">
                  <img src={url} className="w-full h-full object-cover opacity-80" alt="" />
                  <button type="button" onClick={() => onRemoveCurrentImage(url)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} sm:size={12} /></button>
                </div>
              ))}
              {imagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 border-brand-pink/20 group">
                  <LazyImage src={preview} className="rounded-xl sm:rounded-2xl" alt="" />
                  <button type="button" onClick={() => onRemoveNewImage(idx)} className="absolute top-1 right-1 bg-brand-pink text-brand-pink-contrast p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} sm:size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" variant={editingProduct ? 'secondary' : 'primary'} className="w-full py-4 sm:py-6 text-base sm:text-xl shadow-xl" disabled={uploading}>
            {uploading ? '처리 중...' : editingProduct ? '상품 정보 수정 완료' : '새 상품 등록하기'}
          </Button>
        </form>
      </Card>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 px-2">
          <SectionHeading icon={ShoppingBag} className="mb-0">등록된 상품 목록</SectionHeading>
          <span className="text-xs sm:text-sm font-bold text-gray-400 pb-0 sm:pb-2">총 {products.length}개</span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Button variant={selectedAdminCategory === 'all' ? 'primary' : 'outline'} className="px-3 sm:px-5 py-2 sm:py-2.5 flex-none text-[10px] sm:text-xs" onClick={() => setSelectedAdminCategory('all')}>전체</Button>
          {categories.map(cat => (
            <Button key={cat.id} variant={selectedAdminCategory === cat.id ? 'primary' : 'outline'} className="px-3 sm:px-5 py-2 sm:py-2.5 flex-none text-[10px] sm:text-xs" onClick={() => setSelectedAdminCategory(cat.id)}>{cat.name}</Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.filter(p => selectedAdminCategory === 'all' || String(p.category_id) === String(selectedAdminCategory)).map(product => (
            <Card key={product.id} className="p-3 sm:p-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gray-50 overflow-hidden shadow-inner border border-gray-100 flex-shrink-0">
                  {(product.image_urls?.[0] || product.image_url) ? (
                    <LazyImage src={product.image_urls?.[0] || product.image_url} alt="" className="rounded-xl sm:rounded-2xl" />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag size={20} sm:size={24} /></div>}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                      <Badge variant="gray" className="text-[8px] sm:text-[9px] px-1.5 sm:px-2">{(categories.find(c => c.id === product.category_id))?.name || '분류없음'}</Badge>
                      {product.is_limited && (
                        <Badge variant="purple" className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 flex items-center gap-0.5 sm:gap-1">
                          <Gift size={8} sm:size={10} />
                          한정판
                        </Badge>
                      )}
                      {product.flash_sale_enabled && (
                        <Badge variant="orange" className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 flex items-center gap-0.5 sm:gap-1">
                          <Zap size={8} sm:size={10} />
                          선참순
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="admin-text-base truncate">{product.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="admin-text-secondary admin-number">
                          {product.price.toLocaleString()}원
                        </span>
                        <span className="admin-label admin-number">
                          재고: {product.stock}개
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 sm:gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold text-blue-600 border-blue-50 bg-blue-50/30" 
                      onClick={() => onStartEditing(product)}
                    >
                      수정
                    </Button>
                    <Button 
                      variant={product.is_out_of_stock ? 'primary' : 'outline'} 
                      className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold ${!product.is_out_of_stock ? 'text-gray-500 bg-gray-50 border-gray-100' : ''}`} 
                      onClick={() => onToggleStock(product)}
                    >
                      {product.is_out_of_stock ? '판매중' : '품절'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold text-red-400 bg-red-50/30" 
                      onClick={() => onDeleteProduct(product.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminProducts

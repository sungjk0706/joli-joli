import React from 'react';
import { X } from 'lucide-react';
import OrderFormSection from '../customer/OrderFormSection';

const LiveOrderSheet = ({ 
  isOpen, 
  onClose, 
  activeProduct, 
  formData, 
  setFormData, 
  onSubmitOrder, 
  loading, 
  config, 
  showAlert 
}) => {
  if (!isOpen || !activeProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[1000] flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-xl glass-gradient rounded-t-[3rem] animate-slide-up border border-white/40" onClick={e => e.stopPropagation()} style={{ height: '80vh' }}>
        <div className="p-8 h-full overflow-y-auto scrollbar-thin">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl text-gradient-pink">주문하기</h3>
            <button onClick={onClose} className="w-11 h-11 glass rounded-full flex items-center justify-center text-gray-900">
              <X size={20} />
            </button>
          </div>
          <OrderFormSection 
            selectedProduct={activeProduct} 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={(e) => { onSubmitOrder(e, formData, activeProduct); onClose(); }} 
            loading={loading} 
            config={config} 
            showAlert={showAlert} 
          />
        </div>
      </div>
    </div>
  );
};

export default LiveOrderSheet;

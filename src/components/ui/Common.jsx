import { CheckCircle, X, ShoppingBag } from 'lucide-react'
import { cn } from '../../utils/cn'

export const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
  
  const variants = {
    primary: 'bg-brand-pink-dark text-brand-pink-contrast shadow-brand-pink/20 hover:bg-brand-pink',
    secondary: 'bg-brand-blue-dark text-brand-blue-contrast shadow-brand-blue/20 hover:bg-brand-blue',
    dark: 'bg-gray-900 text-white shadow-gray-200 hover:bg-gray-800',
    outline: 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50',
    ghost: 'bg-gray-50 text-gray-400 hover:bg-gray-100 shadow-none'
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-5 text-base',
    xl: 'px-12 py-6 text-xl'
  }

  // 기본 사이즈는 md, xl 등 클래스명에 따라 유동적으로 조절 가능하도록 함
  const variantStyle = variants[variant] || variants.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variantStyle, sizes[variant] || sizes.md, className)}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  )
}

export const Input = ({ label, error, className = '', isCurrency, hideSymbol, ...props }) => {
  // 숫자나 금액 입력 시 우측 정렬을 기본으로 설정
  const isNumber = props.type === 'number' || isCurrency;
  
  // 천 단위 콤마 포맷터
  const formatNumber = (val) => {
    if (!val && val !== 0) return '';
    const num = val.toString().replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleChange = (e) => {
    if (isCurrency) {
      // 콤마를 제거한 순수 숫자만 추출하여 전달
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      const customEvent = {
        ...e,
        target: {
          ...e.target,
          value: rawValue,
          name: props.name
        }
      };
      if (props.onChange) props.onChange(customEvent);
    } else {
      if (props.onChange) props.onChange(e);
    }
  };

  const displayValue = isCurrency ? formatNumber(props.value) : props.value;

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="admin-label block mb-2 ml-1">{label}</label>}
      <div className="relative group">
        <input 
          {...props}
          type={isCurrency ? "text" : props.type}
          inputMode={isCurrency ? "numeric" : props.inputMode}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full bg-white border-2 border-gray-50 rounded-2xl sm:rounded-3xl py-3 sm:py-5 px-4 sm:px-6 admin-text-base focus:border-brand-pink outline-none transition-all shadow-sm",
            isNumber && "text-right tabular-nums font-black",
            isCurrency && !hideSymbol && "pl-10 sm:pl-12"
          )}
        />
        {isCurrency && !hideSymbol && <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 admin-text-base text-brand-pink">₩</span>}
      </div>
      {error && <p className="text-sm text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  )
}

export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className={cn("w-full", className)}>
    {label && <label className="admin-label block mb-2 ml-1">{label}</label>}
    <textarea 
      {...props}
      className="w-full bg-white border-2 border-gray-50 rounded-2xl sm:rounded-3xl py-3 sm:py-5 px-4 sm:px-6 admin-text-base focus:border-brand-pink outline-none transition-all shadow-sm min-h-[150px] resize-none" 
    />
    {error && <p className="text-sm text-red-500 ml-1">{error}</p>}
  </div>
)

export const Card = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-50 overflow-hidden",
      onClick && "cursor-pointer active:scale-[0.98] transition-all",
      className
    )}
  >
    {children}
  </div>
)

export const Badge = ({ children, variant = 'pink', className = '' }) => {
  const variants = {
    pink: 'bg-brand-pink-light text-brand-pink-dark',
    blue: 'bg-brand-blue-light text-brand-blue-dark',
    gray: 'bg-gray-100 text-gray-500',
    white: 'bg-white text-gray-400 border border-gray-100'
  }
  
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-[12px] font-black ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const Stepper = ({ value, onChange, min = 1, className = '' }) => (
  <div className={`flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100 w-fit ${className}`}>
    <button 
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-400 active:scale-90 transition-all border border-gray-100"
    >
      <span className="text-xl font-bold">−</span>
    </button>
    <div className="w-12 text-center font-black text-lg text-gray-800 tabular-nums">
      {value}
    </div>
    <button 
      type="button"
      onClick={() => onChange(value + 1)}
      className="w-10 h-10 flex items-center justify-center bg-brand-pink-dark text-brand-pink-contrast rounded-xl shadow-md active:scale-90 transition-all"
    >
      <span className="text-xl font-bold">+</span>
    </button>
  </div>
)

export const SweetAlert = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success',
  confirmText = '확인',
  showCancel = false,
  onConfirm
}) => {
  if (!isOpen) return null

  const icons = {
    success: <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mb-6 shadow-xl shadow-green-500/10">
               <CheckCircle size={56} />
             </div>,
    error: <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 mb-6 shadow-xl shadow-red-500/10">
             <X size={56} />
           </div>,
    info: <div className="w-24 h-24 bg-brand-pink-light rounded-[2.5rem] flex items-center justify-center text-brand-pink-dark mb-6 shadow-xl shadow-brand-pink/10">
            <ShoppingBag size={56} />
          </div>
  }

  return (
    <div className="fixed top-0 left-0 w-[100vw] h-[100dvh] z-[9999] flex items-center justify-center p-6 animate-fade-in pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 shadow-2xl flex flex-col items-center text-center animate-pop-in border border-gray-50 pointer-events-auto">
        {icons[type]}
        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed whitespace-pre-wrap">{message}</p>
        
        <div className="flex gap-3 w-full">
          {showCancel && (
            <Button variant="outline" className="flex-1 py-5 rounded-3xl text-gray-400 font-bold" onClick={onClose}>
              취소
            </Button>
          )}
          <Button 
            variant={type === 'error' ? 'dark' : 'primary'} 
            className="flex-[2] py-5 text-xl font-black shadow-xl" 
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const SectionHeading = ({ children, icon: Icon, className = '' }) => (
  <div className={`flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 ${className}`}>
    {Icon && (
      <div className="w-9 h-9 sm:w-12 sm:h-12 bg-brand-pink/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-pink shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    )}
    <h2 className="text-xl sm:text-2xl md:text-3xl admin-title truncate">{children}</h2>
  </div>
)

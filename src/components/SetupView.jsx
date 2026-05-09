import BrandBackground from './ui/BrandBackground'

const SetupView = ({ onSkip }) => {
  const [config, setConfig] = useState({ url: '', key: '' })

  const handleSave = () => {
    saveSupabaseConfig(config.url, config.key)
    window.location.reload() // 설정 저장 후 새로고침
  }

  return (
    <BrandBackground className="flex items-center justify-center p-6">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="glass-gradient w-full max-w-md animate-fade-in space-y-6 p-10 rounded-[3rem] shadow-2xl border border-white/40"
      >
        <div className="flex flex-col items-center text-center gap-4 mb-3">
          <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mb-2">
            <Settings className="text-brand-pink-dark animate-spin-slow" size={40} />
          </div>
          <h1 className="text-3xl font-black text-gradient-pink tracking-tight">시스템 초기 설정</h1>
        </div>
        <p className="text-gray-500 mb-8 text-sm font-medium leading-relaxed text-center">
          데이터베이스 연결을 위한 정보를 입력해 주세요.<br/>
          이 정보는 브라우저에 안전하게 저장됩니다.
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-gray-400 ml-3 uppercase tracking-widest">연결 주소 (Supabase URL)</label>
            <input 
              type="text" 
              className="w-full glass border-2 border-white/60 focus:border-brand-pink-dark focus:ring-4 focus:ring-brand-pink/20 rounded-2xl py-4 px-6 text-base font-medium outline-none transition-all duration-300" 
              placeholder="https://xxx.supabase.co" 
              value={config.url}
              onChange={(e) => setConfig({...config, url: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-gray-400 ml-3 uppercase tracking-widest">비밀 키 (Anon Key)</label>
            <input 
              type="password" 
              className="w-full glass border-2 border-white/60 focus:border-brand-pink-dark focus:ring-4 focus:ring-brand-pink/20 rounded-2xl py-4 px-6 text-base font-medium outline-none transition-all duration-300" 
              placeholder="프로젝트 비밀키를 입력하세요" 
              value={config.key}
              onChange={(e) => setConfig({...config, key: e.target.value})}
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 pt-4">
          <button 
            type="submit"
            className="w-full bg-brand-pink text-brand-pink-contrast py-5 rounded-3xl text-xl font-black shadow-xl shadow-brand-pink/30 hover:scale-105 active:scale-95 transition-all"
          >
            설정 저장 및 시작하기
          </button>
          <button 
            type="button" 
            onClick={onSkip}
            className="w-full py-4 text-sm text-gray-400 font-bold hover:text-brand-pink-dark transition-colors"
          >
            나중에 설정할게요 (미리보기 모드)
          </button>
        </div>
      </form>
    </BrandBackground>
  )
}

export default SetupView

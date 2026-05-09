import { createClient } from '@supabase/supabase-js'

// 초기 설정값 (기본적으로 localStorage에서 읽어오거나 빈 값을 반환)
const getSupabaseConfig = () => {
  let url = localStorage.getItem('SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || ''
  const anonKey = localStorage.getItem('SUPABASE_ANON_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  
  // URL 세척: 끝에 붙은 슬래시나 /rest/v1 등 제거
  if (url) {
    url = url.split('/rest/v1')[0].replace(/\/+$/, '');
  }
  
  return { url, anonKey }
}

const { url, anonKey } = getSupabaseConfig()

// URL과 Key가 있을 때만 클라이언트 생성
export const supabase = (url && anonKey) 
  ? createClient(url, anonKey) 
  : null

export const isSupabaseConfigured = () => !!(url && anonKey)

export const saveSupabaseConfig = (url, anonKey) => {
  localStorage.setItem('SUPABASE_URL', url)
  localStorage.setItem('SUPABASE_ANON_KEY', anonKey)
  window.location.reload() // 설정 적용을 위해 새로고침
}

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { configService, productService } from '../services';
import { Card, SectionHeading, Input, Textarea, Button } from './ui/Common';
import { 
  MessageSquare, Trash, Trash2, ShieldOff, Send, Bell, 
  Save
} from 'lucide-react';

const AdminChat = ({ 
  showAlert, 
  onSaveSettings 
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [bannedUsers, setBannedUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadChat();
    loadBannedUsers();
    
    // 실시간 채팅 구독 (관리자 화면에서도 실시간으로 확인 가능하게)
    const channel = supabase
      .channel('admin_chat_monitor')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_chat' }, (payload) => {
        setChatMessages(prev => [payload.new, ...prev].slice(0, 100));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBannedUsers = async () => {
    try {
      const config = await configService.getByKey('banned_users');
      if (config && config.value) {
        setBannedUsers(config.value.split(',').filter(Boolean));
      }
    } catch (error) {
      console.error('Banned users load failed:', error);
    }
  };

  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const { error } = await supabase.from('live_chat').insert({
        user: '관리자',
        text: adminMessage,
        is_admin: true
      });
      if (error) throw error;
      setAdminMessage('');
    } catch (error) {
      showAlert('전송 실패', error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleBanUser = async (userName) => {
    if (userName === '관리자') return;
    if (!window.confirm(`[${userName}] 유저를 차단하시겠습니까? 이 유저의 모든 채팅이 숨겨집니다.`)) return;
    
    try {
      const newBannedList = [...new Set([...bannedUsers, userName])];
      await configService.upsert('banned_users', newBannedList.join(','));
      setBannedUsers(newBannedList);
      showAlert('차단 완료', `${userName} 유저가 차단되었습니다.`, 'success');
    } catch (error) {
      showAlert('차단 실패', error.message, 'error');
    }
  };

  const handleUnbanUser = async (userName) => {
    try {
      const newBannedList = bannedUsers.filter(u => u !== userName);
      await configService.upsert('banned_users', newBannedList.join(','));
      setBannedUsers(newBannedList);
      showAlert('차단 해제', `${userName} 유저의 차단이 해제되었습니다.`, 'success');
    } catch (error) {
      showAlert('해제 실패', error.message, 'error');
    }
  };

  const loadChat = async () => {
    setChatLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_chat')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setChatMessages(data || []);
    } catch (error) {
      console.error('채팅 로드 실패:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('모든 채팅 내역을 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) return;
    try {
      const { error } = await supabase.from('live_chat').delete().neq('id', 0);
      if (error) throw error;
      setChatMessages([]);
      showAlert('삭제 완료', '모든 채팅 내역이 삭제되었습니다.', 'success');
    } catch (error) {
      showAlert('삭제 실패', error.message, 'error');
    }
  };

  const handleDeleteChatMessage = async (id) => {
    try {
      const { error } = await supabase.from('live_chat').delete().eq('id', id);
      if (error) throw error;
      setChatMessages(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      showAlert('삭제 실패', error.message, 'error');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-24">
      {/* 1. 채팅 관리 섹션 (상단으로 이동) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl admin-title flex items-center gap-3">
              <MessageSquare size={28} className="text-zinc-800" />
              라이브 채팅 관리
            </h2>
            <p className="admin-text-secondary text-sm mt-1">실시간 채팅을 모니터링하고 부적절한 메시지를 관리합니다.</p>
          </div>
          <button
            onClick={handleClearChat}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-black flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 shrink-0 whitespace-nowrap text-sm"
          >
            <Trash size={18} />
            <span>채팅창 비우기</span>
          </button>
        </div>

        <div className="bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-350px)] min-h-[500px]">
          <div className="bg-zinc-800/50 px-8 py-5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-white/70 text-[11px] font-black uppercase tracking-[0.2em]">Live Monitor System</span>
              {bannedUsers.length > 0 && (
                <span className="text-red-400/60 text-[10px] font-bold ml-4">
                  BANNED: {bannedUsers.length}
                </span>
              )}
            </div>
            <span className="text-white/30 text-[10px] font-bold">RECENT 100 MESSAGES</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-5 no-scrollbar">
            {chatLoading ? (
              <div className="h-full flex items-center justify-center text-white/10 italic animate-pulse">
                모니터링 시스템 연결 중...
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/5 gap-4">
                <MessageSquare size={64} className="opacity-20" />
                <p className="font-bold text-lg tracking-tight">메시지가 존재하지 않습니다.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className="group flex items-start justify-between gap-6 bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5 hover:bg-white/[0.07] transition-all hover:border-white/10">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${msg.is_admin ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/10 text-white/60'}`}>
                          {msg.is_admin ? 'ADMIN' : 'USER'}
                        </span>
                        <span className={`text-xs font-black ${bannedUsers.includes(msg.user) ? 'text-red-400 line-through' : 'text-white/50'}`}>
                          {msg.user}
                        </span>
                        <span className="text-white/20 text-[10px] font-medium">{new Date(msg.created_at).toLocaleTimeString()}</span>
                        {bannedUsers.includes(msg.user) && (
                          <button onClick={() => handleUnbanUser(msg.user)} className="text-[9px] text-blue-400 font-bold hover:underline">차단해제</button>
                        )}
                      </div>
                      <p className={`text-[15px] leading-relaxed font-medium ${bannedUsers.includes(msg.user) ? 'text-white/20 italic' : 'text-white/90'}`}>
                        {bannedUsers.includes(msg.user) ? '차단된 유저의 메시지입니다.' : msg.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      {!msg.is_admin && !bannedUsers.includes(msg.user) && (
                        <button 
                          onClick={() => handleBanUser(msg.user)}
                          className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center hover:bg-orange-500/20 transition-all"
                          title="유저 차단"
                        >
                          <ShieldOff size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteChatMessage(msg.id)}
                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
                        title="메시지 삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                </div>
              )
            ))}
          </div>

          {/* 관리자 직접 채팅 입력창 */}
          <div className="bg-zinc-800/80 p-6 border-t border-white/5">
            <div className="relative max-w-4xl mx-auto flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 shrink-0">
                <Bell size={24} />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                  placeholder="관리자 공지로 송출할 메시지를 입력하세요..."
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-6 pr-14 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 transition-all font-bold"
                />
                <button 
                  onClick={handleSendAdminMessage}
                  disabled={isSending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;

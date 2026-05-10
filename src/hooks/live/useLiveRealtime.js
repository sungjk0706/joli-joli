import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { configService } from '../../services';

// 모듈 레벨 전역 상태 - Strict Mode에서도 유지
let channelInstance = null;
let subscribeAttempted = false;

export const useLiveRealtime = ({
  isAdmin,
  currentUsername,
  setChatMessages,
  setLikeCount,
  setFloatingItems,
  setNotifications,
  setCurrentShortformVideoUrl,
  setGuideInfo,
  setBannedUsers,
  setViewerCount,
  likeCount
}) => {
  const likeSyncTimer = useRef(null);
  const isActive = useRef(true);

  // 초기 데이터 로드
  useEffect(() => {
    if (!supabase) return;
    
    const fetchInitialData = async () => {
      try {
        const { data: configs } = await supabase
          .from('configs')
          .select('key, value')
          .in('key', ['live_like_count', 'live_guide_info', 'shortform_video_url']);
        
        if (!isActive.current) return;
        
        if (configs) {
          const likes = configs.find(c => c.key === 'live_like_count');
          if (likes) setLikeCount(parseInt(likes.value) || 1284);
          
          const guide = configs.find(c => c.key === 'live_guide_info');
          if (guide) setGuideInfo(guide.value);

          const video = configs.find(c => c.key === 'shortform_video_url');
          if (video) setCurrentShortformVideoUrl(video.value);
        }
      } catch (e) {
        console.log('Initial data fetch skipped (preview mode)');
      }
    };
    
    fetchInitialData();
  }, []);

  // Realtime 구독 - 모듈 레벨에서 단 한 번만 실행
  useEffect(() => {
    if (!supabase) return;
    
    // 이미 구독 완료했으면 스킵
    if (subscribeAttempted && channelInstance) {
      console.log('[useLiveRealtime] Using existing subscription');
      return;
    }
    
    subscribeAttempted = true;

    try {
      // 채널이 없으면 새로 생성 및 모든 리스너 등록
      if (!channelInstance) {
        console.log('[useLiveRealtime] Creating new channel');
        channelInstance = supabase.channel('live-realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (p) => {
            if (!isActive.current) return;
            const name = p.new.customer_name ? `${p.new.customer_name.slice(0,1)}*${p.new.customer_name.slice(-1)}` : '고객';
            const n = { id: Date.now(), text: `${name}님이 주문 완료! 🎉` };
            setNotifications(prev => [...prev, n]);
            setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 3500);
          })
          .on('broadcast', { event: 'join' }, (p) => {
            if (!isActive.current) return;
            setChatMessages(prev => [...prev, { 
              type: 'system', 
              text: `${p.payload.username}님이 입장했습니다. ✨`,
              id: `join-${Date.now()}-${Math.random()}`
            }].slice(-100));
          })
          .on('broadcast', { event: 'like' }, (p) => {
            if (!isActive.current) return;
            setLikeCount(prev => prev + 1);
            const heartId = `heart-${Date.now()}-${Math.random()}`;
            setFloatingItems(prev => {
              if (prev.length > 30) return prev;
              return [...prev, { id: heartId, left: p.payload.left, type: 'heart' }];
            });
            setTimeout(() => {
              setFloatingItems(prev => prev.filter(h => h.id !== heartId));
            }, 2000);
          })
          .on('broadcast', { event: 'chat' }, (p) => {
            if (!isActive.current) return;
            setChatMessages(prev => [...prev, p.payload].slice(-100));
          })
          .on('presence', { event: 'sync' }, () => {
            if (!isActive.current) return;
            const state = channelInstance.presenceState();
            const count = Object.keys(state).length;
            setViewerCount(Math.max(1, count));
          });
      }

      // 구독 시작
      channelInstance.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isActive.current) {
          console.log('[useLiveRealtime] Subscribed successfully');
          await channelInstance.track({ 
            user: currentUsername, 
            online_at: new Date().toISOString() 
          });
        }
      });
    } catch (err) {
      console.log('[useLiveRealtime] Subscription error (non-critical):', err.message);
    }

    return () => {
      isActive.current = false;
      if (likeSyncTimer.current) clearTimeout(likeSyncTimer.current);
    };
  }, [currentUsername]);

  const broadcastLike = (left) => {
    if (!channelInstance) return;
    channelInstance.send({ type: 'broadcast', event: 'like', payload: { left } });
  };

  const broadcastChat = (newMsg) => {
    if (!channelInstance) return;
    channelInstance.send({ type: 'broadcast', event: 'chat', payload: newMsg });
  };

  const syncLikesToDb = (newCount) => {
    if (!supabase) return;
    if (likeSyncTimer.current) clearTimeout(likeSyncTimer.current);
    likeSyncTimer.current = setTimeout(async () => {
      await supabase.from('configs').upsert({ key: 'live_like_count', value: String(newCount) }, { onConflict: 'key' });
    }, 5000);
  };

  return { broadcastLike, broadcastChat, syncLikesToDb };
};

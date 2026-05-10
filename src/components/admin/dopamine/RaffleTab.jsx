import React from 'react';
import { Trophy, Clock, Users, Trash2 } from 'lucide-react';

const RaffleTab = ({ 
  products, 
  raffles, 
  newRaffle, 
  setNewRaffle,
  onCreateRaffle,
  onSelectWinners,
  onDeleteRaffle,
  onToggleActive 
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl admin-title">추첨 이벤트 관리</h2>
      <p className="admin-text-secondary text-sm sm:text-base">랜덤 추첨으로 당첨자를 선정하는 이벤트를 관리합니다.</p>
      
      {/* 추첨 생성 폼 */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-sm">
        <h3 className="admin-title text-base sm:text-lg mb-3 sm:mb-4">새 추첨 이벤트 생성</h3>
        <form onSubmit={onCreateRaffle} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="admin-label block mb-2 ml-1">상품 선택</label>
              <select
                value={newRaffle.productId}
                onChange={(e) => setNewRaffle({ ...newRaffle, productId: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-sm sm:text-base focus:outline-none focus:border-blue-500 [&>option]:text-gray-900 [&>option]:bg-white"
                required
              >
                <option value="">상품 선택</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label block mb-2 ml-1">이벤트 제목</label>
              <input
                type="text"
                value={newRaffle.title}
                onChange={(e) => setNewRaffle({ ...newRaffle, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                placeholder="예: 신상품 런칭 추첨 이벤트"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-label block mb-2 ml-1">설명</label>
              <textarea
                value={newRaffle.description}
                onChange={(e) => setNewRaffle({ ...newRaffle, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-900 text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                placeholder="이벤트 설명을 입력하세요"
                rows="2"
              />
            </div>
            <div>
              <label className="admin-label block mb-2 ml-1">시작 시간</label>
              <input
                type="datetime-local"
                value={newRaffle.startTime}
                onChange={(e) => setNewRaffle({ ...newRaffle, startTime: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="admin-label block mb-2 ml-1">종료 시간</label>
              <input
                type="datetime-local"
                value={newRaffle.endTime}
                onChange={(e) => setNewRaffle({ ...newRaffle, endTime: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="admin-label block mb-2 ml-1">최대 참여자 (선택)</label>
              <input
                type="number"
                value={newRaffle.maxParticipants}
                onChange={(e) => setNewRaffle({ ...newRaffle, maxParticipants: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                placeholder="제한 없으면 비워두세요"
              />
            </div>
            <div>
              <label className="admin-label block mb-2 ml-1">당첨자 수</label>
              <input
                type="number"
                value={newRaffle.winnerCount}
                onChange={(e) => setNewRaffle({ ...newRaffle, winnerCount: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-gray-900 text-[10px] sm:text-sm focus:outline-none focus:border-blue-500"
                min="1"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-900 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Trophy size={18} sm:size={22} />
              <span>추첨 이벤트 생성</span>
            </div>
          </button>
        </form>
      </div>

      {/* 추첨 목록 */}
      {raffles.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-100">
          <Trophy size={36} sm:size={48} className="mx-auto text-gray-200 mb-3 sm:mb-4" />
          <p className="admin-text-base text-sm sm:text-base">추첨 이벤트가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {raffles.map(raffle => (
            <div key={raffle.id} className="bg-white rounded-2xl p-3 sm:p-4 border border-blue-500/20 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="font-black text-gray-900 text-sm sm:text-lg">{raffle.title}</h3>
                    {raffle.is_active && !raffle.is_completed && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] sm:text-xs font-bold">진행중</span>
                    )}
                    {raffle.is_completed && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] sm:text-xs font-bold">완료</span>
                    )}
                    {!raffle.is_active && !raffle.is_completed && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-500/20 text-gray-400 rounded-lg text-[10px] sm:text-xs font-bold">비활성</span>
                    )}
                  </div>
                  <p className="admin-text-secondary text-[10px] sm:text-sm mt-1">{raffle.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-[10px] sm:text-sm">
                    <span className="text-blue-600 font-bold">
                      <Clock size={12} sm:size={14} className="inline mr-0.5 sm:mr-1" />
                      {new Date(raffle.start_time).toLocaleDateString('ko-KR')} ~ {new Date(raffle.end_time).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-gray-700 font-bold">
                      <Users size={12} sm:size={14} className="inline mr-0.5 sm:mr-1" />
                      당첨자: {raffle.winner_count}명
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  {!raffle.is_completed && (
                    <button
                      onClick={() => onToggleActive(raffle)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-sm transition-all ${
                        raffle.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {raffle.is_active ? '활성' : '비활성'}
                    </button>
                  )}
                  {!raffle.is_completed && (
                    <button
                      onClick={() => onSelectWinners(raffle.id)}
                      className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-black text-xs sm:text-base bg-gradient-to-r from-yellow-500 to-orange-500 text-brand-pink-contrast"
                    >
                      당첨자 선정
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteRaffle(raffle.id)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl font-black text-[10px] sm:text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 size={14} sm:size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RaffleTab;

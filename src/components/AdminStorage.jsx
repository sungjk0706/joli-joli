import React, { useState, useEffect, useMemo } from 'react';
import { productService } from '../services';
import { Trash2, FileVideo, FileImage, ExternalLink, RefreshCw, HardDrive, Image as ImageIcon, Video as VideoIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from './ui/Common';

const AdminStorage = ({ showAlert, products = [], config = {} }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await productService.listStorageFiles();
      setFiles(data);
    } catch (error) {
      console.error('스토리지 로드 실패:', error);
      showAlert('오류', '파일 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await productService.uploadImage(file);
      showAlert('업로드 완료', '새로운 파일이 스토리지에 저장되었습니다.', 'success');
      loadFiles(); // 목록 갱신
    } catch (error) {
      showAlert('업로드 실패', error.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 스마트 체크 로직: 파일이 어디서 사용 중인지 판별
  const getUsageStatus = (fileUrl) => {
    const usage = [];
    
    // 1. 상품 이미지 체크
    products.forEach(product => {
      const isUsedInProduct = (product.image_urls || []).includes(fileUrl) || product.image_url === fileUrl;
      if (isUsedInProduct) {
        usage.push({ type: '상품', name: product.name });
      }
    });

    // 2. 기본 영상 설정 체크
    if (config.shortformVideoUrl === fileUrl) {
      usage.push({ type: '설정', name: '기본 숏폼 영상' });
    }

    return usage;
  };

  const handleDelete = async (file) => {
    const usage = getUsageStatus(file.publicUrl);
    const isUsed = usage.length > 0;
    
    let confirmMsg = `[${file.name}] 파일을 정말 삭제하시겠습니까?`;
    if (isUsed) {
      const usageNames = usage.map(u => `[${u.type}: ${u.name}]`).join(', ');
      confirmMsg = `⚠️ 경고: 이 파일은 현재 ${usageNames}에서 사용 중입니다!\n\n삭제할 경우 해당 상품이나 영상이 나오지 않게 됩니다. 그래도 정말 삭제하시겠습니까?`;
    }

    if (!window.confirm(confirmMsg)) return;

    setDeleting(file.name);
    try {
      await productService.deleteStorageFile(file.name);
      setFiles(prev => prev.filter(f => f.name !== file.name));
      showAlert('삭제 완료', '파일이 정상적으로 삭제되었습니다.', 'success');
    } catch (error) {
      showAlert('삭제 실패', error.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isVideoFile = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
  };

  const { imageFiles, videoFiles } = useMemo(() => {
    return files.reduce((acc, file) => {
      if (isVideoFile(file.name)) {
        acc.videoFiles.push(file);
      } else {
        acc.imageFiles.push(file);
      }
      return acc;
    }, { imageFiles: [], videoFiles: [] });
  }, [files]);

  const FileCard = ({ file }) => {
    const usage = getUsageStatus(file.publicUrl);
    const isUsed = usage.length > 0;
    const videoRef = React.useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    return (
      <div key={file.id} className={`group bg-white rounded-[2rem] border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isUsed ? 'border-brand-pink/20' : 'border-zinc-100'}`}>
        {/* Preview Area */}
        <div 
          className="relative aspect-video bg-zinc-100 overflow-hidden cursor-pointer"
          onClick={isVideoFile(file.name) ? togglePlay : undefined}
          onMouseEnter={isVideoFile(file.name) ? () => { videoRef.current?.play(); setIsPlaying(true); } : undefined}
          onMouseLeave={isVideoFile(file.name) ? () => { 
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
              setIsPlaying(false);
            }
          } : undefined}
        >
          {isVideoFile(file.name) ? (
            <div className="w-full h-full flex items-center justify-center relative bg-black">
              <video 
                ref={videoRef}
                src={file.publicUrl} 
                className="w-full h-full object-contain opacity-90"
                muted
                loop
                playsInline
                preload="metadata"
              />
              {/* Center Play Overlay - Hidden when playing */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none transition-opacity group-hover:bg-black/10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <VideoIcon className="text-white drop-shadow-lg" size={32} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <img 
              src={file.publicUrl} 
              alt={file.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          )}
          
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <a 
              href={file.publicUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-zinc-800 hover:bg-white transition-all shadow-lg"
              title="원본 보기"
              onClick={(e) => e.stopPropagation()} // Prevent card click
            >
              <ExternalLink size={18} />
            </a>
          </div>

          {/* Usage Badge Overlay */}
          <div className="absolute bottom-4 left-4 z-10">
            {isUsed ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-pink text-white rounded-full text-[10px] font-black shadow-lg animate-fade-in">
                <CheckCircle2 size={12} />
                사용 중: {usage[0].name} {usage.length > 1 && `외 ${usage.length - 1}건`}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md text-zinc-400 rounded-full text-[10px] font-black shadow-lg">
                <AlertTriangle size={12} />
                미사용 (삭제 가능)
              </div>
            )}
          </div>
        </div>

        {/* Info Area */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-black text-zinc-900 truncate text-sm mb-1" title={file.name}>
              {file.name}
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
              <span className="flex items-center gap-1">
                {isVideoFile(file.name) ? <FileVideo size={12} /> : <FileImage size={12} />}
                {file.name.split('.').pop().toUpperCase()}
              </span>
              <span className="w-1 h-1 bg-zinc-200 rounded-full" />
              <span>{formatSize(file.metadata?.size || 0)}</span>
              <span className="w-1 h-1 bg-zinc-200 rounded-full" />
              <span>{new Date(file.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={() => handleDelete(file)}
            disabled={deleting === file.name}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
              isUsed 
                ? 'bg-zinc-100 text-zinc-400 hover:bg-red-50 hover:text-red-500' 
                : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
            }`}
          >
            {deleting === file.name ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 size={16} />
                {isUsed ? '강제 삭제' : '파일 영구 삭제'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h2 className="text-2xl sm:text-3xl admin-title flex items-center gap-3">
            <HardDrive size={28} className="text-zinc-800" />
            수파베이스 스마트 스토리지 관리
          </h2>
          <p className="admin-text-secondary text-sm mt-1">파일의 실시간 사용 여부를 자동으로 감지하여 안전한 삭제를 도와줍니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="px-6 py-3 bg-brand-pink text-white rounded-xl font-black flex items-center gap-2 hover:bg-brand-pink-dark transition-all active:scale-95 shrink-0 whitespace-nowrap text-sm disabled:opacity-50 shadow-lg shadow-brand-pink/20"
          >
            {uploading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <VideoIcon size={18} />
            )}
            <span>신규 파일 업로드</span>
          </button>
          <button
            onClick={loadFiles}
            disabled={loading || uploading}
            className="px-6 py-3 bg-white border border-zinc-200 text-zinc-800 rounded-xl font-black flex items-center gap-2 hover:bg-zinc-50 transition-all active:scale-95 shrink-0 whitespace-nowrap text-sm disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>목록 갱신</span>
          </button>
        </div>
      </div>

      {loading && files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-pink/20 border-t-brand-pink rounded-full animate-spin" />
          <p className="text-zinc-400 font-bold">파일 목록 분석 중...</p>
        </div>
      ) : (
        <>
          {/* 1. 이미지 섹션 (상단) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-800">이미지 데이터</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Image Assets ({imageFiles.length})</p>
                </div>
              </div>
            </div>
            {imageFiles.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm italic bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                등록된 이미지 파일이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageFiles.map(file => <FileCard key={file.id} file={file} />)}
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-100" />

          {/* 2. 영상 섹션 (하단) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                  <VideoIcon size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-800">영상 데이터</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Video Assets ({videoFiles.length})</p>
                </div>
              </div>
            </div>
            {videoFiles.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-sm italic bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                등록된 영상 파일이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoFiles.map(file => <FileCard key={file.id} file={file} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStorage;

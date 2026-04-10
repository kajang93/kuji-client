import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ImageIcon, Settings as SettingsIcon } from './icons';

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  link?: string;
  buttonText?: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  onBack: () => void;
  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
};

export default function AdminMainBannerManagement({ onBack, banners, setBanners }: Props) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: '',
    link: '',
    isActive: true,
  });

  // Image Requirement Settings
  const [requiredSize, setRequiredSize] = useState({ width: 1920, height: 1080 });
  const [showSettings, setShowSettings] = useState(false);
  const [isCheckingImage, setIsCheckingImage] = useState(false);

  const handleCreate = () => {
    if (banners.length >= 5) {
      alert('최대 5개까지만 이미지를 등록할 수 있습니다.');
      return;
    }
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      buttonText: '시작하기',
      link: '',
      isActive: true,
    });
    setShowEditModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText || '',
      link: banner.link || '',
      isActive: banner.isActive,
    });
    setShowEditModal(true);
  };

  const checkImageDimensions = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === requiredSize.width && img.height === requiredSize.height) {
          resolve(true);
        } else {
          alert(`이미지 크기가 올바르지 않습니다.\n요구사항: ${requiredSize.width}x${requiredSize.height}\n업로드된 이미지: ${img.width}x${img.height}`);
          resolve(false);
        }
      };
      img.onerror = () => {
        alert('이미지를 불러올 수 없습니다. URL을 확인해주세요.');
        resolve(false);
      };
      img.src = url;
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      alert('제목과 이미지는 필수입니다.');
      return;
    }

    setIsCheckingImage(true);
    const isValidSize = await checkImageDimensions(formData.imageUrl);
    setIsCheckingImage(false);

    if (!isValidSize) return;

    const now = new Date().toISOString().split('T')[0];

    if (editingBanner) {
      // Update existing
      const updatedBanners = banners.map(b =>
        b.id === editingBanner.id
          ? { ...b, ...formData, updatedAt: now }
          : b
      );
      setBanners(updatedBanners);
    } else {
      // Create new
      const newBanner: Banner = {
        id: Date.now().toString(),
        ...formData,
        order: banners.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      setBanners([...banners, newBanner]);
    }

    setShowEditModal(false);
    setEditingBanner(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setBanners(
      banners.map(b =>
        b.id === id ? { ...b, isActive: !b.isActive, updatedAt: new Date().toISOString().split('T')[0] } : b
      )
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    newBanners.forEach((b, i) => {
      b.order = i + 1;
    });
    setBanners(newBanners);
  };

  const moveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    newBanners.forEach((b, i) => {
      b.order = i + 1;
    });
    setBanners(newBanners);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-indigo-950 border-b-2 border-teal-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white text-xl">메인 화면 관리</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-white text-purple-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="이미지 규격 설정"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleCreate}
              className="p-2 bg-teal-500 rounded-full hover:bg-teal-600 transition-colors"
              title="새 배너 추가"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900/50 border-b border-white/10 overflow-hidden"
            >
              <div className="p-4 flex items-center gap-6">
                <div className="text-white/80 text-sm font-medium">메인 이미지 규격 설정:</div>
                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-xs">가로(px)</label>
                  <input
                    type="number"
                    value={requiredSize.width}
                    onChange={(e) => setRequiredSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div className="text-white/40">x</div>
                <div className="flex items-center gap-2">
                  <label className="text-white/60 text-xs">세로(px)</label>
                  <input
                    type="number"
                    value={requiredSize.height}
                    onChange={(e) => setRequiredSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div className="text-yellow-400 text-xs ml-2">
                  ※ 설정한 크기와 일치하지 않는 이미지는 등록할 수 없습니다.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-white/60 text-sm">전체 배너</div>
            <div className="text-white text-2xl mt-1">{banners.length} / 5개</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-white/60 text-sm">활성 배너</div>
            <div className="text-teal-400 text-2xl mt-1">
              {banners.filter(b => b.isActive).length}개
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-white/60 text-sm">규격</div>
            <div className="text-yellow-400 text-2xl mt-1">
              {requiredSize.width} x {requiredSize.height}
            </div>
          </div>
        </div>

        {/* Banner List */}
        <div className="space-y-3">
          {banners.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 text-center border border-white/10">
              <ImageIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60">등록된 배너가 없습니다</p>
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                첫 배너 등록하기
              </button>
            </div>
          ) : (
            banners.map((banner, index) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border ${
                  banner.isActive ? 'border-teal-400/50' : 'border-white/20'
                }`}
              >
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative group">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white">
                      미리보기
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg truncate">{banner.title}</h3>
                        <p className="text-white/60 text-sm truncate">{banner.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {banner.isActive ? (
                          <span className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs border border-teal-400/30">
                            활성
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs border border-gray-400/30">
                            비활성
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-white/50">
                      {banner.buttonText && (
                        <div>버튼: {banner.buttonText}</div>
                      )}
                      <div>순서: {banner.order}번째</div>
                      <div>수정일: {banner.updatedAt}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        수정
                      </button>
                      <button
                        onClick={() => toggleActive(banner.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                          banner.isActive
                            ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            : 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                        }`}
                      >
                        {banner.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            숨기기
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            표시
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === banners.length - 1}
                          className="px-2 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 w-full max-w-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl">
                  {editingBanner ? '배너 수정' : '새 배너 등록'}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Warning about size */}
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
                  <div className="text-yellow-500 mt-0.5">⚠️</div>
                  <div className="text-yellow-200 text-sm">
                    반드시 <strong>{requiredSize.width} x {requiredSize.height}</strong> 픽셀 크기의 이미지만 등록 가능합니다.<br/>
                    다른 크기의 이미지는 저장이 제한됩니다.
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-white mb-2">제목 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: 이치방쿠지"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-white mb-2">부제목</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="예: 一番くじ"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-white mb-2">이미지 URL *</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-teal-400"
                  />
                  {formData.imageUrl && (
                    <div className="mt-3 w-full h-48 rounded-lg overflow-hidden bg-white/5 relative">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-white mb-2">버튼 텍스트</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="예: 시작하기"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-white mb-2">링크 (선택)</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="버튼 클릭 시 이동할 링크"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-teal-400"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/30 bg-white/10 text-teal-500 focus:ring-teal-400 focus:ring-offset-0"
                  />
                  <label htmlFor="isActive" className="text-white cursor-pointer">
                    메인 화면에 표시
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isCheckingImage}
                    className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isCheckingImage ? '이미지 확인 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Building2, Mail, Phone, MapPin, FileText, Calendar, Camera, ImageIcon } from './icons';
import { useState, useRef } from 'react';

type BusinessProfileProps = {
  user: { name: string; email: string; type: 'business' };
  onBack: () => void;
  onEdit: () => void;
};

export default function BusinessProfile({ user, onBack, onEdit }: BusinessProfileProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock business data
  const businessInfo = {
    businessName: user.name,
    businessNumber: '123-45-67890',
    representative: '홍길동',
    phone: '02-1234-5678',
    email: user.email,
    address: '서울특별시 강남구 테헤란로 123 (역삼동)',
    registrationDate: '2024-01-15',
    status: '승인됨',
  };

  const handleImageSelect = (type: 'gallery' | 'camera') => {
    setShowImagePicker(false);
    if (type === 'gallery') {
      fileInputRef.current?.click();
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
        fileInputRef.current.removeAttribute('capture');
      }
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-indigo-950 border-b-2 border-teal-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">사업자 프로필</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl mb-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-12 h-12 text-white" />
                )}
              </div>
              <button
                onClick={() => setShowImagePicker(true)}
                className="absolute bottom-4 right-0 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-rose-600 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
            <h2 className="text-white text-2xl mb-2">{businessInfo.businessName}</h2>
            <div className="inline-block px-4 py-1 bg-amber-400/20 border border-amber-400/50 rounded-full text-amber-300 mb-2">
              사업자 계정
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              businessInfo.status === '승인됨'
                ? 'bg-green-500/20 border border-green-400/50 text-green-300'
                : 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300'
            }`}>
              {businessInfo.status}
            </div>
          </div>
        </motion.div>

        {/* Business Information */}
        <div className="space-y-4">
          {/* Business Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/30 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-white/80">사업자등록번호</div>
            </div>
            <div className="text-white pl-13">{businessInfo.businessNumber}</div>
          </motion.div>

          {/* Representative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-300" />
              </div>
              <div className="text-white/80">대표자명</div>
            </div>
            <div className="text-white pl-13">{businessInfo.representative}</div>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-300" />
              </div>
              <div className="text-white/80">대표 전화</div>
            </div>
            <div className="text-white pl-13">{businessInfo.phone}</div>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-rose-500/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-rose-300" />
              </div>
              <div className="text-white/80">이메일</div>
            </div>
            <div className="text-white pl-13">{businessInfo.email}</div>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="text-white/80">사업장 주소</div>
            </div>
            <div className="text-white pl-13">{businessInfo.address}</div>
          </motion.div>

          {/* Registration Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal-500/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-300" />
              </div>
              <div className="text-white/80">가입일</div>
            </div>
            <div className="text-white pl-13">{businessInfo.registrationDate}</div>
          </motion.div>
        </div>

        {/* Edit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="w-full mt-6 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl shadow-xl hover:from-amber-300 hover:to-amber-400 transition-all"
        >
          <div className="text-center">프로필 수정</div>
        </motion.button>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-teal-500/20 border-2 border-teal-400/50 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">ℹ️</div>
            <div className="text-white/70 text-sm">
              사업자 정보 변경이 필요한 경우 고객센터(1588-0000)로 문의해주세요.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Picker Modal */}
      <AnimatePresence>
        {showImagePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowImagePicker(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 max-w-md w-full border-2 border-teal-400/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-xl mb-4 text-center">프로필 사진 선택</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleImageSelect('gallery')}
                  className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>갤러리에서 선택</span>
                </button>

                <button
                  onClick={() => handleImageSelect('camera')}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-400 hover:to-indigo-400 transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Camera className="w-5 h-5" />
                  <span>카메라로 촬영</span>
                </button>

                <button
                  onClick={() => setShowImagePicker(false)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                >
                  <div className="text-center">취소</div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

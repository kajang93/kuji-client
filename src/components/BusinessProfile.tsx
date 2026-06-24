import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Building2, Mail, Phone, MapPin, FileText, Calendar, Camera, ImageIcon } from './icons';
import { useState, useRef, useEffect } from 'react';
import { fetchBusinessProfile } from '../api/auth';
import { validateImageFile, compressImageFile } from '../api/client';

type BusinessProfileProps = {
  user: { name: string; email: string; type: 'business' };
  onBack: () => void;
  onEdit: () => void;
};

export default function BusinessProfile({ user, onBack, onEdit }: BusinessProfileProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchBusinessProfile();
        setBusinessInfo({
          businessName: data.companyName || user.name,
          businessNumber: data.businessNumber || '-',
          representative: data.ceoName || '-',
          phone: user.phone || data.phoneNumber || '-',
          email: user.email,
          address: user.address || data.shippingAddress || '-',
          registrationDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-',
          status: data.status === 'APPROVED' ? '승인됨' : (data.status === 'REJECTED' ? '반려됨' : '심사중'),
        });
      } catch (error) {
        console.error("Failed to load business profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user]);

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

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImageFile(file);
      
      const errorMsg = validateImageFile(compressedFile, 10);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
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
            <h2 className="text-white text-2xl mb-2">{isLoading ? '-' : businessInfo?.businessName}</h2>
            <div className="inline-block px-4 py-1 bg-amber-400/20 border border-amber-400/50 rounded-full text-amber-300 mb-2">
              사업자 계정
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              businessInfo?.status === '승인됨'
                ? 'bg-green-500/20 border border-green-400/50 text-green-300'
                : 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300'
            }`}>
              {isLoading ? '-' : businessInfo?.status}
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
            <div className="text-white pl-13">{isLoading ? '-' : businessInfo?.businessNumber}</div>
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
            <div className="text-white pl-13">{isLoading ? '-' : businessInfo?.representative}</div>
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
            <div className="text-white pl-13">{isLoading ? '-' : businessInfo?.phone}</div>
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
            <div className="text-white pl-13">{isLoading ? '-' : businessInfo?.email}</div>
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
            <div className="text-white pl-13">{isLoading ? '-' : businessInfo?.address}</div>
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
            <div className="text-white pl-13">{isLoading ? '-' : businessInfo?.registrationDate}</div>
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
          프로필 수정
        </motion.button>

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-teal-500/10 border-2 border-teal-400/30 rounded-xl p-5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="text-xl">ℹ️</div>
              <div className="text-white/80 text-sm leading-relaxed">
                사업자 정보 변경이 필요한 경우 아래 버튼을 눌러 카카오톡 채널(쿠지샵)로 문의해 주세요.
              </div>
            </div>
            <button 
              onClick={() => window.open('http://pf.kakao.com/_xxxxxxx/chat', '_blank')}
              className="w-full mt-1 py-3 bg-[#FEE500] text-[#191919] font-bold rounded-xl shadow-md hover:bg-[#F4DC00] transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.86 1.83 5.37 4.6 6.84l-1.07 3.92c-.12.44.38.77.74.52l4.63-3.11c.36.03.73.05 1.1.05 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              카카오톡 채널 문의하기
            </button>
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
                  취소
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

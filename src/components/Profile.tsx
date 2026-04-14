import { motion, AnimatePresence } from './motion';
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Camera, ImageIcon } from './icons';
import { useState, useRef, useEffect } from 'react';

type ProfileProps = {
  user: { name: string; email: string; type: 'social' | 'business' | 'admin'; points?: number; profileImageUrl?: string };
  onBack: () => void;
  onEdit: () => void;
};

export default function Profile({ user, onBack, onEdit }: ProfileProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user.profileImageUrl || null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user.profileImageUrl) {
      setProfileImage(user.profileImageUrl);
    }
  }, [user.profileImageUrl]);

  // Mock user data
  const [userDetails, setUserDetails] = useState({
    name: user.name,
    email: user.email,
    phone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
    birthdate: '1990-01-01',
    joinDate: '2024-01-15',
    type: user.type === 'business' ? '사업자' : '일반 고객',
  });

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
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">내 프로필</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl mb-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
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
            <h2 className="text-white text-2xl mb-2">{userDetails.name}</h2>
            <div className="inline-block px-4 py-1 bg-yellow-400/20 border border-yellow-400/50 rounded-full text-yellow-300">
              {userDetails.type}
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {/* Email */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-sm">이메일</div>
                <div className="text-white">{userDetails.email}</div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-300" />
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-sm">휴대폰</div>
                <div className="text-white">{userDetails.phone}</div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-pink-300" />
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-sm">주소</div>
                <div className="text-white">{userDetails.address}</div>
              </div>
            </div>
          </div>

          {/* Points */}
          {user.points !== undefined && (
            <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm rounded-xl p-4 border-2 border-green-400/50 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="flex-1">
                  <div className="text-green-200 text-sm">보유 포인트</div>
                  <div className="text-white text-xl" style={{ fontWeight: 700 }}>{user.points.toLocaleString()}P</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-400/30">
                <div className="text-green-200 text-xs">
                  💡 쿠지 1장 구매 시 100포인트 적립
                </div>
              </div>
            </div>
          )}

          {/* Birthdate */}
          {userDetails.birthdate && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <div className="text-white/60 text-sm">생년월일</div>
                  <div className="text-white">{userDetails.birthdate}</div>
                </div>
              </div>
            </div>
          )}

          {/* Join Date */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="flex-1">
                <div className="text-white/60 text-sm">가입일</div>
                <div className="text-white">{userDetails.joinDate}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-full shadow-xl"
        >
          <div className="text-center text-lg">프로필 수정</div>
        </motion.button>
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
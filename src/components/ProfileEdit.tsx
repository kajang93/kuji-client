import { useState, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Save, Search, Camera, ImageIcon, X } from './icons';
import AddressSearchModal from './AddressSearchModal';
import { updateMyProfile, changePassword } from '../api/auth';
import { validateImageFile, compressImageFile, validatePasswordRules } from '../api/client';
import { toast } from 'sonner';

type ProfileEditProps = {
  user: { name: string; email: string; type: string; phone?: string; address?: string; addressDetail?: string; birthdate?: string; profileImageUrl?: string };
  onBack: () => void;
  onSave: (userData: UserData) => void;
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  addressDetail?: string;
  birthdate: string;
  profileImage?: string;
};

export default function ProfileEdit({ user, onBack, onSave }: ProfileEditProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '010-1234-5678');
  const [address, setAddress] = useState(user.address || '서울특별시 강남구 테헤란로 123');
  const [addressDetail, setAddressDetail] = useState(user.addressDetail || '');
  const [zonecode, setZonecode] = useState('');
  const [birthdate, setBirthdate] = useState(user.birthdate || '1990-01-01');
  const [profileImage, setProfileImage] = useState<string | null>(user.profileImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 비밀번호 변경 관련 상태
  const [showPwChange, setShowPwChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    const pwError = validatePasswordRules(newPassword);
    if (pwError) {
      toast.error(pwError);
      return;
    }

    try {
      setIsChangingPw(true);
      await changePassword(currentPassword, newPassword);
      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      setShowPwChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsChangingPw(false);
    }
  };


  const handleImageSelect = (type: 'gallery' | 'camera') => {
    setShowImagePicker(false);
    if (type === 'gallery') {
      fileInputRef.current?.click();
    } else {
      // For camera, also use file input with capture attribute
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
        fileInputRef.current.removeAttribute('capture');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!phone.trim()) {
      alert('휴대폰 번호를 입력해주세요');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      const requestData = { nickname: name };
      formData.append(
        "request", 
        new Blob([JSON.stringify(requestData)], { type: "application/json" })
      );
      
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }
      
      const response = await updateMyProfile(formData);
      
      onSave({ 
        name, 
        email, 
        phone, 
        address, 
        addressDetail,
        birthdate, 
        profileImage: response.profileImageUrl 
      });
      onBack();
    } catch (error: any) {
      alert(error.message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
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

      setSelectedFile(compressedFile);
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
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">프로필 수정</h1>
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
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
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
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/60">
                최대 10MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
            <div className="inline-block mt-8 px-4 py-1 bg-amber-400/20 border border-amber-400/50 rounded-full text-amber-300">
              {user.type === 'business' ? '사업자' : '일반 고객'}
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Name */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-300" />
              </div>
              <div className="text-white/80">{user.type === 'business' ? '사업자명' : '이름'}</div>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
              readOnly={user.type === 'business'}
              className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none ${
                user.type === 'business' ? 'opacity-60 cursor-not-allowed' : 'focus:border-pink-400'
              }`}
              placeholder={user.type === 'business' ? '사업자명' : '이름 입력 (최대 12자)'}
            />
          </div>

          {/* Email */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-300" />
              </div>
              <div className="text-white/80">이메일</div>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
              placeholder="이메일 입력"
            />
          </div>

          {/* Phone */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-300" />
              </div>
              <div className="text-white/80">휴대폰</div>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
              placeholder="010-0000-0000"
            />
          </div>

          {/* Address */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-pink-500/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-pink-300" />
              </div>
              <div className="text-white/80">주소</div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={zonecode}
                  readOnly
                  onClick={() => setShowAddressSearch(true)}
                  className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400 cursor-pointer"
                  placeholder="우편번호"
                />
                <button
                  onClick={() => setShowAddressSearch(true)}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors whitespace-nowrap"
                >
                  우편번호 검색
                </button>
              </div>
              <input
                type="text"
                value={address}
                readOnly
                onClick={() => setShowAddressSearch(true)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400 cursor-pointer"
                placeholder="기본 주소"
              />
              <input
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                placeholder="상세주소를 입력하세요"
              />
            </div>
          </div>

          {/* Birthdate */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="text-white/80">생년월일</div>
            </div>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Password Change Section (only for non-social) */}
          {user.type !== 'social' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowPwChange(!showPwChange)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="text-white/80">비밀번호 변경</div>
                </div>
                <div className={`transition-transform duration-300 ${showPwChange ? 'rotate-180' : ''}`}>
                  <ChevronLeft className="w-5 h-5 text-white/50 -rotate-90" />
                </div>
              </div>
              
              <AnimatePresence>
                {showPwChange && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handlePasswordChange} className="space-y-4 border-t border-white/10 pt-4">
                      <div>
                        <label className="block text-white/60 text-sm mb-1">현재 비밀번호</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-1">새 비밀번호</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                          placeholder="8자 이상"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 text-sm mb-1">새 비밀번호 확인</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isChangingPw}
                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 mt-2"
                      >
                        {isChangingPw ? '변경 중...' : '비밀번호 변경 저장'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full mt-6 py-4 text-white rounded-full shadow-xl flex items-center justify-center gap-2 ${
            isSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-purple-500'
          }`}
        >
          <Save className="w-5 h-5" />
          <div className="text-lg">{isSaving ? '저장 중...' : '저장하기'}</div>
        </motion.button>
      </div>

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        title="주소 검색"
        description="검색할 도로명 또는 지번 주소를 입력하세요"
        onComplete={(result) => {
          setAddress(result.address);
          setZonecode(result.zonecode);
        }}
      />

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
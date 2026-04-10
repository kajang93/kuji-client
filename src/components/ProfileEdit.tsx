import { useState, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Save, Search, Camera, ImageIcon, X } from './icons';

type ProfileEditProps = {
  user: { name: string; email: string; type: 'social' | 'business'; phone?: string; address?: string; birthdate?: string };
  onBack: () => void;
  onSave: (userData: UserData) => void;
};

type UserData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthdate: string;
};

export default function ProfileEdit({ user, onBack, onSave }: ProfileEditProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '010-1234-5678');
  const [address, setAddress] = useState(user.address || '서울특별시 강남구 테헤란로 123');
  const [birthdate, setBirthdate] = useState(user.birthdate || '1990-01-01');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showAddressSearch, setShowAddressSearch] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddressSearch = () => {
    // Mock address search - in real app, use Daum/Kakao Address API
    const mockResults = [
      '서울특별시 강남구 테헤란로 123 (역삼동)',
      '서울특별시 강남구 강남대로 456 (논현동)',
      '서울특별시 서초구 서초대로 789 (서초동)',
      '서울특별시 송파구 올림픽로 100 (잠실동)',
      '서울특별시 마포구 월드컵북로 200 (상암동)',
      '경기도 성남시 분당구 판교역로 300 (삼평동)',
      '경기도 수원시 영통구 광교중앙로 400 (하동)',
      '인천광역시 연수구 센트럴로 500 (송도동)',
      '부산광역시 해운대구 센텀중앙로 600 (우동)',
      '대구광역시 수성구 동대구로 700 (범어동)',
      '광주광역시 서구 상무대로 800 (치평동)',
      '대전광역시 유성구 대학로 900 (궁동)',
      '울산광역시 남구 삼산로 1000 (삼산동)',
      '제주특별자치도 제주시 노형로 1100 (노형동)',
      '서울특별시 종로구 세종대로 1200 (세종로)',
      '서울특별시 중구 을지로 1300 (을지로동)',
      '서울특별시 용산구 이태원로 1400 (이태원동)',
      '서울특별시 성동구 왕십리로 1500 (행당동)',
      '서울특별시 광진구 능동로 1600 (자양동)',
      '서울특별시 동대��구 왕산로 1700 (용두동)',
      '서울특별시 강남구 테헤란로 152',
      '서울특별시 강남구 역삼동 123-45',
    ].filter(addr => addr.toLowerCase().includes(addressSearchTerm.toLowerCase()));
    
    setAddressSearchResults(mockResults);
  };

  const handleSelectAddress = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setShowAddressSearch(false);
    setAddressSearchTerm('');
    setAddressSearchResults([]);
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

  const handleSave = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    if (!phone.trim()) {
      alert('휴대폰 번호를 입력해주세요');
      return;
    }

    onSave({ name, email, phone, address, birthdate });
    onBack();
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="hidden"
              />
            </div>
            <div className="inline-block px-4 py-1 bg-amber-400/20 border border-amber-400/50 rounded-full text-amber-300">
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
              <div className="text-white/80">이름</div>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
              placeholder="이름 입력"
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                  placeholder="주소를 검색하세요"
                />
                <button
                  onClick={() => setShowAddressSearch(true)}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors flex items-center justify-center shrink-0"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
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
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-xl flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <div className="text-lg">저장하기</div>
        </motion.button>
      </div>

      {/* Address Search Modal */}
      <AnimatePresence>
        {showAddressSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddressSearch(false);
              setAddressSearchTerm('');
              setAddressSearchResults([]);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">주소 검색</h2>
                <button
                  onClick={() => {
                    setShowAddressSearch(false);
                    setAddressSearchTerm('');
                    setAddressSearchResults([]);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={addressSearchTerm}
                  onChange={(e) => setAddressSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
                  placeholder="도로명 또는 지번 입력 후 Enter"
                />
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {addressSearchResults.length === 0 ? (
                  <div className="text-white/60 text-center py-8">
                    {addressSearchTerm ? '검색 결과가 없습니다' : '주소를 입력하고 Enter를 눌러주세요'}
                  </div>
                ) : (
                  addressSearchResults.map((addr, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAddress(addr)}
                      className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/10"
                    >
                      {addr}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Check, Upload, X, FileText, Search } from './icons';
import { toast } from 'sonner@2.0.3';

type SignupProps = {
  userType: 'customer' | 'business';
  onBack: () => void;
  onComplete: (type: 'registered' | 'requested') => void;
};

export default function Signup({ userType, onBack, onComplete }: SignupProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Refs for input fields
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    passwordConfirm: '',
    name: '',
    nickname: '',
    emailId: '',
    emailDomain: 'naver.com',
    customDomain: '',
    phone: '',
    phoneVerified: false,
    verificationCode: '',
    address: '',
    addressDetail: '',
    birthdate: today,
    businessNumber: '',
    businessName: '',
    managerName: '',
    shippingAddress: '',
    shippingAddressDetail: '',
    businessFile: null as File | null,
  });

  const [idChecked, setIdChecked] = useState(false);
  const [idAvailable, setIdAvailable] = useState(false);
  const [businessNumberChecked, setBusinessNumberChecked] = useState(false);
  const [businessNumberValid, setBusinessNumberValid] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [addressSearchResults, setAddressSearchResults] = useState<string[]>([]);
  const [shippingSearchTerm, setShippingSearchTerm] = useState('');
  const [shippingSearchResults, setShippingSearchResults] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const emailDomains = [
    'naver.com',
    'gmail.com',
    'hanmail.net',
    'kakao.com',
    'daum.net',
    'hotmail.com',
    'yahoo.co.kr',
    '직접입력',
  ];

  const handleChange = (field: string, value: string) => {
    // Auto-format phone number with hyphens
    if (field === 'phone') {
      const cleaned = value.replace(/[^0-9]/g, '');
      let formatted = cleaned;
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
      }
      setFormData({ ...formData, [field]: formatted });
      return;
    }
    
    setFormData({ ...formData, [field]: value });
    if (field === 'id') {
      setIdChecked(false);
      setIdAvailable(false);
    }
    if (field === 'businessNumber') {
      setBusinessNumberChecked(false);
      setBusinessNumberValid(false);
    }
    if (field === 'password') {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string) => {
    setPasswordChecked(false);
    if (password.length === 0) {
      setPasswordError('');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('비밀번호는 최소 8자 이상이어야 합니다');
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const validCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (validCount < 3) {
      setPasswordError('영문 대/소문자, 숫자, 특수문자 중 3가지 이상 조합');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handlePasswordCheck = () => {
    const isValid = validatePassword(formData.password);
    if (isValid) {
      setPasswordChecked(true);
      toast.success('사용 가능한 비밀번호입니다.');
    } else if (formData.password.length === 0) {
      toast.error('비밀번호를 입력해주세요.');
    } else {
      toast.error(passwordError || '비밀번호 형식을 확인해주세요.');
    }
  };

  const handleIdCheck = () => {
    if (formData.id.length >= 4) {
      const isAvailable = Math.random() > 0.3;
      setIdAvailable(isAvailable);
      setIdChecked(true);
      if (isAvailable) {
        toast.success('사용 가능한 아이디입니다.');
      } else {
        toast.error('이미 사용중인 아이디입니다.');
      }
    }
  };

  const handleBusinessNumberCheck = () => {
    if (formData.businessNumber.length === 10) {
      const isValid = Math.random() > 0.2;
      setBusinessNumberValid(isValid);
      setBusinessNumberChecked(true);
      if (isValid) {
        toast.success('유효한 사업자번호입니다.');
      } else {
        toast.error('유효하지 않은 사업자번호입니다.');
      }
    }
  };

  const handleSendVerification = () => {
    if (formData.phone.length >= 10) {
      setPhoneVerificationSent(true);
      toast.success('인증번호가 전송되었습니다.');
    }
  };

  const handleVerifyPhone = () => {
    if (formData.verificationCode.length === 6) {
      setFormData({ ...formData, phoneVerified: true });
      toast.success('휴대폰 인증이 완료되었습니다.');
    }
  };

  const handleAddressSearch = () => {
    // Mock address search - in real app, use Daum/Kakao Address API
    const allAddresses = [
      '서울특별시 강남구 테헤란로 123',
      '서울특별시 강남구 테헤란로 152',
      '서울특별시 강남구 역삼동 123-45',
      '서울특별시 강남구 삼성동 456-78',
      '서울특별시 종로구 종로 456',
      '경기도 성남시 분당구 정자동 789',
      '부산광역시 해운대구 해운대로 101',
      '인천광역시 남동구 논현동 202',
      '대전광역시 서구 둔산동 303',
    ];
    
    const results = addressSearchTerm
      ? allAddresses.filter(addr => addr.includes(addressSearchTerm))
      : [];
    
    setAddressSearchResults(results);
  };

  const handleShippingAddressSearch = () => {
    // Mock address search - in real app, use Daum/Kakao Address API
    const allAddresses = [
      '서울특별시 강남구 테헤란로 123',
      '서울특별시 강남구 테헤란로 152',
      '서울특별시 강남구 역삼동 123-45',
      '서울특별시 강남구 삼성동 456-78',
      '서울특별시 종로구 종로 456',
      '경기도 성남시 분당구 정자동 789',
      '부산광역시 해운대구 해운대로 101',
      '인천광역시 남동구 논현동 202',
      '대전광역시 서구 둔산동 303',
    ];
    
    const results = shippingSearchTerm
      ? allAddresses.filter(addr => addr.includes(shippingSearchTerm))
      : [];
    
    setShippingSearchResults(results);
  };

  const handleAddressSelect = (address: string) => {
    setFormData({ ...formData, address });
    setShowAddressModal(false);
    setAddressSearchTerm('');
    setAddressSearchResults([]);
  };

  const handleShippingAddressSelect = (address: string) => {
    setFormData({ ...formData, shippingAddress: address });
    setShowShippingAddressModal(false);
    setShippingSearchTerm('');
    setShippingSearchResults([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, businessFile: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('이용약관에 동의해주세요.');
      return;
    }

    if (userType === 'customer') {
      if (!idChecked || !idAvailable) {
        toast.error('아이디 중복확인을 완료해주세요.');
        return;
      }
    } else {
      if (!businessNumberChecked || !businessNumberValid) {
        toast.error('사업자번호 확인을 완료해주세요.');
        return;
      }
    }

    if (!passwordChecked) {
      toast.error('비밀번호 확인을 완료해주세요.');
      return;
    }

    if (passwordError) {
      toast.error('비밀번호 형식을 확인해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    const email = formData.emailDomain === '직접입력' 
      ? `${formData.emailId}@${formData.customDomain}`
      : `${formData.emailId}@${formData.emailDomain}`;

    if (!formData.emailId || (formData.emailDomain === '직접입력' && !formData.customDomain)) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    if (!formData.phone) {
      toast.error('휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!formData.phoneVerified) {
      toast.error('휴대폰 인증을 완료해주세요.');
      return;
    }

    if (userType === 'customer') {
      if (!formData.address) {
        toast.error('배송주소를 입력해주세요.');
        return;
      }
    }

    if (userType === 'business') {
      if (!formData.businessName) {
        toast.error('사업자명을 입력해주세요.');
        return;
      }
      if (!formData.managerName) {
        toast.error('담당자명을 입력해주세요.');
        return;
      }
      if (!formData.shippingAddress) {
        toast.error('출고지 주소를 입력해주세요.');
        return;
      }
      if (!formData.businessFile) {
        toast.error('사업자등록증 파일을 첨부해주세요.');
        return;
      }
    }

    const signupData = {
      userId: userType === 'customer' ? formData.id : formData.businessNumber,
      password: formData.password,
      name: userType === 'customer' ? formData.name : formData.businessName,
      email: email,
      phone: formData.phone,
      address: userType === 'customer' ? formData.address : formData.shippingAddress,
      birthdate: userType === 'customer' ? formData.birthdate : null,
      businessNumber: userType === 'business' ? formData.businessNumber : null,
      authorities: userType === 'business' ? ['ROLE_BUSINESS'] : ['ROLE_USER']
    };

    fetch("/api/members/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorMsg = await res.text();
          throw new Error(errorMsg || "회원가입에 실패했습니다.");
        }
        return res.json();
      })
      .then(() => {
        if (userType === 'business') {
          toast.success('사업자 등록 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.');
          onComplete('requested');
        } else {
          toast.success('회원가입이 완료되었습니다!');
          onComplete('registered');
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">
            {userType === 'business' ? '사업자 등록 신청' : '회원가입'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-w-2xl mx-auto">
        {userType === 'customer' ? (
          <>
            {/* Customer Form */}
            {/* ID */}
            <div>
              <label className="block text-white mb-2">
                아이디 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleChange('id', e.target.value)}
                  onKeyDown={(e) => {
                    // ID 입력 후 엔터 시 중복확인 실행 대신 비밀번호로 이동하도록 변경
                    // 또는 여기서 엔터 치면 바로 비밀번호로 가는 게 더 자연스러움
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                       e.preventDefault();
                       passwordRef.current?.focus();
                    }
                  }}
                  placeholder="4자 이상 입력"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                  required
                />
                <button
                  type="button"
                  onClick={handleIdCheck}
                  disabled={formData.id.length < 4}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap ${
                    formData.id.length >= 4
                      ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">확인</div>
                </button>
              </div>
              {idChecked && (
                <p className={`mt-1 text-sm ${idAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {idAvailable ? '✓ 사용 가능한 아이디입니다' : '✗ 이미 사용중인 아이디입니다'}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Business Form */}
            {/* Business Number */}
            <div>
              <label className="block text-white mb-2">
                사업자등록번호 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.businessNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 10) {
                      handleChange('businessNumber', value);
                    }
                  }}
                  placeholder="10자리 숫자 입력"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                  required
                />
                <button
                  type="button"
                  onClick={handleBusinessNumberCheck}
                  disabled={formData.businessNumber.length !== 10}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap ${
                    formData.businessNumber.length === 10
                      ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">확인</div>
                </button>
              </div>
              {businessNumberChecked && (
                <p className={`mt-1 text-sm ${businessNumberValid ? 'text-green-400' : 'text-red-400'}`}>
                  {businessNumberValid ? '✓ 유효한 사업자번호입니다' : '✗ 유효하지 않은 사업자번호입니다'}
                </p>
              )}
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-white mb-2">
                사업자명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="사업자명을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>

            {/* Manager Name */}
            <div>
              <label className="block text-white mb-2">
                담당자명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => handleChange('managerName', e.target.value)}
                placeholder="담당자명을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>
          </>
        )}

        {/* Password */}
        <div>
          <label className="block text-white mb-2">
            비밀번호 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  passwordConfirmRef.current?.focus();
                }
              }}
              ref={passwordRef}
              placeholder="8자 이상, 영문/숫자/특수문자 중 3가지 조합"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              required
            />
            <button
              type="button"
              onClick={handlePasswordCheck}
              disabled={formData.password.length === 0}
              className={`px-4 sm:px-6 py-3 rounded-xl whitespace-nowrap text-sm sm:text-base ${
                formData.password.length > 0
                  ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="text-center">확인</div>
            </button>
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-red-400">✗ {passwordError}</p>
          )}
          {passwordChecked && !passwordError && (
            <p className="mt-1 text-sm text-green-400">✓ 사용 가능한 비밀번호입니다</p>
          )}
        </div>

        {/* Password Confirm */}
        <div>
          <label className="block text-white mb-2">
            비밀번호 확인 <span className="text-red-400">*</span>
          </label>
          {userType === 'business' ? (
            <div className="flex gap-2">
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                ref={passwordConfirmRef}
                placeholder="비밀번호를 다시 입력하세요"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.password === formData.passwordConfirm && formData.passwordConfirm) {
                    toast.success('✓ 비밀번호가 일치합니다');
                  } else if (!formData.passwordConfirm) {
                    toast.error('비밀번호 확인을 입력해주세요');
                  } else {
                    toast.error('✗ 비밀번호가 일치하지 않습니다');
                  }
                }}
                disabled={!formData.passwordConfirm}
                className={`px-4 sm:px-6 py-3 rounded-xl whitespace-nowrap text-sm sm:text-base ${
                  formData.passwordConfirm
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-center">확인</div>
              </button>
            </div>
          ) : (
            <input
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => handleChange('passwordConfirm', e.target.value)}
              ref={passwordConfirmRef}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              required
            />
          )}
          {formData.passwordConfirm && (
            <p className={`mt-1 text-sm ${formData.password === formData.passwordConfirm ? 'text-green-400' : 'text-red-400'}`}>
              {formData.password === formData.passwordConfirm ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-white mb-2">
            이메일 <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                value={formData.emailId}
                onChange={(e) => handleChange('emailId', e.target.value)}
                placeholder="이메일 ID"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
              <span className="flex items-center text-white px-1 sm:px-2">@</span>
            </div>
            <select
              value={formData.emailDomain}
              onChange={(e) => handleChange('emailDomain', e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:border-yellow-400"
            >
              {emailDomains.map((domain) => (
                <option key={domain} value={domain} className="bg-purple-900">
                  {domain}
                </option>
              ))}
            </select>
          </div>
          {formData.emailDomain === '직접입력' && (
            <input
              type="text"
              value={formData.customDomain}
              onChange={(e) => handleChange('customDomain', e.target.value)}
              placeholder="도메인 입력 (예: example.com)"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 mt-2"
              required
            />
          )}
        </div>

        {/* Phone with Verification */}
        <div>
          <label className="block text-white mb-2">
            휴대폰 번호 <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, '');
                handleChange('phone', value);
              }}
              placeholder="010-0000-0000"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              disabled={formData.phoneVerified}
              required
            />
            {!formData.phoneVerified && (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={formData.phone.length < 10}
                className={`px-6 py-3 rounded-xl whitespace-nowrap ${
                  formData.phone.length >= 10
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-center">인증</div>
              </button>
            )}
          </div>
          
          {phoneVerificationSent && !formData.phoneVerified && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={formData.verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 6) {
                    handleChange('verificationCode', value);
                  }
                }}
                placeholder="인증번호 6자리"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleVerifyPhone}
                disabled={formData.verificationCode.length !== 6}
                className={`px-6 py-3 rounded-xl whitespace-nowrap ${
                  formData.verificationCode.length === 6
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-center">확인</div>
              </button>
            </div>
          )}

          {formData.phoneVerified && (
            <p className="mt-1 text-sm text-green-400">✓ 휴대폰 인증이 완료되었습니다</p>
          )}
        </div>

        {/* Address - Customer Only */}
        {userType === 'customer' && (
          <>
            <div>
              <label className="block text-white mb-2">
                배송주소 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.address}
                  readOnly
                  placeholder="주소 검색 버튼을 클릭하세요"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 cursor-pointer"
                  onClick={() => setShowAddressModal(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-3 py-3 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-400 whitespace-nowrap flex items-center justify-center shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={formData.addressDetail}
                onChange={(e) => handleChange('addressDetail', e.target.value)}
                placeholder="상세주소를 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-white mb-2">생년월일</label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleChange('birthdate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-white mb-2">닉네임</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </>
        )}

        {/* Shipping Address - Business Only */}
        {userType === 'business' && (
          <>
            <div>
              <label className="block text-white mb-2">
                출고지 주소 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.shippingAddress}
                  readOnly
                  placeholder="주소 검색 버튼을 클릭하세요"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 cursor-pointer"
                  onClick={() => setShowShippingAddressModal(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowShippingAddressModal(true)}
                  className="px-3 py-3 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-400 whitespace-nowrap flex items-center justify-center shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={formData.shippingAddressDetail}
                onChange={(e) => handleChange('shippingAddressDetail', e.target.value)}
                placeholder="상세주소를 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Business License File */}
            <div>
              <label className="block text-white mb-2">
                사업자등록증 첨부 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="business-file"
                  required
                />
                <label
                  htmlFor="business-file"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white cursor-pointer hover:bg-white/20 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>{formData.businessFile ? formData.businessFile.name : '파일 선택 (이미지 또는 PDF)'}</span>
                </label>
              </div>
              {formData.businessFile && (
                <div className="flex items-center gap-2 mt-2 p-3 bg-white/10 rounded-xl">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm flex-1">{formData.businessFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, businessFile: null })}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Terms Agreement */}
        <div className="pt-6 border-t border-white/20">
          <label className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-1">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  agreedToTerms
                    ? 'bg-yellow-500 border-yellow-500'
                    : 'border-white/30 bg-white/10'
                }`}
              >
                {agreedToTerms && <Check className="w-4 h-4 text-purple-900" />}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white">
                  이용약관 동의 <span className="text-red-400">*</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-yellow-400 text-sm underline hover:text-yellow-300 flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>전문 보기</span>
                </button>
              </div>
              <p className="text-white/60 text-sm">
                일본 이치방 쿠지 서비스 이용약관 및 개인정보 처리방침에 동의합니다.
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl text-lg shadow-2xl mt-8"
        >
          <div className="text-center">
            {userType === 'business' ? '신청 요청' : '회원가입 완료'}
          </div>
        </motion.button>
      </form>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-2 border-cyan-400/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">이용약관 및 개인정보 처리방침</h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white/10 rounded-2xl p-6 space-y-4 text-white/90 text-sm">
                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">제1조 (목적)</h3>
                  <p>본 약관은 일본 이치방 쿠지 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">제2조 (서비스의 제공)</h3>
                  <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>일본 애니메이션 관련 쿠지 복권 판매</li>
                    <li>당첨 결과 확인 및 배송 서비스</li>
                    <li>상품 구매 내역 및 당첨 내역 관리</li>
                    <li>찜 목록 및 알림 서비스</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">제3조 (개인정보의 수집 및 이용)</h3>
                  <p>회사는 다음의 목적으로 개인정보를 수집 및 이용합니다:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>회원가입 및 본인 확인</li>
                    <li>상품 배송 및 고객 서비스 제공</li>
                    <li>서비스 이용 통계 및 분석</li>
                    <li>마케팅 및 광고 활용 (선택 동의 시)</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">제4조 (회원의 의무)</h3>
                  <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>타인의 정보를 도용하는 행위</li>
                    <li>서비스의 정상적인 운영을 방해하는 행위</li>
                    <li>불법적인 목적으로 서비스를 이용하는 행위</li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">제5조 (환불 및 교환)</h3>
                  <p>쿠지 복권의 특성상 구매 후 환불 및 교환이 불가능합니다. 단, 상품 하자 또는 배송 오류가 있는 경우 교환이 가능합니다.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">제6조 (면책사항)</h3>
                  <p>회사는 천재지변, 불가항력 또는 이에 준하는 사유로 서비스를 제공할 수 없는 경우 책임을 면합니다.</p>
                </section>

                <section>
                  <h3 className="font-semibold text-yellow-400 mb-2">개인정보 처리방침</h3>
                  <p className="mb-2">회사는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
                  <p className="text-white/70">수집하는 개인정보 항목: 이메일, 휴대폰번호, 배송주소, 결제정보</p>
                  <p className="text-white/70 mt-1">보유 및 이용기간: 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관)</p>
                </section>
              </div>

              <button
                onClick={() => setShowTermsModal(false)}
                className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all"
              >
                <div className="text-center">닫기</div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Search Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 max-w-md w-full border-2 border-cyan-400/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">주소 검색</h2>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setAddressSearchTerm('');
                    setAddressSearchResults([]);
                  }}
                  className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <p className="text-white/70 text-sm mb-4">배송받을 주소를 검색해주세요</p>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={addressSearchTerm}
                  onChange={(e) => setAddressSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                  placeholder="도로명 또는 지번 입력 후 Enter"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {addressSearchResults.length === 0 ? (
                  <div className="text-white/60 text-center py-8">
                    {addressSearchTerm ? '검색 결과가 없습니다' : '주소를 입력하고 Enter를 눌러주세요'}
                  </div>
                ) : (
                  addressSearchResults.map((address, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddressSelect(address)}
                      className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-left transition-colors border border-white/20"
                    >
                      {address}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Address Search Modal */}
      <AnimatePresence>
        {showShippingAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShippingAddressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 max-w-md w-full border-2 border-cyan-400/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">출고지 주소 검색</h2>
                <button
                  onClick={() => {
                    setShowShippingAddressModal(false);
                    setShippingSearchTerm('');
                    setShippingSearchResults([]);
                  }}
                  className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <p className="text-white/70 text-sm mb-4">출고지 주소를 검색해주세요</p>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={shippingSearchTerm}
                  onChange={(e) => setShippingSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleShippingAddressSearch()}
                  placeholder="도로명 또는 지번 입력 후 Enter"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Search Results */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {shippingSearchResults.length === 0 ? (
                  <div className="text-white/60 text-center py-8">
                    {shippingSearchTerm ? '검색 결과가 없습니다' : '주소를 입력하고 Enter를 눌러주세요'}
                  </div>
                ) : (
                  shippingSearchResults.map((address, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleShippingAddressSelect(address)}
                      className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-left transition-colors border border-white/20"
                    >
                      {address}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Check, Upload, X, FileText, Search } from './icons';
import { toast } from 'sonner';
import { signup, checkEmail, sendSms, verifySms } from '../api/auth';
import { compressImageFile, validatePasswordRules } from '../api/client';
import AddressSearchModal from './AddressSearchModal';

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
    zonecode: '',
    birthdate: today,
    businessNumber: '',
    businessName: '',
    managerName: '',
    shippingAddress: '',
    shippingAddressDetail: '',
    shippingZonecode: '',
    businessFile: null as File | null,
  });

  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [businessNumberChecked, setBusinessNumberChecked] = useState(false);
  const [businessNumberValid, setBusinessNumberValid] = useState(false);
  const [phoneVerificationSent, setPhoneVerificationSent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);

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
    if (field === 'emailId' || field === 'emailDomain' || field === 'customDomain') {
      setEmailChecked(false);
      setEmailAvailable(false);
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
    
    const errorMsg = validatePasswordRules(password);
    if (errorMsg) {
      setPasswordError(errorMsg);
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

  const handleEmailCheck = async () => {
    const email = formData.emailDomain === '직접입력' 
      ? `${formData.emailId}@${formData.customDomain}`
      : `${formData.emailId}@${formData.emailDomain}`;

    if (formData.emailId.length >= 2) {
      try {
        const isAvailable = await checkEmail(email);
        setEmailAvailable(isAvailable);
        setEmailChecked(true);
        if (isAvailable) {
          toast.success('사용 가능한 이메일입니다.');
        } else {
          toast.error('이미 사용중인 이메일입니다.');
        }
      } catch (error) {
        toast.error('이메일 중복 확인에 실패했습니다.');
      }
    } else {
      toast.error('이메일 주소를 입력해주세요.');
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

  const handleSendVerification = async () => {
    if (formData.phone.length >= 10) {
      try {
        await sendSms(formData.phone);
        setPhoneVerificationSent(true);
        toast.success('인증번호가 전송되었습니다.');
      } catch (error: any) {
        toast.error(error.message || '인증번호 전송에 실패했습니다.');
      }
    }
  };

  const handleVerifyPhone = async () => {
    if (formData.verificationCode.length === 6) {
      try {
        await verifySms(formData.phone, formData.verificationCode);
        setFormData({ ...formData, phoneVerified: true });
        toast.success('휴대폰 인증이 완료되었습니다.');
      } catch (error: any) {
        toast.error(error.message || '인증번호 확인에 실패했습니다.');
      }
    }
  };



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      let fileToUpload = file;
      
      // 이미지만 압축 (PDF 등은 그대로 통과)
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImageFile(file);
      }
      
      if (fileToUpload.size > 10 * 1024 * 1024) {
        toast.error('파일 용량은 10MB를 초과할 수 없습니다.');
        return;
      }
      setFormData({ ...formData, businessFile: fileToUpload });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms || !agreePrivacy) {
      toast.error('필수 이용약관에 동의해주세요.');
      return;
    }

    if (!emailChecked || !emailAvailable) {
      toast.error('이메일 중복확인을 완료해주세요.');
      return;
    }

    if (userType === 'business') {
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
      email: email,
      password: formData.password,
      nickname: formData.nickname || (userType === 'customer' ? formData.name : formData.businessName),
      phoneNumber: formData.phone,
      birthDate: userType === 'customer' ? formData.birthdate : null,
      role: userType === 'business' ? 'BIZ' : 'USER',
      businessNumber: userType === 'business' ? formData.businessNumber : null,
      companyName: userType === 'business' ? formData.businessName : null,
      ceoName: userType === 'business' ? formData.managerName : null,
      businessAddress: userType === 'business' ? formData.shippingAddress : null,
      isTermsAgreed: agreeTerms,
      isPrivacyAgreed: agreePrivacy,
      isMarketingAgreed: agreeMarketing
    };

    signup(signupData)
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
        {/* Business Form Specifics */}
        {userType === 'business' && (
          <>
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
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                  required
                />
                <button
                  type="button"
                  onClick={handleBusinessNumberCheck}
                  disabled={formData.businessNumber.length !== 10}
                  className={`flex items-center justify-center px-6 py-3 rounded-xl whitespace-nowrap shrink-0 ${
                    formData.businessNumber.length === 10
                      ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  확인
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
              className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              required
            />
            <button
              type="button"
              onClick={handlePasswordCheck}
              disabled={formData.password.length === 0}
              className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl whitespace-nowrap shrink-0 text-sm sm:text-base ${
                formData.password.length > 0
                  ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              확인
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
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
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
                className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl whitespace-nowrap shrink-0 text-sm sm:text-base ${
                  formData.passwordConfirm
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                확인
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
            <div className="flex-1 min-w-0 flex gap-2">
              <input
                type="text"
                value={formData.emailId}
                onChange={(e) => handleChange('emailId', e.target.value)}
                placeholder="이메일 주소"
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
              <span className="text-white self-center text-lg">@</span>
              {formData.emailDomain === '직접입력' ? (
                <div className="flex-1 min-w-0 flex gap-2">
                  <input
                    type="text"
                    value={formData.customDomain}
                    onChange={(e) => handleChange('customDomain', e.target.value)}
                    placeholder="도메인 입력"
                    className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('emailDomain', 'naver.com')}
                    className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <select
                  value={formData.emailDomain}
                  onChange={(e) => handleChange('emailDomain', e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-slate-800 border border-white/30 text-white focus:outline-none focus:border-yellow-400 appearance-none"
                >
                  {emailDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleEmailCheck}
              disabled={!formData.emailId}
              className={`flex items-center justify-center px-6 py-3 rounded-xl whitespace-nowrap shrink-0 font-bold ${
                formData.emailId
                  ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              중복확인
            </button>
          </div>
          {emailChecked && (
            <p className={`mt-1 text-sm ${emailAvailable ? 'text-green-400' : 'text-red-400'}`}>
              {emailAvailable ? '✓ 사용 가능한 이메일입니다' : '✗ 이미 사용중인 이메일입니다'}
            </p>
          )}
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
              className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
              disabled={formData.phoneVerified}
              required
            />
            {!formData.phoneVerified && (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={formData.phone.length < 10}
                className={`flex items-center justify-center px-6 py-3 rounded-xl whitespace-nowrap shrink-0 ${
                  formData.phone.length >= 10
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                인증
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
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleVerifyPhone}
                disabled={formData.verificationCode.length !== 6}
                className={`flex items-center justify-center px-6 py-3 rounded-xl whitespace-nowrap shrink-0 ${
                  formData.verificationCode.length === 6
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                확인
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
                  value={formData.zonecode}
                  readOnly
                  placeholder="우편번호"
                  className="w-32 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none cursor-pointer"
                  onClick={() => setShowAddressModal(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="px-4 py-3 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-400 font-medium whitespace-nowrap shrink-0"
                >
                  우편번호 검색
                </button>
              </div>
              <input
                type="text"
                value={formData.address}
                readOnly
                placeholder="기본 주소"
                className="w-full px-4 py-3 mb-2 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none cursor-pointer"
                onClick={() => setShowAddressModal(true)}
                required
              />
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
                  value={formData.shippingZonecode}
                  readOnly
                  placeholder="우편번호"
                  className="w-32 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none cursor-pointer"
                  onClick={() => setShowShippingAddressModal(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowShippingAddressModal(true)}
                  className="px-4 py-3 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-400 font-medium whitespace-nowrap shrink-0"
                >
                  우편번호 검색
                </button>
              </div>
              <input
                type="text"
                value={formData.shippingAddress}
                readOnly
                placeholder="기본 출고지 주소"
                className="w-full px-4 py-3 mb-2 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none cursor-pointer"
                onClick={() => setShowShippingAddressModal(true)}
                required
              />
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
        <div className="pt-6 border-t border-white/20 space-y-4">
          {/* Agree All */}
          <div 
            onClick={() => {
              const nextState = !(agreeTerms && agreePrivacy && agreeMarketing);
              setAgreeTerms(nextState);
              setAgreePrivacy(nextState);
              setAgreeMarketing(nextState);
            }}
            className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10"
          >
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              agreeTerms && agreePrivacy && agreeMarketing ? 'bg-yellow-500 border-yellow-500' : 'border-white/30 bg-white/10'
            }`}>
              {agreeTerms && agreePrivacy && agreeMarketing && <Check className="w-4 h-4 text-purple-900" />}
            </div>
            <span className="text-white font-bold text-lg">전체 동의하기</span>
          </div>

          {/* Individual Terms */}
          <div className="space-y-3 px-2">
            {[
              { id: 'terms', label: '이용약관 동의', isRequired: true, state: agreeTerms, setter: setAgreeTerms },
              { id: 'privacy', label: '개인정보 수집 및 이용 동의', isRequired: true, state: agreePrivacy, setter: setAgreePrivacy },
              { id: 'marketing', label: '마케팅 정보 수신 동의', isRequired: false, state: agreeMarketing, setter: setAgreeMarketing }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div 
                  onClick={() => item.setter(!item.state)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    item.state ? 'bg-yellow-500 border-yellow-500' : 'border-white/30 bg-white/10'
                  }`}>
                    {item.state && <Check className="w-3.5 h-3.5 text-purple-900" />}
                  </div>
                  <span className="text-white/80 text-sm">
                    {item.label} {item.isRequired && <span className="text-red-400">*</span>}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-white/40 text-xs underline hover:text-white/60"
                >
                  전문 보기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl text-lg shadow-2xl mt-8"
        >
          
            {userType === 'business' ? '신청 요청' : '회원가입 완료'}
          
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
                className="mt-4 flex items-center justify-center w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Search Modal */}
      <AddressSearchModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="배송주소 검색"
        description="배송받을 주소를 검색해주세요"
        onComplete={(result) => {
          setFormData((prev) => ({
            ...prev,
            address: result.address,
            zonecode: result.zonecode,
          }));
        }}
      />

      {/* Shipping Address Search Modal */}
      <AddressSearchModal
        isOpen={showShippingAddressModal}
        onClose={() => setShowShippingAddressModal(false)}
        title="출고지 주소 검색"
        description="출고지 주소를 검색해주세요"
        onComplete={(result) => {
          setFormData((prev) => ({
            ...prev,
            shippingAddress: result.address,
            shippingZonecode: result.zonecode,
          }));
        }}
      />
    </div>
  );
}
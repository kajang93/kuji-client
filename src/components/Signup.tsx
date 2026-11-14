// 가입 입력과 휴대폰 인증의 유효시간을 안내하고 검증된 정보로 가입을 요청한다.
import { useState, useEffect, useRef, type FC } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Check, Upload, X } from './icons';
import { toast } from 'sonner';
import { signup, checkEmail, sendSms, verifySignupSms } from '../api/auth';
import { compressImageFile, validatePasswordRules } from '../api/client';
import AddressSearchModal from './AddressSearchModal';
import PolicyContent from './PolicyContent';
import { POLICY_TITLES, type PolicyKind } from '../constants/policies';
import { trackFunnelEvent } from '../utils/funnelAnalytics';

type SignupProps = {
  userType: 'customer' | 'business';
  onBack: () => void;
  onComplete: (type: 'registered' | 'requested') => void;
};

const Signup: FC<SignupProps> = ({ userType, onBack, onComplete }) => {
  const submittingRef = useRef(false);
  const signupStarted = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneRequestVersion = useRef(0);
  const sendingSmsRef = useRef(false);
  const verifyingPhoneRef = useRef(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneVerification, setPhoneVerification] = useState<{phone: string; token: string; expiresAt: number} | null>(null);
  // Refs for input fields
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    passwordConfirm: '',
    name: '',
    nickname: '',
    email: '',
    phone: '',
    phoneVerified: false,
    verificationCode: '',
    birthdate: '',
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
  const passwordError = formData.password ? validatePasswordRules(formData.password) || '' : '';
  const [openPolicy, setOpenPolicy] = useState<PolicyKind | null>(null);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [checkedEmail, setCheckedEmail] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const emailRequestVersion = useRef(0);
  const pendingEmailRequest = useRef<number | null>(null);
  const mounted = useRef(false);
  const [now, setNow] = useState(Date.now);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const resendSeconds = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const codeSeconds = Math.max(0, Math.ceil((codeExpiresAt - now) / 1000));
  const proofSeconds = Math.max(0, Math.ceil(((phoneVerification?.expiresAt || 0) - now) / 1000));
  const clockLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    mounted.current = true;
    window.scrollTo(0, 0);
    trackFunnelEvent('SIGNUP_VIEW', { audience: userType, method: 'email' });
    return () => {
      mounted.current = false;
      phoneRequestVersion.current += 1;
      emailRequestVersion.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!resendAvailableAt && !codeExpiresAt && !phoneVerification) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [resendAvailableAt, codeExpiresAt, phoneVerification]);

  useEffect(() => {
    if (!phoneVerification || phoneVerification.expiresAt > now) return;
    setPhoneVerification(null);
    setPhoneVerificationSent(false);
    setCodeExpiresAt(0);
    setFormData(previous => ({ ...previous, phoneVerified: false, verificationCode: '' }));
  }, [now, phoneVerification]);

  const handleChange = (field: string, value: string) => {
    if (!signupStarted.current) {
      signupStarted.current = true;
      trackFunnelEvent('SIGNUP_START', { audience: userType, method: 'email' });
    }
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
      if (formatted !== formData.phone) {
        phoneRequestVersion.current += 1;
        setPhoneVerification(null);
        setPhoneVerificationSent(false);
        setCodeExpiresAt(0);
        setFormData(previous => ({ ...previous, phone: formatted, phoneVerified: false, verificationCode: '' }));
      }
      return;
    }
    
    setFormData({ ...formData, [field]: value });
    if (field === 'email') {
      emailRequestVersion.current += 1;
      pendingEmailRequest.current = null;
      setIsCheckingEmail(false);
      setCheckedEmail('');
      setEmailChecked(false);
      setEmailAvailable(false);
    }
    if (field === 'businessNumber') {
      setBusinessNumberChecked(false);
      setBusinessNumberValid(false);
    }
  };

  const handleEmailCheck = async () => {
    const email = formData.email.trim();
    if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
      toast.error('이메일 주소를 확인해 주세요.');
      return;
    }
    if (pendingEmailRequest.current !== null) return;
    const version = ++emailRequestVersion.current;
    pendingEmailRequest.current = version;
    setIsCheckingEmail(true);
    try {
      const isAvailable = await checkEmail(email);
      if (!mounted.current || emailRequestVersion.current !== version) return;
      setEmailAvailable(isAvailable);
      setEmailChecked(true);
      setCheckedEmail(email);
      if (isAvailable) toast.success('사용 가능한 이메일입니다.');
      else toast.error('이미 사용중인 이메일입니다.');
    } catch {
      if (mounted.current && emailRequestVersion.current === version) toast.error('이메일 중복 확인에 실패했습니다.');
    } finally {
      if (pendingEmailRequest.current === version) {
        pendingEmailRequest.current = null;
        if (mounted.current) setIsCheckingEmail(false);
      }
    }
  };

  const validateBusinessNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 10) return false;

    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNumber.charAt(i)) * weights[i];
    }
    
    sum += Math.floor((parseInt(cleanNumber.charAt(8)) * 5) / 10);
    
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return checkDigit === parseInt(cleanNumber.charAt(9));
  };

  const handleBusinessNumberCheck = () => {
    if (formData.businessNumber.length === 10) {
      const isValid = validateBusinessNumber(formData.businessNumber);
      setBusinessNumberValid(isValid);
      setBusinessNumberChecked(true);
      if (isValid) {
        toast.success('번호 형식 확인 완료 · 등록증 심사 예정');
      } else {
        toast.error('사업자번호 형식을 확인해 주세요.');
      }
    }
  };

  const handleSendVerification = async () => {
    if (sendingSmsRef.current || verifyingPhoneRef.current || Date.now() < resendAvailableAt) return;
    const phone = formData.phone.replace(/[^0-9]/g, '');
    if (!/^01[016789][0-9]{7,8}$/.test(phone)) {
      toast.error('올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }
    sendingSmsRef.current = true;
    setIsSendingVerification(true);
    const version = ++phoneRequestVersion.current;
    setPhoneVerification(null);
    setPhoneVerificationSent(false);
    setFormData(previous => ({ ...previous, phoneVerified: false, verificationCode: '' }));
    try {
      await sendSms(phone);
      if (!mounted.current || phoneRequestVersion.current !== version) return;
      const acceptedAt = Date.now();
      setNow(acceptedAt);
      setResendAvailableAt(acceptedAt + 60_000);
      setCodeExpiresAt(acceptedAt + 180_000);
      setPhoneVerificationSent(true);
      trackFunnelEvent('SMS_SEND_ACCEPTED', { audience: userType, method: 'email' });
      toast.success('인증번호가 전송되었습니다.');
    } catch (error: any) {
      if (mounted.current && phoneRequestVersion.current === version) toast.error(error.message || '인증번호 전송에 실패했습니다.');
    } finally {
      sendingSmsRef.current = false;
      if (mounted.current) setIsSendingVerification(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (verifyingPhoneRef.current || sendingSmsRef.current || formData.verificationCode.length !== 6) return;
    if (!phoneVerificationSent || !codeExpiresAt || Date.now() >= codeExpiresAt) {
      toast.error('인증번호 입력 시간이 만료되었습니다. 다시 전송해 주세요.');
      return;
    }
    verifyingPhoneRef.current = true;
    setIsVerifyingPhone(true);
    const version = phoneRequestVersion.current;
    const phone = formData.phone.replace(/[^0-9]/g, '');
    try {
      const proof = await verifySignupSms(phone, formData.verificationCode);
      if (!mounted.current || phoneRequestVersion.current !== version) return;
      setPhoneVerification({phone, token: proof.verificationToken, expiresAt: Date.parse(proof.expiresAt)});
      setNow(Date.now());
      setFormData(previous => ({ ...previous, phoneVerified: true }));
      trackFunnelEvent('PHONE_VERIFIED', { audience: userType, method: 'email' });
      toast.success('휴대폰 인증이 완료되었습니다. 10분 안에 가입해 주세요.');
    } catch (error: any) {
      if (mounted.current && phoneRequestVersion.current === version) {
        setPhoneVerification(null);
        setFormData(previous => ({ ...previous, phoneVerified: false }));
        toast.error(error.message || '인증번호 확인에 실패했습니다.');
      }
    } finally {
      verifyingPhoneRef.current = false;
      if (mounted.current) setIsVerifyingPhone(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('사업자등록증은 JPG, PNG 또는 PDF로 첨부해주세요.');
        return;
      }
      let fileToUpload = file;
      
      // 이미지만 압축 (PDF 등은 그대로 통과)
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImageFile(file);
      }
      
      if (fileToUpload.size > 5 * 1024 * 1024) {
        toast.error('파일 용량은 5MB를 초과할 수 없습니다.');
        return;
      }
      setFormData(previous => ({ ...previous, businessFile: fileToUpload }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const reject = (message: string) => {
      trackFunnelEvent('VALIDATION_FAILED', { audience: userType, method: 'email' });
      toast.error(message);
    };

    if (!agreeTerms || !agreePrivacy) {
      reject('필수 이용약관에 동의해주세요.');
      return;
    }

    if (!emailChecked || !emailAvailable || checkedEmail !== formData.email.trim()) {
      reject('이메일 중복확인을 완료해주세요.');
      return;
    }

    if (userType === 'business') {
      if (!businessNumberChecked || !businessNumberValid) {
        reject('사업자번호 확인을 완료해주세요.');
        return;
      }
    }

    if (!formData.password || passwordError) {
      reject('비밀번호 형식을 확인해주세요.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      reject('비밀번호가 일치하지 않습니다.');
      return;
    }
    const email = formData.email.trim();

    if (!formData.phone) {
      reject('휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!formData.phoneVerified || !phoneVerification
        || phoneVerification.phone !== formData.phone.replace(/[^0-9]/g, '')) {
      reject('휴대폰 인증을 완료해주세요.');
      return;
    }
    if (!Number.isFinite(phoneVerification.expiresAt) || phoneVerification.expiresAt <= Date.now()) {
      setPhoneVerification(null);
      setPhoneVerificationSent(false);
      setFormData(previous => ({ ...previous, phoneVerified: false }));
      reject('휴대폰 인증 시간이 만료되었습니다. 다시 인증해 주세요.');
      return;
    }

    const businessAddress = [formData.shippingAddress, formData.shippingAddressDetail]
      .map(value => value.trim()).filter(Boolean).join(' ');

    if (userType === 'business') {
      if (!formData.businessName) {
        reject('사업자명을 입력해주세요.');
        return;
      }
      if (!formData.managerName) {
        reject('대표자명을 입력해주세요.');
        return;
      }
      if (!formData.shippingAddress.trim()) {
        reject('사업장 주소를 입력해주세요.');
        return;
      }
      if (businessAddress.length > 255) {
        reject('사업장 주소는 상세주소를 포함해 255자 이내로 입력해주세요.');
        return;
      }
      if (!formData.businessFile) {
        reject('사업자등록증 파일을 첨부해주세요.');
        return;
      }
    }

    const signupData = {
      email: email,
      password: formData.password,
      nickname: formData.nickname || (userType === 'customer' ? formData.name : formData.businessName),
      phoneNumber: formData.phone,
      phoneVerificationToken: phoneVerification.token,
      birthDate: userType === 'customer' ? formData.birthdate || undefined : null,
      role: userType === 'business' ? 'BIZ' : 'USER',
      businessNumber: userType === 'business' ? formData.businessNumber : null,
      companyName: userType === 'business' ? formData.businessName : null,
      ceoName: userType === 'business' ? formData.managerName : null,
      businessAddress: userType === 'business' ? businessAddress : null,
      isTermsAgreed: agreeTerms,
      isPrivacyAgreed: agreePrivacy,
      isMarketingAgreed: agreeMarketing
    };

    submittingRef.current = true;
    setIsSubmitting(true);
    trackFunnelEvent('SIGNUP_SUBMITTED', { audience: userType, method: 'email' });
    signup(signupData, userType === 'business' ? formData.businessFile : undefined)
      .then(() => {
        trackFunnelEvent('SIGNUP_COMPLETED', { audience: userType, method: 'email' });
        if (!mounted.current) return;
        if (userType === 'business') {
          toast.success('사업자 등록 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.');
          onComplete('requested');
        } else {
          toast.success('회원가입이 완료되었습니다!');
          onComplete('registered');
        }
      })
      .catch((error) => {
        if (mounted.current) toast.error(error.message);
      })
      .finally(() => {
        submittingRef.current = false;
        if (mounted.current) setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-full pb-20">
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
                  {businessNumberValid ? '✓ 번호 형식 확인 완료 · 등록증 심사 예정' : '✗ 사업자번호 형식을 확인해 주세요'}
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
                대표자명 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => handleChange('managerName', e.target.value)}
                placeholder="대표자명을 입력하세요"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400"
                required
              />
            </div>
          </>
        )}

        {/* Password */}
        <div>
          <label className="block text-white mb-2">비밀번호 <span className="text-red-400">*</span></label>
          <input type="password" autoComplete="new-password" value={formData.password} onChange={e => handleChange('password', e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); passwordConfirmRef.current?.focus(); } }}
            ref={passwordRef} placeholder="8자 이상, 영문/숫자/특수문자 중 3가지 조합"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400" required />
          {passwordError && <p className="mt-1 text-sm text-red-400">✗ {passwordError}</p>}
          {formData.password && !passwordError && <p className="mt-1 text-sm text-green-400">✓ 사용 가능한 비밀번호입니다</p>}
        </div>
        <div>
          <label className="block text-white mb-2">비밀번호 확인 <span className="text-red-400">*</span></label>
          <input type="password" autoComplete="new-password" value={formData.passwordConfirm} onChange={e => handleChange('passwordConfirm', e.target.value)}
            ref={passwordConfirmRef} placeholder="비밀번호를 다시 입력하세요"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400" required />
          {formData.passwordConfirm && <p className={`mt-1 text-sm ${formData.password === formData.passwordConfirm ? 'text-green-400' : 'text-red-400'}`}>
            {formData.password === formData.passwordConfirm ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
          </p>}
        </div>
        <div>
          <label className="block text-white mb-2">이메일 <span className="text-red-400">*</span></label>
          <div className="flex gap-2">
            <input type="email" autoComplete="email" inputMode="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="name@example.com"
              className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400" required />
            <button type="button" onClick={() => void handleEmailCheck()} disabled={!formData.email.trim() || isCheckingEmail}
              className="shrink-0 rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-40">
              {isCheckingEmail ? '확인 중' : '중복확인'}
            </button>
          </div>
          {emailChecked && <p className={`mt-1 text-sm ${emailAvailable ? 'text-green-400' : 'text-red-400'}`}>
            {emailAvailable ? '✓ 사용 가능한 이메일입니다' : '✗ 이미 사용중인 이메일입니다'}
          </p>}
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
              disabled={isSubmitting}
              required
            />
            {!formData.phoneVerified && (
              <button
                type="button"
                onClick={handleSendVerification}
                disabled={formData.phone.length < 10 || isSendingVerification || isVerifyingPhone || resendSeconds > 0}
                className={`flex items-center justify-center px-6 py-3 rounded-xl whitespace-nowrap shrink-0 ${
                  formData.phone.length >= 10
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSendingVerification ? '발송 중' : resendSeconds > 0 ? `${resendSeconds}초 후 재전송` : phoneVerificationSent ? '재전송' : '인증'}
              </button>
            )}
          </div>
          
          {phoneVerificationSent && !formData.phoneVerified && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                autoComplete="one-time-code"
                inputMode="numeric"
                aria-label="문자 인증번호"
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
                disabled={formData.verificationCode.length !== 6 || isVerifyingPhone || isSendingVerification || codeSeconds === 0}
                className={`flex items-center justify-center px-6 py-3 rounded-xl whitespace-nowrap shrink-0 ${
                  formData.verificationCode.length === 6
                    ? 'bg-yellow-500 text-purple-900 hover:bg-yellow-400'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isVerifyingPhone ? '확인 중' : '확인'}
              </button>
            </div>
          )}

          {phoneVerificationSent && !formData.phoneVerified && <p role="status" className="mt-2 text-sm text-amber-200">
            {codeSeconds > 0 ? `인증번호 입력 ${clockLabel(codeSeconds)} 남음 · 재전송은 60초 후 가능해요.` : '인증번호가 만료되었습니다. 다시 전송해 주세요.'}
          </p>}

          {formData.phoneVerified && (
            <p role="status" className="mt-1 text-sm text-green-400">✓ 휴대폰 인증 완료 · 가입 가능 시간 {clockLabel(proofSeconds)} 남음</p>
          )}
        </div>

        {/* 고객 프로필 */}
        {userType === 'customer' && (
          <>
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
                사업장 주소 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={formData.shippingZonecode}
                  readOnly
                  placeholder="우편번호"
                  className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none cursor-pointer"
                  onClick={() => setShowShippingAddressModal(true)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowShippingAddressModal(true)}
                  className="px-4 py-3 bg-amber-500 text-slate-900 rounded-xl border border-transparent hover:bg-amber-400 font-medium whitespace-nowrap shrink-0"
                >
                  우편번호 검색
                </button>
              </div>
              <input
                type="text"
                value={formData.shippingAddress}
                readOnly
                placeholder="기본 사업장 주소"
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
                  accept="image/jpeg,image/png,application/pdf"
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
              <p className="mt-2 text-xs text-white/60">주민등록번호 등 심사에 필요하지 않은 정보는 가린 사본을 첨부해 주세요.</p>
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
              { id: 'terms' as const, label: '이용약관 동의', isRequired: true, state: agreeTerms, setter: setAgreeTerms },
              { id: 'privacy' as const, label: '개인정보 수집 및 이용 동의', isRequired: true, state: agreePrivacy, setter: setAgreePrivacy },
              { id: 'marketing' as const, label: '마케팅 정보 수신 동의', isRequired: false, state: agreeMarketing, setter: setAgreeMarketing }
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
                  onClick={() => setOpenPolicy(item.id)}
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
          disabled={isSubmitting}
          className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl text-lg shadow-2xl mt-8"
        >
          
            {isSubmitting ? '신청을 저장하고 있습니다…' : userType === 'business' ? '신청 요청' : '회원가입 완료'}
          
        </motion.button>
      </form>

      {/* Terms Modal */}
      <AnimatePresence>
        {openPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenPolicy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-label={POLICY_TITLES[openPolicy]}
              className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border-2 border-cyan-400/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl">{POLICY_TITLES[openPolicy]}</h2>
                <button
                  onClick={() => setOpenPolicy(null)}
                  className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto rounded-2xl bg-white/5 p-4 sm:p-6">
                <PolicyContent kind={openPolicy} audience={userType} />
              </div>

              <button
                onClick={() => setOpenPolicy(null)}
                className="mt-4 flex items-center justify-center w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all"
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipping Address Search Modal */}
      <AddressSearchModal
        isOpen={showShippingAddressModal}
        onClose={() => setShowShippingAddressModal(false)}
        title="사업장 주소 검색"
        description="사업장 주소를 검색해주세요"
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
};
export default Signup;

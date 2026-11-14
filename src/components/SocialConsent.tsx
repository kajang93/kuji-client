// 간편 로그인으로 처음 가입할 때 대형 쇼핑몰처럼 필수·선택 약관을 항목별로 보여주고 동의를 받는다.
import { useState, type FC } from 'react';
import { motion, AnimatePresence } from './motion';
import { Check, ChevronLeft, X } from './icons';
import PolicyContent from './PolicyContent';
import type { PolicyKind } from '../constants/policies';

export type SocialAgreements = { isAgeOver14: boolean; isTermsAgreed: boolean; isPrivacyAgreed: boolean; isMarketingAgreed: boolean };

type Item = { key: keyof SocialAgreements; label: string; required: boolean; policy?: PolicyKind };
const ITEMS: Item[] = [
  { key: 'isAgeOver14', label: '만 14세 이상입니다', required: true },
  { key: 'isTermsAgreed', label: '오시쿠지 이용약관 동의', required: true, policy: 'terms' },
  { key: 'isPrivacyAgreed', label: '개인정보 수집·이용 동의', required: true, policy: 'privacy' },
  { key: 'isMarketingAgreed', label: '마케팅 정보 수신 동의 (이벤트·혜택 알림)', required: false, policy: 'marketing' },
];

const CheckCircle: FC<{ checked: boolean; large?: boolean }> = ({ checked, large }) => (
  <span className={'flex flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors '
    + (large ? 'h-7 w-7 ' : 'h-6 w-6 ')
    + (checked ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/30 text-transparent')}>
    <Check className={large ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
  </span>
);

const SocialConsent: FC<{
  providerName: string;
  submitting?: boolean;
  onSubmit: (agreements: SocialAgreements) => void;
  onCancel: () => void;
}> = ({ providerName, submitting = false, onSubmit, onCancel }) => {
  const [agreed, setAgreed] = useState<SocialAgreements>({ isAgeOver14: false, isTermsAgreed: false, isPrivacyAgreed: false, isMarketingAgreed: false });
  const [viewing, setViewing] = useState<PolicyKind | null>(null);
  const allChecked = ITEMS.every(item => agreed[item.key]);
  const requiredChecked = ITEMS.filter(item => item.required).every(item => agreed[item.key]);

  const toggleAll = () => {
    const next = !allChecked;
    setAgreed({ isAgeOver14: next, isTermsAgreed: next, isPrivacyAgreed: next, isMarketingAgreed: next });
  };

  return (
    <div className="flex min-h-full flex-col bg-slate-900 text-white">
      <header className="flex items-center gap-3 px-4 pb-3 pt-4">
        <button type="button" onClick={onCancel} aria-label="가입 취소" className="rounded-full p-2 hover:bg-white/10"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="text-lg font-bold">약관 동의</h1>
      </header>

      <main className="flex-1 px-5 pb-6">
        <p className="mt-2 text-2xl font-bold leading-snug">{providerName}로 처음 오셨네요!<br /><span className="text-blue-300">약관에 동의하고 시작해요</span></p>
        <p className="mt-2 text-sm text-white/60">서비스 이용을 위해 아래 약관에 동의해 주세요.</p>

        <button type="button" onClick={toggleAll} className="mt-7 flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-left">
          <CheckCircle checked={allChecked} large />
          <span>
            <span className="block font-bold">전체 동의하기</span>
            <span className="block text-xs text-white/50">선택 항목(마케팅 정보 수신)을 포함한 모든 약관에 동의합니다.</span>
          </span>
        </button>

        <ul className="mt-3 divide-y divide-white/10">
          {ITEMS.map(item => (
            <li key={item.key} className="flex items-center gap-3 py-3.5">
              <button type="button" role="checkbox" aria-checked={agreed[item.key]} onClick={() => setAgreed(prev => ({ ...prev, [item.key]: !prev[item.key] }))} className="flex flex-1 items-center gap-3 text-left">
                <CheckCircle checked={agreed[item.key]} />
                <span className="text-sm">
                  <span className={item.required ? 'font-semibold text-blue-300' : 'text-white/50'}>[{item.required ? '필수' : '선택'}]</span> {item.label}
                </span>
              </button>
              {item.policy && <button type="button" onClick={() => setViewing(item.policy!)} className="flex-shrink-0 px-1 text-xs text-white/50 underline underline-offset-2 hover:text-white">보기</button>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-white/40">마케팅 정보 수신에 동의하지 않아도 서비스를 이용할 수 있으며, 설정에서 언제든 바꿀 수 있어요.</p>
      </main>

      <footer className="sticky bottom-0 bg-slate-900 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        <button type="button" disabled={!requiredChecked || submitting} onClick={() => onSubmit(agreed)}
          className="w-full rounded-2xl bg-blue-500 py-4 font-bold text-white transition-colors hover:bg-blue-600 disabled:bg-white/15 disabled:text-white/40">
          {submitting ? '가입하는 중…' : '동의하고 가입하기'}
        </button>
      </footer>

      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setViewing(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="max-h-[85%] w-full overflow-y-auto rounded-t-3xl bg-slate-900 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4" onClick={event => event.stopPropagation()}>
              <div className="mb-3 flex justify-end"><button type="button" onClick={() => setViewing(null)} aria-label="닫기" className="rounded-full p-2 hover:bg-white/10"><X className="h-5 w-5" /></button></div>
              <PolicyContent kind={viewing} audience="customer" />
              <button type="button" onClick={() => setViewing(null)} className="mt-6 w-full rounded-2xl bg-blue-500 py-3 font-bold">확인</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialConsent;

// 확인 중인 결제의 상태와 재조회 방법을 안내한다.
import type { FC } from "react";
import { Clock3, LoaderCircle } from "lucide-react";

interface PaymentRecoveryNoticeProps {
  message: string;
  busy: boolean;
  needsLogin: boolean;
  onCheck: () => void;
  onLogin: () => void;
}

const PaymentRecoveryNotice: FC<PaymentRecoveryNoticeProps> = ({ message, busy, needsLogin, onCheck, onLogin }) => (
  <section role="status" aria-live="polite" className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md rounded-2xl border border-amber-400/40 bg-slate-900 p-4 text-white shadow-xl">
    <div className="flex items-start gap-3">
      {busy ? <LoaderCircle className="mt-1 h-5 w-5 shrink-0 animate-spin text-amber-300" /> : <Clock3 className="mt-1 h-5 w-5 shrink-0 text-amber-300" />}
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-amber-200">결제 결과 확인</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{message}</p>
        <button type="button" disabled={busy} onClick={needsLogin ? onLogin : onCheck} className="mt-3 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50">
          {busy ? "확인 중" : needsLogin ? "결제한 계정으로 로그인" : "상태 다시 확인"}
        </button>
      </div>
    </div>
  </section>
);

export default PaymentRecoveryNotice;

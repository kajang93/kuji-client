// 사업자 심사 상태와 등록증 보완·재신청을 안내한다.
import { useEffect, useRef, useState } from 'react';
import { Clock, ChevronLeft } from './icons';
import { openKakaoChannel } from '../constants/support';
import { fetchBusinessApplication, resubmitBusinessApplication, type BusinessApplication } from '../api/auth';
import { toast } from 'sonner';

type Props = {
  onBack: () => void;
  onRefreshAccount: () => Promise<void>;
  user: { memberId?: number; name: string; email: string; businessStatus?: string | null; businessRejectReason?: string | null } | null;
};

export default function BusinessPending({ onBack, onRefreshAccount, user }: Props) {
  const [application, setApplication] = useState<BusinessApplication | null>(null);
  const [license, setLicense] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const load = async () => {
    if (!user?.memberId) return;
    setLoading(true);
    try { setApplication(await fetchBusinessApplication(user.memberId)); }
    catch (error) { toast.error(error instanceof Error ? error.message : '사업자 신청 정보를 불러오지 못했습니다.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [user?.memberId]);
  const rejected = (application?.status || user?.businessStatus) === 'REJECTED';
  const needsDocument = application && (!application.licenseImageUrl || rejected);
  const submit = async () => {
    if (!application || pending.current) return;
    if (!license || !['image/jpeg', 'image/png', 'application/pdf'].includes(license.type) || license.size > 5 * 1024 * 1024) {
      toast.error('5MB 이하의 JPG, PNG 또는 PDF 등록증을 첨부해주세요.');
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      await resubmitBusinessApplication({ businessNumber: application.businessNumber, companyName: application.companyName,
        representativeName: application.ceoName, businessAddress: application.businessAddress }, license);
      setLicense(null);
      toast.success('서류가 제출되었습니다. 관리자 심사 후 판매를 시작할 수 있습니다.');
      await load();
      await onRefreshAccount();
    } catch (error) { toast.error(error instanceof Error ? error.message : '서류를 제출하지 못했습니다.'); }
    finally { pending.current = false; setBusy(false); }
  };
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 p-6 text-white">
      <button onClick={onBack} className="mb-10 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3"><ChevronLeft className="h-5 w-5" />로그아웃</button>
      <section className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6">
        <Clock className="mb-5 h-10 w-10 text-amber-300" />
        <h1 className="text-2xl font-semibold">{rejected ? '사업자 신청 보완이 필요해요' : '사업자 신청을 확인하고 있어요'}</h1>
        <p className="mt-4 leading-relaxed text-slate-300">{user?.name}님, 승인 후 상품 판매를 시작할 수 있습니다. 제출한 서류와 사업자 정보를 관리자가 확인합니다.</p>
        {rejected && <p role="status" className="mt-4 rounded-xl bg-rose-400/10 p-4 text-rose-200">보완 사유. {application?.rejectReason || user?.businessRejectReason || '등록 정보를 확인해주세요.'}</p>}
        {loading && <p role="status" className="mt-5 text-slate-400">신청 정보를 불러오고 있습니다…</p>}
        {needsDocument && !loading && <div className="mt-6 space-y-3">
          <p className="text-sm text-amber-200">등록증을 첨부해 신청을 보완해주세요. 파일은 본인과 관리자만 확인할 수 있습니다.</p>
          <p className="text-xs text-slate-400">주민등록번호 등 심사에 필요하지 않은 정보는 가린 사본을 첨부해 주세요.</p>
          {(['businessNumber', 'companyName', 'ceoName', 'businessAddress'] as const).map((field, index) => <label key={field} className="block text-sm text-slate-300">
            {['사업자번호', '상호', '대표자명', '사업장 주소'][index]}
            <input value={application[field] || ''} disabled={busy} onChange={event => setApplication({ ...application, [field]: event.target.value })}
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-white" />
          </label>)}
          <label className="block text-sm text-slate-300">사업자등록증 · JPG, PNG, PDF · 최대 5MB
            <input type="file" accept="image/jpeg,image/png,application/pdf" disabled={busy} onChange={event => setLicense(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
          </label>
          <button disabled={busy || !license} onClick={() => void submit()} className="w-full rounded-xl bg-amber-300 p-3 font-semibold text-slate-950 disabled:opacity-40">{busy ? '서류 제출 중…' : '등록증 제출하고 심사 요청'}</button>
        </div>}
        <button disabled={busy} onClick={async () => { await load(); await onRefreshAccount(); }} className="mt-6 w-full rounded-xl border border-white/15 p-3">심사 상태 새로 확인</button>
        <button onClick={openKakaoChannel} className="mt-3 w-full rounded-xl bg-[#FEE500] p-3 text-slate-950">카카오톡으로 문의하기</button>
      </section>
    </main>
  );
}

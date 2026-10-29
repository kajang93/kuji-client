// 고객 환불 요청과 관리자 검토 상태를 실제 접수 내역으로 표시합니다.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import { createRefund, fetchRefundRequests, fetchRefundTargets, reviewRefund } from '../api/refunds';
import type { RefundRequest, RefundStatus, RefundTarget, RefundTargetType } from '../api/refunds';

type Props = { onBack: () => void; admin?: boolean; initialTargetType?: RefundTargetType };
const statusNames: Record<RefundStatus, string> = {
  REQUESTED: '접수', UNDER_REVIEW: '검토 중', REVIEW_APPROVED: '환불 실행 대기', REJECTED: '반려',
};
const dateLabel = (value: string) => new Date(value).toLocaleString('ko-KR');
const messageOf = (error: unknown) => error instanceof Error ? error.message : '환불 내역을 불러오지 못했습니다.';

const RefundCenter: FC<Props> = ({ onBack, admin = false, initialTargetType = 'DRAW_HISTORY' }) => {
  const [view, setView] = useState<RefundTargetType | 'REQUESTS'>(admin ? 'REQUESTS' : initialTargetType);
  const [filter, setFilter] = useState<RefundStatus | ''>('');
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [targets, setTargets] = useState<RefundTarget[]>([]);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [selected, setSelected] = useState<RefundTarget | null>(null);
  const [reviewing, setReviewing] = useState<RefundRequest | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const mutationPending = useRef(false);
  const generation = useRef(0);

  const load = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError('');
    try {
      if (view === 'REQUESTS') {
        const data = await fetchRefundRequests(admin, page, filter || undefined);
        if (generation.current !== current) return;
        setRequests(data.content);
        setHasNext(data.hasNext);
      } else {
        const data = await fetchRefundTargets(view, page);
        if (generation.current !== current) return;
        setTargets(data.content);
        setHasNext(data.hasNext);
      }
    } catch (cause) {
      if (generation.current === current) setError(messageOf(cause));
    } finally {
      if (generation.current === current) setLoading(false);
    }
  }, [admin, page, view, filter]);
  useEffect(() => {
    void load();
    return () => { generation.current++; };
  }, [load]);

  const changeView = (next: typeof view) => {
    setView(next); setPage(0); setSelected(null); setReviewing(null); setReason(''); setNotice('');
  };
  const submit = async (status?: Exclude<RefundStatus, 'REQUESTED'>) => {
    if (mutationPending.current) return;
    if (admin && (!reviewing || !status)) return;
    const trimmed = reason.trim();
    if (trimmed.length < (admin ? 5 : 10) || trimmed.length > 1000) {
      setError(`사유를 ${admin ? 5 : 10}~1,000자로 입력해 주세요.`);
      return;
    }
    mutationPending.current = true; setBusy(true); setError('');
    try {
      if (admin && reviewing && status) {
        const updated = await reviewRefund(reviewing.id, status, trimmed);
        setRequests(items => items.map(item => item.id === updated.id ? updated : item));
        setNotice(updated.statusNotice);
      } else if (!admin && selected) {
        await createRefund(selected, trimmed);
        setNotice('환불 요청이 접수되었습니다. 내 요청에서 검토 상태를 확인해 주세요.');
        setView('REQUESTS'); setPage(0);
      }
      setSelected(null); setReviewing(null); setReason('');
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      mutationPending.current = false; setBusy(false);
    }
  };

  const rows = view === 'REQUESTS' ? requests : targets;
  return (
    <div className="min-h-full bg-slate-950 pb-24 text-slate-100" aria-busy={loading || busy}>
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-slate-950/95 p-5 backdrop-blur">
        <button aria-label="뒤로" onClick={onBack} className="rounded-xl bg-white/5 p-2"><ArrowLeft className="h-5 w-5" /></button>
        <div><h1 className="text-xl font-bold">{admin ? '환불 요청 관리' : '환불 요청'}</h1><p className="mt-1 text-xs text-slate-400">{admin ? '접수 사유와 거래 상태를 확인하고 검토합니다.' : '구매 상품과 충전 포인트의 환불을 요청할 수 있어요.'}</p></div>
      </header>
      <main className="mx-auto max-w-3xl space-y-5 p-5">
        <div className="flex gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-100">
          <ShieldCheck className="h-5 w-5 shrink-0" /><p>사용 내역과 배송 상태를 확인한 후 처리합니다. ‘환불 실행 대기’는 검토가 승인된 상태이며, 결제 취소나 포인트 반환이 완료된 상태는 아닙니다.</p>
        </div>
        {admin ? (
          <label className="block text-sm">검토 상태
            <select aria-label="검토 상태" value={filter} disabled={busy} onChange={event => { setFilter(event.target.value as RefundStatus | ''); setPage(0); setReviewing(null); setReason(''); }} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 p-3">
              <option value="">전체</option>{Object.entries(statusNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ) : (
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="환불 내역 구분">
            {([['DRAW_HISTORY', '구매 상품'], ['POINT_CHARGE', '충전 포인트'], ['REQUESTS', '내 요청']] as const).map(([value, label]) => (
              <button role="tab" aria-selected={view === value} key={value} disabled={busy} onClick={() => changeView(value)} className={`rounded-xl px-2 py-3 text-sm ${view === value ? 'bg-cyan-300 font-bold text-slate-950' : 'bg-white/5 text-slate-300'}`}>{label}</button>
            ))}
          </div>
        )}
        {notice && <p role="status" className="rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-200">{notice}</p>}
        {error && <div role="alert" className="rounded-xl bg-rose-400/10 p-4 text-sm text-rose-200">{error}<button onClick={() => void load()} disabled={busy || loading} className="ml-3 underline">다시 확인</button></div>}
        {loading ? <p role="status" className="py-10 text-center text-slate-400">내역을 불러오는 중입니다.</p> : !error && rows.length === 0 ? <div className="rounded-2xl border border-white/10 p-10 text-center text-slate-400"><RotateCcw className="mx-auto mb-3 h-7 w-7" />{view === 'REQUESTS' ? '접수된 요청이 없습니다.' : '요청할 수 있는 내역이 없습니다.'}</div> : null}
        {!loading && !error && view !== 'REQUESTS' && targets.map(target => (
          <article key={`${target.targetType}-${target.targetId}`} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h2 className="font-semibold">{target.title}</h2><p className="mt-1 text-xs text-slate-400">{dateLabel(target.occurredAt)} · 내역 {target.targetId}</p>
            {target.targetType === 'POINT_CHARGE' && target.targetAmount !== null && <p className="mt-3 text-sm">원충전금액 {target.targetAmount.toLocaleString()}원</p>}
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{target.notice}</p>
            <button disabled={busy} onClick={() => { setSelected(target); setReason(''); setError(''); }} className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm text-cyan-200">환불 요청하기</button>
          </article>
        ))}
        {!loading && !error && view === 'REQUESTS' && requests.map(request => (
          <article key={request.id} className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-semibold">{request.title}</h2><span className={`rounded-full px-3 py-1 text-xs ${request.status === 'REJECTED' ? 'bg-rose-400/10 text-rose-200' : 'bg-cyan-400/10 text-cyan-200'}`}>{request.statusLabel}</span></div>
            <p className="mt-2 text-xs text-slate-400">접수 {dateLabel(request.createdAt)} · 요청 {request.id}{admin ? ` · ${request.memberNickname} (회원 ${request.memberId})` : ''}</p>
            <p className="mt-4 whitespace-pre-wrap break-words text-sm">{request.reason}</p>
            {request.reviewReason && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/5 p-3 text-sm text-slate-300">검토 의견. {request.reviewReason}</p>}
            <p className="mt-3 text-xs leading-relaxed text-slate-400">{request.statusNotice}</p>
            {admin && <p className="mt-2 text-xs text-amber-200">접수 당시 상태 {request.fulfillmentStatus}. 실제 사용·배송·관련 요청을 확인한 후 검토해 주세요.</p>}
            {admin && ['REQUESTED', 'UNDER_REVIEW'].includes(request.status) && <button disabled={busy} onClick={() => { setReviewing(request); setReason(''); setError(''); }} className="mt-4 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">검토하기</button>}
          </article>
        ))}
        {!loading && !error && <nav aria-label="내역 페이지" className="flex items-center justify-between text-sm"><button disabled={page === 0 || busy} onClick={() => setPage(value => value - 1)} className="rounded-xl bg-white/5 px-4 py-2 disabled:opacity-30">이전</button><span>{page + 1} 페이지</span><button disabled={!hasNext || busy} onClick={() => setPage(value => value + 1)} className="rounded-xl bg-white/5 px-4 py-2 disabled:opacity-30">다음</button></nav>}
      </main>
      {(selected || reviewing) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5" role="dialog" aria-modal="true" aria-labelledby="refund-form-title">
        <form onSubmit={event => { event.preventDefault(); void submit(reviewing?.status === 'REQUESTED' ? 'UNDER_REVIEW' : undefined); }} className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
          <h2 id="refund-form-title" className="text-lg font-bold">{admin ? '환불 검토' : '환불 사유 작성'}</h2>
          <p className="mt-2 text-sm text-slate-400">{selected?.title || reviewing?.title}</p>
          <label className="mt-5 block text-sm">{admin ? '검토 의견' : '환불 사유'}<textarea aria-label={admin ? '검토 의견' : '환불 사유'} value={reason} onChange={event => setReason(event.target.value)} minLength={admin ? 5 : 10} maxLength={1000} required disabled={busy} rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-slate-950 p-3" /></label>
          <p className="mt-1 text-right text-xs text-slate-400">{reason.trim().length}/1,000자 · 최소 {admin ? 5 : 10}자</p>
          {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => { setSelected(null); setReviewing(null); setReason(''); setError(''); }} className="rounded-xl bg-white/5 px-4 py-3 text-sm">닫기</button>
            {admin && reviewing?.status === 'UNDER_REVIEW' ? <><button type="button" disabled={busy} onClick={() => void submit('REJECTED')} className="rounded-xl bg-rose-400/15 px-4 py-3 text-sm text-rose-200">반려</button><button type="button" disabled={busy} onClick={() => void submit('REVIEW_APPROVED')} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950">환불 실행 대기로 변경</button></> : <button type="submit" disabled={busy} className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950">{busy ? '처리 중' : admin ? '검토 시작' : '요청 접수'}</button>}
          </div>
        </form>
      </div>}
    </div>
  );
};
export default RefundCenter;

// 실제 송금이 끝난 거래의 지급 증빙을 확인하고 정산 기록으로 남긴다.
import { useEffect, useRef, useState, type FC } from 'react';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { isAxiosError } from 'axios';
import { fetchSettlementSellers, fetchSettlementSales, fetchAdminSettlementPayouts, previewSettlement, recordSettlementPayout, type SettlementSeller, type SettlementSale, type SettlementPayout, type SettlementPreview, type RecordSettlementPayout } from '../api/settlements';

const money = (value: number) => `${value.toLocaleString()}원`;
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());

const AdminSettlements: FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sellers, setSellers] = useState<SettlementSeller[]>([]);
  const [sellerPage, setSellerPage] = useState(0);
  const [moreSellers, setMoreSellers] = useState(false);
  const [seller, setSeller] = useState<SettlementSeller | null>(null);
  const [sales, setSales] = useState<SettlementSale[]>([]);
  const [salePage, setSalePage] = useState(0);
  const [moreSales, setMoreSales] = useState(false);
  const [payouts, setPayouts] = useState<SettlementPayout[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [preview, setPreview] = useState<SettlementPreview | null>(null);
  const [paidDate, setPaidDate] = useState(today);
  const [transferReference, setTransferReference] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const pending = useRef<RecordSettlementPayout | null>(null);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    void fetchSettlementSellers(sellerPage).then(data => { if (active) { setSellers(data.content); setMoreSellers(data.hasNext); } }).catch(() => { if (active) setMessage('판매자 정산 목록을 불러오지 못했습니다.'); });
    return () => { active = false; };
  }, [sellerPage, revision]);
  useEffect(() => {
    if (!seller) return;
    let active = true;
    setSelected([]); setPreview(null);
    void Promise.all([fetchSettlementSales(seller.sellerId, salePage), fetchAdminSettlementPayouts(seller.sellerId)])
      .then(([orders, history]) => { if (active) { setSales(orders.content); setMoreSales(orders.hasNext); setPayouts(history.content); } })
      .catch(() => { if (active) setMessage('정산 거래와 지급 기록을 불러오지 못했습니다.'); });
    return () => { active = false; };
  }, [seller?.sellerId, salePage, revision]);
  const selectSeller = (value: SettlementSeller) => {
    if (busy || pending.current) return;
    setSeller(value); setSalePage(0); setSales([]); setPayouts([]); setPreview(null); setSelected([]); setMessage(''); setConfirmed(false);
  };
  const checkAmount = async () => {
    if (!seller || !selected.length || busy || pending.current) return;
    setBusy(true); setMessage('');
    try { setPreview(await previewSettlement(seller.sellerId, selected)); setConfirmed(false); }
    catch { setMessage('지급 가능 상태가 바뀌었거나 선택 거래를 확인하지 못했습니다. 목록을 다시 조회해 주세요.'); }
    finally { setBusy(false); }
  };
  const record = async () => {
    if (!seller || !preview || submitting.current || busy || (!pending.current && (!confirmed || !paidDate || !transferReference.trim() || !evidenceReference.trim()))) return;
    submitting.current = true;
    if (!pending.current) pending.current = { requestId: crypto.randomUUID(), saleIds: preview.saleIds, expectedAmount: preview.netAmount, paidDate, transferReference: transferReference.trim(), evidenceReference: evidenceReference.trim(), transferConfirmed: true };
    setBusy(true); setMessage('');
    try {
      const result = await recordSettlementPayout(seller.sellerId, pending.current);
      pending.current = null; setPreview(null); setSelected([]); setConfirmed(false); setTransferReference(''); setEvidenceReference('');
      setMessage(`지급 확인 기록 ${result.id}번을 저장했습니다. 은행 송금은 실행하지 않았습니다.`);
      setRevision(value => value + 1);
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status && [400, 403, 404, 409, 422].includes(status)) {
        pending.current = null; setPreview(null); setConfirmed(false);
        setRevision(value => value + 1);
        setMessage('지급 기록이 거절되었습니다. 최신 거래 상태와 지급일·금액·증빙을 확인해 주세요. 은행에서 다시 송금하지 마세요.');
      } else {
        setMessage('저장 결과를 확인하지 못했습니다. 은행에서 다시 송금하지 말고 같은 내용으로 재확인해 주세요. 입력값과 접수번호는 이 화면에서 유지됩니다.');
      }
    } finally { submitting.current = false; setBusy(false); }
  };
  return (
    <section className="min-h-full bg-slate-950 px-5 py-6 text-white">
      <button disabled={busy || !!pending.current} onClick={onBack} className="flex items-center gap-2 text-sm text-slate-300 disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> 관리자 홈</button>
      <h1 className="mt-6 text-2xl font-bold">판매자 지급 기록</h1>
      <p className="mt-3 rounded-2xl border border-amber-200/20 bg-amber-200/5 p-4 text-sm leading-6 text-amber-100">이 화면은 은행 송금을 실행하지 않습니다. 배송 완료된 실제 거래의 금액을 확인한 뒤, 별도 송금을 완료한 관리자가 지급일과 증빙을 기록합니다. 테스트·미대사·환불 검토 거래는 지급 대상으로 선택할 수 없습니다.</p>
      {message && <p role="status" className="mt-4 rounded-xl bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">{message}</p>}
      <div className="mt-6 space-y-2">{sellers.map(value => <button key={value.sellerId} disabled={busy || !!pending.current} onClick={() => selectSeller(value)} className={`w-full rounded-2xl border p-4 text-left disabled:opacity-40 ${seller?.sellerId === value.sellerId ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-slate-800 bg-slate-900'}`}><strong>{value.sellerName}</strong><span className="mt-2 block text-xs text-slate-300">지급 가능 {value.eligibleSaleCount}건 · {money(value.eligibleAmount)} / 지급 기록 {money(value.paidAmount)}</span></button>)}</div>
      {!sellers.length && <p className="my-5 text-sm text-slate-400">표시할 판매자 정산 내역이 없습니다.</p>}
      <div className="mt-3 flex justify-between text-sm"><button disabled={sellerPage === 0 || busy || !!pending.current} onClick={() => setSellerPage(value => value - 1)} className="disabled:opacity-30">이전 판매자</button><button disabled={!moreSellers || busy || !!pending.current} onClick={() => setSellerPage(value => value + 1)} className="disabled:opacity-30">다음 판매자</button></div>
      {seller && <>
        <div className="mb-3 mt-8 flex items-center justify-between"><h2 className="font-semibold">{seller.sellerName} 거래</h2><button disabled={busy || !!pending.current} onClick={() => setRevision(value => value + 1)} aria-label="정산 목록 다시 조회" className="rounded-lg bg-white/5 p-2 disabled:opacity-30"><RefreshCw className="h-4 w-4" /></button></div>
        <div className="space-y-2">{sales.map(sale => <label key={sale.id} className={`flex gap-3 rounded-xl border p-4 ${sale.eligible ? 'border-cyan-300/20 bg-slate-900' : 'border-slate-800 bg-slate-900/40 text-slate-400'}`}><input type="checkbox" checked={selected.includes(sale.id)} disabled={!sale.eligible || busy || !!pending.current} onChange={event => { setSelected(ids => event.target.checked ? [...ids, sale.id] : ids.filter(id => id !== sale.id)); setPreview(null); }} className="mt-1" /><span className="min-w-0 flex-1"><strong className="text-sm">{sale.boardTitle}</strong><span className="mt-1 block text-xs">거래 {sale.id} · {sale.completedAt.slice(0,10)} · 일반 티켓 {sale.purchasedCount}장</span><span className="mt-2 block text-xs">매출 {money(sale.grossAmount)} − 수수료 {money(sale.feeAmount)} = {money(sale.netAmount)}</span><span className="mt-2 block text-xs">{sale.statusReason}</span></span></label>)}</div>
        {!sales.length && <p className="p-4 text-sm text-slate-400">정산 원장이 없습니다. 실제 거래가 생성되면 조회됩니다.</p>}
        <div className="mt-3 flex justify-between text-sm"><button disabled={salePage === 0 || busy || !!pending.current} onClick={() => setSalePage(value => value - 1)} className="disabled:opacity-30">이전 거래</button><button disabled={!moreSales || busy || !!pending.current} onClick={() => setSalePage(value => value + 1)} className="disabled:opacity-30">다음 거래</button></div>
        <button disabled={!selected.length || busy || !!pending.current} onClick={() => void checkAmount()} className="mt-5 w-full rounded-xl bg-cyan-300 py-3 font-semibold text-slate-950 disabled:opacity-30">선택 {selected.length}건의 지급액 확인</button>
        {preview && <div className="mt-5 space-y-4 rounded-2xl border border-amber-200/30 bg-amber-200/5 p-5">
          <h3 className="font-semibold text-amber-100">{preview.saleCount}건 · 확인 금액 {money(preview.netAmount)}</h3>
          <p className="text-xs leading-6 text-slate-300">{preview.notice}</p>
          <label className="block text-sm">실제 지급일<input type="date" max={today()} value={paidDate} disabled={busy || !!pending.current} onChange={event => setPaidDate(event.target.value)} className="mt-2 block w-full rounded-xl bg-slate-800 p-3" /></label>
          <label className="block text-sm">송금 참조번호<input value={transferReference} maxLength={180} disabled={busy || !!pending.current} onChange={event => setTransferReference(event.target.value)} placeholder="계좌번호 대신 거래 확인용 참조번호" className="mt-2 block w-full rounded-xl bg-slate-800 p-3" /></label>
          <label className="block text-sm">증빙 보관 참조<input value={evidenceReference} maxLength={255} disabled={busy || !!pending.current} onChange={event => setEvidenceReference(event.target.value)} placeholder="내부 증빙 문서번호 등. 개인정보 입력 금지" className="mt-2 block w-full rounded-xl bg-slate-800 p-3" /></label>
          <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={confirmed} disabled={busy || !!pending.current} onChange={event => setConfirmed(event.target.checked)} className="mt-1" />별도 은행 송금을 완료했고 지급액·판매자·증빙을 확인했습니다.</label>
          <button disabled={busy || (!pending.current && (!confirmed || !transferReference.trim() || !evidenceReference.trim() || !paidDate))} onClick={() => void record()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-200 py-3 font-semibold text-slate-950 disabled:opacity-30"><Check className="h-4 w-4" />{busy ? '확인 중' : pending.current ? '같은 지급 기록 재확인' : '송금 완료 사실 기록'}</button>
        </div>}
        <h2 className="mb-3 mt-8 font-semibold">최근 지급 확인 기록</h2>
        <div className="space-y-3">{payouts.map(item => <article key={item.id} className="rounded-xl bg-slate-900 p-4 text-sm"><p className="font-semibold">기록 {item.id} · {money(item.amount)}</p><p className="mt-2 text-slate-300">지급일 {item.paidDate}</p><p className="mt-1 break-all text-xs text-slate-400">송금 참조 {item.transferReference}<br />증빙 참조 {item.evidenceReference}</p></article>)}</div>
        {!payouts.length && <p className="text-sm text-slate-400">아직 지급 확인 기록이 없습니다.</p>}
      </>}
    </section>
  );
};
export default AdminSettlements;

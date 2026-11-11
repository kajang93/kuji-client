// 판매자가 본인에게 기록된 지급일과 금액 및 증빙 참조를 확인한다.
import { useEffect, useState, type FC } from 'react';
import { fetchMySettlementPayouts, type SettlementPayout } from '../api/settlements';

const SellerPayoutHistory: FC = () => {
  const [records, setRecords] = useState<SettlementPayout[]>([]);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true; setLoading(true); setError(false);
    void fetchMySettlementPayouts(page).then(result => { if (active) { setRecords(result.content); setMore(result.hasNext); } })
      .catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);
  return <section aria-label="판매자 지급 확인 기록" className="mb-5 rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-5">
    <h2 className="font-semibold text-cyan-100">지급 확인 기록</h2><p className="mt-2 text-xs leading-6 text-slate-400">관리자가 별도 송금 완료를 확인해 남긴 기록입니다. 은행 계좌의 실제 입금과 함께 대조해 주세요.</p>
    {loading ? <p role="status" className="mt-4 text-sm">불러오는 중입니다.</p> : error ? <p role="alert" className="mt-4 text-sm text-rose-200">지급 내역을 불러오지 못했습니다.</p> : records.length ? <ul className="mt-4 space-y-3">{records.map(item => <li key={item.id} className="rounded-xl bg-white/5 p-3 text-sm"><strong>{item.amount.toLocaleString()}원</strong><span className="ml-3 text-slate-300">{item.paidDate}</span><p className="mt-2 break-all text-xs text-slate-400">송금 참조 {item.transferReference}<br />증빙 참조 {item.evidenceReference}</p></li>)}</ul> : <p className="mt-4 text-sm text-slate-400">아직 지급 확인 기록이 없습니다.</p>}
    <div className="mt-4 flex justify-between text-xs"><button disabled={page === 0 || loading} onClick={() => setPage(value => value - 1)} className="disabled:opacity-30">이전</button><button disabled={!more || loading} onClick={() => setPage(value => value + 1)} className="disabled:opacity-30">다음</button></div>
  </section>;
};
export default SellerPayoutHistory;

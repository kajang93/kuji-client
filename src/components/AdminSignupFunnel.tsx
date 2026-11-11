// 단계별 이용 집계와 회원 원장의 실제 신규 가입 건수를 분리해서 보여준다.
import { useEffect, useState, type FC } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchSignupFunnel, type FunnelReport } from '../api/funnel';
import type { FunnelEvent } from '../utils/funnelAnalytics';

const stages: [FunnelEvent, string][] = [
  ['LANDING_VIEW', '홈 진입'], ['VIEW_ITEM_LIST', '상품 목록'], ['VIEW_ITEM', '상품 상세'],
  ['AUTH_VIEW', '로그인 화면'], ['SIGNUP_VIEW', '가입 폼'], ['SIGNUP_START', '가입 입력 시작'],
  ['SMS_SEND_ACCEPTED', '문자 발송 요청 수락'], ['PHONE_VERIFIED', '휴대폰 인증 성공'],
  ['SIGNUP_SUBMITTED', '가입 제출'], ['SIGNUP_COMPLETED', '브라우저 가입 완료 보고'],
  ['LOGIN_COMPLETED', '로그인 완료'], ['AUTH_RETURNED_ITEM', '원래 상품 복귀'], ['VALIDATION_FAILED', '입력 확인 필요'],
];

const AdminSignupFunnel: FC<{ onBack: () => void }> = ({ onBack }) => {
  const [days, setDays] = useState(7);
  const [report, setReport] = useState<FunnelReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    void fetchSignupFunnel(days).then(data => { if (active) setReport(data); })
      .catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [days, revision]);
  const counts = new Map(report?.counts.map(item => [item.event, item.count]));
  return (
    <section className="min-h-full bg-slate-950 px-5 py-6 text-white">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-300"><ArrowLeft className="h-4 w-4" /> 관리자 홈</button>
      <h1 className="mt-6 text-2xl font-bold">가입 흐름 집계</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">수집 시작 이후의 단계별 건수입니다. 문자 도착률·순방문자·개별 고객 전환율과 구분해 확인해 주세요.</p>
      <div className="my-5 flex gap-3">
        <select aria-label="집계 기간" value={days} onChange={event => setDays(Number(event.target.value))} className="rounded-xl bg-slate-800 px-3 py-2">{[1,7,30,90].map(value => <option key={value} value={value}>최근 {value}일</option>)}</select>
        <button disabled={loading} onClick={() => setRevision(value => value + 1)} className="rounded-xl bg-cyan-300/10 px-3 py-2 text-cyan-200 disabled:opacity-40"><RefreshCw className="h-4 w-4" /><span className="sr-only">다시 조회</span></button>
      </div>
      {error ? <p role="alert" className="rounded-xl bg-rose-400/10 p-4 text-rose-200">집계를 불러오지 못했습니다. 권한과 연결 상태를 확인해 주세요.</p> : loading ? <p role="status">집계를 불러오고 있어요.</p> : report && <>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5"><p className="text-sm text-cyan-100">회원 원장 기준 신규 가입 확정</p><p className="mt-2 text-3xl font-bold">{report.confirmedSignups.toLocaleString()}명</p><p className="mt-2 text-xs text-slate-400">관리자 계정 제외. 유입별 귀속을 추정하지 않습니다.</p></div>
        <ol className="mt-5 space-y-2">{stages.map(([event, label]) => <li key={event} className="flex justify-between gap-4 rounded-xl bg-slate-900 px-4 py-3"><span className="text-sm text-slate-300">{label}</span><strong className="tabular-nums">{(counts.get(event) || 0).toLocaleString()}건</strong></li>)}</ol>
        <h2 className="mb-3 mt-7 font-semibold">유입별 단계 건수</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800"><table className="w-full text-left text-xs"><thead className="bg-slate-900"><tr><th className="p-3">유입</th><th className="p-3">단계</th><th className="p-3">건수</th></tr></thead><tbody>{report.sources.map(item => <tr key={`${item.source}-${item.event}`} className="border-t border-slate-800"><td className="p-3">{item.source}</td><td className="p-3">{stages.find(([event]) => event === item.event)?.[1] || item.event}</td><td className="p-3">{item.count.toLocaleString()}</td></tr>)}</tbody></table>{!report.sources.length && <p className="p-4 text-slate-400">아직 수집된 유입별 집계가 없습니다.</p>}</div>
        <p className="mt-5 text-xs leading-6 text-slate-400">{report.notice}</p>
      </>}
    </section>
  );
};
export default AdminSignupFunnel;

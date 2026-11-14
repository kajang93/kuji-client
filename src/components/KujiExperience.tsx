// 실제 결제·포인트·배송 기록 없이 티켓 선택부터 라스트상 개봉까지 체험한다.
import { useEffect, useRef, useState, type FC } from 'react';
import { ArrowLeft, Check, Gift, RotateCcw, Sparkles, Ticket } from 'lucide-react';
import { motion } from './motion';
import KujiReveal from './KujiReveal';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { createExperienceRound, EXPERIENCE_IMAGE, purchaseExperienceTickets } from '../utils/kujiExperience';
import { playDrawHaptic } from '../utils/drawHaptics';
import type { Prize } from '../shared-types';

const KujiExperience: FC<{ onBack: () => void }> = ({ onBack }) => {
  const [round, setRound] = useState(createExperienceRound);
  const [selected, setSelected] = useState<number[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [history, setHistory] = useState<Prize[]>([]);
  const [phase, setPhase] = useState<'select' | 'reveal' | 'results'>('select');
  const [error, setError] = useState('');
  const opening = useRef(false);
  const remaining = round.tickets.filter(ticket => !ticket.opened);

  useEffect(() => {
    document.getElementById('main-scroll-container')?.scrollTo(0, 0);
  }, [phase]);

  const reset = () => {
    opening.current = false;
    setRound(createExperienceRound());
    setSelected([]); setPrizes([]); setHistory([]); setError(''); setPhase('select');
  };

  const toggle = (id: number) => {
    if (opening.current || round.tickets.find(ticket => ticket.id === id)?.opened) return;
    playDrawHaptic('select');
    setError('');
    setSelected(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
  };

  const purchase = () => {
    if (opening.current) return;
    try {
      const result = purchaseExperienceTickets(round, selected);
      opening.current = true;
      setRound(result.round); setPrizes(result.prizes);
      setSelected([]); setError(''); setPhase('reveal');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '체험 티켓을 다시 선택해 주세요.');
    }
  };

  if (phase === 'reveal') return <KujiReveal experience prizes={prizes} onComplete={destination => {
    if (!opening.current) return;
    opening.current = false;
    setHistory(previous => [...previous, ...prizes]);
    setPhase(destination === 'detail' && remaining.length ? 'select' : 'results');
  }} />;

  return (
    <section className="min-h-full bg-slate-950 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 text-white sm:px-8">
      <div className="mx-auto max-w-lg">
        <button onClick={onBack} className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" />홈으로 돌아가기</button>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"><Sparkles className="h-3.5 w-3.5" />무료 쿠지 체험</span>
          <span className="text-xs text-slate-400">일반 {remaining.length} / 6장</span>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{phase === 'results' ? '오늘 체험한 작은 행운들' : '마음이 가는 한 장, 뜯어볼까요?'}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">0원으로 가상 구매하고 실제 쿠지처럼 개봉해 보세요. 실제 결제·포인트 차감·상품 배송은 없습니다.</p>
        {phase === 'results' ? <>
          <p className="mt-5 text-xs text-cyan-200">아래 결과는 무료 체험 기록이며 실제 보관함에 저장되지 않아요.</p>
          <div className="mt-4 space-y-3">
            {history.map(prize => <article key={prize.id} className={`flex items-center gap-4 rounded-2xl border p-3 ${prize.lastPrize ? 'border-amber-200/30 bg-amber-200/10' : 'border-white/10 bg-slate-900'}`}>
              <ImageWithFallback src={prize.image} alt={prize.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div><p className={`text-xs font-semibold ${prize.lastPrize ? 'text-amber-200' : 'text-cyan-200'}`}>{prize.lastPrize ? '라스트상 · 마지막 티켓 보너스' : `${prize.rank}상 · 체험 결과`}</p><p className="mt-1 text-sm text-white">{prize.name}</p></div>
            </article>)}
          </div>
          {remaining.length > 0 && <button onClick={() => setPhase('select')} className="mt-6 w-full rounded-2xl bg-amber-100 px-5 py-4 font-semibold text-slate-950">남은 {remaining.length}장 이어서 체험</button>}
          <button onClick={reset} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-4 text-sm text-slate-200"><RotateCcw className="h-4 w-4" />새 회차로 다시 체험</button>
        </> : <>
          <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            <ImageWithFallback src={EXPERIENCE_IMAGE} alt="무료 체험에 사용하는 달빛 서점 그림" fetchPriority="high" className="h-40 w-full object-cover object-center sm:h-48" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">달빛 서점 · 체험용 가상 굿즈</p>
          </div>
          <aside aria-label="라스트상 체험 규칙" className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-100"><Gift className="h-4 w-4" />마지막 한 장에는 라스트상까지</p>
            <p className="mt-2 text-xs leading-5 text-amber-100/75">일반 티켓이 모두 소진되는 구매에 라스트상 1개가 추가돼요. 라스트상은 일반 티켓에 섞이지 않아요.</p>
            <p className="mt-2 text-xs text-slate-400">체험 구성 · A상 1개, B상 2개, C상 3개 + 라스트상 1개</p>
          </aside>
          <div className="mb-3 mt-7 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-200">티켓 선택</h2>
            <button onClick={() => { setSelected(remaining.map(ticket => ticket.id)); setError(''); playDrawHaptic('select'); }} disabled={!remaining.length} className="min-h-10 text-xs font-semibold text-cyan-200 hover:text-cyan-100">남은 {remaining.length}장 모두 선택</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {round.tickets.map(ticket => <motion.button key={ticket.id} type="button" aria-label={`${ticket.id + 1}번 체험 티켓${ticket.opened ? ' 개봉됨' : ''}`} aria-pressed={selected.includes(ticket.id)} disabled={ticket.opened} onClick={() => toggle(ticket.id)} whileTap={ticket.opened ? {} : { scale: 0.96 }} className={`relative flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl border transition-colors ${ticket.opened ? 'border-white/5 bg-slate-900/50 text-slate-600' : selected.includes(ticket.id) ? 'border-amber-200 bg-amber-200/15 text-amber-100 shadow-lg shadow-amber-300/5' : 'border-indigo-300/20 bg-gradient-to-br from-indigo-950 to-slate-900 text-slate-200 hover:border-cyan-200/50'}`}>
              {ticket.opened ? <Check className="h-6 w-6" /> : <Ticket className="h-7 w-7 -rotate-12" />}<span className="text-xs font-semibold">{ticket.opened ? '개봉한 티켓' : `${String(ticket.id + 1).padStart(2, '0')}번 티켓`}</span>
              {selected.includes(ticket.id) && <Check aria-hidden="true" className="absolute right-2 top-2 h-4 w-4 text-amber-100" />}
            </motion.button>)}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}
          <button onClick={purchase} disabled={!selected.length} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-100 to-amber-300 px-5 py-4 font-semibold text-slate-950 shadow-lg disabled:bg-none disabled:bg-slate-800 disabled:text-slate-500">{selected.length ? `0원으로 가상 구매 · ${selected.length}장 개봉` : '체험할 티켓을 골라주세요'}</button>
          {history.length > 0 && <button onClick={() => setPhase('results')} className="mt-3 min-h-11 w-full text-sm text-slate-300">지금까지 체험 결과 보기</button>}
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">아이폰 웹에서는 짧은 진동만 느낄 수 있어요(iOS 18 이상).<br />앱에서는 절취선을 뜯을수록 강해지는 진동을 느낄 수 있어요.</p>
        </>}
        <p className="mt-7 text-center text-[11px] text-slate-500">체험 기록은 새로고침하거나 화면을 나가면 초기화됩니다.</p>
      </div>
    </section>
  );
};

export default KujiExperience;

// 실물 티켓을 당겨 개봉하는 연출과 당첨 상품 확인을 제공한다.
import { useState, useEffect, useRef, useId, type FC } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation, useReducedMotion, type PanInfo } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Hand, LoaderCircle, Package, RotateCcw, Sparkles, Ticket } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import type { Prize } from '@/shared-types';
import { isLastPrize } from '../utils/kujiMappers';
import confetti from 'canvas-confetti';
import { playDrawHaptic, stopDrawHaptics } from '../utils/drawHaptics';

type KujiRevealProps = {
  prizes: Prize[];
  onComplete: (destination?: "winning" | "detail") => void;
};

type RevealStage = 'ready' | 'tearing' | 'revealed';
const DRAG_THRESHOLD = 132;
const RANK_TONES: Record<string, { color: string; soft: string; particles: number }> = {
  LAST: { color: '#ffe3a3', soft: '#c9862c', particles: 40 },
  S: { color: '#f5cf83', soft: '#bc842e', particles: 32 },
  A: { color: '#f5cf83', soft: '#bc842e', particles: 28 },
  B: { color: '#9ac7ff', soft: '#477ace', particles: 20 },
  C: { color: '#c4a9ff', soft: '#8060bb', particles: 16 },
  D: { color: '#8fddca', soft: '#368d81', particles: 14 },
  E: { color: '#f1abc9', soft: '#ae5c80', particles: 12 },
};

const KujiReveal: FC<KujiRevealProps> = ({ prizes, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<RevealStage>('ready');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const controls = useAnimation();
  const rotateY = useTransform(x, [0, DRAG_THRESHOLD, 460], [0, -12, -38]);
  const rotate = useTransform(x, [0, DRAG_THRESHOLD], [0, -3]);
  const progressScale = useTransform(x, [0, DRAG_THRESHOLD], [0, 1]);
  const paperId = useId().replace(/:/g, '');
  const currentPrize = prizes[currentIndex];
  const isLastBonus = isLastPrize(currentPrize.rank);
  const hasLastBonus = prizes.some(prize => isLastPrize(prize.rank));
  const tone = RANK_TONES[isLastBonus ? 'LAST' : currentPrize.rank] || { color: '#aebdd7', soft: '#64748b', particles: 10 };

  const mountedRef = useRef(true);
  const stageRef = useRef<RevealStage>('ready');
  const currentIndexRef = useRef(0);
  const autoRef = useRef(false);
  const completedRef = useRef(false);
  const runRef = useRef(0);
  const timersRef = useRef(new Map<number, (active: boolean) => void>());
  const pullSegmentRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const lastTearSoundRef = useRef(0);

  const isActive = (run: number) => mountedRef.current && !completedRef.current && runRef.current === run;

  const pause = (duration: number, run: number): Promise<boolean> => new Promise(resolve => {
    if (!isActive(run)) {
      resolve(false);
      return;
    }
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      resolve(isActive(run));
    }, duration);
    timersRef.current.set(timer, resolve);
  });

  const cancelRun = () => {
    runRef.current += 1;
    timersRef.current.forEach((resolve, timer) => {
      window.clearTimeout(timer);
      resolve(false);
    });
    timersRef.current.clear();
  };

  useEffect(() => {
    mountedRef.current = true;
    window.scrollTo(0, 0);
    return () => {
      mountedRef.current = false;
      cancelRun();
      controls.stop();
      stopDrawHaptics();
      audioSourcesRef.current.forEach(source => source.stop());
      audioSourcesRef.current.clear();
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context && context.state !== 'closed') void context.close().catch(() => undefined);
    };
  }, [controls]);

  useEffect(() => {
    if (stage !== 'revealed') return;
    headingRef.current?.focus({ preventScroll: true });
    if (reducedMotion || !canvasRef.current) return;
    const celebration = confetti.create(canvasRef.current, { resize: true, useWorker: false });
    void celebration({
      particleCount: tone.particles,
      spread: 68,
      startVelocity: 21,
      gravity: 0.85,
      ticks: 100,
      origin: { x: 0.5, y: 0.58 },
      colors: [tone.color, '#f8fafc', tone.soft],
      scalar: 0.7,
      disableForReducedMotion: true,
    });
    return () => celebration.reset();
  }, [stage, currentIndex, reducedMotion, tone.color, tone.soft, tone.particles]);

  const playTearSound = () => {
    const now = Date.now();
    if (now - lastTearSoundRef.current < 90) return;
    lastTearSoundRef.current = now;
    try {
      if (!audioContextRef.current) {
        if (!('AudioContext' in window)) return;
        audioContextRef.current = new AudioContext();
      }
      const context = audioContextRef.current;
      if (context.state === 'suspended') void context.resume().catch(() => undefined);
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.035), context.sampleRate);
      const noise = buffer.getChannelData(0);
      for (let i = 0; i < noise.length; i++) {
        noise[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noise.length * 0.18));
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0.045, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.035);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(context.destination);
      audioSourcesRef.current.add(source);
      source.onended = () => {
        audioSourcesRef.current.delete(source);
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      source.start();
      source.stop(context.currentTime + 0.035);
    } catch {
      // 소리를 재생할 수 없는 환경에서도 개봉 동작은 계속한다.
    }
  };

  const resetTicket = (index: number) => {
    currentIndexRef.current = index;
    stageRef.current = 'ready';
    pullSegmentRef.current = 0;
    setCurrentIndex(index);
    setStage('ready');
    setPullProgress(0);
    x.set(0);
    controls.set({ x: 0, y: 0, opacity: 1 });
  };

  const openTicket = async (index: number, run: number): Promise<boolean> => {
    if (!isActive(run) || stageRef.current !== 'ready') return false;
    stageRef.current = 'tearing';
    setStage('tearing');
    setPullProgress(100);
    playDrawHaptic('open');
    playTearSound();
    void controls.start({
      x: reducedMotion ? 0 : Math.max(window.innerWidth, 480),
      y: reducedMotion ? 0 : -24,
      opacity: 0,
      transition: { duration: reducedMotion ? 0.12 : 0.44, ease: [0.22, 0.7, 0.25, 1] },
    });
    if (!await pause(reducedMotion ? 140 : 460, run)) return false;
    stageRef.current = 'revealed';
    setStage('revealed');
    playDrawHaptic('reveal');
    toast.success(prizes[index].rank + '상 · ' + prizes[index].name, { id: 'kuji-reveal', duration: 1800 });
    return true;
  };

  const finish = (destination: 'winning' | 'detail') => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelRun();
    controls.stop();
    stopDrawHaptics();
    onComplete(destination);
  };

  const handleDragStart = () => {
    if (stageRef.current !== 'ready' || autoRef.current) return;
    controls.stop();
    pullSegmentRef.current = 0;
    playDrawHaptic('select');
  };

  const handleDrag = () => {
    if (stageRef.current !== 'ready' || autoRef.current) return;
    const progress = Math.min(Math.max(x.get(), 0) / DRAG_THRESHOLD, 1);
    setPullProgress(Math.round(progress * 100));
    const segment = Math.floor(progress * 4);
    if (segment > pullSegmentRef.current) {
      pullSegmentRef.current = segment;
      playDrawHaptic('pull');
      playTearSound();
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (stageRef.current !== 'ready' || autoRef.current) return;
    const distance = Math.max(x.get(), 0);
    if (distance >= DRAG_THRESHOLD || (distance >= 48 && info.velocity.x > 700)) {
      void openTicket(currentIndexRef.current, runRef.current);
    } else {
      setPullProgress(0);
      pullSegmentRef.current = 0;
      void controls.start({ x: 0, y: 0, opacity: 1, transition: reducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 420, damping: 28 } });
    }
  };

  const handleManualOpen = () => {
    if (autoRef.current || stageRef.current !== 'ready') return;
    void openTicket(currentIndexRef.current, runRef.current);
  };

  const handleNext = () => {
    if (autoRef.current || stageRef.current !== 'revealed') return;
    playDrawHaptic('select');
    if (currentIndexRef.current < prizes.length - 1) {
      cancelRun();
      resetTicket(currentIndexRef.current + 1);
    } else {
      finish('detail');
    }
  };

  const handleAutoOpen = async () => {
    if (autoRef.current || stageRef.current !== 'ready' || completedRef.current) return;
    autoRef.current = true;
    setIsAutoMode(true);
    playDrawHaptic('select');
    const run = ++runRef.current;
    const startIndex = currentIndexRef.current;
    for (let index = startIndex; index < prizes.length; index++) {
      if (!isActive(run)) return;
      if (index > startIndex) {
        resetTicket(index);
        if (!await pause(reducedMotion ? 160 : 280, run)) return;
      }
      if (!await openTicket(index, run)) return;
      if (!await pause(1050, run)) return;
    }
    if (!isActive(run)) return;
    autoRef.current = false;
    setIsAutoMode(false);
    finish('winning');
  };

  return (
    <section aria-label="쿠지 개봉" className="relative isolate min-h-full w-full overflow-x-clip bg-[#080d19] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,#252348_0%,transparent_62%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 3px,transparent 4px)', backgroundSize: '100% 4px' }} />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200/15 bg-amber-200/[0.06]">
              <Ticket className="h-[18px] w-[18px] -rotate-12 text-amber-200" />
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] text-amber-100/75">KUJI SHOP</p>
              <p className="mt-0.5 text-[11px] text-slate-400">나의 행운을 여는 순간</p>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-1.5 text-xs tabular-nums text-slate-400">
            <span className="font-semibold text-white">{currentIndex + 1}</span><span className="mx-1.5 text-slate-600">/</span>{prizes.length}
          </div>
        </header>

        {hasLastBonus && (
          <div role="status" className="mt-5 rounded-2xl border border-amber-200/25 bg-amber-200/[0.07] px-4 py-3 text-center text-sm text-amber-100">
            마지막 일반 쿠지를 뽑았어요. 라스트상 1개도 함께 개봉해요.
          </div>
        )}

        <main className="flex flex-1 flex-col justify-center py-8 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            {stage !== 'revealed' ? (
              <motion.div key={'ticket-' + currentIndex} initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.12 : 0.22 }}>
                <div className="mb-9 text-center">
                  <p className="mb-3 text-[10px] font-medium tracking-[0.24em] text-amber-200/65">A LITTLE MOMENT OF LUCK</p>
                  <h1 className="text-[28px] font-semibold leading-[1.35] tracking-tight sm:text-[34px]">어떤 행운이<br /><span className="text-amber-100">기다리고 있을까요?</span></h1>
                  <p className="mt-3 text-sm text-slate-400">한 장의 설렘을, 내 손으로.</p>
                </div>

                <div className="relative mx-auto w-full max-w-[390px]" style={{ perspective: '1100px' }}>
                  <div aria-hidden="true" className="pointer-events-none absolute -inset-6 rounded-full bg-amber-100/[0.05] blur-3xl" />
                  <div className="relative aspect-[1.72] w-full rounded-[18px] shadow-[0_26px_65px_-20px_#000] sm:rounded-[22px]">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[18px] border border-amber-100/30 bg-[#eee9dc] sm:rounded-[22px]">
                      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'repeating-linear-gradient(25deg,#a59a83 0px,transparent 1px,transparent 4px)' }} />
                      <div className="absolute inset-3 rounded-xl border border-amber-900/15" />
                      <div className="flex flex-col items-center text-[#735936]">
                        <span className="text-[10px] font-semibold tracking-[0.3em]">YOUR LUCKY PRIZE</span>
                        <span className="mt-1 font-serif text-6xl font-bold">{currentPrize.rank}<span className="ml-1 text-xl">상</span></span>
                      </div>
                    </div>

                    <motion.div
                      role="button"
                      tabIndex={stage === 'ready' && !isAutoMode ? 0 : -1}
                      aria-label="오른쪽으로 당겨 쿠지 개봉. 엔터 키로 바로 개봉할 수 있습니다."
                      aria-disabled={stage !== 'ready' || isAutoMode}
                      drag={stage === 'ready' && !isAutoMode ? 'x' : false}
                      dragConstraints={{ left: 0, right: 168 }}
                      dragElastic={{ left: 0.03, right: 0.08 }}
                      dragMomentum={false}
                      onDragStart={handleDragStart}
                      onDrag={handleDrag}
                      onDragEnd={handleDragEnd}
                      onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleManualOpen();
                        }
                      }}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={controls}
                      style={{ x, rotateY: reducedMotion ? 0 : rotateY, rotate: reducedMotion ? 0 : rotate, transformOrigin: '85% 50%', transformStyle: 'preserve-3d', touchAction: 'pan-y' }}
                      className="absolute inset-0 z-10 select-none rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 active:cursor-grabbing sm:rounded-[22px]"
                    >
                      <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 400 232" className="overflow-visible drop-shadow-[0_10px_15px_#00000040]" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={paperId + '-paper'} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#faf3e3" /><stop offset="55%" stopColor="#ede2cc" /><stop offset="100%" stopColor="#dfcfad" />
                          </linearGradient>
                          <linearGradient id={paperId + '-foil'} x1="0%" y1="10%" x2="100%" y2="90%">
                            <stop offset="0%" stopColor="#8f692e" /><stop offset="30%" stopColor="#d1a45b" /><stop offset="48%" stopColor="#9e7334" /><stop offset="65%" stopColor="#dec28b" /><stop offset="100%" stopColor="#886028" />
                          </linearGradient>
                          <pattern id={paperId + '-grain'} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1h1M2 3h1" stroke="#8a744a" strokeOpacity=".12" strokeWidth=".5" /></pattern>
                          <pattern id={paperId + '-lines'} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v12" stroke="#b79559" strokeOpacity=".11" strokeWidth=".5" /></pattern>
                        </defs>
                        <rect width="400" height="232" rx="20" fill={'url(#' + paperId + '-paper)'} />
                        <rect width="400" height="232" rx="20" fill={'url(#' + paperId + '-grain)'} />
                        <rect x="10" y="10" width="380" height="212" rx="12" fill="none" stroke="#a98950" strokeOpacity=".42" />
                        <path d="M78 0v232" stroke="#927b54" strokeOpacity=".48" strokeDasharray="2 5" />
                        <circle cx="78" cy="0" r="8" fill="#121728" /><circle cx="78" cy="232" r="8" fill="#111625" />
                        <rect x="90" y="24" width="278" height="184" rx="7" fill={'url(#' + paperId + '-lines)'} />
                        <path d="M107 57V41h17m227 16V41h-17M107 175v16h17m227-16v16h-17" fill="none" stroke="#b29156" strokeWidth="1.3" />
                        <text x="39" y="100" textAnchor="middle" fill="#725832" fontSize="12" fontWeight="700" letterSpacing="3" transform="rotate(-90 39 100)">KUJI SHOP</text>
                        <text x="39" y="181" textAnchor="middle" fill="#9b8255" fontSize="9" letterSpacing="1">NO.</text>
                        <text x="39" y="199" textAnchor="middle" fill="#725832" fontSize="12" fontWeight="600">{String(currentIndex + 1).padStart(3, '0')}</text>
                        <text x="225" y="82" textAnchor="middle" fill="#998057" fontSize="9" letterSpacing="4">A GIFT OF CHANCE</text>
                        <text x="225" y="128" textAnchor="middle" fill={'url(#' + paperId + '-foil)'} fontFamily="Georgia, serif" fontWeight="700" fontSize="43" letterSpacing="8">KUJI</text>
                        <path d="M167 145h116" stroke="#ad8d53" strokeOpacity=".5" />
                        <text x="225" y="166" textAnchor="middle" fill="#8b744b" fontSize="11" letterSpacing="2">행운을 여는 한 장</text>
                        <path d="M377 91l5 6-5 6 5 6-5 6 5 6-5 6 5 6-5 6" fill="none" stroke="#9e814c" strokeOpacity=".45" />
                      </svg>
                      <div aria-hidden="true" className="absolute right-2 top-1/2 flex h-12 w-7 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-[#b59660]/40 bg-[#dbc596]/45 text-[#72542d] shadow-[inset_0_1px_0_#ffffff60]">
                        <span className="text-[7px] font-semibold tracking-wide">PULL</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="mx-auto mt-7 max-w-[250px]">
                    <div aria-hidden="true" className="h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-amber-400/60 to-amber-100" style={{ scaleX: progressScale }} />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Hand aria-hidden="true" className="h-3.5 w-3.5 text-amber-100/70" />
                      <span>{stage === 'tearing' ? '당신의 행운을 확인하고 있어요' : pullProgress >= 100 ? '지금 손을 놓으면 열려요' : '오른쪽으로 천천히 당겨보세요'}</span>
                      {stage === 'ready' && <motion.span aria-hidden="true" animate={reducedMotion ? {} : { x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="h-3.5 w-3.5 text-amber-100/70" /></motion.span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={'result-' + currentIndex} initial={{ opacity: 0, y: reducedMotion ? 0 : 18, scale: reducedMotion ? 1 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.12 : 0.35 }} onAnimationComplete={() => headingRef.current?.focus({ preventScroll: true })}>
                <div className="mb-5 text-center">
                  <div className="mx-auto mb-2 flex items-center justify-center gap-1.5 text-[10px] font-medium tracking-[0.22em]" style={{ color: tone.color }}><Sparkles aria-hidden="true" className="h-3 w-3" />YOUR LUCKY MOMENT</div>
                  <p className="text-sm text-slate-400">{isLastBonus ? '마지막 한 장의 주인공에게 드리는 보너스예요.' : '기다리던 행운이 도착했어요.'}</p>
                </div>
                <div className="relative overflow-hidden rounded-[26px] border bg-gradient-to-b from-slate-800/80 to-slate-900/95 p-3.5 shadow-2xl" style={{ borderColor: tone.color + '40', boxShadow: '0 0 70px -25px ' + tone.soft + '65' }}>
                  <div aria-hidden="true" className="pointer-events-none absolute -top-20 left-1/2 h-44 w-64 -translate-x-1/2 rounded-full opacity-15 blur-3xl" style={{ backgroundColor: tone.color }} />
                  <div className="relative flex h-[min(38dvh,300px)] min-h-[180px] items-center justify-center overflow-hidden rounded-[17px] bg-[#f3f3f1]">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,#fff_20%,#e7e8e6_100%)]" />
                    <ImageWithFallback src={currentPrize.image} alt={currentPrize.name} className="relative h-full w-full object-contain p-5" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-slate-950/90 px-3 py-1.5 text-[11px] font-bold shadow-lg" style={{ color: tone.color }}>{isLastBonus ? '라스트상 보너스' : `${currentPrize.rank}상`}</div>
                  </div>
                  <div className="relative px-2 pb-3 pt-5 text-center">
                    <p className="mb-1 text-[10px] font-medium tracking-[0.18em]" style={{ color: tone.color }}>{isLastBonus ? '라스트상 추가 지급' : `${currentPrize.rank}상 당첨`}</p>
                    <h2 ref={headingRef} tabIndex={-1} className="break-keep text-xl font-semibold leading-relaxed tracking-tight text-white outline-none sm:text-2xl">{currentPrize.name}</h2>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><Package aria-hidden="true" className="h-3 w-3" />보관함에 안전하게 담았어요.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="relative z-40 mt-auto">
          <div aria-hidden="true" className="mb-5 h-px overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div initial={false} animate={{ width: ((currentIndex + (stage === 'revealed' ? 1 : 0)) / prizes.length) * 100 + '%' }} transition={{ duration: reducedMotion ? 0 : 0.3 }} className="h-full rounded-full bg-amber-100/40" />
          </div>
          {isAutoMode ? (
            <div role="status" aria-live="polite" className="flex min-h-12 items-center justify-center gap-2 text-sm text-slate-300"><LoaderCircle aria-hidden="true" className={'h-4 w-4 text-amber-200 ' + (reducedMotion ? '' : 'animate-spin')} />{currentIndex + 1} / {prizes.length} · 한 장씩 개봉하고 있어요.</div>
          ) : stage === 'ready' ? (
            <div className="flex gap-2.5">
              <button type="button" onClick={handleManualOpen} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.045] px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">바로 뜯기<ArrowUpRight aria-hidden="true" className="h-4 w-4 text-slate-400" /></button>
              {prizes.length > 1 && <button type="button" onClick={() => void handleAutoOpen()} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-200/20 bg-amber-100/[0.08] px-4 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-100/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">모두 자동 오픈<Sparkles aria-hidden="true" className="h-4 w-4" /></button>}
            </div>
          ) : stage === 'revealed' ? (
            currentIndex < prizes.length - 1 ? (
              <button type="button" onClick={handleNext} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 font-semibold text-slate-950 shadow-[0_4px_25px_-8px_#f5d18b50] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">다음 쿠지 뜯기<ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" /></button>
            ) : (
              <div className="space-y-2.5">
                <button type="button" onClick={() => finish('winning')} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 font-semibold text-slate-950 shadow-[0_4px_25px_-8px_#f5d18b50] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"><Package aria-hidden="true" className="h-[18px] w-[18px]" />보관함으로 바로 이동</button>
                <button type="button" onClick={() => finish('detail')} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />다시 뽑기</button>
              </div>
            )
          ) : <div role="status" className="flex min-h-12 items-center justify-center text-sm text-slate-400">봉인된 행운을 열고 있어요.</div>}
          <p className="mt-4 text-center text-[10px] tracking-wide text-slate-600">오늘의 작은 설렘, 오래 남을 순간.</p>
        </footer>
      </div>
    </section>
  );
};

export default KujiReveal;

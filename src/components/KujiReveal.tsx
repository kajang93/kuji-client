// 실물 티켓을 당겨 개봉하는 연출과 당첨 상품 확인을 제공한다.
import { useState, useEffect, useRef, type FC } from 'react';
import { motion, animate, AnimatePresence, useMotionValue, useTransform, useReducedMotion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Hand, LoaderCircle, Package, RotateCcw, Sparkles, Ticket, Volume2, VolumeX } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import type { Prize } from '@/shared-types';
import { isLastPrize } from '../utils/kujiMappers';
import confetti from 'canvas-confetti';
import { playDrawHaptic, playRevealHaptic, playTearTick, stopDrawHaptics } from '../utils/drawHaptics';

type KujiRevealProps = {
  prizes: Prize[];
  onComplete: (destination?: "winning" | "detail") => void;
  experience?: boolean;
};

type RevealStage = 'ready' | 'tearing' | 'unsealed' | 'revealed';
type OpeningBeat = 'sealed' | 'dimming' | 'tension' | 'split' | 'burst';
const DRAG_THRESHOLD = 132;
// 절취선 구멍 (흰 띠 위 파란 원)과 뜯긴 끝의 톱니 모양
const PERF_HOLES = 'radial-gradient(circle at 4px 5px,#1d4ed8 1.6px,transparent 2px)';
const TORN_EDGE = 'polygon(0 0,3px 30%,0 50%,3px 70%,0 100%,100% 100%,100% 0)';
const RANK_TONES: Record<string, { color: string; soft: string; particles: number }> = {
  LAST: { color: '#ffe3a3', soft: '#c9862c', particles: 40 },
  S: { color: '#f5cf83', soft: '#bc842e', particles: 32 },
  A: { color: '#f5cf83', soft: '#bc842e', particles: 28 },
  B: { color: '#9ac7ff', soft: '#477ace', particles: 20 },
  C: { color: '#fdba74', soft: '#ea580c', particles: 16 },
  D: { color: '#8fddca', soft: '#368d81', particles: 14 },
  E: { color: '#f1abc9', soft: '#ae5c80', particles: 12 },
};

const KujiReveal: FC<KujiRevealProps> = ({ prizes, onComplete, experience = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<RevealStage>('ready');
  const [openingBeat, setOpeningBeat] = useState<OpeningBeat>('sealed');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // 절취선 전체 폭: 남은 띠와 뜯긴 띠가 같은 구멍 격자를 쓰도록 측정한다
  const [stripWidth, setStripWidth] = useState(292);
  const measureStrip = (el: HTMLDivElement | null) => {
    if (el && el.offsetWidth > 0 && el.offsetWidth !== stripWidth) setStripWidth(el.offsetWidth);
  };
  const reducedMotion = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [0, DRAG_THRESHOLD, 250], [0, -64, -168]);
  const paperLift = useTransform(x, [0, DRAG_THRESHOLD, 250], [0, -8, -2]);
  const stripPeel = useTransform(x, [0, DRAG_THRESHOLD], ['0%', '100%']);
  const stripOpacity = useTransform(x, [0, 8, DRAG_THRESHOLD, 170], [0, 1, 1, 0]);
  const stripLift = useTransform(x, [0, DRAG_THRESHOLD], [0, 9]);
  const stripLiftUp = useTransform(x, [0, DRAG_THRESHOLD], [0, -9]);
  const stripTilt = useTransform(x, [0, DRAG_THRESHOLD], [0, 3]);
  const stripTiltUp = useTransform(x, [0, DRAG_THRESHOLD], [0, -3]);
  const tabRight = useTransform(x, [0, DRAG_THRESHOLD, 170], ['-14px', 'calc(100% - 40px)', 'calc(100% - 40px)']);
  const foldShade = useTransform(x, [0, 65, DRAG_THRESHOLD, 250], [0, 0.15, 0.32, 0.05]);
  const creaseWidth = useTransform(x, [0, DRAG_THRESHOLD, 250], ['2%', '12%', '2%']);
  const progressScale = useTransform(x, [0, DRAG_THRESHOLD], [0, 1]);
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
  const celebrationRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const lastTearSoundRef = useRef(0);
  const soundEnabledRef = useRef(true);
  const panStartRef = useRef(0);
  const horizontalPanRef = useRef(false);

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
    x.stop();
    stopDrawHaptics();
    celebrationRef.current?.reset();
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch { /* 이미 끝난 소리는 다시 중지하지 않는다. */ }
    });
    audioSourcesRef.current.clear();
  };

  useEffect(() => {
    mountedRef.current = true;
    window.scrollTo(0, 0);
    return () => {
      mountedRef.current = false;
      cancelRun();
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context && context.state !== 'closed') void context.close().catch(() => undefined);
    };
  }, [x]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) return;
      cancelRun();
      autoRef.current = false;
      setIsAutoMode(false);
      if (stageRef.current !== 'revealed' && stageRef.current !== 'unsealed') resetTicket(currentIndexRef.current);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [x]);

  useEffect(() => {
    if (!reducedMotion) return;
    stopDrawHaptics();
    if (stageRef.current === 'tearing') {
      cancelRun();
      autoRef.current = false;
      setIsAutoMode(false);
      resetTicket(currentIndexRef.current);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (stage !== 'revealed') return;
    headingRef.current?.focus({ preventScroll: true });
    if (reducedMotion || document.hidden || !canvasRef.current) return;
    const celebration = confetti.create(canvasRef.current, { resize: true, useWorker: false });
    celebrationRef.current = celebration;
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
    return () => {
      celebration.reset();
      if (celebrationRef.current === celebration) celebrationRef.current = null;
    };
  }, [stage, currentIndex, reducedMotion, tone.color, tone.soft, tone.particles]);

  const preparePaperAudio = () => {
    if (!soundEnabledRef.current || document.hidden || reducedMotion) return;
    try {
      if (!audioContextRef.current) {
        const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Context) return;
        audioContextRef.current = new Context();
      }
      const context = audioContextRef.current;
      if (context.state === 'suspended') void context.resume().catch(() => undefined);
      return context;
    } catch {
      return;
    }
  };

  const toggleSound = () => {
    soundEnabledRef.current = !soundEnabledRef.current;
    setSoundEnabled(soundEnabledRef.current);
    if (soundEnabledRef.current) preparePaperAudio();
    else {
      audioSourcesRef.current.forEach(source => { try { source.stop(); } catch { /* 이미 끝난 소리 */ } });
      audioSourcesRef.current.clear();
    }
  };

  const playTearSound = (snap = false) => {
    if (!soundEnabledRef.current || document.hidden || reducedMotion) return;
    const now = Date.now();
    if (!snap && now - lastTearSoundRef.current < 65) return;
    lastTearSoundRef.current = now;
    try {
      const context = preparePaperAudio();
      if (!context) return;
      const duration = snap ? 0.14 : 0.055;
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
      const noise = buffer.getChannelData(0);
      for (let i = 0; i < noise.length; i++) {
        const grain = 0.35 + 0.65 * Math.pow(Math.sin(i / context.sampleRate * (snap ? 120 : 190) * Math.PI), 2);
        noise[i] = (Math.random() * 2 - 1) * grain * Math.exp(-i / (noise.length * 0.42));
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = snap ? 1900 : 2600;
      filter.Q.value = 0.6;
      gain.gain.setValueAtTime(snap ? 0.13 : 0.085, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
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
      source.stop(context.currentTime + duration);
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
    setOpeningBeat('sealed');
    setPullProgress(0);
    x.set(0);
    horizontalPanRef.current = false;
  };

  const openTicket = async (run: number): Promise<boolean> => {
    if (!isActive(run) || document.hidden || stageRef.current !== 'ready') return false;
    stageRef.current = 'tearing';
    setStage('tearing');
    setPullProgress(100);
    setOpeningBeat('dimming');
    if (!reducedMotion) {
      playDrawHaptic('select');
      if (!await pause(180, run)) return false;
      setOpeningBeat('tension');
      playDrawHaptic('pull');
      const pullFrom = Math.max(x.get(), 0);
      const heldPull = Math.max(pullFrom, 44);
      void animate(x, [pullFrom, heldPull, heldPull - 5, heldPull + 3, heldPull], { duration: 0.32, ease: 'easeInOut' });
      if (!await pause(320, run)) return false;
    }
    setOpeningBeat('split');
    playDrawHaptic('open');
    playTearSound(true);
    void animate(x, 250, { duration: reducedMotion ? 0.12 : 0.28, ease: [0.22, 0.7, 0.25, 1] });
    if (!await pause(reducedMotion ? 140 : 280, run)) return false;
    if (!reducedMotion) {
      setOpeningBeat('burst');
      if (!await pause(240, run)) return false;
    }
    stageRef.current = 'unsealed';
    setStage('unsealed');
    const opened = prizes[currentIndexRef.current];
    playRevealHaptic(opened && isLastPrize(opened.rank) ? 'LAST' : opened?.rank ?? '');
    return true;
  };

  const showPrize = (index: number, run: number) => {
    if (!isActive(run) || stageRef.current !== 'unsealed') return;
    stageRef.current = 'revealed';
    setStage('revealed');
    toast.success((experience ? '체험 결과 · ' : '') + (isLastPrize(prizes[index].rank) ? '라스트상' : prizes[index].rank + '상') + ' · ' + prizes[index].name, { id: 'kuji-reveal', duration: 1800 });
  };

  const finish = (destination: 'winning' | 'detail') => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelRun();
    onComplete(destination);
  };

  const handleDragStart = () => {
    if (stageRef.current !== 'ready' || autoRef.current) return;
    x.stop();
    panStartRef.current = x.get();
    horizontalPanRef.current = false;
    pullSegmentRef.current = 0;
    preparePaperAudio();
    playDrawHaptic('select');
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (stageRef.current !== 'ready' || autoRef.current) return;
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) return;
    horizontalPanRef.current = true;
    const distance = Math.max(-info.offset.x, 0);
    // 손가락보다 종이가 조금 늦게 따라오도록 접착면의 저항감을 표현한다.
    x.set(Math.min(panStartRef.current + distance / (1 + distance / 420), DRAG_THRESHOLD + 8));
    const progress = Math.min(Math.max(x.get(), 0) / DRAG_THRESHOLD, 1);
    setPullProgress(Math.round(progress * 100));
    // 절취선 구멍 16개를 하나씩 뜯는 느낌: 처음엔 약하게, 끝으로 갈수록 강하게
    const segment = Math.floor(progress * 16);
    if (segment > pullSegmentRef.current) {
      pullSegmentRef.current = segment;
      playTearTick(progress < 0.4 ? 1 : progress < 0.8 ? 2 : 3);
      playTearSound();
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (stageRef.current !== 'ready' || autoRef.current) return;
    const distance = Math.max(x.get(), 0);
    if (event.type !== 'pointercancel' && event.type !== 'touchcancel' && horizontalPanRef.current && distance >= DRAG_THRESHOLD) {
      void openTicket(runRef.current);
    } else {
      stopDrawHaptics();
      setPullProgress(0);
      pullSegmentRef.current = 0;
      void animate(x, 0, reducedMotion ? { duration: 0.1 } : { type: 'spring', stiffness: 300, damping: 24 });
    }
  };

  const handleManualOpen = () => {
    if (autoRef.current || stageRef.current !== 'ready') return;
    preparePaperAudio();
    void openTicket(runRef.current);
  };

  const handleNext = () => {
    if (autoRef.current || stageRef.current !== 'revealed') return;
    if (currentIndexRef.current < prizes.length - 1) {
      cancelRun();
      resetTicket(currentIndexRef.current + 1);
      playDrawHaptic('select');
    } else {
      finish('detail');
    }
  };

  const handleStopAutoOpen = () => {
    if (!autoRef.current) return;
    autoRef.current = false;
    setIsAutoMode(false);
    cancelRun();
    if (stageRef.current !== 'revealed' && stageRef.current !== 'unsealed') resetTicket(currentIndexRef.current);
  };

  const handleAutoOpen = async () => {
    if (document.hidden || autoRef.current || stageRef.current !== 'ready' || completedRef.current) return;
    preparePaperAudio();
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
      if (!await openTicket(run)) return;
      if (!await pause(650, run)) return;
      showPrize(index, run);
      if (!await pause(1050, run)) return;
    }
    if (!isActive(run)) return;
    autoRef.current = false;
    setIsAutoMode(false);
    finish('winning');
  };

  return (
    <section aria-label={experience ? '무료 쿠지 개봉 체험' : '쿠지 개봉'} className="relative isolate min-h-full w-full overflow-x-clip bg-[#173a86] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#3b6fe0_0%,transparent_65%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 3px,transparent 4px)', backgroundSize: '100% 4px' }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-[#02040b]" initial={false} animate={{ opacity: stage === 'tearing' && !reducedMotion ? 0.78 : 0 }} transition={{ duration: 0.18 }} />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />

      <div className="relative mx-auto flex min-h-full w-full max-w-lg flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
        {experience && <p className="mb-4 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-center text-xs text-cyan-100">무료 가상 구매 체험 · 실제 상품·결제 없음</p>}
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
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleSound} aria-label={soundEnabled ? '종이 소리 끄기' : '종이 소리 켜기'} aria-pressed={soundEnabled} className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-amber-100">{soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
          <div className="rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-1.5 text-xs tabular-nums text-slate-400">
            <span className="font-semibold text-white">{currentIndex + 1}</span><span className="mx-1.5 text-slate-600">/</span>{prizes.length}
          </div>
          </div>
        </header>

        {hasLastBonus && (
          <div role="status" className="mt-5 rounded-2xl border border-amber-200/25 bg-amber-200/[0.07] px-4 py-3 text-center text-sm text-amber-100">
            마지막 일반 쿠지를 뽑았어요. 라스트상 1개도 함께 개봉해요.
          </div>
        )}

        <main className="relative z-20 flex flex-1 flex-col justify-center py-8 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            {stage !== 'revealed' ? (
              <motion.div key={'ticket-' + currentIndex} initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.12 : 0.22 }}>
                <motion.div className="mb-9 text-center" animate={{ opacity: stage === 'tearing' && !reducedMotion ? 0.25 : 1 }} transition={{ duration: 0.18 }}>
                  <p className="mb-3 text-[10px] font-medium tracking-[0.24em] text-amber-200/65">A LITTLE MOMENT OF LUCK</p>
                  <h1 className="text-[28px] font-semibold leading-[1.35] tracking-tight sm:text-[34px]">{stage === 'unsealed' ? <>펼친 종이 안에,<br /><span className="text-amber-100">오늘의 행운이 있어요.</span></> : <>노란 손잡이를 잡고,<br /><span className="text-amber-100">절취선을 쭉— 뜯어요.</span></>}</h1>
                  <p className="mt-3 text-sm text-slate-400">{stage === 'unsealed' ? '내 손으로 뜯어 확인한 한 장.' : '손끝을 따라 봉인이 조금씩 열려요.'}</p>
                </motion.div>

                <div className="relative mx-auto w-full max-w-[340px]">
                  <motion.div
                    role="button"
                    tabIndex={stage === 'ready' && !isAutoMode ? 0 : -1}
                    aria-label="오른쪽 모서리를 잡고 왼쪽으로 벗겨 쿠지 개봉. 엔터 키로 바로 개봉할 수 있습니다."
                    aria-disabled={stage !== 'ready' || isAutoMode}
                    onPointerDown={preparePaperAudio}
                    onPanStart={handleDragStart}
                    onPan={handleDrag}
                    onPanEnd={handleDragEnd}
                    onContextMenu={event => event.preventDefault()}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleManualOpen();
                      }
                    }}
                    className="relative aspect-[1.3] w-full cursor-grab select-none rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-8 focus-visible:ring-offset-slate-950 active:cursor-grabbing"
                    style={{ perspective: '1200px', touchAction: 'pan-y', WebkitUserSelect: 'none' }}
                  >
                    {/* 안쪽 면: 뜯고 펼치면 보이는 등급 도장 */}
                    <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[6px] border-[3px] border-white bg-[#fdfbf4] shadow-[0_22px_40px_-10px_#0b1a44c0]">
                      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#1d4ed812 1px, transparent 1.2px)', backgroundSize: '9px 9px' }} />
                      <div className="absolute inset-y-0 left-0 flex w-[14%] items-center justify-center border-r-2 border-dotted border-[#1d4ed8]/35 bg-[#1d4ed8]">
                        <div className="text-center text-yellow-300" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}><span className="text-[10px] font-black tracking-[0.25em]">推しクジ</span><span className="mt-2 font-mono text-[10px] text-white/80">No.{String(currentIndex + 1).padStart(4, '0')}</span></div>
                      </div>
                      <div className="absolute inset-y-3 left-[17%] right-3 flex flex-col items-center justify-center rounded-[4px] border-2 border-dashed border-[#1d4ed8]/25">
                        <motion.div key={'stamp-' + currentIndex} initial={false} animate={(stage === 'unsealed' || openingBeat === 'burst') && !reducedMotion ? { scale: [1, 1.18, 1], rotate: [-6, -10, -6] } : { scale: 1, rotate: -6 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="flex flex-col items-center px-3 text-center">
                          <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full border-[5px] shadow-[inset_0_0_0_3px_#fff]" style={{ borderColor: tone.soft, backgroundColor: tone.color }}>
                            <span className={(isLastBonus ? 'text-[26px]' : 'text-[54px]') + ' font-black leading-none text-[#1b1b1b]'}>{isLastBonus ? 'LAST' : currentPrize.rank}</span>
                          </div>
                          <span className="mt-1.5 text-lg font-black text-[#1b1b1b]">{isLastBonus ? '라스트원상' : currentPrize.rank + '상'}</span>
                          <motion.p initial={false} animate={{ opacity: stage === 'unsealed' || openingBeat === 'burst' ? 1 : 0 }} className="mt-0.5 line-clamp-2 max-w-[200px] text-[11px] font-semibold leading-4 text-[#4a4a4a]">{currentPrize.name}</motion.p>
                        </motion.div>
                      </div>
                    </div>

                    {/* 겉면: 인쇄된 쿠지 표지. 절취선이 다 뜯기면 왼쪽 접힘선을 축으로 펼쳐진다 */}
                    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[14%] right-0 origin-left" style={{ rotateY: reducedMotion ? 0 : rotateY, y: reducedMotion ? 0 : paperLift, transformStyle: 'preserve-3d', opacity: reducedMotion && openingBeat !== 'sealed' ? 0 : 1 }}>
                      <div className="absolute inset-0 rounded-r-[6px] border border-[#d9d3c3] bg-[#f6f3ea]" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundImage: 'radial-gradient(#1d4ed80f 1px, transparent 1.2px)', backgroundSize: '8px 8px' }} />
                      <div className="absolute inset-0 overflow-hidden rounded-r-[6px] border-[3px] border-l-0 border-white shadow-[2px_6px_12px_#00000040]" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: 'linear-gradient(150deg,#2563eb 0%,#1d4ed8 55%,#1e3a8a 100%)' }}>
                        <div className="absolute -left-6 top-[38%] h-[30%] w-[140%] -rotate-[8deg] bg-yellow-300" style={{ backgroundImage: 'repeating-linear-gradient(-45deg,#facc15 0 10px,#fde047 10px 20px)' }} />
                        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%,#fff 1.5px,transparent 2px),radial-gradient(circle at 75% 80%,#fff 1px,transparent 1.5px)', backgroundSize: '26px 26px,18px 18px' }} />
                        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
                          <span className="text-[11px] font-black tracking-[0.4em] text-yellow-300">推しクジ</span>
                          <span className="mt-0.5 text-[34px] font-black leading-none tracking-tight text-white [text-shadow:0_3px_0_#1e3a8a]">오시쿠지</span>
                          <span className="mt-[18%] rounded-full bg-[#1e3a8a] px-3 py-1 text-[10px] font-black tracking-[0.2em] text-yellow-300 ring-2 ring-white">LUCKY TICKET</span>
                          <span className="absolute bottom-3 right-4 font-mono text-[10px] text-white/70">No.{String(currentIndex + 1).padStart(4, '0')}</span>
                          <span className="absolute left-3 top-3 rounded-sm bg-white px-1.5 py-0.5 text-[9px] font-black text-[#1d4ed8]">1回</span>
                        </div>
                        <motion.div className="absolute inset-0 bg-gradient-to-l from-[#0b1a44] via-transparent to-white" style={{ opacity: foldShade }} />
                        <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0b1a44]/40 via-white/30 to-transparent" style={{ width: creaseWidth }} />
                      </div>

                      {/* 위·아래 절취선: 오른쪽부터 당긴 만큼 띠가 뜯겨 나간다.
                          구멍 무늬는 표지 전체 폭 기준으로 고정해 남은 띠와 뜯긴 띠의 구멍이 어긋나지 않게 한다. */}
                      {[false, true].map(bottom => (
                        <div key={String(bottom)} ref={bottom ? undefined : measureStrip} className={'absolute inset-x-0 h-[10px] ' + (bottom ? 'bottom-0' : 'top-0')} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                          <motion.div className="absolute inset-y-0 left-0 overflow-hidden" style={{ right: stripPeel }}>
                            <div className="absolute inset-y-0 left-0 bg-white" style={{ width: stripWidth, backgroundImage: PERF_HOLES, backgroundSize: '8px 10px', backgroundRepeat: 'repeat-x' }} />
                          </motion.div>
                          <motion.div className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: stripPeel, y: bottom ? stripLift : stripLiftUp, rotate: bottom ? stripTilt : stripTiltUp, opacity: stripOpacity, transformOrigin: '0% 50%', filter: 'drop-shadow(0 2px 2px #0b1a4466)' }}>
                            <div className="absolute inset-y-0 right-0 bg-white" style={{ width: stripWidth, backgroundImage: PERF_HOLES, backgroundSize: '8px 10px', backgroundRepeat: 'repeat-x', clipPath: TORN_EDGE }} />
                          </motion.div>
                        </div>
                      ))}

                      {/* 당김 손잡이 */}
                      <motion.div className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1 rounded-l-full bg-yellow-300 py-2 pl-2.5 pr-3 text-[10px] font-black text-[#1e3a8a] shadow-lg ring-2 ring-white" style={{ right: tabRight, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                        <ArrowLeft className="h-3.5 w-3.5" />뜯기
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <div className="mx-auto mt-7 max-w-[250px]">
                    <div aria-hidden="true" className="h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-amber-400/60 to-amber-100" style={{ scaleX: progressScale }} />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Hand aria-hidden="true" className="h-3.5 w-3.5 text-amber-100/70" />
                      <span>{stage === 'unsealed' ? '안쪽에 적힌 상과 상품을 확인해 보세요' : stage === 'tearing' ? openingBeat === 'dimming' ? '행운이 열리기 직전, 잠깐의 설렘' : openingBeat === 'tension' ? '봉인을 조금 더 당기고 있어요' : openingBeat === 'split' ? '봉인이 찢어지고 있어요' : '이제, 당신의 행운을 만나요' : pullProgress >= 100 ? '지금 손을 놓으면 열려요' : pullProgress > 0 ? '절취선을 따라 조금만 더 벗겨보세요' : '노란 손잡이를 잡고 왼쪽으로 당겨보세요'}</span>
                      {stage === 'ready' && <motion.span aria-hidden="true" animate={reducedMotion ? {} : { x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowLeft className="h-3.5 w-3.5 text-amber-100/70" /></motion.span>}
                    </div>
                  </div>
                  {stage === 'unsealed' && <p role="status" className="sr-only">{isLastBonus ? '라스트상' : `${currentPrize.rank}상`} · {currentPrize.name}</p>}
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
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><Package aria-hidden="true" className="h-3 w-3" />{experience ? '무료 체험 결과예요. 실제 상품·배송은 없어요.' : '보관함에 안전하게 담았어요.'}</div>
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
            <div className="space-y-2">
              <div role="status" aria-live="polite" className="flex min-h-12 items-center justify-center gap-2 text-sm text-slate-300"><LoaderCircle aria-hidden="true" className={'h-4 w-4 text-amber-200 ' + (reducedMotion ? '' : 'animate-spin')} />{currentIndex + 1} / {prizes.length} · 한 장씩 개봉하고 있어요.</div>
              <button type="button" onClick={handleStopAutoOpen} className="flex min-h-11 w-full items-center justify-center rounded-xl border border-white/15 text-sm text-slate-300 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">자동 오픈 멈추기</button>
            </div>
          ) : stage === 'ready' ? (
            <div className="flex gap-2.5">
              <button type="button" onClick={handleManualOpen} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.045] px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">바로 뜯기<ArrowUpRight aria-hidden="true" className="h-4 w-4 text-slate-400" /></button>
              {prizes.length > 1 && <button type="button" onClick={() => void handleAutoOpen()} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-200/20 bg-amber-100/[0.08] px-4 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-100/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">모두 자동 오픈<Sparkles aria-hidden="true" className="h-4 w-4" /></button>}
            </div>
          ) : stage === 'unsealed' ? (
            <button type="button" onClick={() => showPrize(currentIndexRef.current, runRef.current)} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 font-semibold text-slate-950 transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">당첨 상품 자세히 보기<ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" /></button>
          ) : stage === 'revealed' ? (
            currentIndex < prizes.length - 1 ? (
              <button type="button" onClick={handleNext} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 font-semibold text-slate-950 shadow-[0_4px_25px_-8px_#f5d18b50] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">다음 쿠지 뜯기<ArrowRight aria-hidden="true" className="h-[18px] w-[18px]" /></button>
            ) : (
              <div className="space-y-2.5">
                <button type="button" onClick={() => finish('winning')} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 font-semibold text-slate-950 shadow-[0_4px_25px_-8px_#f5d18b50] transition-colors hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"><Package aria-hidden="true" className="h-[18px] w-[18px]" />{experience ? '체험 결과 보기' : '보관함으로 바로 이동'}</button>
                <button type="button" onClick={() => finish('detail')} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />{experience ? '남은 티켓 보기' : '다시 뽑기'}</button>
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

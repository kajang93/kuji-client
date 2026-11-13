// 실물 티켓을 당겨 개봉하는 연출과 당첨 상품 확인을 제공한다.
import { useState, useEffect, useRef, useId, type FC } from 'react';
import { motion, animate, AnimatePresence, useMotionValue, useTransform, useReducedMotion, type PanInfo } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Hand, LoaderCircle, Package, RotateCcw, Sparkles, Ticket, Volume2, VolumeX } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import type { Prize } from '@/shared-types';
import { isLastPrize } from '../utils/kujiMappers';
import confetti from 'canvas-confetti';
import { playDrawHaptic, stopDrawHaptics } from '../utils/drawHaptics';

type KujiRevealProps = {
  prizes: Prize[];
  onComplete: (destination?: "winning" | "detail") => void;
  experience?: boolean;
};

type RevealStage = 'ready' | 'tearing' | 'unsealed' | 'revealed';
type OpeningBeat = 'sealed' | 'dimming' | 'tension' | 'split' | 'burst';
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

const KujiReveal: FC<KujiRevealProps> = ({ prizes, onComplete, experience = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<RevealStage>('ready');
  const [openingBeat, setOpeningBeat] = useState<OpeningBeat>('sealed');
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const reducedMotion = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [0, DRAG_THRESHOLD, 250], [0, -64, -168]);
  const paperLift = useTransform(x, [0, DRAG_THRESHOLD, 250], [0, -8, -2]);
  const curl = useTransform(x, [0, 30, DRAG_THRESHOLD, 250], [0, -24, -38, -4]);
  const foldShade = useTransform(x, [0, 65, DRAG_THRESHOLD, 250], [0, 0.15, 0.32, 0.05]);
  const creaseWidth = useTransform(x, [0, DRAG_THRESHOLD, 250], ['2%', '12%', '2%']);
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
    playDrawHaptic('reveal');
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
    const segment = Math.floor(progress * 8);
    if (segment > pullSegmentRef.current) {
      pullSegmentRef.current = segment;
      playDrawHaptic('pull');
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
    <section aria-label={experience ? '무료 쿠지 개봉 체험' : '쿠지 개봉'} className="relative isolate min-h-full w-full overflow-x-clip bg-[#080d19] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_28%,#252348_0%,transparent_62%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 3px,transparent 4px)', backgroundSize: '100% 4px' }} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-[#02040b]" initial={false} animate={{ opacity: stage === 'tearing' && !reducedMotion ? 0.78 : 0 }} transition={{ duration: 0.18 }} />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
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
                  <h1 className="text-[28px] font-semibold leading-[1.35] tracking-tight sm:text-[34px]">{stage === 'unsealed' ? <>펼친 종이 안에,<br /><span className="text-amber-100">오늘의 행운이 있어요.</span></> : <>종이 끝을 잡고,<br /><span className="text-amber-100">두근두근, 페리페리.</span></>}</h1>
                  <p className="mt-3 text-sm text-slate-400">{stage === 'unsealed' ? '내 손으로 뜯어 확인한 한 장.' : '손끝을 따라 봉인이 조금씩 열려요.'}</p>
                </motion.div>

                <div className="relative mx-auto w-full max-w-[390px]">
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
                    className="relative aspect-[1.72] w-full cursor-grab select-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-8 focus-visible:ring-offset-slate-950 active:cursor-grabbing"
                    style={{ perspective: '1200px', touchAction: 'pan-y', WebkitUserSelect: 'none' }}
                  >
                    <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-sm border border-[#cabb9e] bg-[#eee6d4] shadow-[0_18px_36px_-12px_#000000a0]">
                      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(8deg,transparent 0px,transparent 3px,#86795715 4px)' }} />
                      <div className="absolute inset-y-0 left-0 flex w-[17%] items-center justify-center border-r border-dashed border-[#8b7650]/60 bg-[#e5dbc5]">
                        <div className="text-center text-[#776446]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}><span className="text-[9px] tracking-[0.2em]">오시쿠지 · 행운의 한 장</span><span className="mt-3 text-[10px] font-mono">{String(currentIndex + 1).padStart(4, '0')}</span></div>
                      </div>
                      <div className="absolute inset-y-3 left-[21%] right-3 flex flex-col items-center justify-center border border-[#bba989]/65 bg-[#faf5e7] text-[#443c31]">
                        <span className="absolute top-3 text-[8px] tracking-[0.25em] text-[#968873]">OSHIKUJI / LUCKY TICKET</span>
                        {(stage === 'unsealed' || openingBeat === 'burst') ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="px-3 text-center">
                          <span className={isLastBonus ? 'font-serif text-3xl font-black' : 'font-serif text-6xl font-black'}>{isLastBonus ? 'LAST' : currentPrize.rank}</span><span className="ml-1 text-xl font-bold">상</span>
                          <p className="mt-1 line-clamp-2 text-[11px] font-semibold leading-4">{currentPrize.name}</p>
                        </motion.div> : <div className="flex gap-2 opacity-20">{[0, 1, 2].map(index => <span key={index} className="h-1 w-1 rounded-full bg-[#8c795b]" />)}</div>}
                        <span className="absolute bottom-3 text-[8px] tracking-widest text-[#968873]">{stage === 'unsealed' || openingBeat === 'burst' ? '당신의 행운을 확인했어요' : '봉인된 나의 행운'}</span>
                      </div>
                      {[false, true].map(bottom => <motion.div key={String(bottom)} className={`absolute left-[18%] right-0 h-[5px] ${bottom ? 'bottom-0' : 'top-0'}`} style={{ scaleX: progressScale, transformOrigin: '100% 50%', backgroundImage: 'repeating-linear-gradient(110deg,#b09a7455 0px,#f8f0dc 2px,transparent 3px,transparent 6px)' }} />)}
                    </div>

                    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[17%] right-0 origin-left" style={{ rotateY: reducedMotion ? 0 : rotateY, y: reducedMotion ? 0 : paperLift, transformStyle: 'preserve-3d', opacity: reducedMotion && openingBeat !== 'sealed' ? 0 : 1 }}>
                      <div className="absolute inset-0 rounded-sm border border-[#b9aa8c] bg-[#e5d8bd] shadow-[0_8px_16px_#00000030]" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundImage: 'repeating-linear-gradient(33deg,transparent 0px,transparent 3px,#a896740e 4px)' }}>
                        <div className="absolute inset-x-1 inset-y-2 border-y border-dashed border-[#ac9771]/40" />
                        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#ad976e]/25 to-transparent" />
                      </div>
                      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                        <svg width="100%" height="100%" viewBox="0 0 330 232" preserveAspectRatio="none" className="overflow-visible drop-shadow-[2px_6px_6px_#00000030]">
                          <defs>
                            <linearGradient id={paperId + '-paper'} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff8e9" /><stop offset="65%" stopColor="#f1e4c9" /><stop offset="100%" stopColor="#dcccaa" /></linearGradient>
                            <pattern id={paperId + '-grain'} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 1h2M3 4h1" stroke="#8a744a" strokeOpacity=".18" strokeWidth=".5" /></pattern>
                            <pattern id={paperId + '-lines'} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v9" stroke="#a08458" strokeOpacity=".1" strokeWidth=".6" /></pattern>
                          </defs>
                          <path d="M1 1H327L329 6L327 11L329 16L327 21L329 26V207L327 212L329 217L327 222L329 227L327 231H1Z" fill={'url(#' + paperId + '-paper)'} stroke="#c5b38e" />
                          <path d="M1 1H327V231H1Z" fill={'url(#' + paperId + '-grain)'} />
                          <rect x="13" y="13" width="300" height="206" fill="none" stroke="#a98a54" strokeOpacity=".5" />
                          <rect x="23" y="23" width="280" height="186" fill={'url(#' + paperId + '-lines)'} />
                          <path d="M15 28H312M15 204H312" stroke="#9b7944" strokeOpacity=".48" strokeDasharray="2 4" />
                          <text x="164" y="63" textAnchor="middle" fill="#9c7f50" fontSize="9" letterSpacing="3">OSHIKUJI ORIGINAL TICKET</text>
                          <text x="164" y="123" textAnchor="middle" fill="#634829" fontFamily="Georgia, serif" fontWeight="700" fontSize="46" letterSpacing="6">KUJI</text>
                          <path d="M102 142H225" stroke="#a78a55" strokeOpacity=".55" />
                          <text x="164" y="166" textAnchor="middle" fill="#8b744b" fontSize="11" letterSpacing="2">한 장에 담긴 작은 두근거림</text>
                          <text x="164" y="192" textAnchor="middle" fill="#aa926e" fontSize="8" letterSpacing="1.5">뜯는 순간, 나의 행운이 된다</text>
                        </svg>
                        <motion.div className="absolute inset-0 bg-gradient-to-l from-[#423015] via-transparent to-white" style={{ opacity: foldShade }} />
                        <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#513e20]/35 via-white/30 to-transparent" style={{ width: creaseWidth }} />
                        <motion.div className="absolute bottom-0 right-0 top-0 flex w-[13%] items-center justify-center border-l border-dashed border-[#b29a6d]/70 bg-gradient-to-r from-[#f1e5cc] to-[#d6c39f] text-[#7f633b]" style={{ rotateY: reducedMotion ? 0 : curl, transformOrigin: '0% 50%', transformStyle: 'preserve-3d' }}>
                          <div className="flex flex-col items-center gap-2"><ArrowLeft className="h-4 w-4" /><span className="text-[8px] font-semibold" style={{ writingMode: 'vertical-rl' }}>여기부터 뜯기</span></div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>

                  <div className="mx-auto mt-7 max-w-[250px]">
                    <div aria-hidden="true" className="h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                      <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-amber-400/60 to-amber-100" style={{ scaleX: progressScale }} />
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Hand aria-hidden="true" className="h-3.5 w-3.5 text-amber-100/70" />
                      <span>{stage === 'unsealed' ? '안쪽에 적힌 상과 상품을 확인해 보세요' : stage === 'tearing' ? openingBeat === 'dimming' ? '행운이 열리기 직전, 잠깐의 설렘' : openingBeat === 'tension' ? '봉인을 조금 더 당기고 있어요' : openingBeat === 'split' ? '봉인이 찢어지고 있어요' : '이제, 당신의 행운을 만나요' : pullProgress >= 100 ? '지금 손을 놓으면 열려요' : pullProgress > 0 ? '절취선을 따라 조금만 더 벗겨보세요' : '오른쪽 끝을 잡고 왼쪽으로 벗겨보세요'}</span>
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

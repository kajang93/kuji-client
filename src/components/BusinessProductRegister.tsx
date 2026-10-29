import { useState, useRef } from 'react';
import { motion } from './motion';
import { ChevronLeft, Upload, X, Plus, Check, Loader2, Sparkles } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { createKujiBoard, deleteKujiBoard, registerBoardItems, uploadBoardImages } from '../api/kuji';
import { validateImageFile, compressImageFile } from '../api/client';
import { processAiImage, fetchItemSuggestion } from '../api/admin';
import { rankColors } from '../constants/rankColors';
import { toast } from 'sonner';
import { isLastPrize } from '../utils/kujiMappers';

type BusinessProductRegisterProps = {
  onBack: () => void;
  onComplete?: () => void | Promise<void>;
};

type ProductItem = {
  id: string;
  image: string | null;
  name: string;
  stock: number;
};

const ranks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'LAST'];
const singleItemRanks = new Set(['A', 'B', 'C', 'LAST']);

const createEmptyProducts = (rank: string, count: number): ProductItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${rank}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    image: null,
    name: '',
    stock: isLastPrize(rank) ? 1 : 0
  }));

export default function BusinessProductRegister({ onBack, onComplete }: BusinessProductRegisterProps) {
  const [seriesName, setSeriesName] = useState('');
  const [seriesImage, setSeriesImage] = useState<string | null>(null);
  const [seriesFile, setSeriesFile] = useState<File | null>(null);
  const [pricePerDraw, setPricePerDraw] = useState<number | ''>('');
  const [rewardRate, setRewardRate] = useState<number | ''>('');
  const [rankData, setRankData] = useState<Record<string, ProductItem[]>>({});
  const [productFiles, setProductFiles] = useState<Record<string, File>>({}); // Added to track actual File objects
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState<Record<string, boolean>>({});
  const [unfinishedBoardId, setUnfinishedBoardId] = useState<number | null>(null);
  const registeringRef = useRef(false);
  
  const seriesImageInputRef = useRef<HTMLInputElement>(null);

  const handleSeriesImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImageFile(file);
      
      const errorMsg = validateImageFile(compressedFile, 10);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }
      setSeriesFile(compressedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeriesImage(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleProductImageUpload = async (rank: string, productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedFile = await compressImageFile(file);
      
      const errorMsg = validateImageFile(compressedFile, 10);
      if (errorMsg) {
        alert(errorMsg);
        return;
      }
      // Store the actual file for submission
      setProductFiles(prev => ({ ...prev, [productId]: compressedFile }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setRankData(prev => ({
          ...prev,
          [rank]: prev[rank]?.map(p =>
            p.id === productId ? { ...p, image: reader.result as string } : p
          ) || []
        }));
      };
      reader.readAsDataURL(compressedFile);
    }
  };

  const handleAddProducts = (rank: string, count: number) => {
    setRankData(prev => {
      if (isLastPrize(rank) && (prev[rank]?.length || 0) > 0) return prev;
      return { ...prev, [rank]: [...(prev[rank] || []), ...createEmptyProducts(rank, isLastPrize(rank) ? 1 : count)] };
    });
  };

  const handleApplyRecommendedStructure = () => {
    setRankData(prev => {
      const next = { ...prev };
      ranks.forEach(rank => {
        if (!next[rank]?.length) {
          next[rank] = createEmptyProducts(rank, singleItemRanks.has(rank) ? 1 : 3);
        }
      });
      return next;
    });
    toast.success('비어 있는 등급에 추천 상품 구성을 만들었습니다.');
  };

  const handleRemoveProduct = (rank: string, productId: string) => {
    setRankData(prev => ({
      ...prev,
      [rank]: prev[rank]?.filter(p => p.id !== productId) || []
    }));
    setProductFiles(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const handleProductChange = (rank: string, productId: string, field: 'name' | 'stock', value: string | number) => {
    setRankData(prev => ({
      ...prev,
      [rank]: prev[rank]?.map(p =>
        p.id === productId ? { ...p, [field]: field === 'stock' && isLastPrize(rank) ? 1 : value } : p
      ) || []
    }));
  };

  const handleAiAutoComplete = async (rank: string, productId: string) => {
    const file = productFiles[productId];
    if (!file) {
      toast.error('먼저 이미지를 업로드해주세요');
      return;
    }

    setIsAiProcessing(prev => ({ ...prev, [productId]: true }));
    try {
      // 1. AI로 배경 제거 및 설명 생성
      const result = await processAiImage(file);
      
      // 2. 나만의 엔진 (누적 데이터 기반 추천 엔진) 호출
      let suggestedStock = 1;
      let suggestedName = result.name;
      try {
        // rank에서 실제 등급 문자 추출 (예: 'A상' -> 'A')
        const gradeMatch = rank.match(/^[A-Z]/i);
        const gradeLetter = gradeMatch ? gradeMatch[0].toUpperCase() : rank;
        const suggestion = await fetchItemSuggestion(gradeLetter);
        
        if (suggestion.suggestedTotalQty) {
          suggestedStock = suggestion.suggestedTotalQty;
        }
        if (suggestion.suggestedName) {
          suggestedName = suggestion.suggestedName;
        }
      } catch (e) {
        console.warn("추천 엔진 호출 실패 (초기 데이터 부족 등)", e);
      }
      
      // 3. 폼에 매핑 (이미지, 추천 이름 + AI 설명, 추천 수량)
      setRankData(prev => ({
        ...prev,
        [rank]: prev[rank]?.map(p =>
          p.id === productId ? { ...p, image: result.imageUrl, name: `[${suggestedName}] ${result.description}`, stock: isLastPrize(rank) ? 1 : suggestedStock } : p
        ) || []
      }));
      toast.success('누적 데이터 분석 및 AI 이미지 처리가 완료되었습니다!');
    } catch (error) {
      console.error(error);
      toast.error('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAiProcessing(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRegister = async () => {
    if (registeringRef.current || unfinishedBoardId !== null) return;
    if (!seriesName.trim() || seriesName.trim().length > 100) return toast.error('시리즈명은 1자 이상 100자 이내로 입력해주세요.');
    if (!Number.isSafeInteger(pricePerDraw) || Number(pricePerDraw) < 1 || Number(pricePerDraw) > 2147483647) return toast.error('구매 가격은 1원 이상 2147483647원 이하의 정수로 입력해주세요.');
    const reward = rewardRate === '' ? 0 : rewardRate;
    if (!Number.isInteger(reward) || reward < 0 || reward > 100) return toast.error('적립 포인트는 0부터 100 사이의 정수로 입력해주세요.');
    if (!seriesFile || !seriesImage) return toast.error('시리즈 이미지를 등록해주세요.');
    if (Object.values(isAiProcessing).some(Boolean)) return toast.error('이미지 자동완성이 끝난 후 저장해주세요.');

    const products = Object.entries(rankData).flatMap(([grade, items]) => items.map(item => ({ grade, ...item })));
    if (products.length === 0) return toast.error('최소 1개 이상의 상품을 등록해주세요.');
    if (!products.some(product => !isLastPrize(product.grade))) return toast.error('라스트상 외에 일반 쿠지 상품을 등록해주세요.');
    if (products.filter(product => isLastPrize(product.grade)).length > 1 || products.some(product => isLastPrize(product.grade) && product.stock !== 1)) return toast.error('라스트상은 한 종류, 수량 1개만 등록할 수 있습니다.');
    for (const product of products) {
      if (!product.name.trim() || product.name.trim().length > 100) return toast.error(`${product.grade}상 상품명은 1자 이상 100자 이내로 입력해주세요.`);
      if (!Number.isInteger(product.stock) || product.stock < 1 || product.stock > 100000) return toast.error(`${product.grade}상 수량은 1개 이상 100000개 이하의 정수로 입력해주세요.`);
      if (!product.image || !productFiles[product.id]) return toast.error(`${product.grade}상 상품 이미지를 등록해주세요.`);
    }

    registeringRef.current = true;
    setIsRegistering(true);
    let boardId: number | null = null;
    try {
      boardId = await createKujiBoard({ title: seriesName.trim(), pricePerDraw: Number(pricePerDraw), status: 'PREPARING', rewardRate: reward });
      await uploadBoardImages(boardId, 'THUMBNAIL', [seriesFile]);
      await registerBoardItems(boardId,
        products.map(product => ({ grade: product.grade, name: product.name.trim(), totalQty: product.stock })),
        products.map(product => productFiles[product.id]));
    } catch (error) {
      const message = error instanceof Error ? error.message : '상품 저장에 실패했습니다.';
      if (boardId !== null) {
        try {
          await deleteKujiBoard(boardId);
          toast.error(`${message} 생성 중인 준비 상품은 정리했습니다. 입력 내용을 확인하고 다시 저장해주세요.`);
        } catch {
          setUnfinishedBoardId(boardId);
          toast.error(`${message} 준비 상품 ${boardId}번이 남아 있습니다. 상품 관리에서 확인해주세요.`);
        }
      } else {
        toast.error(message);
      }
      return;
    } finally {
      registeringRef.current = false;
      setIsRegistering(false);
    }

    // 상위 화면은 저장된 상품 목록을 서버에서 다시 조회한다.
    setUnfinishedBoardId(boardId);
    if (!onComplete) toast.success('운영예정 상품으로 저장했습니다. 상품 관리에서 판매를 시작할 수 있습니다.');
    try {
      await onComplete?.();
    } catch {
      toast.error('상품은 저장됐지만 목록을 새로 불러오지 못했습니다. 상품 관리에서 확인해주세요.');
    }
  };

  const totalProductCount = Object.values(rankData).reduce((sum, products) => sum + products.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-800 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            disabled={isRegistering}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl">쿠지 상품 등록</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRegister}
              disabled={isRegistering || unfinishedBoardId !== null}
              className={`px-3 py-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-white text-sm flex items-center gap-1 transition-colors ${isRegistering ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isRegistering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>준비 상품 저장</span>
            </button>
          </div>
        </div>
      </div>

      {unfinishedBoardId !== null && (
        <div role="alert" className="mx-auto mt-4 max-w-4xl rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          준비 상품 {unfinishedBoardId}번이 저장되어 있습니다. 중복 등록을 막기 위해 다시 저장할 수 없습니다. 상품 관리에서 내용을 확인해주세요.
          <button onClick={onBack} className="ml-3 underline">상품 관리로 돌아가기</button>
        </div>
      )}
      <fieldset disabled={isRegistering || unfinishedBoardId !== null} className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-4 disabled:opacity-70">
        {/* Series Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/20 to-white/5 p-4 shadow-lg ring-1 ring-white/5 backdrop-blur-sm sm:p-6"
        >
          <h2 className="text-white text-lg mb-4">시리즈 정보</h2>
          <p className="mb-4 text-sm text-white/60">저장한 상품은 운영예정으로 보관됩니다. 상품 관리에서 구성을 확인한 후 판매를 시작해주세요.</p>
          
          {/* Series Image */}
          <div className="mb-4">
            <label className="text-white/70 text-sm block mb-2">시리즈 이미지</label>
            <label className="cursor-pointer">
              <div className="w-full h-48 bg-white/10 rounded-xl border-2 border-dashed border-white/30 hover:border-teal-400 transition-colors overflow-hidden">
                {seriesImage ? (
                  <img src={seriesImage} alt="Series" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-white/60 text-sm">클릭하여 이미지 업로드</span>
                  </div>
                )}
              </div>
              <input
                ref={seriesImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleSeriesImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Series Name */}
          <div className="mb-4">
            <label className="text-white/70 text-sm block mb-2">시리즈명</label>
            <input
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
              placeholder="예: 원피스 쿠지 시리즈 Vol.1"
            />
          </div>

          {/* New Fields: Price and Reward Rate */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-white/70 text-sm block mb-2">1회 구매 가격 (원)</label>
              <input
                type="number"
                value={pricePerDraw === 0 || pricePerDraw === '' ? '' : pricePerDraw}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setPricePerDraw(val as number | '');
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
                placeholder="예: 10000"
                min="1" max="2147483647" step="1"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-2">1장 구매 시 적립 포인트 설정</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rewardRate === 0 || rewardRate === '' ? '' : rewardRate}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setRewardRate(val as number | '');
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-teal-400"
                  placeholder="예: 100"
                  min="0" max="100" step="1"
                />
                <span className="text-white/70">P</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Entry by Rank */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-white text-lg font-medium">등급별 상품 등록</h2>
            <div className="text-teal-300 text-sm">
              총 {totalProductCount}개 상품
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 p-4 shadow-lg ring-1 ring-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-white font-medium">추천 구성 빠른 생성</span>
                  <span className="rounded-md bg-amber-400/20 px-2 py-1 text-xs text-amber-200">A·B·C·라스트 각 1개</span>
                  <span className="rounded-md bg-cyan-400/20 px-2 py-1 text-xs text-cyan-200">D~H 각 3개</span>
                </div>
                <p className="text-sm text-white/55">
                  이미 입력한 등급은 그대로 두고 비어 있는 등급만 채웁니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyRecommendedStructure}
                className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                추천 구성 만들기
              </button>
            </div>
          </div>
          
          {ranks.map((rank) => {
            const currentProducts = rankData[rank] || [];
            const isSingleItemRank = singleItemRanks.has(rank);
            
            return (
              <motion.div
                key={rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/20 to-white/5 p-4 shadow-lg ring-1 ring-white/5 backdrop-blur-sm"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${rankColors[rank]} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className={`text-white ${rank === 'LAST' ? 'text-xs font-bold' : 'text-xl'}`}>{rank}</span>
                    </div>
                    <div>
                      <h3 className="text-white text-lg">{rank === 'LAST' ? '라스트상 상품' : `${rank}상 상품`}</h3>
                      <span className={`text-xs ${isSingleItemRank ? 'text-amber-300' : 'text-cyan-300'}`}>
                        {isLastPrize(rank) ? '마지막 일반 티켓 구매자에게 추가 지급 · 1개 고정' : isSingleItemRank ? '단품 권장' : '다품 권장'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddProducts(rank, 1)}
                      disabled={isLastPrize(rank) && currentProducts.length > 0}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-green-500 px-3 py-2.5 text-sm text-white transition-colors hover:bg-green-600 sm:py-2"
                    >
                      <Plus className="w-4 h-4" />
                      1개 추가
                    </button>
                    {!isSingleItemRank && (
                      <button
                        type="button"
                        onClick={() => handleAddProducts(rank, 3)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500/80 px-3 py-2.5 text-sm text-white transition-colors hover:bg-cyan-500 sm:py-2"
                      >
                        <Plus className="w-4 h-4" />
                        3개 추가
                      </button>
                    )}
                  </div>
                </div>

                {currentProducts.length === 0 ? (
                  <div className="text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <p className="text-white/40 text-sm">등록된 상품이 없습니다. 상품 추가 버튼을 눌러주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentProducts.map((product) => (
                      <div key={product.id} className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-inner shadow-black/10 sm:p-4">
                        <div className="grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-start">
                          {/* Image Upload */}
                          <div className="flex items-start justify-between gap-3 sm:block">
                            <label className="cursor-pointer">
                              <div className="h-24 w-24 overflow-hidden rounded-xl border border-dashed border-white/30 bg-white/10 transition-colors hover:border-teal-400">
                                {product.image ? (
                                  <ImageWithFallback
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center">
                                    <Upload className="w-6 h-6 text-white/40 mb-1" />
                                    <span className="text-white/40 text-xs">이미지</span>
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleProductImageUpload(rank, product.id, e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(rank, product.id)}
                              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-300/20 bg-red-500/20 text-red-200 transition-colors hover:bg-red-500/30 sm:hidden"
                              aria-label="상품 삭제"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Product Details */}
                          <div className="min-w-0 space-y-3">
                            <div>
                              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <label className="text-white/60 text-xs">상품명</label>
                                {/* AI Auto Complete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleAiAutoComplete(rank, product.id)}
                                  disabled={isAiProcessing[product.id] || !productFiles[product.id]}
                                  className={`inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors sm:min-h-0 sm:w-auto sm:px-2 sm:py-1 ${
                                    isAiProcessing[product.id] 
                                      ? 'bg-indigo-500/50 cursor-not-allowed' 
                                      : !productFiles[product.id]
                                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                  }`}
                                  title="사진을 올린 후 누르면 AI가 누끼와 설명을 자동 생성합니다"
                                >
                                  {isAiProcessing[product.id] ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin text-white" />
                                      <span className="text-white">AI 생성중...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3 h-3" />
                                      <span>AI 자동완성</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleProductChange(rank, product.id, 'name', e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-teal-400"
                                placeholder="상품명 입력"
                              />
                            </div>
                            <div>
                              <label className="text-white/60 text-xs block mb-1">재고</label>
                              <input
                                type="number"
                                value={product.stock === 0 ? '' : product.stock}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  handleProductChange(rank, product.id, 'stock', val);
                                }}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-teal-400"
                                placeholder="재고 수량"
                                min="1" max={isLastPrize(rank) ? 1 : 100000} step="1" readOnly={isLastPrize(rank)}
                              />
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(rank, product.id)}
                            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-red-300/20 bg-red-500/20 text-red-200 transition-colors hover:bg-red-500/30 sm:flex"
                            aria-label="상품 삭제"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: isRegistering ? 1 : 1.02 }}
            whileTap={{ scale: isRegistering ? 1 : 0.98 }}
            onClick={handleRegister}
            disabled={isRegistering || unfinishedBoardId !== null}
            className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-400 to-blue-500 py-4 text-white shadow-xl ${isRegistering ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isRegistering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>{isRegistering ? '저장 중...' : '준비 상품 저장'}</span>
          </motion.button>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-indigo-300/35 bg-indigo-500/20 p-4 ring-1 ring-white/5"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">💡</div>
            <div className="text-white/70 text-sm">
              <p className="mb-2 font-bold text-indigo-300">이미지 업로드 안내</p>
              <ul className="list-disc list-inside space-y-1">
                <li>파일당 최대 용량: <span className="text-teal-300 font-bold">10MB</span></li>
                <li>이미지 확장자: <span className="text-teal-300 font-bold">JPG, PNG 등</span></li>
                <li>각 등급별로 여러 상품을 등록할 수 있으며, 고화질 이미지 사용을 권장합니다.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </fieldset>
    </div>
  );
}

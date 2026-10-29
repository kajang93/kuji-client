import { AnimeCollection, KujiBoard, Prize } from "../shared-types";
import { toAbsoluteUrl } from "../api/client";

export const FALLBACK_BOARD_IMAGE =
  "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400";

// 라스트상은 일반 티켓 수량과 결제에서 제외되는 마지막 구매자 보너스다.
export function isLastPrize(rank: string | undefined | null): boolean {
  const normalized = (rank || '').trim().toUpperCase().replace(/[ _-]/g, '');
  return ['LAST', 'LASTONE', 'LAST상', '라스트', '라스트상', '라스트원'].includes(normalized);
}

export function getRegularPrizeStock(prizes: Prize[]) {
  const regularPrizes = prizes.filter(prize => !isLastPrize(prize.rank));
  const lastPrizes = prizes.filter(prize => isLastPrize(prize.rank));
  return {
    totalKuji: regularPrizes.reduce((sum, prize) => sum + prize.totalCount, 0),
    remainingKuji: regularPrizes.reduce((sum, prize) => sum + prize.remainingCount, 0),
    hasLastPrize: lastPrizes.length > 0,
    lastPrizeAvailable: lastPrizes.some(prize => prize.remainingCount > 0),
  };
}

// 서버 KujiBoard 응답 → 프론트 AnimeCollection 변환 (목록/판매자/새로고침 공용)
export function mapBoardToCollection(board: KujiBoard): AnimeCollection {
  const thumbnail =
    board.images?.find((img) => img.imageType === "THUMBNAIL")?.imageUrl ||
    board.images?.[0]?.imageUrl;

  return {
    id: board.id.toString(),
    name: board.title,
    image: toAbsoluteUrl(thumbnail) || FALLBACK_BOARD_IMAGE,
    totalKuji: board.totalCount || 0,
    remainingKuji: board.remainCount || 0,
    gradeCount: board.gradeCount || 0,
    hasLastPrize: board.hasLastPrize ?? false,
    lastPrizeAvailable: board.lastPrizeAvailable ?? false,
    boardId: board.id,
    isWished: board.isWished,
    operationStatus:
      board.status === "ACTIVE"
        ? "active"
        : board.status === "PREPARING"
          ? "scheduled"
          : "ended",
    pricePerDraw: board.pricePerDraw || 15000,
    rewardRate: board.rewardRate || 0,
    prizes: [],
  };
}

// 서버 KujiItem/추첨 결과 응답 → 프론트 Prize 변환 (상세/추첨/수정 공용)
export function mapKujiItemToPrize(p: any): Prize {
  let options: any[] = [];
  if (p.options) {
    try {
      options = typeof p.options === "string" ? JSON.parse(p.options) : p.options;
    } catch {
      options = [];
    }
  }

  return {
    ...p,
    id: p.id?.toString() || Math.random().toString(),
    rank: isLastPrize(p.grade || p.rank) ? "LAST" : p.grade || p.rank,
    lastPrize: p.lastPrize ?? isLastPrize(p.grade || p.rank),
    image: toAbsoluteUrl(
      p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : p.imageUrl || p.image,
    ),
    totalCount: p.totalQty ?? p.totalCount ?? 0,
    remainingCount: p.remainQty ?? p.remainingCount ?? 0,
    opened: p.opened || [],
    drawHistoryId: p.drawHistoryId,
    options,
  };
}

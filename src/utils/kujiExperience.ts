// 운영 주문·재고와 분리된 무료 체험 회차와 마지막 티켓 보너스를 관리한다.
import type { AnimeCollection, Prize } from '../shared-types';
import { isLastPrize } from './kujiMappers';

export type ExperienceRound = {
  tickets: { id: number; opened: boolean; prize: Prize }[];
  lastPrize: Prize;
  lastAwarded: boolean;
};

export const EXPERIENCE_IMAGE = '/catalog-preview/moonlit/banner.svg';
const PRIZE_IMAGES: Record<string, string> = {
  A: '/catalog-preview/moonlit/prize-a.svg',
  B: '/catalog-preview/moonlit/prize-b.svg',
  C: '/catalog-preview/moonlit/prize-c.svg',
};

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

const MAX_PRODUCT_TICKETS = 60;

/** 상품 상세에서 연 체험: 그 상품의 실제 구성·이미지로 가상 회차를 만든다 (재고·결제와 무관). */
export function createProductExperienceRound(collection: AnimeCollection): ExperienceRound | null {
  const regular = collection.prizes.filter(prize => !isLastPrize(prize.rank) && prize.totalCount > 0);
  if (!regular.length) return null;
  const pool: Prize[] = [];
  regular.forEach(prize => { for (let i = 0; i < prize.totalCount && pool.length < MAX_PRODUCT_TICKETS; i++) pool.push(prize); });
  const last = collection.prizes.find(prize => isLastPrize(prize.rank));
  return {
    tickets: shuffle(pool).map((prize, id) => ({ id, opened: false, prize: {
      ...prize, id: `experience-${id}`, image: prize.image || collection.image, totalCount: 1, remainingCount: 1, opened: [false],
    } })),
    lastPrize: last
      ? { ...last, id: 'experience-last', rank: 'LAST', lastPrize: true, image: last.image || collection.image, totalCount: 1, remainingCount: 1, opened: [false] }
      : { id: 'experience-last', rank: 'LAST', lastPrize: true, name: `${collection.name} 라스트상`, image: collection.image, totalCount: 1, remainingCount: 1, opened: [false] },
    lastAwarded: false,
  };
}

export function createExperienceRound(): ExperienceRound {
  const grades = ['A', 'B', 'B', 'C', 'C', 'C'];
  for (let index = grades.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [grades[index], grades[swap]] = [grades[swap], grades[index]];
  }
  const names: Record<string, string> = { A: '심야 격납고 메카 아트보드', B: '전설의 검 아크릴 스탠드', C: '히어로 메탈 배지' };
  return {
    tickets: grades.map((rank, id) => ({ id, opened: false, prize: {
      id: `experience-${id}`, rank, name: names[rank], image: PRIZE_IMAGES[rank],
      totalCount: 1, remainingCount: 1, opened: [false],
    } })),
    lastPrize: { id: 'experience-last', rank: 'LAST', lastPrize: true, name: '라스트원 흑룡 일러스트 보드', image: '/catalog-preview/moonlit/prize-last.svg', totalCount: 1, remainingCount: 1, opened: [false] },
    lastAwarded: false,
  };
}

export function purchaseExperienceTickets(round: ExperienceRound, selected: number[]): { round: ExperienceRound; prizes: Prize[] } {
  const ids = new Set(selected);
  if (!selected.length || ids.size !== selected.length || selected.some(id => !Number.isInteger(id) || !round.tickets.some(ticket => ticket.id === id && !ticket.opened))) {
    throw new Error('남아 있는 체험 티켓을 다시 선택해 주세요.');
  }
  const prizes = selected.map(id => ({ ...round.tickets.find(ticket => ticket.id === id)!.prize, remainingCount: 0, opened: [true] }));
  const tickets = round.tickets.map(ticket => ids.has(ticket.id) ? { ...ticket, opened: true } : ticket);
  const awardLast = !round.lastAwarded && tickets.every(ticket => ticket.opened);
  if (awardLast) prizes.push({ ...round.lastPrize, remainingCount: 0, opened: [true] });
  return { round: { ...round, tickets, lastAwarded: round.lastAwarded || awardLast }, prizes };
}

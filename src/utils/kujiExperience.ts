// 운영 주문·재고와 분리된 무료 체험 회차와 마지막 티켓 보너스를 관리한다.
import type { Prize } from '../shared-types';

export type ExperienceRound = {
  tickets: { id: number; opened: boolean; prize: Prize }[];
  lastPrize: Prize;
  lastAwarded: boolean;
};

export const EXPERIENCE_IMAGE = '/catalog-preview/moonlit-bookshop.webp';

export function createExperienceRound(): ExperienceRound {
  const grades = ['A', 'B', 'B', 'C', 'C', 'C'];
  for (let index = grades.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [grades[index], grades[swap]] = [grades[swap], grades[index]];
  }
  const names: Record<string, string> = { A: '달빛 서점 아트프린트', B: '작은 독서가 엽서', C: '달빛 고양이 스티커' };
  return {
    tickets: grades.map((rank, id) => ({ id, opened: false, prize: {
      id: `experience-${id}`, rank, name: names[rank], image: EXPERIENCE_IMAGE,
      totalCount: 1, remainingCount: 1, opened: [false],
    } })),
    lastPrize: { id: 'experience-last', rank: 'LAST', lastPrize: true, name: '달빛 서점 라스트 아트프린트', image: EXPERIENCE_IMAGE, totalCount: 1, remainingCount: 1, opened: [false] },
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

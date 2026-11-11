// 개인정보를 제외한 가입 단계 집계와 실제 회원 생성 건수를 관리자에게 제공한다.
import axiosInstance from './axiosInstance';
import type { FunnelEvent } from '../utils/funnelAnalytics';

export interface FunnelCount { event: FunnelEvent; count: number }
export interface FunnelReport {
  days: number;
  counts: FunnelCount[];
  sources: { source: string; event: FunnelEvent; count: number }[];
  confirmedSignups: number;
  notice: string;
}
export const fetchSignupFunnel = async (days = 7) => (await axiosInstance.get<FunnelReport>('/api/admin/analytics/signup-funnel', { params: { days } })).data;

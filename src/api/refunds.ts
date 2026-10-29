// 본인 구매·충전의 환불 접수와 관리자 검토 API를 호출합니다.
import axios from './axiosInstance';

export type RefundTargetType = 'DRAW_HISTORY' | 'POINT_CHARGE';
export type RefundStatus = 'REQUESTED' | 'UNDER_REVIEW' | 'REVIEW_APPROVED' | 'REJECTED';
export interface RefundPage<T> { content: T[]; page: number; size: number; hasNext: boolean }
export interface RefundTarget {
  targetType: RefundTargetType; targetId: number; title: string; occurredAt: string;
  targetAmount: number | null; fulfillmentStatus: string; notice: string;
}
export interface RefundRequest {
  id: number; memberId: number; memberNickname: string; targetType: RefundTargetType;
  targetId: number; title: string; sourceOccurredAt: string; targetAmount: number | null;
  refundAmount: number | null; fulfillmentStatus: string; reason: string; status: RefundStatus;
  statusLabel: string; reviewReason: string | null; createdAt: string;
  executionPending: boolean; statusNotice: string;
}
export async function fetchRefundTargets(targetType: RefundTargetType, page: number) {
  return (await axios.get<RefundPage<RefundTarget>>('/api/refunds/targets', { params: { targetType, page, size: 20 } })).data;
}
export async function fetchRefundRequests(admin: boolean, page: number, status?: RefundStatus) {
  return (await axios.get<RefundPage<RefundRequest>>(admin ? '/api/admin/refunds' : '/api/refunds/me', { params: { page, size: 20, status: admin ? status : undefined } })).data;
}
export async function createRefund(target: RefundTarget, reason: string) {
  return (await axios.post<RefundRequest>('/api/refunds', { targetType: target.targetType, targetId: target.targetId, reason })).data;
}
export async function reviewRefund(id: number, status: Exclude<RefundStatus, 'REQUESTED'>, reason: string) {
  return (await axios.patch<RefundRequest>(`/api/admin/refunds/${id}/review`, { status, reason })).data;
}

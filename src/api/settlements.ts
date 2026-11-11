// 관리자 지급 확인 기록과 판매자 본인의 정산 내역을 조회한다.
import axiosInstance from './axiosInstance';

export interface SettlementPage<T> { content: T[]; page: number; size: number; hasNext: boolean }
export interface SettlementSeller { sellerId: number; sellerName: string; eligibleSaleCount: number; eligibleAmount: number; paidAmount: number }
export interface SettlementSale { id: number; boardTitle: string; completedAt: string; purchasedCount: number; grossAmount: number; feeAmount: number; netAmount: number; paymentEnvironment: string; delivered: boolean; refundHold: boolean; paid: boolean; eligible: boolean; payoutId: number | null; statusReason: string }
export interface SettlementPreview { sellerId: number; saleIds: number[]; grossAmount: number; feeAmount: number; netAmount: number; saleCount: number; manualTransfer: boolean; notice: string }
export interface SettlementPayout { id: number; sellerId: number; sellerName: string; amount: number; paidDate: string; transferReference: string; evidenceReference: string; requestId: string; recordedAt: string; manualTransfer: boolean; notice: string; sales: SettlementSale[] }
export interface RecordSettlementPayout { requestId: string; saleIds: number[]; expectedAmount: number; paidDate: string; transferReference: string; evidenceReference: string; transferConfirmed: true }

const adminBase = '/api/admin/settlements';
export const fetchSettlementSellers = async (page = 0) => (await axiosInstance.get<SettlementPage<SettlementSeller>>(`${adminBase}/sellers`, { params: { page, size: 20 } })).data;
export const fetchSettlementSales = async (sellerId: number, page = 0) => (await axiosInstance.get<SettlementPage<SettlementSale>>(`${adminBase}/sellers/${sellerId}/sales`, { params: { page, size: 50 } })).data;
export const previewSettlement = async (sellerId: number, saleIds: number[]) => (await axiosInstance.post<SettlementPreview>(`${adminBase}/sellers/${sellerId}/preview`, { saleIds })).data;
export const recordSettlementPayout = async (sellerId: number, input: RecordSettlementPayout) => (await axiosInstance.post<SettlementPayout>(`${adminBase}/sellers/${sellerId}/payouts`, input)).data;
export const fetchAdminSettlementPayouts = async (sellerId: number, page = 0) => (await axiosInstance.get<SettlementPage<SettlementPayout>>(`${adminBase}/sellers/${sellerId}/payouts`, { params: { page, size: 20 } })).data;
export const fetchMySettlementPayouts = async (page = 0) => (await axiosInstance.get<SettlementPage<SettlementPayout>>('/api/settlements/payouts', { params: { page, size: 20 } })).data;

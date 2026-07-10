import { Inquiry, Post } from "../shared-types";
import axiosInstance from "./axiosInstance";

export const fetchAllInquiries = async (): Promise<Inquiry[]> => {
  const response = await axiosInstance.get("/api/admin/inquiries");
  return response.data;
};

export const answerInquiry = async (id: number, answerContent: string): Promise<void> => {
  await axiosInstance.put(`/api/admin/inquiries/${id}/answer`, { answerContent });
};

export const fetchNotices = async (): Promise<Post[]> => {
  const response = await axiosInstance.get("/api/posts?category=NOTICE");
  // /api/posts는 Spring 페이지네이션 객체({content:[...]})를 반환하므로 배열만 추출.
  // (배열을 그대로 setState하면 notices.filter가 함수가 아니라 렌더 크래시 → 검은 화면)
  const data = response.data;
  return Array.isArray(data) ? data : (data?.content ?? []);
};

// 서버 POST/PUT /api/posts는 multipart(consumes=MULTIPART_FORM_DATA)로,
// JSON을 'request' 파트(Blob)로 담아야 함. JSON 직접 전송 시 415 오류 발생.
const buildNoticeFormData = (title: string, content: string): FormData => {
  const formData = new FormData();
  const requestBlob = new Blob(
    [JSON.stringify({ title, content, category: "NOTICE" })],
    { type: "application/json" },
  );
  formData.append("request", requestBlob);
  return formData;
};

export const createNotice = async (title: string, content: string): Promise<void> => {
  await axiosInstance.post("/api/posts", buildNoticeFormData(title, content));
};

export const updateNotice = async (id: number, title: string, content: string): Promise<void> => {
  await axiosInstance.put(`/api/posts/${id}`, buildNoticeFormData(title, content));
};

export const deleteNotice = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/posts/${id}`);
};

export const fetchAdminMembers = async (): Promise<any[]> => {
  const response = await axiosInstance.get("/api/admin/members");
  return response.data;
};

export const fetchPromotions = async (): Promise<any[]> => {
  const response = await axiosInstance.get("/api/admin/promotions");
  return response.data;
};

export const createPromotion = async (promotionData: any): Promise<void> => {
  await axiosInstance.post("/api/admin/promotions", promotionData);
};

export const processAiImage = async (file: File): Promise<{ imageUrl: string; name: string; description: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/api/admin/ai/process-image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const fetchItemSuggestion = async (grade: string): Promise<{ grade: string; suggestedName: string; suggestedTotalQty: number; confidence: number; sampleCount: number; nameCandidates: string[] }> => {
  const response = await axiosInstance.get(`/api/admin/ai/item-suggestion?grade=${grade}`);
  return response.data;
};

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

export const createNotice = async (title: string, content: string): Promise<void> => {
  await axiosInstance.post("/api/posts", { title, content, category: "NOTICE" });
};

export const updateNotice = async (id: number, title: string, content: string): Promise<void> => {
  await axiosInstance.put(`/api/posts/${id}`, { title, content, category: "NOTICE" });
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

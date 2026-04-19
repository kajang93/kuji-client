import { KujiBoard, BoardStatus, BoardImageType } from "../shared-types";

const API_BASE_URL = "/api/kuji";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchKujiBoards = async (): Promise<KujiBoard[]> => {
  const response = await fetch(API_BASE_URL, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch kuji boards");
  }
  return response.json();
};

export interface CreateKujiBoardRequest {
  title: string;
  pricePerDraw: number;
  status: BoardStatus;
  rewardRate: number;
}

export const createKujiBoard = async (data: CreateKujiBoardRequest): Promise<number> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create kuji board");
  }
  // The service returns the ID (Long)
  return response.json();
};

export const uploadBoardImages = async (
  boardId: number,
  type: BoardImageType,
  files: File[]
): Promise<void> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("type", type);
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/${boardId}/images`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Note: Content-Type should NOT be set manually for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload images");
  }
};

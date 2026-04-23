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
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload images");
  }
};

/**
 * Register multiple items for a kuji board with images.
 */
export const registerBoardItems = async (
  boardId: number,
  itemsData: any[],
  files: File[]
): Promise<void> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  
  // Create a Blob from the items JSON data
  const jsonBlob = new Blob([JSON.stringify(itemsData)], { type: 'application/json' });
  formData.append("items", jsonBlob);

  // Append images
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/${boardId}/items`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to register items");
  }
};

/**
 * Fetch detailed information of a single board (includes prizes/items).
 */
export const fetchKujiBoardDetail = async (boardId: number): Promise<KujiBoard> => {
  const response = await fetch(`${API_BASE_URL}/${boardId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch board detail for ID: ${boardId}`);
  }
  return response.json();
};

/**
 * Update a specific kuji item.
 */
export const updateKujiItem = async (
  itemId: number,
  data: { grade?: string; name?: string; totalQty?: number }
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update kuji item");
  }
};

/**
 * Delete a specific kuji item.
 */
export const deleteKujiItem = async (itemId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to delete kuji item");
  }
};

export interface PostComment {
  id: number;
  authorId?: number;
  content: string;
  authorName: string;
  authorEmail: string;
  profileImageUrl?: string;
  createdAt: string;
}

export type BoardStatus = 'PREPARING' | 'ACTIVE' | 'FINISHED';
export type BoardImageType = 'THUMBNAIL' | 'DETAIL' | 'BANNER';

export interface KujiBoardImage {
  id: number;
  imageUrl: string;
  sequence: number;
  imageType: BoardImageType;
}

export interface KujiBoard {
  id: number;
  title: string;
  pricePerDraw: number;
  status: BoardStatus;
  rewardRate: number;
  createdAt: string;
  images: KujiBoardImage[];
  totalCount?: number;
  remainCount?: number;
  gradeCount?: number; // 추가
  hasLastPrize?: boolean;
  lastPrizeAvailable?: boolean;
  isWished?: boolean; // 추가
  prizes?: KujiItemResponse[];
}

export interface KujiItemResponse {
  id: number;
  grade: string;
  lastPrize?: boolean;
  name: string;
  totalQty: number;
  remainQty: number;
  imageUrls: string[];
  opened: boolean[];
  drawHistoryId?: number;
  options?: string | PrizeOption[];
}

export type Prize = {
  id: string;
  rank: string;
  lastPrize?: boolean;
  name: string;
  image: string;
  totalCount: number;
  remainingCount: number;
  totalQty?: number;     // Backend field alignment
  remainQty?: number;    // Backend field alignment
  opened: boolean[];
  drawHistoryId?: number; // 추가
  options?: PrizeOption[];
};

export type AnimeCollection = {
  id: string;
  name: string;
  image: string;
  totalKuji: number;
  remainingKuji: number;
  hasLastPrize?: boolean;
  lastPrizeAvailable?: boolean;
  gradeCount?: number; // 추가
  prizes: Prize[];
  operationStatus?: "scheduled" | "active" | "ended";
  boardId?: number; // Backend alignment
  isWished?: boolean; // 추가
  rewardRate?: number; // 적립 포인트 설정용
  pricePerDraw?: number;
};

export type WinningItem = {
  id: string;
  drawHistoryId?: number; // Backend alignment
  date: string;
  animeName: string;
  rank: string;
  prizeName: string;
  prizeImage: string;
  deliveryStatus: "stored" | "preparing" | "shipped" | "delivered" | "SHIP_REQUESTED";
  trackingNumber?: string;
  needsOptionSelection?: boolean;
  selectedOption?: {
    id: string;
    name: string;
    image: string;
  };
  isNew?: boolean;
  shippingId?: number; // 추가
  courierName?: string; // 추가
  sellerName?: string; // 추가
};

export interface ShippingInfo {
  id: number;
  recipientName: string;
  phone: string;
  address: string;
  detailAddress: string;
  trackingNumber?: string;
  status: "COMPLETED" | "PREPARING" | "SHIPPING" | "DELIVERED" | "CANCELLED" | "RETURNED";
  courierName?: string;
  deliveryMessage?: string;
  createdAt: string;
  items: {
    drawHistoryId: number;
    kujiName: string;
    grade: string;
    itemName: string;
    itemImage: string;
  }[];
}

export type PrizeOption = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export type InquiryComment = {
  id: string;
  author: "customer" | "seller";
  authorName: string;
  content: string;
  date: string;
  time: string;
};

export type CustomerInquiry = {
  id: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  orderNumber: string;
  inquiryType: "주문" | "배송" | "결제" | "상품문의" | "기타";
  subject: string;
  content: string;
  status: "pending" | "answered" | "closed";
  createdAt: string;
  comments: InquiryComment[];
  isNew?: boolean;
};

export type ScreenType =
  | "main"
  | "list"
  | "detail"
  | "login"
  | "selection"
  | "reveal"
  | "profile"
  | "profileEdit"
  | "purchase"
  | "refunds"
  | "winning"
  | "wishlist"
  | "settings"
  | "support"
  | "prizeSelection"
  | "businessDashboard"
  | "businessProfile"
  | "businessProducts"
  | "businessProductEdit"
  | "businessRegister"
  | "businessShipping"
  | "businessInquiries"
  | "community"
  | "communityDetail"
  | "communityWrite"
  | "notice"
  | "events"
  | "adminDashboard"
  | "adminNoticeManagement"
  | "adminEventManagement"
  | "adminInquiryManagement"
  | "adminMainBannerManagement"
  | "adminUserManagement"
  | "adminPromotionManagement"
  | "adminStatistics"
  | "adminRefunds"
  | "kakaoCallback"
  | "naverCallback"
  | "googleCallback"
  | "businessPending"
  | "pointCharge";

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  link?: string;
  buttonText?: string;
};

export interface MemberProfileResponse {
  memberId: number;
  email: string;
  nickname: string;
  role: string;
  points: number;
  isActive: boolean;
  profileImageUrl?: string;
  businessStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  businessRejectReason?: string | null;
  phoneNumber?: string;
  birthDate?: string;
  address?: string;
  addressDetail?: string;
  createdAt?: string;
}

export type PostCategory = "FREE" | "WINNING" | "QNA" | "NOTICE";

export interface Post {
  id: number;
  authorId?: number;
  title: string;
  content: string;
  category: PostCategory;
  viewCount: number;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  imageUrls?: string[];
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isWished?: boolean;
}

export interface PostCreateRequest {
  title: string;
  content: string;
  category: PostCategory;
}

export type InquiryType = "SHIPPING" | "PRODUCT" | "ACCOUNT" | "ETC";
export type InquiryStatus = "WAITING" | "COMPLETED";

export interface Inquiry {
  id: number;
  title: string;
  content?: string;
  inquiryType: InquiryType;
  categoryDescription: string;
  status: InquiryStatus;
  statusDescription: string;
  createdAt: string;
  answerContent: string | null;
  answeredAt: string | null;
  memberName?: string;
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
  inquiryType: InquiryType;
  shippingId?: number;
}

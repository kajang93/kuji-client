export const TYPES_MODULE = true;

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
  isWished?: boolean; // 추가
  prizes?: Prize[];
}

export type Prize = {
  id: string;
  rank: string;
  name: string;
  image: string;
  totalCount: number;
  remainingCount: number;
  totalQty?: number;     // Backend field alignment
  remainQty?: number;    // Backend field alignment
  opened: boolean[];
  drawHistoryId?: number; // 추가
};

export type AnimeCollection = {
  id: string;
  name: string;
  image: string;
  totalKuji: number;
  remainingKuji: number;
  gradeCount?: number; // 추가
  prizes: Prize[];
  operationStatus?: "scheduled" | "active" | "ended";
  boardId?: number; // Backend alignment
  isWished?: boolean; // 추가
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
};

export interface ShippingInfo {
  id: number;
  recipientName: string;
  phone: string;
  zipcode: string;
  address: string;
  detailAddress: string;
  trackingNumber?: string;
  status: "PREPARING" | "SHIPPED" | "DELIVERED";
  courierName?: string;
  deliveryMessage?: string;
  createdAt: string;
  updatedAt: string;
  items: WinningItem[];
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

export type Inquiry = {
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
  | "adminStatistics"
  | "kakaoCallback"
  | "businessPending";

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  link?: string;
  buttonText?: string;
};

export interface MemberProfileResponse {
  id: number;
  email: string;
  nickname: string;
  role: string;
  points: number;
  isActive: boolean;
  profileImageUrl?: string;
}

export type PostCategory = "FREE" | "WINNING" | "QNA" | "NOTICE";

export interface Post {
  id: number;
  title: string;
  content: string;
  category: PostCategory;
  viewCount: number;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
  inquiryType: InquiryType;
  shippingId?: number;
}

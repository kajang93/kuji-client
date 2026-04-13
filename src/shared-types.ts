export const TYPES_MODULE = true;

export type Prize = {
  id: string;
  rank: string;
  name: string;
  image: string;
  totalCount: number;
  remainingCount: number;
  opened: boolean[];
};

export type AnimeCollection = {
  id: string;
  name: string;
  image: string;
  totalKuji: number;
  remainingKuji: number;
  prizes: Prize[];
  operationStatus?: "scheduled" | "active" | "ended";
};

export type WinningItem = {
  id: string;
  date: string;
  animeName: string;
  rank: string;
  prizeName: string;
  prizeImage: string;
  deliveryStatus: "stored" | "preparing" | "shipped" | "delivered";
  trackingNumber?: string;
  needsOptionSelection?: boolean;
  selectedOption?: {
    id: string;
    name: string;
    image: string;
  };
  isNew?: boolean;
};

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
  isActive: boolean;
  link?: string;
  buttonText?: string;
  createdAt: string;
  updatedAt: string;
};

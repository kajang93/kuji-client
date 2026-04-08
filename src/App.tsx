import { useState, useEffect } from "react";
import axios from "axios";
import MainScreen from "./components/MainScreen";
import AnimeList from "./components/AnimeList";
import PrizeDetail from "./components/PrizeDetail";
import KujiSelection from "./components/KujiSelection";
import KujiReveal from "./components/KujiReveal";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import BusinessSidebar from "./components/BusinessSidebar";
import AdminSidebar from "./components/AdminSidebar";
import BusinessDashboard from "./components/BusinessDashboard";
import BusinessProfile from "./components/BusinessProfile";
import AdminDashboard from "./components/AdminDashboard";
import AdminNoticeManagement from "./components/AdminNoticeManagement";
import AdminEventManagement from "./components/AdminEventManagement";
import AdminInquiryManagement from "./components/AdminInquiryManagement";
import AdminMainBannerManagement from "./components/AdminMainBannerManagement";
import AdminUserManagement from "./components/AdminUserManagement";
import AdminStatistics from "./components/AdminStatistics";
import Profile from "./components/Profile";
import ProfileEdit from "./components/ProfileEdit";
import PurchaseHistory from "./components/PurchaseHistory";
import WinningHistory from "./components/WinningHistory";
import Wishlist from "./components/Wishlist";
import Settings from "./components/Settings";
import CustomerSupport from "./components/CustomerSupport";
import PrizeSelection from "./components/PrizeSelection";
import BusinessProductList from "./components/BusinessProductList";
import BusinessProductEdit from "./components/BusinessProductEdit";
import BusinessProductRegister from "./components/BusinessProductRegister";
import BusinessShippingManagement from "./components/BusinessShippingManagement";
import SellerInquiries from "./components/SellerInquiries";
import Community from "./components/Community";
import Notice from "./components/Notice";
import Events from "./components/Events";
import AlertModal from "./components/AlertModal";
import { Menu } from "./components/icons";
import KakaoCallback from "./components/KakaoCallback";
import SignUp from "./components/SignUp";

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
  operationStatus?: "scheduled" | "active" | "ended"; // 운영예정, 운영중, 운영종료
};

export type WinningItem = {
  id: string;
  date: string;
  animeName: string;
  rank: string;
  prizeName: string;
  prizeImage: string;
  deliveryStatus: "preparing" | "shipped" | "delivered";
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
  inquiryType: "주문" | "배송" | "결제" | "상품문의" | "기타"; // Added inquiry type
  subject: string;
  content: string;
  status: "pending" | "answered" | "closed";
  createdAt: string;
  comments: InquiryComment[];
  isNew?: boolean;
};

type ScreenType =
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
  | "signup";

export type User = {
  memberId: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  type: "social" | "business" | "admin"; // Derived or mapped from RoleType
  role: "USER" | "BIZ" | "ADMIN";
  points?: number;
};

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

export default function App() {
  const [screen, setScreen] = useState<ScreenType>("main");
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: "1",
      title: "이치방쿠지",
      subtitle: "一番くじ",
      imageUrl:
        "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=1920",
      order: 1,
      isActive: true,
      buttonText: "시작하기",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ]);
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeCollection | null>(null);
  const [selectedKuji, setSelectedKuji] = useState<number[]>(
    [],
  );
  const [revealedPrizes, setRevealedPrizes] = useState<Prize[]>(
    [],
  );
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [kujiStatus, setKujiStatus] = useState<boolean[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [returnToScreen, setReturnToScreen] = useState<
    "detail" | null
  >(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedWinningId, setSelectedWinningId] = useState<
    string | null
  >(null);
  const [selectedRank, setSelectedRank] = useState<string>("");
  const [editingCollectionId, setEditingCollectionId] =
    useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });
  const [winningHistory, setWinningHistory] = useState<
    WinningItem[]
  >([
    // Mock old data
    {
      id: "W20241116003",
      date: "2024-11-16 11:25",
      animeName: "나루토 시리즈",
      rank: "C",
      prizeName: "C상 피규어",
      prizeImage:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200",
      deliveryStatus: "preparing",
    },
  ]);

  // Fetch full user info from backend
  const fetchUserInfo = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:8080/api/members/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;
      setUser({
        memberId: data.memberId,
        email: data.email,
        nickname: data.nickname,
        profileImageUrl: data.profileImageUrl,
        type:
          data.role === "ADMIN"
            ? "admin"
            : data.role === "BIZ"
              ? "business"
              : "social",
        role: data.role,
        points: data.points || 0,
      });
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const [inquiries, setInquiries] = useState<Inquiry[]>([
    {
      id: "INQ001",
      customerId: "customer1",
      customerName: "홍길동",
      sellerId: "seller1",
      sellerName: "원피스 전문샵",
      orderNumber: "W20241116003",
      inquiryType: "배송", // Added inquiry type
      subject: "배송 문의",
      content: "배송이 언제 출발하나요?",
      status: "pending",
      createdAt: "2024-11-18 14:30",
      comments: [],
      isNew: true,
    },
  ]);

  // Handle Token-based Auth and URL Path for Kakao Callback
  useEffect(() => {
    // 1. Check for stored token on load
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo(token);
    }

    // 2. Check for redirect path
    const path = window.location.pathname;
    if (path === "/auth/kakao/callback") {
      setScreen("kakaoCallback");
    }
  }, []);

  const animeCollections: AnimeCollection[] = [
    {
      id: "1",
      name: "원피스",
      image:
        "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400",
      totalKuji: 80,
      remainingKuji: 80,
      operationStatus: "active", // 운영중
      prizes: [
        {
          id: "A",
          rank: "A",
          name: "A상 피규어",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 2,
          remainingCount: 2,
          opened: [false, false],
        },
        {
          id: "B",
          rank: "B",
          name: "B상 피규어",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 3,
          remainingCount: 3,
          opened: [false, false, false],
        },
        {
          id: "C",
          rank: "C",
          name: "C상 피규어",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 2,
          remainingCount: 2,
          opened: [false, false],
        },
        {
          id: "D",
          rank: "D",
          name: "D상 피규어",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 3,
          remainingCount: 3,
          opened: [false, false, false],
        },
        {
          id: "E",
          rank: "E",
          name: "E상 피규어",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 1,
          remainingCount: 1,
          opened: [false],
        },
        {
          id: "F",
          rank: "F",
          name: "F상 머그",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 1,
          remainingCount: 1,
          opened: [false],
        },
        {
          id: "G",
          rank: "G",
          name: "G상 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 24,
          remainingCount: 24,
          opened: new Array(24).fill(false),
        },
        {
          id: "H",
          rank: "H",
          name: "H상 코드밴드/코스터",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=200",
          totalCount: 21,
          remainingCount: 21,
          opened: new Array(21).fill(false),
        },
      ],
    },
    {
      id: "2",
      name: "귀멸의 칼날",
      image:
        "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=400",
      totalKuji: 80,
      remainingKuji: 80,
      operationStatus: "scheduled", // 운영예정
      prizes: [
        {
          id: "A",
          rank: "A",
          name: "A상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 2,
          remainingCount: 2,
          opened: [false, false],
        },
        {
          id: "B",
          rank: "B",
          name: "B상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 3,
          remainingCount: 3,
          opened: [false, false, false],
        },
        {
          id: "C",
          rank: "C",
          name: "C상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 2,
          remainingCount: 2,
          opened: [false, false],
        },
        {
          id: "D",
          rank: "D",
          name: "D상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 3,
          remainingCount: 3,
          opened: [false, false, false],
        },
        {
          id: "E",
          rank: "E",
          name: "E상 타월",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 5,
          remainingCount: 5,
          opened: new Array(5).fill(false),
        },
        {
          id: "F",
          rank: "F",
          name: "F상 파우치",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 8,
          remainingCount: 8,
          opened: new Array(8).fill(false),
        },
        {
          id: "G",
          rank: "G",
          name: "G상 키링",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 30,
          remainingCount: 30,
          opened: new Array(30).fill(false),
        },
      ],
    },
    {
      id: "3",
      name: "나루토",
      image:
        "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=400",
      totalKuji: 80,
      remainingKuji: 80,
      operationStatus: "ended", // 운영종료
      prizes: [
        {
          id: "A",
          rank: "A",
          name: "A상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 1,
          remainingCount: 1,
          opened: [false],
        },
        {
          id: "B",
          rank: "B",
          name: "B상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 2,
          remainingCount: 2,
          opened: [false, false],
        },
        {
          id: "C",
          rank: "C",
          name: "C상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 3,
          remainingCount: 3,
          opened: [false, false, false],
        },
        {
          id: "D",
          rank: "D",
          name: "D상 피규어",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 4,
          remainingCount: 4,
          opened: [false, false, false, false],
        },
        {
          id: "E",
          rank: "E",
          name: "E상 플레이트",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 10,
          remainingCount: 10,
          opened: new Array(10).fill(false),
        },
        {
          id: "F",
          rank: "F",
          name: "F상 스티커",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 25,
          remainingCount: 25,
          opened: new Array(25).fill(false),
        },
        {
          id: "G",
          rank: "G",
          name: "G상 배지",
          image:
            "https://images.unsplash.com/photo-1761129386720-82a53e04d9b7?w=200",
          totalCount: 35,
          remainingCount: 35,
          opened: new Array(35).fill(false),
        },
      ],
    },
  ];

  const handleAnimeSelect = (anime: AnimeCollection) => {
    setSelectedAnime(anime);
    setScreen("detail");
    // Initialize kuji status - 15% already opened
    const status = Array.from(
      { length: anime.totalKuji },
      () => Math.random() < 0.15,
    );
    setKujiStatus(status);
  };

  const handlePurchase = (count: number) => {
    if (!user) {
      // Not logged in - go to login screen
      setPurchaseCount(count);
      setReturnToScreen("detail");
      setScreen("login");
    } else {
      // Already logged in - proceed to selection
      setPurchaseCount(count);
      setSelectedKuji([]);
      setScreen("selection");
    }
  };

  const handleLogin = (userData: {
    nickname: string;
    email: string;
    type: "social" | "business" | "admin";
  }) => {
    // Check if token exists in localStorage (set by Login/Kakao component)
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo(token);
    } else {
      // Mock for dev
      setUser({
        memberId: 0,
        email: userData.email,
        nickname: userData.nickname,
        role:
          userData.type === "social"
            ? "USER"
            : userData.type === "business"
              ? "BIZ"
              : "ADMIN",
        type: userData.type,
        points: 0,
      });
    }

    setIsSidebarOpen(false);

    // Business users go to dashboard, regular users return to previous screen or main
    if (userData.type === "business") {
      setScreen("businessDashboard");
    } else if (userData.type === "admin") {
      setScreen("adminDashboard");
    } else if (returnToScreen === "detail") {
      setScreen("selection");
      setReturnToScreen(null);
    } else {
      setScreen("main");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsSidebarOpen(false);
    setScreen("main");
  };

  const handleKujiReveal = (kujiIndices: number[]) => {
    // Simulate random prizes for each selected kuji
    if (selectedAnime) {
      const prizes = kujiIndices.map(() => {
        return selectedAnime.prizes[
          Math.floor(
            Math.random() * selectedAnime.prizes.length,
          )
        ];
      });
      setRevealedPrizes(prizes);
      setSelectedKuji(kujiIndices);
      setScreen("reveal");
    }
  };

  const handleRevealComplete = () => {
    // Add revealed prizes to winning history with isNew flag!
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newWinnings: WinningItem[] = revealedPrizes.map(
      (prize, index) => ({
        id: `W${Date.now()}${index}`,
        date: dateStr,
        animeName: selectedAnime?.name || "알 수 없음",
        rank: prize.rank,
        prizeName: prize.name,
        prizeImage: prize.image,
        deliveryStatus: "preparing" as const,
        // A~D상은 한정판으로 옵션(색상/버전) 선택 필요
        needsOptionSelection: [
          "A",
          "B",
          "C",
          "D",
          "G",
        ].includes(prize.rank),
        isNew: true,
      }),
    );

    setWinningHistory((prev) => [...newWinnings, ...prev]);

    // 포인트 적립: 구매한 쿠지 개수당 100포인트씩
    if (user) {
      const earnedPoints = purchaseCount * 100;
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          points: (prev.points || 0) + earnedPoints,
        };
      });
      showAlert(
        `${earnedPoints}포인트가 적립되었습니다!`,
        "success",
        "포인트 적립",
      );
    }

    // Go to winning history after revealing all prizes!
    setScreen("winning");
    setSelectedAnime(null);
    setRevealedPrizes([]);
    setSelectedKuji([]);
  };

  const handleSidebarNavigate = (
    navScreen:
      | "profile"
      | "purchase"
      | "winning"
      | "wishlist"
      | "settings"
      | "support"
      | "community"
      | "events",
  ) => {
    setScreen(navScreen);

    // Clear NEW badges when viewing winning history
    if (navScreen === "winning") {
      setWinningHistory((prev) =>
        prev.map((w) => ({ ...w, isNew: false })),
      );
    }
  };

  const handleBusinessSidebarNavigate = (
    navScreen:
      | "businessDashboard"
      | "businessProducts"
      | "businessRegister"
      | "businessShipping"
      | "businessProfile"
      | "settings"
      | "businessInquiries",
  ) => {
    setScreen(navScreen);
  };

  const handleAdminSidebarNavigate = (
    navScreen:
      | "adminDashboard"
      | "adminNoticeManagement"
      | "adminEventManagement"
      | "adminInquiryManagement"
      | "adminMainBannerManagement"
      | "adminUserManagement"
      | "adminStatistics",
  ) => {
    setScreen(navScreen);
  };

  const handleUpdateShipping = (
    winningId: string,
    status: "preparing" | "shipped" | "delivered",
    trackingNumber?: string,
  ) => {
    setWinningHistory((prev) =>
      prev.map((winning) => {
        if (winning.id === winningId) {
          return {
            ...winning,
            deliveryStatus: status,
            trackingNumber:
              trackingNumber || winning.trackingNumber,
          };
        }
        return winning;
      }),
    );
  };

  const handleWishlistSelect = (animeId: string) => {
    const anime = animeCollections.find(
      (a) => a.id === animeId,
    );
    if (anime) {
      handleAnimeSelect(anime);
    }
  };

  const handleToggleWishlist = (animeId: string) => {
    setWishlist((prev) => {
      if (prev.includes(animeId)) {
        return prev.filter((id) => id !== animeId);
      } else {
        return [...prev, animeId];
      }
    });
  };

  const handleRemoveFromWishlist = (animeId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== animeId));
  };

  const handleSelectPrizeOption = (
    winningId: string,
    rank: string,
  ) => {
    setSelectedWinningId(winningId);
    setSelectedRank(rank);
    setScreen("prizeSelection");
  };

  const handlePrizeOptionConfirm = (optionId: string) => {
    if (!selectedWinningId) return;

    const selectedOption = getPrizeOptions(selectedRank).find(
      (opt) => opt.id === optionId,
    );
    if (!selectedOption) return;

    // Update winning history with selected option
    setWinningHistory((prev) =>
      prev.map((winning) => {
        if (winning.id === selectedWinningId) {
          return {
            ...winning,
            selectedOption: {
              id: selectedOption.id,
              name: selectedOption.name,
              image: selectedOption.image,
            },
            prizeName: selectedOption.name, // Update prize name
            prizeImage: selectedOption.image, // Update prize image
            needsOptionSelection: false, // No longer needs selection
            deliveryStatus: "preparing" as const, // Keep as preparing
          };
        }
        return winning;
      }),
    );

    setScreen("winning");
  };

  // Alert function
  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    title?: string,
  ) => {
    setAlertModal({ isOpen: true, message, type, title });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Mock prize options for all ranks
  const getPrizeOptions = (rank: string): PrizeOption[] => {
    const options: Record<string, PrizeOption[]> = {
      A: [
        {
          id: "A1",
          name: "루피 마스터피스 피규어",
          image:
            "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400",
          description: "높이 25cm, 프리미엄 도색",
        },
        {
          id: "A2",
          name: "에이스 불꽃 ver. 피규어",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
          description: "높이 25cm, LED 이펙트 포함",
        },
        {
          id: "A3",
          name: "샹크스 황제 ver. 피규어",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
          description: "높이 28cm, 망토 실물감",
        },
      ],
      B: [
        {
          id: "B1",
          name: "조로 삼도류 피규어",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
          description: "높이 20cm, 칼 3개 포함",
        },
        {
          id: "B2",
          name: "나미 기후봉 ver. 피규어",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
          description: "높이 20cm, 기후봉 포함",
        },
        {
          id: "B3",
          name: "상디 디아블 ver. 피규어",
          image:
            "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400",
          description: "높이 20cm, 불꽃 이펙트",
        },
        {
          id: "B4",
          name: "로빈 하나하나 ver. 피규어",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
          description: "높이 20cm, 꽃잎 이펙트",
        },
      ],
      C: [
        {
          id: "C1",
          name: "프랑키 장군 피규어",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
          description: "높이 18cm, 변형 가능",
        },
        {
          id: "C2",
          name: "브룩 소울킹 피규어",
          image:
            "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400",
          description: "높이 18cm, 기타 포함",
        },
        {
          id: "C3",
          name: "징베 해협의 협객 피규어",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400",
          description: "높이 18cm, 물 이펙트",
        },
        {
          id: "C4",
          name: "우솝 저격왕 피규어",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
          description: "높이 18cm, 새총 포함",
        },
        {
          id: "C5",
          name: "쵸파 몬스터 ver. 피규어",
          image:
            "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400",
          description: "높이 18cm, 특수 도색",
        },
      ],
      D: [
        {
          id: "D1",
          name: "루피 SD 피규어",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
          description: "높이 12cm, 귀여운 디자인",
        },
        {
          id: "D2",
          name: "조로 SD 피규어",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300",
          description: "높이 12cm, 귀여운 디자인",
        },
        {
          id: "D3",
          name: "나미 SD 피규어",
          image:
            "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=300",
          description: "높이 12cm, 귀여운 디자인",
        },
        {
          id: "D4",
          name: "상디 SD 피규어",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
          description: "높이 12cm, 귀여운 디자인",
        },
        {
          id: "D5",
          name: "쵸파 SD 피규어",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300",
          description: "높이 12cm, 귀여운 디자인",
        },
        {
          id: "D6",
          name: "로빈 SD 피규어",
          image:
            "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=300",
          description: "높이 12cm, 귀여운 디자인",
        },
      ],
      E: [
        {
          id: "E1",
          name: "밀짚모자 해적단 타올",
          image:
            "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=300",
          description: "60x120cm, 부드러운 소재",
        },
        {
          id: "E2",
          name: "원피스 로고 티셔츠 (블랙)",
          image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
          description: "M/L/XL 사이즈 선택",
        },
        {
          id: "E3",
          name: "원피스 로고 티셔츠 (화이트)",
          image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
          description: "M/L/XL 사이즈 선택",
        },
        {
          id: "E4",
          name: "원피스 후드티 (네이비)",
          image:
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300",
          description: "M/L/XL 사이즈 선택",
        },
        {
          id: "E5",
          name: "해적왕 머그컵",
          image:
            "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300",
          description: "350ml, 도자기",
        },
        {
          id: "E6",
          name: "밀짚모자 캔버스백",
          image:
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=300",
          description: "40x35cm, 튼튼한 재질",
        },
      ],
      F: [
        {
          id: "F1",
          name: "루피 클리어파일 세트",
          image:
            "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300",
          description: "A4 사이즈 5장",
        },
        {
          id: "F2",
          name: "조로 클리어파일 세트",
          image:
            "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300",
          description: "A4 사이즈 5장",
        },
        {
          id: "F3",
          name: "나미 클리어파일 세트",
          image:
            "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300",
          description: "A4 사이즈 5장",
        },
        {
          id: "F4",
          name: "상디 클리어파일 세트",
          image:
            "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300",
          description: "A4 사이즈 5장",
        },
        {
          id: "F5",
          name: "밀짚모자 메모장",
          image:
            "https://images.unsplash.com/photo-1517842645767-c639042777db?w=300",
          description: "100매, 다양한 디자인",
        },
        {
          id: "F6",
          name: "원피스 스티커 세트",
          image:
            "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=300",
          description: "30종 스티커",
        },
        {
          id: "F7",
          name: "해적왕 포스터",
          image:
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300",
          description: "A3 사이즈, 고급 인쇄",
        },
      ],
      G: [
        {
          id: "G1",
          name: "루피 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=300",
          description: "높이 10cm",
        },
        {
          id: "G2",
          name: "조로 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
          description: "높이 10cm",
        },
        {
          id: "G3",
          name: "나미 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300",
          description: "높이 10cm",
        },
        {
          id: "G4",
          name: "우솝 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
          description: "높이 10cm",
        },
        {
          id: "G5",
          name: "상디 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300",
          description: "높이 10cm",
        },
        {
          id: "G6",
          name: "쵸파 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
          description: "높이 10cm",
        },
        {
          id: "G7",
          name: "로빈 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300",
          description: "높이 10cm",
        },
        {
          id: "G8",
          name: "프랑키 아크릴 스탠드",
          image:
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300",
          description: "높이 10cm",
        },
      ],
      H: [
        {
          id: "H1",
          name: "원피스 러버 키홀더 - 루피",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H2",
          name: "원피스 러버 키홀더 - 조로",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H3",
          name: "원피스 러버 키홀더 - 나미",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H4",
          name: "원피스 러버 키홀더 - 상디",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H5",
          name: "원피스 러버 키홀더 - 쵸파",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H6",
          name: "원피스 러버 키홀더 - 우솝",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H7",
          name: "원피스 러버 키홀더 - 로빈",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H8",
          name: "원피스 러버 키홀더 - 브룩",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H9",
          name: "원피스 러버 키홀더 - 징베",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
        {
          id: "H10",
          name: "원피스 러버 키홀더 - 프랑키",
          image:
            "https://images.unsplash.com/photo-1563299796-17596ed6b017?w=300",
          description: "5cm, 양면 인쇄",
        },
      ],
    };

    return options[rank] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-800 overflow-hidden">
      {/* Hamburger Menu Button - Fixed position */}
      {screen !== "reveal" && screen !== "login" && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 z-30 p-3 bg-rose-500 rounded-full shadow-lg hover:bg-rose-600 transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Sidebar - Different for Business Users */}
      {user?.type === "business" ? (
        <BusinessSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
          onNavigate={handleBusinessSidebarNavigate}
          newInquiriesCount={
            inquiries.filter((inq) => inq.isNew).length
          }
        />
      ) : user?.type === "admin" ? (
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
          onNavigate={handleAdminSidebarNavigate}
          newInquiriesCount={
            inquiries.filter((inq) => inq.isNew).length
          }
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
          onLogin={() => {
            setIsSidebarOpen(false);
            setScreen("login");
          }}
          onNavigate={handleSidebarNavigate}
        />
      )}

      {screen === "main" && (
        <MainScreen
          onStart={() => setScreen("list")}
          banners={banners}
        />
      )}
      {screen === "list" && (
        <AnimeList
          collections={animeCollections}
          onSelect={handleAnimeSelect}
          onBack={() => setScreen("main")}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
        />
      )}
      {screen === "detail" && selectedAnime && (
        <PrizeDetail
          anime={selectedAnime}
          onBack={() => setScreen("list")}
          onPurchase={handlePurchase}
          user={user}
        />
      )}
      {screen === "login" && (
        <Login
          onLogin={handleLogin}
          onBack={() => setScreen(returnToScreen || "main")}
          onSignUp={() => setScreen("signup")}
        />
      )}
      {screen === "selection" && selectedAnime && (
        <KujiSelection
          totalKuji={selectedAnime.totalKuji}
          purchaseCount={purchaseCount}
          kujiStatus={kujiStatus}
          onConfirm={handleKujiReveal}
          onBack={() => setScreen("detail")}
        />
      )}
      {screen === "reveal" && revealedPrizes.length > 0 && (
        <KujiReveal
          prizes={revealedPrizes}
          onComplete={handleRevealComplete}
        />
      )}
      {screen === "profile" && user && (
        <Profile
          user={user}
          onBack={() => setScreen("main")}
          onEdit={() => setScreen("profileEdit")}
        />
      )}
      {screen === "profileEdit" && user && (
        <ProfileEdit
          user={user}
          onBack={() => setScreen("profile")}
          onSave={(userData) => {
            setUser({ ...user, ...userData });
            setScreen("profile");
          }}
        />
      )}
      {screen === "purchase" && (
        <PurchaseHistory onBack={() => setScreen("main")} />
      )}
      {screen === "winning" && (
        <WinningHistory
          onBack={() => {
            // Clear NEW badges when leaving winning history
            setWinningHistory((prev) =>
              prev.map((w) => ({ ...w, isNew: false })),
            );
            setScreen("main");
          }}
          onSelectPrizeOption={handleSelectPrizeOption}
          winningHistory={winningHistory}
          onSubmitInquiry={(
            sellerId,
            sellerName,
            orderNumber,
            inquiryType,
            subject,
            content,
          ) => {
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

            const newInquiry: Inquiry = {
              id: `INQ${Date.now()}`,
              customerId: user?.memberId.toString() || "customer1",
              customerName: user?.nickname || "고객",
              sellerId,
              sellerName,
              orderNumber,
              inquiryType,
              subject,
              content,
              status: "pending",
              createdAt: dateStr,
              comments: [],
              isNew: true,
            };

            setInquiries((prev) => [newInquiry, ...prev]);
            showAlert(
              "문의가 성공적으로 전송되었습니다",
              "success",
            );
          }}
        />
      )}
      {screen === "prizeSelection" && (
        <PrizeSelection
          rank={selectedRank}
          prizeName={`${selectedRank}상`}
          availableOptions={getPrizeOptions(selectedRank)}
          onConfirm={handlePrizeOptionConfirm}
          onBack={() => setScreen("winning")}
        />
      )}
      {screen === "wishlist" && (
        <Wishlist
          onBack={() => setScreen("main")}
          onSelectAnime={handleWishlistSelect}
          wishlist={wishlist}
          allCollections={animeCollections}
          onRemoveFromWishlist={handleRemoveFromWishlist}
        />
      )}
      {screen === "settings" && (
        <Settings
          onBack={() =>
            setScreen(
              user?.type === "business"
                ? "businessDashboard"
                : "main",
            )
          }
          user={user}
        />
      )}
      {screen === "support" && (
        <CustomerSupport onBack={() => setScreen("main")} />
      )}
      {screen === "community" && (
        <Community
          onBack={() => setScreen("main")}
          onNavigateToNotice={() => setScreen("notice")}
          onNavigateToSupport={() => setScreen("support")}
          user={user}
        />
      )}
      {screen === "notice" && (
        <Notice onBack={() => setScreen("main")} />
      )}
      {screen === "events" && (
        <Events onBack={() => setScreen("main")} />
      )}

      {/* Business Screens */}
      {screen === "businessDashboard" && (
        <BusinessDashboard
          onNavigate={(screen) => {
            if (screen === "productList")
              setScreen("businessProducts");
            else if (screen === "productRegister")
              setScreen("businessRegister");
            else if (screen === "shipping")
              setScreen("businessShipping");
            else if (screen === "inquiries")
              setScreen("businessInquiries");
          }}
        />
      )}
      {screen === "businessProfile" && user && (
        <BusinessProfile
          user={user}
          onBack={() => setScreen("businessDashboard")}
          onEdit={() => setScreen("profileEdit")}
        />
      )}
      {screen === "businessProducts" && (
        <BusinessProductList
          onBack={() => setScreen("businessDashboard")}
          collections={animeCollections}
          onEdit={(id) => {
            setEditingCollectionId(id);
            setScreen("businessProductEdit");
          }}
        />
      )}
      {screen === "businessProductEdit" &&
        editingCollectionId &&
        animeCollections.find(
          (c) => c.id === editingCollectionId,
        ) && (
          <BusinessProductEdit
            onBack={() => setScreen("businessProducts")}
            collection={
              animeCollections.find(
                (c) => c.id === editingCollectionId,
              )!
            }
            onSave={(updatedCollection) => {
              // In real app, save to backend
              showAlert("상품이 수정되었습니다", "success");
              setScreen("businessProducts");
            }}
          />
        )}
      {screen === "businessRegister" && (
        <BusinessProductRegister
          onBack={() => setScreen("businessDashboard")}
          onComplete={() => {
            showAlert("상품이 등록되었습니다!", "success");
            setScreen("businessProducts");
          }}
          onTempSave={(message) => {
            showAlert(message, "success");
          }}
        />
      )}
      {screen === "businessShipping" && (
        <BusinessShippingManagement
          onBack={() => setScreen("businessDashboard")}
          winningHistory={winningHistory}
          onUpdateShipping={handleUpdateShipping}
        />
      )}
      {screen === "businessInquiries" && (
        <SellerInquiries
          onBack={() => setScreen("businessDashboard")}
          inquiries={inquiries}
          onAddComment={(inquiryId, content) => {
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

            setInquiries((prev) =>
              prev.map((inq) => {
                if (inq.id === inquiryId) {
                  return {
                    ...inq,
                    comments: [
                      ...inq.comments,
                      {
                        id: `CMT${Date.now()}`,
                        author: "seller",
                        authorName: user?.nickname || "판매자",
                        content,
                        date: dateStr,
                        time: timeStr,
                      },
                    ],
                    isNew: false,
                  };
                }
                return inq;
              }),
            );
            showAlert("답변이 등록되었습니다", "success");
          }}
          onEditComment={(inquiryId, commentId, content) => {
            setInquiries((prev) =>
              prev.map((inq) => {
                if (inq.id === inquiryId) {
                  return {
                    ...inq,
                    comments: inq.comments.map((cmt) =>
                      cmt.id === commentId
                        ? { ...cmt, content }
                        : cmt,
                    ),
                  };
                }
                return inq;
              }),
            );
            showAlert("답변이 수정되었습니다", "success");
          }}
          onDeleteComment={(inquiryId, commentId) => {
            setInquiries((prev) =>
              prev.map((inq) => {
                if (inq.id === inquiryId) {
                  return {
                    ...inq,
                    comments: inq.comments.filter(
                      (cmt) => cmt.id !== commentId,
                    ),
                  };
                }
                return inq;
              }),
            );
            showAlert("답변이 삭제되었습니다", "success");
          }}
          onUpdateStatus={(inquiryId, status) => {
            setInquiries((prev) =>
              prev.map((inq) =>
                inq.id === inquiryId ? { ...inq, status } : inq,
              ),
            );
          }}
        />
      )}

      {/* Admin Screens */}
      {screen === "adminDashboard" && (
        <AdminDashboard
          onNavigate={(screen) => {
            if (screen === "noticeManagement")
              setScreen("adminNoticeManagement");
            else if (screen === "eventManagement")
              setScreen("adminEventManagement");
            else if (screen === "inquiryManagement")
              setScreen("adminInquiryManagement");
            else if (screen === "mainBannerManagement")
              setScreen("adminMainBannerManagement");
            else if (screen === "userManagement")
              setScreen("adminUserManagement");
            else if (screen === "users")
              setScreen("adminUserManagement");
            else if (screen === "statistics")
              setScreen("adminStatistics");
            else if (screen === "mainBanner")
              setScreen("adminMainBannerManagement");
          }}
        />
      )}
      {screen === "adminNoticeManagement" && (
        <AdminNoticeManagement
          onBack={() => setScreen("adminDashboard")}
        />
      )}
      {screen === "adminEventManagement" && (
        <AdminEventManagement
          onBack={() => setScreen("adminDashboard")}
        />
      )}
      {screen === "adminInquiryManagement" && (
        <AdminInquiryManagement
          onBack={() => setScreen("adminDashboard")}
          inquiries={inquiries}
          onAddComment={(inquiryId, content) => {
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

            setInquiries((prev) =>
              prev.map((inq) => {
                if (inq.id === inquiryId) {
                  return {
                    ...inq,
                    comments: [
                      ...inq.comments,
                      {
                        id: `CMT${Date.now()}`,
                        author: "seller",
                        authorName: user?.nickname || "관리자",
                        content,
                        date: dateStr,
                        time: timeStr,
                      },
                    ],
                    isNew: false,
                  };
                }
                return inq;
              }),
            );
            showAlert("답변이 등록되었습니다", "success");
          }}
          onUpdateStatus={(inquiryId, status) => {
            setInquiries((prev) =>
              prev.map((inq) =>
                inq.id === inquiryId ? { ...inq, status } : inq,
              ),
            );
          }}
        />
      )}
      {screen === "adminMainBannerManagement" && (
        <AdminMainBannerManagement
          onBack={() => setScreen("adminDashboard")}
          banners={banners}
          setBanners={setBanners}
        />
      )}
      {screen === "adminUserManagement" && (
        <AdminUserManagement
          onBack={() => setScreen("adminDashboard")}
        />
      )}
      {screen === "adminStatistics" && (
        <AdminStatistics
          onBack={() => setScreen("adminDashboard")}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {screen === "kakaoCallback" && (
        <KakaoCallback />
      )}

      {screen === "signup" && (
        <SignUp
          onBack={() => setScreen("login")}
          onSuccess={() => {
            setScreen("login");
            setAlertModal({
              isOpen: true,
              title: "회원가입 성공",
              message: "이제 로그인할 수 있습니다!",
              type: "success",
            });
          }}
        />
      )}
    </div>
  );
}
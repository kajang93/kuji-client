import { useState, useEffect } from "react";
import MainScreen from "./components/MainScreen";
import AnimeList from "./components/AnimeListFixed";
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
import LiveTicker from "./components/LiveTicker";
import { Menu } from "./components/icons";
import { Toaster, toast, toast as sonnerToast } from "sonner";
import KakaoCallback from "./components/KakaoCallback";
import BusinessPending from "./components/BusinessPending";
import PointCharge from "./components/PointCharge";
import { fetchKujiBoards, fetchKujiBoardDetail, drawKuji, fetchMyDrawHistory, fetchSellerKujiBoards, deleteKujiBoard } from "./api/kuji";
import BoardList from "./components/BoardList";
import BoardDetail from "./components/BoardDetail";
import BoardWrite from "./components/BoardWrite";
import { fetchMyProfile } from "./api/auth";
import { toggleWishlist, fetchMyWishlist } from "./api/wishlist";
import { onForegroundMessage } from "./api/firebase";
import { fetchSellerShippingList, completeShipping, updateTrackingInfo } from "./api/shipping";
import { confirmPointCharge } from "./api/points";
import { toAbsoluteUrl } from "./api/client";

import {
  Prize,
  AnimeCollection,
  WinningItem,
  PrizeOption,
  InquiryComment,
  Inquiry,
  ScreenType,
  Banner,
  KujiBoard,
  Post,
  PostCategory,
  ShippingInfo
} from "./shared-types";




export default function App() {
  const [screen, setScreen] = useState<ScreenType>("main");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeCollection | null>(null);
  const [kujiStatus, setKujiStatus] = useState<boolean[]>([]);
  const [revealedPrizes, setRevealedPrizes] = useState<Prize[]>([]);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [selectedKuji, setSelectedKuji] = useState<number[]>([]);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    type: "social" | "business" | "admin";
    points?: number;
    isActive?: boolean; // 추가: 사업자 승인 여부
    profileImageUrl?: string; // 추가: 사용자 프로필 이미지
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [returnToScreen, setReturnToScreen] = useState<
    "detail" | "list" | null
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

  const [animeCollections, setAnimeCollections] = useState<AnimeCollection[]>([]);
  const [sellerCollections, setSellerCollections] = useState<AnimeCollection[]>([]);

  // Fetch Kuji Boards from server
  
  useEffect(() => {
    if (screen === "businessProducts") {
      fetchSellerKujiBoards()
        .then(boards => {
          const mappedCollections = boards.map((board: any) => {
            return {
              id: board.id.toString(),
              name: board.title,
              image: (board.images?.find((img: any) => img.imageType === 'THUMBNAIL')?.imageUrl || board.images?.[0]?.imageUrl) || "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400",
              totalKuji: board.totalCount || 0,
              remainingKuji: board.remainCount || 0,
              gradeCount: board.gradeCount || 0,
              boardId: board.id,
              isWished: board.isWished,
              operationStatus: board.status === 'ACTIVE' ? 'active' : board.status === 'PREPARING' ? 'scheduled' : 'ended',
              pricePerDraw: board.pricePerDraw || 15000,
              prizes: []
            };
          });
          setSellerCollections(mappedCollections);
        })
        .catch(console.error);
    }
  }, [screen]);
  
  const handleFetchBoards = async () => {
    try {
      const boards = await fetchKujiBoards();

      const mappedCollections: AnimeCollection[] = boards.map((board: KujiBoard) => {
        return {
          id: board.id.toString(),
          name: board.title,
          image: toAbsoluteUrl(
            board.images.find((img: any) => img.imageType === 'THUMBNAIL')?.imageUrl ||
            board.images[0]?.imageUrl
          ) || "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400",
          totalKuji: board.totalCount || 0,
          remainingKuji: board.remainCount || 0,
          gradeCount: board.gradeCount || 0,
          boardId: board.id,
          isWished: board.isWished, // 서버에서 받은 찜 여부 매핑
          operationStatus: board.status === 'ACTIVE' ? 'active' :
            board.status === 'PREPARING' ? 'scheduled' : 'ended',
          pricePerDraw: board.pricePerDraw || 15000, // Added price mapping
          prizes: []
        };
      });

      setAnimeCollections(mappedCollections);
      
      // 게시판 목록을 가져올 때 사용자의 찜 상태가 포함되어 있다면 wishlist ID 목록도 업데이트
      const wishedIds = boards
        .filter((b: KujiBoard) => b.isWished)
        .map((b: KujiBoard) => b.id.toString());
      if (wishedIds.length > 0) {
        setWishlist(wishedIds);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    }
  };

  const handleRefresh = async () => {
    await handleFetchBoards();
    if (user?.role === 'ADMIN' || user?.role === 'SELLER') {
      try {
        const boards = await fetchSellerKujiBoards();
        const mappedCollections = boards.map((board: any) => {
          return {
            id: board.id.toString(),
            name: board.title,
            image: board.images?.find((img: any) => img.imageType === 'THUMBNAIL')?.imageUrl || board.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1658233427916-2351b655618f?w=400",
            totalKuji: board.totalCount || 0,
            remainingKuji: board.remainCount || 0,
            gradeCount: board.gradeCount || 0,
            boardId: board.id,
            isWished: board.isWished,
            operationStatus: board.status === 'ACTIVE' ? 'active' : board.status === 'PREPARING' ? 'scheduled' : 'ended',
            pricePerDraw: board.pricePerDraw || 15000,
            prizes: []
          };
        });
        setSellerCollections(mappedCollections);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    handleFetchBoards();
  }, []);

  // Foreground FCM message handler
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground push notification received:", payload);
      const title = payload.notification?.title || payload.data?.title || "알림";
      const body = payload.notification?.body || payload.data?.body || "";
      
      toast.success(
        `${title}\n${body}`,
        {
          duration: 6000,
          position: "top-center"
        }
      );
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Check for existing session or Kakao redirect on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    
    // Toss Payment Redirect Handling
    const payment = urlParams.get("payment");
    const pointCharge = urlParams.get("pointCharge");
    const paymentKey = urlParams.get("paymentKey");
    const orderId = urlParams.get("orderId");
    const amount = urlParams.get("amount");

    if (payment === "success" && paymentKey && orderId && amount) {
      handlePGPaymentCompletion(paymentKey, orderId, amount);
    } else if (payment === "fail") {
      const failMessage = urlParams.get("message") || "결제가 취소되었거나 실패했습니다.";
      localStorage.removeItem("kuji_pending_payment");
      alert(decodeURIComponent(failMessage));
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (pointCharge === "success" && paymentKey && orderId && amount) {
      handlePointChargeCompletion(paymentKey, orderId, amount);
    } else if (pointCharge === "fail") {
      const failMessage = urlParams.get("message") || "충전이 취소되었거나 실패했습니다.";
      localStorage.removeItem("point_charge_pending");
      alert(decodeURIComponent(failMessage));
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.has("code")) {
      setScreen("kakaoCallback");
    } else if (token && token !== "undefined" && token !== "null") {
      handleFetchUserInfo(token);
    }
  }, []);

  const handlePGPaymentCompletion = async (paymentKey: string, orderId: string, amount: string) => {
    try {
      const pendingData = localStorage.getItem("kuji_pending_payment");
      if (!pendingData) {
        alert("결제 대기 정보를 찾을 수 없습니다.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      const { boardId, count } = JSON.parse(pendingData);
      
      // Cleanup URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const result = await drawKuji(boardId, {
        count,
        paymentType: "PG",
        paymentKey,
        orderId,
        amount: Number(amount)
      });
      
      const prizes: Prize[] = result.results.map((p: any) => ({
        ...p,
        id: p.id?.toString() || Math.random().toString(),
        rank: p.grade || p.rank,
        image: toAbsoluteUrl((p.imageUrls && p.imageUrls.length > 0)
          ? p.imageUrls[0]
          : p.imageUrl || p.image),
        totalCount: p.totalQty ?? p.totalCount ?? 0,
        remainingCount: p.remainQty ?? p.remainingCount ?? 0,
        opened: p.opened || [],
        drawHistoryId: p.drawHistoryId
      }));

      localStorage.removeItem("kuji_pending_payment");
      setRevealedPrizes(prizes);
      setScreen("reveal");
      
    } catch (error) {
      console.error("결제 승인 처리 중 오류:", error);
      alert("결제 승인 후 뽑기 처리에 실패했습니다. 관리자에게 문의해주세요.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handlePointChargeCompletion = async (paymentKey: string, orderId: string, amount: string) => {
    try {
      const pendingData = localStorage.getItem("point_charge_pending");
      if (!pendingData) {
        alert("충전 대기 정보를 찾을 수 없습니다.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      
      // Cleanup URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const result = await confirmPointCharge({
        paymentKey,
        orderId,
        amount: Number(amount)
      });
      
      localStorage.removeItem("point_charge_pending");

      const bonusMsg = result.bonusPoints > 0
        ? `\n🎁 보너스 ${result.bonusPoints.toLocaleString()}P 추가 적립!`
        : '';
      alert(`충전 완료! 🎉${bonusMsg}\n총 보유 포인트: ${result.totalPoints.toLocaleString()}P`);
      
      // Refresh user info
      const token = localStorage.getItem("token");
      if (token) {
        await handleFetchUserInfo(token);
      }
      setScreen("main");
    } catch (error) {
      console.error("포인트 충전 처리 중 오류:", error);
      alert("충전 승인 처리에 실패했습니다. 관리자에게 문의해주세요.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleFetchUserInfo = async (token: string) => {
    try {
      const userData = await fetchMyProfile();
      const userRole = userData.role || "USER";
      const formattedUser = {
        name: userData.nickname || userData.name,
        email: userData.email,
        type: (userRole === "ROLE_BUSINESS" || userRole === "BIZ" ? "business" : userRole === "ROLE_ADMIN" || userRole === "ADMIN" ? "admin" : "social") as any,
        points: userData.points || 0,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        profileImageUrl: userData.profileImageUrl || "",
      };

      setUser(formattedUser);
      
      // 사용자 정보 로드 후 찜 목록 및 당첨 내역도 함께 로드
      handleFetchWishlist();
      handleFetchWinningHistory(formattedUser.type);

      if (formattedUser.type === "business" && formattedUser.isActive === false) {
        setScreen("businessPending");
      }
    } catch (error) {
      console.error("Session expired or invalid token:", error);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Notification Settings
  const [notificationSettings, setNotificationSettings] =
    useState({
      pushEnabled: true,
      soundEnabled: false,
      vibrationEnabled: true,
      kakaoWinning: true,
      kakaoDelivery: true,
      kakaoInquiry: true,
      marketingOpen: false,
      marketingRestock: false,
      marketingEvent: false,
      nightPush: false,
    });
  const [winningHistory, setWinningHistory] = useState<
    WinningItem[]
  >([]);

  // 서버에서 당첨 내역 가져오기
  const handleFetchWinningHistory = async (overrideUserType?: "social" | "business" | "admin") => {
    const activeUserType = overrideUserType || user?.type;
    try {
      if (activeUserType === "business") {
        const shippings = await fetchSellerShippingList();
        const mappedWinnings: WinningItem[] = [];
        shippings.forEach(s => {
          if (s.items) {
            s.items.forEach((item: any) => {
              mappedWinnings.push({
                id: `${s.id}-${item.drawHistoryId}`,
                drawHistoryId: item.drawHistoryId,
                date: s.createdAt?.replace('T', ' ').substring(0, 16) || '',
                animeName: item.kujiName || '',
                rank: item.grade || '',
                prizeName: item.itemName || '',
                prizeImage: item.itemImage || '',
                deliveryStatus: 
                  s.status === 'PREPARING' ? 'preparing' :
                  s.status === 'SHIPPING' ? 'shipped' :
                  s.status === 'DELIVERED' ? 'delivered' : 'preparing',
                trackingNumber: s.trackingNumber,
                courierName: s.courierName,
                needsOptionSelection: false,
                isNew: false
              });
            });
          }
        });
        setWinningHistory(mappedWinnings);
      } else {
        const histories = await fetchMyDrawHistory();
        
        const mappedWinnings: WinningItem[] = histories.map(h => ({
          id: `W${h.id}`, // 고유 식별자
          drawHistoryId: h.id,
          date: h.createdAt?.replace('T', ' ').substring(0, 16) || '',
          animeName: h.boardTitle,
          rank: h.grade,
          prizeName: h.itemName,
          prizeImage: h.itemImageUrl,
          deliveryStatus: 
            h.status === 'DRAWN' ? 'stored' :
            h.status === 'SHIPPING_REQUESTED' ? 'preparing' :
            h.status === 'SHIPPING' ? 'shipped' :
            h.status === 'DELIVERED' ? 'delivered' : 'stored',
          needsOptionSelection: (h.grade && /^[A-DG]/i.test(h.grade)),
          isNew: false,
          shippingId: h.shippingId
        }));

        setWinningHistory(mappedWinnings);
      }
    } catch (error) {
      console.error("Failed to fetch winning history:", error);
    }
  };

  // 서버에서 찜 목록 가져오기
  const handleFetchWishlist = async () => {
    try {
      const myWishlist = await fetchMyWishlist();
      setWishlist(myWishlist.map(board => board.id.toString()));
      
      // 전체 목록에서도 찜 상태 동기화
      setAnimeCollections(prev => prev.map(anime => ({
        ...anime,
        isWished: myWishlist.some(w => w.id.toString() === anime.id)
      })));
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  // Inquiries state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Remove static animeCollections array

  const handleAnimeSelect = async (anime: AnimeCollection) => {
    try {
      // 1. Fetch real detail data from server (Backend returns List<KujiItem>)
      const items = await fetchKujiBoardDetail(Number(anime.id));

      // 2. Map backend items to frontend prizes structure
      const updatedPrizes = items.map(p => {
        let parsedOptions = [];
        if ((p as any).options) {
          try {
            parsedOptions = typeof (p as any).options === 'string' ? JSON.parse((p as any).options) : (p as any).options;
          } catch(e) {}
        }
        return {
          ...p,
          id: (p as any).id?.toString() || Math.random().toString(),
          rank: (p as any).grade || (p as any).rank,
          // Match the backend's imageUrls array
          image: ((p as any).imageUrls && (p as any).imageUrls.length > 0)
            ? (p as any).imageUrls[0]
            : (p as any).imageUrl || (p as any).image,
          totalCount: (p as any).totalQty ?? (p as any).totalCount ?? 0,
          remainingCount: (p as any).remainQty ?? (p as any).remainingCount ?? 0,
          opened: (p as any).opened || [],
          options: parsedOptions
        };
      });

      const updatedAnime = {
        ...anime,
        prizes: updatedPrizes,
        totalKuji: updatedPrizes.reduce((sum, p) => sum + p.totalCount, 0),
        remainingKuji: updatedPrizes.reduce((sum, p) => sum + p.remainingCount, 0)
      };

      setSelectedAnime(updatedAnime);
      setScreen("detail");

      // Initialize kuji status from backend data
      const status: boolean[] = [];
      updatedPrizes.forEach(p => {
        if (p.opened) {
          status.push(...p.opened);
        }
      });

      // If status is empty (new board), fill with false
      if (status.length === 0) {
        for (let i = 0; i < updatedAnime.totalKuji; i++) {
          status.push(false);
        }
      }

      setKujiStatus(status);
    } catch (error) {
      console.error("Failed to load board details:", error);
      alert("상품 상세 정보를 가져오는데 실패했습니다.");
    }
  };

  const handlePurchase = (count: number, pointsUsed = 0) => {
    if (!user) {
      // Not logged in - go to login screen
      setPurchaseCount(count);
      setPointsToUse(pointsUsed);
      setReturnToScreen("detail");
      setScreen("login");
    } else {
      // Already logged in - proceed to selection
      setPurchaseCount(count);
      setPointsToUse(pointsUsed);
      setSelectedKuji([]);
      setScreen("selection");
    }
  };

  const handleLogin = (userData: {
    name: string;
    email: string;
    type: "social" | "business" | "admin";
  }) => {
    setUser(userData);
    setIsSidebarOpen(false);

    handleFetchWinningHistory(userData.type);
    handleFetchWishlist();

    // Business users go to dashboard (if active) or pending screen
    if (userData.type === "business") {
      if (userData.isActive === false) {
        setScreen("businessPending");
      } else {
        setScreen("businessDashboard");
      }
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
    setUser(null);
    setIsSidebarOpen(false);
    setScreen("main");
  };

  const handleKujiReveal = async (kujiIndices: number[]) => {
    if (!selectedAnime || !user) return;

    try {
      // 1. Call the real draw API with POINT payment type
      const response = await drawKuji(selectedAnime.id || (selectedAnime as any).boardId, {
        count: kujiIndices.length,
        paymentType: "POINT"
      });

      // 2. Map backend results (KujiItemResponse) to frontend prizes structure
      const prizes: Prize[] = response.results.map((p: any) => ({
        ...p,
        id: p.id?.toString() || Math.random().toString(),
        rank: p.grade || p.rank,
        image: toAbsoluteUrl((p.imageUrls && p.imageUrls.length > 0)
          ? p.imageUrls[0]
          : p.imageUrl || p.image),
        totalCount: p.totalQty ?? p.totalCount ?? 0,
        remainingCount: p.remainQty ?? p.remainingCount ?? 0,
        opened: p.opened || [],
        drawHistoryId: p.drawHistoryId // 추가
      }));

      // 3. Update the board state locally
      const updatedPrizes = selectedAnime.prizes.map(p => {
        // Count how many items of this rank were won
        const countWon = response.results.filter((r: any) => (r.grade || r.rank) === p.rank).length;
        return {
          ...p,
          remainingCount: Math.max(0, p.remainingCount - countWon)
        };
      });

      const updatedAnime = {
        ...selectedAnime,
        prizes: updatedPrizes,
        remainingKuji: response.totalRemaining
      };

      setRevealedPrizes(prizes);
      setSelectedKuji(kujiIndices);
      setSelectedAnime(updatedAnime);

      // Update the collection in the list as well
      setAnimeCollections(prev => prev.map(c =>
        c.id === updatedAnime.id ? updatedAnime : c
      ));

      setScreen("reveal");
    } catch (error: any) {
      console.error("Failed to draw kuji:", error);
      sonnerToast.error(error.message || "추첨 중 오류가 발생했습니다.");
    }
  };

  const handleRevealComplete = (
    destination: "winning" | "detail" = "winning",
  ) => {
    // Add revealed prizes to winning history with isNew flag!
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newWinnings: WinningItem[] = revealedPrizes.map(
      (prize, index) => ({
        id: `W${Date.now()}${index}`,
        drawHistoryId: prize.drawHistoryId,
        date: dateStr,
        animeName: selectedAnime?.name || "알 수 없음",
        rank: prize.rank,
        prizeName: prize.name,
        prizeImage: prize.image,
        deliveryStatus: "stored" as const,
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
    }

    // Go to destination
    if (destination === "winning") {
      setScreen("winning");
      setSelectedAnime(null);
    } else {
      setScreen("detail");
    }

    setRevealedPrizes([]);
    setSelectedKuji([]);
  };

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const getSidebarMenuItems = () => {
    const baseMenu = [
      { id: "main", label: "홈", icon: <Home className="w-5 h-5" /> },
      { id: "list", label: "뽑기 목록", icon: <Ticket className="w-5 h-5" /> },
      { id: "community", label: "커뮤니티", icon: <MessageSquare className="w-5 h-5" /> },
      { id: "support", label: "고객센터", icon: <Support className="w-5 h-5" /> },
    ];
    return baseMenu;
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
      handleFetchWinningHistory(); // 화면 진입 시 최신 데이터 로드
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
    if (navScreen === "businessShipping") {
      handleFetchWinningHistory();
    }
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

  const handleUpdateShipping = async (
    winningId: string,
    status: "preparing" | "shipped" | "delivered",
    trackingNumber?: string,
    courierName?: string
  ) => {
    // winningId is structured as "shippingId-drawHistoryId"
    const parts = winningId.split('-');
    const shippingId = Number(parts[0]);
    if (isNaN(shippingId)) {
      toast.error("올바르지 않은 배송 ID입니다.");
      return;
    }

    try {
      if (status === "shipped") {
        if (!courierName) {
          toast.error("택배사를 선택해주세요.");
          return;
        }
        if (!trackingNumber) {
          toast.error("운송장 번호를 입력해주세요.");
          return;
        }
        await updateTrackingInfo(shippingId, {
          courierName: courierName,
          trackingNumber: trackingNumber
        });
        toast.success("송장 등록 및 배송이 시작되었습니다!");
      } else if (status === "delivered") {
        await completeShipping(shippingId);
        toast.success("배송 완료 처리가 완료되었습니다.");
      }

      // 서버에서 최신 데이터 다시 불러오기
      await handleFetchWinningHistory();
    } catch (error: any) {
      console.error("Failed to update shipping:", error);
      toast.error(error.message || "배송 상태 업데이트에 실패했습니다.");
    }
  };

  const handleConfirmDelivery = async (winningId: string) => {
    const winning = winningHistory.find((w) => w.id === winningId);
    if (!winning || !winning.shippingId) {
      toast.error("올바르지 않은 배송 정보입니다.");
      return;
    }

    try {
      await completeShipping(winning.shippingId);
      toast.success("배송이 확정되었습니다. 이용해 주셔서 감사합니다!");
      await handleFetchWinningHistory();
    } catch (error: any) {
      console.error("Failed to confirm delivery:", error);
      toast.error(error.message || "배송 확정에 실패했습니다.");
    }
  };

  const handleWishlistSelect = (animeId: string) => {
    const anime = animeCollections.find(
      (a) => a.id === animeId,
    );
    if (anime) {
      handleAnimeSelect(anime);
    }
  };

  const handleToggleWishlist = async (animeId: string) => {
    if (!user) {
      setReturnToScreen("list"); // 뒤로가기 시 목록으로 복귀
      setScreen("login");
      return;
    }

    try {
      // 1. 서버 API 호출
      const { wished } = await toggleWishlist(Number(animeId));
      
      // 2. 로컬 상태 업데이트
      setWishlist((prev) => {
        if (wished) {
          return prev.includes(animeId) ? prev : [...prev, animeId];
        } else {
          return prev.filter((id) => id !== animeId);
        }
      });

      // 3. 전체 목록 데이터도 업데이트
      setAnimeCollections(prev => prev.map(anime => 
        anime.id === animeId ? { ...anime, isWished: wished } : anime
      ));

      toast.success(wished ? "찜 목록에 추가되었습니다." : "찜 목록에서 제거되었습니다.");
    } catch (error: any) {
      console.error("Failed to toggle wishlist:", error);
      toast.error(error.message || "찜하기 처리에 실패했습니다.");
    }
  };

  const handleRemoveFromWishlist = async (animeId: string) => {
    try {
      // 찜 해제 API 호출 (토글과 동일한 엔드포인트 사용)
      const { wished } = await toggleWishlist(Number(animeId));
      
      if (!wished) {
        setWishlist((prev) => prev.filter((id) => id !== animeId));
        setAnimeCollections(prev => prev.map(anime => 
          anime.id === animeId ? { ...anime, isWished: false } : anime
        ));
        toast.success("찜 목록에서 제거되었습니다.");
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("찜 해제에 실패했습니다.");
    }
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
            deliveryStatus: "stored" as const, // Keep as stored until shipping request
          };
        }
        return winning;
      }),
    );

    setScreen("winning");
  };

  const handleRequestShipping = (winningIds: string[]) => {
    setWinningHistory((prev) =>
      prev.map((w) => {
        if (winningIds.includes(w.id)) {
          return { ...w, deliveryStatus: "preparing" }; // stored -> preparing
        }
        return w;
      }),
    );

    handleFetchWinningHistory(); // 서버 데이터 갱신

    showAlert(
      `총 ${winningIds.length}건의 배송 신청이 완료되었습니다.`,
      "success",
      "배송 신청 완료",
    );

    // Simulate Kakao Notification
    if (notificationSettings.kakaoDelivery) {
      setTimeout(() => {
        showAlert(
          `[카카오톡 알림톡 전송]\n배송 신청이 접수되었습니다. (운송장 번호 생성 예정)`,
          "info",
          "알림 발송 완료",
        );
      }, 1500);
    }
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

  // Real prize options from backend data
  const getPrizeOptions = (rank: string): PrizeOption[] => {
    const prize = selectedAnime?.prizes.find((p) => p.rank === rank);
    if (prize && prize.options && Array.isArray(prize.options) && prize.options.length > 0) {
      if (typeof prize.options[0] === 'string') {
        return prize.options.map((opt: string, i: number) => ({
          id: `${prize.id}_opt_${i}`,
          name: opt,
          image: prize.image,
          description: ""
        }));
      }
      if (prize.options[0].name) {
        return prize.options.map((opt: any, i: number) => ({
          id: opt.id || `${prize.id}_opt_${i}`,
          name: opt.name,
          image: opt.image || prize.image,
          description: opt.description || ""
        }));
      }
    }

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
    <div className="h-[100dvh] flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-800 overflow-hidden w-full relative">
      {/* Live Ticker - Show on all screens except login/reveal/detail */}
      {screen !== "login" &&
        screen !== "reveal" &&
        screen !== "detail" && <LiveTicker />}

      {/* Hamburger Menu Button - Fixed position */}
      {screen !== "reveal" && screen !== "login" && screen !== "communityWrite" && screen !== "communityDetail" && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-12 right-4 z-30 p-3 bg-rose-500 rounded-full shadow-lg hover:bg-rose-600 transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative w-full"
        id="main-scroll-container"
      >
        <PullToRefresh onRefresh={handleRefresh}>
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
            onToggleWishlist={(anime) => handleToggleWishlist(anime.id)}
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
            onBack={() => {
              setScreen(returnToScreen || "main");
              setReturnToScreen(null);
            }}
          />
        )}
        {screen === "selection" && selectedAnime && (
          <KujiSelection
            boardId={selectedAnime.id}
            totalKuji={selectedAnime.totalKuji}
            purchaseCount={purchaseCount}
            pointsToUse={pointsToUse}
            pricePerKuji={selectedAnime.pricePerDraw || 15000}
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
            onChargePoints={() => setScreen("pointCharge")}
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
        {screen === "pointCharge" && user && (
          <PointCharge
            currentPoints={user.points || 0}
            onBack={() => setScreen("main")}
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
            onConfirmDelivery={handleConfirmDelivery}
            onRequestShipping={handleRequestShipping}
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
                customerId: user?.id || "customer1",
                customerName: user?.name || "고객",
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
            settings={notificationSettings}
            onUpdateSettings={setNotificationSettings}
          />
        )}
        {screen === "community" && (
          <BoardList 
            user={user}
            onWrite={() => {
              if (!user) {
                toast.error("로그인이 필요한 서비스입니다.");
                setIsLoginModalOpen(true);
                return;
              }
              setSelectedPostId(null); // 새 글 작성을 위해 ID 초기화
              setScreen("communityWrite");
            }} 
            onDetail={(id) => {
              setSelectedPostId(id);
              setScreen("communityDetail");
            }} 
          />
        )}

        {screen === "communityDetail" && selectedPostId && (
          <BoardDetail 
            postId={selectedPostId} 
            user={user}
            onBack={() => setScreen("community")} 
            onEdit={() => setScreen("communityWrite")}
          />
        )}

        {screen === "communityWrite" && (
          <BoardWrite 
            postId={selectedPostId || undefined}
            onBack={() => setScreen(selectedPostId ? "communityDetail" : "community")} 
            onSuccess={() => setScreen(selectedPostId ? "communityDetail" : "community")} 
          />
        )}

        {screen === "support" && (
          <CustomerSupport onBack={() => setScreen("main")} />
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
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onLogout={handleLogout}
            onNavigate={(screen) => {
              if (screen === "productList")
                setScreen("businessProducts");
              else if (screen === "productRegister")
                setScreen("businessRegister");
              else if (screen === "shipping") {
                handleFetchWinningHistory();
                setScreen("businessShipping");
              }
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
            onOpenSidebar={() => setIsSidebarOpen(true)}
            collections={sellerCollections}
            onDelete={async (id) => {
              if (window.confirm("정말로 이 상품을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.")) {
                try {
                  await deleteKujiBoard(Number(id));
                  setSellerCollections(prev => prev.filter(c => c.id !== id));
                  alert("상품이 성공적으로 삭제되었습니다.");
                } catch (e) {
                  console.error(e);
                  alert("상품 삭제에 실패했습니다.");
                }
              }
            }}
            onEdit={async (id) => {
              try {
                // Fetch full details of items (Backend returns List<KujiItem>)
                const items = await fetchKujiBoardDetail(Number(id));
                const updatedPrizes = items.map(p => ({
                  ...p,
                  id: (p as any).id?.toString() || Math.random().toString(),
                  rank: (p as any).grade || (p as any).rank,
                  // Match the backend's imageUrls array
                  image: ((p as any).imageUrls && (p as any).imageUrls.length > 0)
                    ? (p as any).imageUrls[0]
                    : (p as any).imageUrl || (p as any).image,
                  totalCount: (p as any).totalQty ?? (p as any).totalCount ?? 0,
                  remainingCount: (p as any).remainQty ?? (p as any).remainingCount ?? 0,
                  opened: (p as any).opened || []
                }));

                // Update the collection in our global state to include prizes
                setAnimeCollections(prev => prev.map(c =>
                  c.id === id ? {
                    ...c,
                    prizes: updatedPrizes,
                    totalKuji: updatedPrizes.reduce((sum, p) => sum + p.totalCount, 0),
                    remainingKuji: updatedPrizes.reduce((sum, p) => sum + p.remainingCount, 0)
                  } : c
                ));

                setEditingCollectionId(id);
                setScreen("businessProductEdit");
              } catch (error) {
                console.error("Failed to fetch product details for editing:", error);
                alert("상품 정보를 불러오는데 실패했습니다.");
              }
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
                          authorName: user?.name || "판매자",
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
                  inq.id === inquiryId
                    ? { ...inq, status }
                    : inq,
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
                          authorName: user?.name || "관리자",
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

              // Simulate KakaoTalk Notification for Inquiry Reply
              if (notificationSettings.kakaoInquiry) {
                setTimeout(() => {
                  showAlert(
                    `[카카오톡 알림톡 전송]\n문의하신 내용에 답변이 등록되었습니다.`,
                    "info",
                    "알림 발송 완료",
                  );
                }, 1500);
              }
            }}
            onUpdateStatus={(inquiryId, status) => {
              setInquiries((prev) =>
                prev.map((inq) =>
                  inq.id === inquiryId
                    ? { ...inq, status }
                    : inq,
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
        {screen === "kakaoCallback" && (
          <KakaoCallback
            onLoginSuccess={(token, userData) => {
              localStorage.setItem("token", token);
              // Format user data to match app state
              const formattedUser = {
                name: userData.nickname || userData.name,
                email: userData.email,
                type: (userData.role === "BIZ" ? "business" : "social") as any,
                points: userData.points || 0,
                profileImageUrl: userData.profileImageUrl || "",
              };
              setUser(formattedUser);

              // Remove code from URL without refreshing
              window.history.replaceState({}, document.title, window.location.pathname);

              if (formattedUser.type === "business") {
                setScreen("businessDashboard");
              } else {
                setScreen("main");
                // 찜 목록 로드
                handleFetchWishlist();
              }
              sonnerToast.success("로그인에 성공했습니다!");
            }}
            onLoginFailure={(error) => {
              setScreen("login");
              window.history.replaceState({}, document.title, window.location.pathname);
              sonnerToast.error(`로그인 실패: ${error}`);
            }}
          />
        )}
        {screen === "businessPending" && (
          <BusinessPending
            user={user}
            onBack={() => {
              handleLogout();
            }}
          />
        )}
      </div>

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

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
      <Toaster position="top-center" richColors />
    </div>
  );
}
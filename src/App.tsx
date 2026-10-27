import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainScreen from "./components/MainScreen";
import AnimeList from "./components/AnimeListFixed";
import PrizeDetail from "./components/PrizeDetail";
import KujiSelection from "./components/KujiSelection";
import KujiReveal from "./components/KujiReveal";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import BusinessSidebar from "./components/BusinessSidebar";
import AdminSidebar from "./components/AdminSidebar";
import AdminScreens from "./components/screens/AdminScreens";
import BusinessScreens from "./components/screens/BusinessScreens";
import Profile from "./components/Profile";
import ProfileEdit from "./components/ProfileEdit";
import PurchaseHistory from "./components/PurchaseHistory";
import WinningHistory from "./components/WinningHistory";
import Wishlist from "./components/Wishlist";
import Settings from "./components/Settings";
import CustomerSupport from "./components/CustomerSupport";
import PrizeSelection from "./components/PrizeSelection";
import { useGlobalGestures } from "./hooks/useGlobalGestures";
import { useRefreshOnPageShow } from "./hooks/useRefreshOnPageShow";
import Notice from "./components/Notice";
import Events from "./components/Events";
import AlertModal from "./components/AlertModal";
import LiveTicker from "./components/LiveTicker";
import { Menu } from "./components/icons";
import { Toaster, toast, toast as sonnerToast } from "sonner";
import KakaoCallback from "./components/KakaoCallback";
import NaverCallback from "./components/NaverCallback";
import GoogleCallback from "./components/GoogleCallback";
import PointCharge from "./components/PointCharge";
import PaymentRecoveryNotice from "./components/PaymentRecoveryNotice";
import { fetchKujiBoards, fetchKujiBoardDetail, drawKuji, fetchMyDrawHistory, fetchSellerKujiBoards } from "./api/kuji";
import BoardList from "./components/BoardList";
import BoardDetail from "./components/BoardDetail";
import BoardWrite from "./components/BoardWrite";
import { fetchMyProfile, logout } from "./api/auth";
import { getToken } from "./api/axiosInstance";
import { toggleWishlist, fetchMyWishlist } from "./api/wishlist";
import { onForegroundMessage } from "./api/firebase";
import { fetchSellerShippingList, completeShipping, updateTrackingInfo } from "./api/shipping";
import { confirmPointCharge } from "./api/points";
import { fetchPaymentStatus, type PaymentStatus } from "./api/payments";
import { clearPaymentRecovery, readPaymentRecovery, resolvePaymentRecovery, savePaymentReturn, type PaymentKind, type PendingPaymentRecovery } from "./utils/paymentRecovery";
import { mapBoardToCollection, mapKujiItemToPrize } from "./utils/kujiMappers";

import {
  Prize,
  AnimeCollection,
  WinningItem,
  PrizeOption,
  CustomerInquiry,
  ScreenType,
  Banner,
  KujiBoard,
} from "./shared-types";



import { useScreen } from "./hooks/useScreen";

export default function App() {

  const [screen, setScreen] = useScreen();
  const navigate = useNavigate();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeCollection | null>(null);
  const [kujiStatus, setKujiStatus] = useState<boolean[]>([]);
  const [revealedPrizes, setRevealedPrizes] = useState<Prize[]>([]);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [user, setUser] = useState<{
    memberId?: number;
    name: string;
    email: string;
    type: "social" | "business" | "admin";
    points?: number;
    isActive?: boolean; // 추가: 사업자 승인 여부
    businessStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    businessRejectReason?: string | null;
    profileImageUrl?: string; // 추가: 사용자 프로필 이미지
  } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPaymentRecovery | null>(readPaymentRecovery);
  const [paymentRecoveryBusy, setPaymentRecoveryBusy] = useState(false);
  const [paymentRecoveryMessage, setPaymentRecoveryMessage] = useState("이전에 진행한 결제의 결과를 확인하고 있습니다.");
  const paymentRequests = useRef(new Set<string>());
  const pointDrawPending = useRef(false);
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
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });
  useGlobalGestures(screen, setScreen, returnToScreen);
useRefreshOnPageShow(handleRefresh);
  const [animeCollections, setAnimeCollections] = useState<AnimeCollection[]>([]);
  const [sellerCollections, setSellerCollections] = useState<AnimeCollection[]>([]);

  // Fetch Kuji Boards from server
  const fetchSellerCollectionsWithPrizes = async () => {
    const boards = await fetchSellerKujiBoards();
    const collections = await Promise.all(
      boards.map(async (board) => {
        const collection = mapBoardToCollection(board);
        const boardPrizes = board.prizes?.map(mapKujiItemToPrize) || [];
        const detailPrizes =
          boardPrizes.length > 0
            ? boardPrizes
            : (await fetchKujiBoardDetail(board.id)).map(mapKujiItemToPrize);

        return {
          ...collection,
          prizes: detailPrizes,
          totalKuji: detailPrizes.reduce((sum, prize) => sum + prize.totalCount, 0),
          remainingKuji: detailPrizes.reduce((sum, prize) => sum + prize.remainingCount, 0),
        };
      }),
    );

    setSellerCollections(collections);
  };
  
  useEffect(() => {
    if (screen === "businessProducts") {
      fetchSellerCollectionsWithPrizes()
        .catch(console.error);
    }
  }, [screen]);
  
  const handleFetchBoards = async () => {
    try {
      const boards = await fetchKujiBoards();

      const mappedCollections: AnimeCollection[] = boards.map(mapBoardToCollection);

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

async function handleRefresh() {
  await handleFetchBoards();
  if (user?.type === 'admin' || user?.type === 'business') {
    try {
      await fetchSellerCollectionsWithPrizes();
    } catch (e) {
      console.error(e);
    }
  }
}

  useEffect(() => {
    handleFetchBoards();
  }, []);

  // Foreground FCM message handler
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground push notification received:", payload);
      
      // 당첨 알림(WINNING)은 KujiReveal에서 개별적으로 토스트를 띄우므로(스포일러 방지) 여기서 무시
      if (payload.data?.subType === 'WINNING') {
        return;
      }
      
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
    if (screen === "kakaoCallback" || screen === "naverCallback" || screen === "googleCallback") {
      return;
    }
    const token = getToken();
    const urlParams = new URLSearchParams(window.location.search);
    
    // Toss Payment Redirect Handling
    const payment = urlParams.get("payment");
    const pointCharge = urlParams.get("pointCharge");
    const paymentKey = urlParams.get("paymentKey");
    const orderId = urlParams.get("orderId");
    const amount = urlParams.get("amount");
    const sharedPostId = Number(urlParams.get("postId"));

    if (payment === "success" && paymentKey && orderId && amount) {
      handlePaymentReturn("kuji", orderId, { paymentKey, amount });
    } else if (payment === "fail") {
      handlePaymentReturn("kuji", orderId);
    } else if (pointCharge === "success" && paymentKey && orderId && amount) {
      handlePaymentReturn("points", orderId, { paymentKey, amount });
    } else if (pointCharge === "fail") {
      handlePaymentReturn("points", orderId);
    } else if (Number.isInteger(sharedPostId) && sharedPostId > 0) {
      setSelectedPostId(sharedPostId);
      setScreen("communityDetail");
      if (token && token !== "undefined" && token !== "null") {
        handleFetchUserInfo();
      }
    } else if (urlParams.get("action") === "signup") {
      setScreen("login");
    } else if (urlParams.has("code")) {
      navigate(`/auth/kakao/callback${window.location.search}`, { replace: true });
      return;
    } else if (window.location.hash.includes("access_token")) {
      const state = new URLSearchParams(window.location.hash.substring(1)).get("state");
      if (state && state === sessionStorage.getItem("oauth_state_google")) {
        navigate(`/auth/google/callback${window.location.hash}`, { replace: true });
      } else if (state && state === sessionStorage.getItem("oauth_state_naver")) {
        navigate(`/auth/naver/callback${window.location.hash}`, { replace: true });
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
        setScreen("login");
        toast.error("로그인 요청을 확인할 수 없습니다. 다시 로그인해 주세요.");
      }
      return;
    } else if (token && token !== "undefined" && token !== "null") {
      handleFetchUserInfo();
    }

    // 새로고침으로 화면에 필요한 선택 상태가 사라지면 목록으로 돌아갑니다.
    if ((screen === "detail" || screen === "selection") && payment !== "success") {
      setScreen("list");
    } else if (screen === "reveal" && payment !== "success") {
      setScreen("winning");
    } else if (screen === "communityDetail" && !(Number.isInteger(sharedPostId) && sharedPostId > 0)) {
      setScreen("community");
    } else if (screen === "businessProductEdit") {
      setScreen("businessProducts");
    } else if (screen === "prizeSelection") {
      setScreen("winning");
    }
  }, []);

  const handlePaymentReturn = (kind: PaymentKind, orderId: string | null, callback?: { paymentKey: string; amount: string }) => {
    try {
      if (!orderId) throw new Error("주문 정보가 없습니다.");
      // 복구 정보를 저장한 뒤 주소에서 결제 키를 제거한다.
      const recovery = savePaymentReturn(kind, orderId, callback);
      setPendingPayment(recovery);
      window.history.replaceState({}, document.title, window.location.pathname);
      void recoverPayment(recovery);
    } catch {
      setScreen("main");
      toast.error("결제 정보를 확인하지 못했습니다. 이 화면을 유지하고 고객센터에 문의해 주세요.");
    }
  };

  const applyPaymentStatus = async (payment: PendingPaymentRecovery, status: PaymentStatus) => {
    if (status === "COMPLETED") {
      clearPaymentRecovery(payment);
      setPendingPayment(null);
      await handleFetchUserInfo();
      setScreen(payment.kind === "kuji" ? "winning" : "main");
      toast.success(payment.kind === "kuji" ? "이미 완료된 결제입니다. 당첨 내역에서 결과를 확인해 주세요." : "충전이 완료됐습니다. 포인트와 충전 내역을 확인해 주세요.");
    } else if (status === "CANCELLED" || status === "FAILED") {
      clearPaymentRecovery(payment);
      setPendingPayment(null);
      setScreen("main");
      toast.info(status === "CANCELLED" ? "결제 취소가 확인됐습니다." : "결제가 승인되지 않은 것으로 확인됐습니다.");
    } else {
      setPaymentRecoveryMessage(status === "RECOVERING"
        ? "결제 결과를 확인하고 있습니다. 확인이 끝날 때까지 추가 결제를 하지 말고 잠시 후 상태를 다시 확인해 주세요."
        : payment.kind === "kuji" && payment.paymentKey && (!payment.boardId || !payment.count)
        ? "결제한 상품 정보를 확인할 수 없습니다. 추가 결제를 하지 말고 고객센터에 문의해 주세요."
        : "아직 결제 완료가 확인되지 않았습니다. 잠시 후 상태를 다시 확인해 주세요.");
    }
  };

  const recoverPayment = async (payment: PendingPaymentRecovery) => {
    if (paymentRequests.current.has(payment.orderId)) return;
    setPendingPayment(payment);
    if (!getToken()) {
      setPaymentRecoveryMessage("결제한 계정으로 로그인하면 이전 결제 결과를 계속 확인할 수 있습니다.");
      return;
    }
    paymentRequests.current.add(payment.orderId);
    setPaymentRecoveryBusy(true);
    setPaymentRecoveryMessage("이전에 진행한 결제의 결과를 확인하고 있습니다.");
    try {
      const outcome = await resolvePaymentRecovery<{ kind: "kuji"; prizes: Prize[] } | { kind: "points"; totalPoints: number }>(payment, {
        getStatus: fetchPaymentStatus,
        confirm: async (saved) => {
          if (saved.kind === "kuji") {
            const result = await drawKuji(saved.boardId!, {
              count: saved.count!,
              paymentType: "PG",
              paymentKey: saved.paymentKey,
              orderId: saved.orderId,
              amount: saved.amount,
            });
            return { kind: "kuji", prizes: result.results.map(mapKujiItemToPrize) };
          }
          const result = await confirmPointCharge({ paymentKey: saved.paymentKey, orderId: saved.orderId, amount: saved.amount });
          return { kind: "points", totalPoints: result.totalPoints };
        },
      });
      if (outcome.result) {
        clearPaymentRecovery(payment);
        setPendingPayment(null);
        await handleFetchUserInfo();
        if (outcome.result.kind === "kuji") {
          setRevealedPrizes(outcome.result.prizes);
          setScreen("reveal");
        } else {
          setScreen("main");
          toast.success(`충전이 완료됐습니다. 총 보유 포인트는 ${outcome.result.totalPoints.toLocaleString()}P입니다.`);
        }
      } else {
        await applyPaymentStatus(payment, outcome.status);
      }
    } catch {
      setPaymentRecoveryMessage(getToken()
        ? "결제 상태를 아직 확인하지 못했습니다. 결제한 계정인지 확인하고 추가 결제 없이 상태를 다시 확인해 주세요."
        : "결제한 계정으로 로그인하면 이전 결제 결과를 계속 확인할 수 있습니다.");
    } finally {
      paymentRequests.current.delete(payment.orderId);
      setPaymentRecoveryBusy(false);
    }
  };

  useEffect(() => {
    if (screen === "kakaoCallback" || screen === "naverCallback" || screen === "googleCallback") return;
    const recovery = readPaymentRecovery();
    if (recovery) void recoverPayment(recovery);
  }, [user?.email]);

  const handleFetchUserInfo = async () => {
    try {
      const userData = await fetchMyProfile();
      const userRole = userData.role || "USER";
      const formattedUser = {
        memberId: userData.memberId,
        name: userData.nickname || userData.email,
        email: userData.email,
        type: (userRole === "ROLE_BUSINESS" || userRole === "BIZ" ? "business" : userRole === "ROLE_ADMIN" || userRole === "ADMIN" ? "admin" : "social") as "business" | "admin" | "social",
        points: userData.points || 0,
        isActive: userRole === 'BIZ' || userRole === 'ROLE_BUSINESS' ? userData.businessStatus === 'APPROVED' : true,
        businessStatus: userData.businessStatus,
        businessRejectReason: userData.businessRejectReason,
        profileImageUrl: userData.profileImageUrl || "",
        phone: userData.phoneNumber,
        birthdate: userData.birthDate,
        address: userData.address,
        addressDetail: userData.addressDetail,
        joinDate: userData.createdAt ? String(userData.createdAt).substring(0, 10) : undefined,
      };

      setUser(formattedUser);
      
      // 사용자 정보 로드 후 찜 목록 및 당첨 내역도 함께 로드
      if (formattedUser.type === "social") {
        handleFetchWishlist();
      }
      handleFetchWinningHistory(formattedUser.type);

      if (formattedUser.type === "business" && formattedUser.isActive === false) {
        setScreen("businessPending");
      } else if (formattedUser.type === 'business' && screen === 'businessPending') {
        setScreen('businessDashboard');
      }
    } catch (error) {
      console.error("Session expired or invalid token:", error);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      // 세션이 무효인데 로그인 전제 화면에 머물러 있으면 빈 화면이 되므로 메인으로 복귀
      setScreen(prev =>
        ([
          "profile", "profileEdit", "pointCharge", "purchase", "winning", "wishlist",
          "businessDashboard", "businessProfile", "businessProducts", "businessRegister",
          "businessShipping", "businessInquiries", "businessPending", "businessProductEdit",
          "adminDashboard", "adminNoticeManagement", "adminEventManagement", "adminInquiryManagement",
          "adminMainBannerManagement", "adminUserManagement", "adminPromotionManagement", "adminStatistics",
        ] as ScreenType[]).includes(prev) ? "main" : prev
      );
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
      kakaoBizOrder: true,
      kakaoBizCancel: true,
      kakaoBizInquiry: true,
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
            s.items.forEach((item) => {
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
                isNew: false,
                sellerName: user?.name || '내 상점'
              });
            });
          }
        });
        setWinningHistory(mappedWinnings);
      } else {
        const histories = await fetchMyDrawHistory();
        
        if (!histories || !Array.isArray(histories)) {
          setWinningHistory([]);
          return;
        }

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
          needsOptionSelection: !!(h.grade && /^[A-DG]/i.test(h.grade)),
          isNew: false,
          shippingId: h.shippingId,
          sellerName: h.sellerName || '알 수 없는 판매처'
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
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);

  // Remove static animeCollections array

  const handleAnimeSelect = async (anime: AnimeCollection) => {
    try {
      // 1. Fetch real detail data from server (Backend returns List<KujiItem>)
      const items = await fetchKujiBoardDetail(Number(anime.id));

      // 2. Map backend items to frontend prizes structure
      const updatedPrizes = items.map(mapKujiItemToPrize);

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
      setScreen("selection");
    }
  };

  const handleLogin = (userData: {
    memberId?: number;
    name: string;
    email: string;
    type: "social" | "business" | "admin";
    isActive?: boolean;
    businessStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    businessRejectReason?: string | null;
    points?: number;
  }) => {
    setUser(userData);
    setIsSidebarOpen(false);

    handleFetchWinningHistory(userData.type);
    if (userData.type === "social") {
      handleFetchWishlist();
    }

    // Business users go to dashboard (if active) or pending screen
    if (userData.type === "business") {
      if (userData.businessStatus !== 'APPROVED') {
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
    showConfirm("로그아웃 하시겠습니까?", async () => {
      try {
        await logout();
        setUser(null);
        setScreen("main");
        setIsSidebarOpen(false);
        toast.success("로그아웃 되었습니다.");
      } catch (error) {
        console.error("서버 로그아웃 실패:", error);
        toast.error("로그아웃하지 못했습니다. 연결 상태를 확인하고 다시 시도해주세요.");
      }
    }, "로그아웃", "info");
  };

  // 소셜 로그인(카카오/네이버/구글) 콜백 공통 처리
  const handleSocialLoginSuccess = (successMessage: string) =>
    (token: string, userData: any) => {
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
      const formattedUser = {
        memberId: userData.memberId,
        name: userData.nickname || userData.email,
        email: userData.email,
        type: (userData.role === "BIZ" ? "business" : userData.role === 'ADMIN' ? 'admin' : "social") as "business" | "admin" | "social",
        points: userData.points || 0,
        isActive: userData.role === 'BIZ' ? userData.businessStatus === 'APPROVED' : true,
        businessStatus: userData.businessStatus,
        businessRejectReason: userData.businessRejectReason,
        profileImageUrl: userData.profileImageUrl || "",
      };
      setUser(formattedUser);

      // Remove OAuth params from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);

      if (formattedUser.type === "business") {
        setScreen(formattedUser.businessStatus === 'APPROVED' ? 'businessDashboard' : 'businessPending');
      } else if (formattedUser.type === 'admin') {
        setScreen('adminDashboard');
      } else {
        setScreen("main");
        handleFetchWishlist();
      }
      sonnerToast.success(successMessage);
    };

  const handleSocialLoginFailure = (error: string) => {
    setScreen("login");
    window.history.replaceState({}, document.title, window.location.pathname);
    sonnerToast.error(`로그인 실패: ${error}`);
  };

  const handleKujiReveal = async (kujiIndices: number[]) => {
    if (!selectedAnime || !user || kujiIndices.length === 0 || pointDrawPending.current) return;
    pointDrawPending.current = true;

    try {
      // 1. Call the real draw API with POINT payment type
      const response = await drawKuji(Number(selectedAnime.id), {
        count: kujiIndices.length,
        paymentType: "POINT"
      });

      // 2. Map backend results (KujiItemResponse) to frontend prizes structure
      const prizes: Prize[] = response.results.map(mapKujiItemToPrize);

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
      setSelectedAnime(updatedAnime);

      // 사용한 포인트 로컬 상태 차감
      if (pointsToUse > 0) {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            points: Math.max(0, (prev.points || 0) - pointsToUse)
          };
        });
      }

      // Update the collection in the list as well
      setAnimeCollections(prev => prev.map(c =>
        c.id === updatedAnime.id ? updatedAnime : c
      ));

      setScreen("reveal");
    } catch (error: any) {
      console.error("Failed to draw kuji:", error);
      sonnerToast.error(error.message || "추첨 중 오류가 발생했습니다.");
    } finally {
      pointDrawPending.current = false;
    }
  };

  const handleRevealComplete = async (
    destination: "winning" | "detail" = "winning",
  ) => {
    try {
      const histories = await fetchMyDrawHistory();
      const revealedIds = revealedPrizes.map(p => p.drawHistoryId);

      if (Array.isArray(histories)) {
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
          needsOptionSelection: !!(h.grade && /^[A-DG]/i.test(h.grade)),
          isNew: revealedIds.includes(h.id),
          shippingId: h.shippingId,
          sellerName: h.sellerName || '알 수 없는 판매처'
        }));
        setWinningHistory(mappedWinnings);
      }
    } catch (error) {
      console.error("Failed to update winning history:", error);
    }

    // 포인트 적립: 쿠지 판에 설정된 적립 포인트(rewardRate) 반영
    if (user) {
      const earnedPoints = revealedPrizes.length * (selectedAnime?.rewardRate || 0);
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
      | "notice"
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
    courierName?: string,
    courierPhone?: string
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
          trackingNumber: trackingNumber,
          courierPhone: courierPhone?.trim() || undefined
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

  };

  // Alert function
  const showAlert = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    title?: string,
  ) => {
    setAlertModal({ isOpen: true, message, type, title, onConfirm: undefined });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    title: string = "확인",
    type: "warning" | "info" = "warning"
  ) => {
    setAlertModal({ isOpen: true, message, type, title, onConfirm });
  };

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Real prize options from backend data
  const getPrizeOptions = (rank: string): PrizeOption[] => {
    const prizesForRank = selectedAnime?.prizes.filter((p) => p.rank === rank) || [];
    
    // 해당 등급(rank)에 등록된 모든 상품들을 옵션으로 매핑하여 반환합니다.
    return prizesForRank.map((prize) => ({
      id: prize.id,
      name: prize.name,
      image: prize.image,
      description: `남은 수량: ${prize.remainingCount}개`
    }));
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden relative w-full" id="main-scroll-container">

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
            onToggleWishlist={(anime) => handleToggleWishlist(anime.id)}
          />
        )}
        {screen === "detail" && selectedAnime && (
          <PrizeDetail
            anime={selectedAnime}
            onBack={() => setScreen("list")}
            onPurchase={handlePurchase}
            user={user ? { ...user, points: user.points || 0 } : null}
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
            boardId={Number(selectedAnime.id)}
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
            onBack={() => setScreen(user.type === "business" ? "businessProfile" : "profile")}
            onSave={(userData) => {
              setUser({ 
                ...user, 
                ...userData,
                profileImageUrl: userData.profileImage || user.profileImageUrl
              });
              setScreen(user.type === "business" ? "businessProfile" : "profile");
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

              const newInquiry: CustomerInquiry = {
                id: `INQ${Date.now()}`,
                customerId: user?.email || "customer1",
                customerName: user?.name || "고객",
                sellerId,
                sellerName,
                orderNumber,
                inquiryType: inquiryType === "주문" || inquiryType === "배송" || inquiryType === "결제" || inquiryType === "상품문의" ? inquiryType : "기타",
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
            onBack={() => setScreen("main")}
            onWrite={() => {
              if (!user) {
                toast.error("로그인이 필요한 서비스입니다.");
                setScreen("login");
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
            onBack={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete("postId");
              window.history.replaceState({}, document.title, url.toString());
              setScreen("community");
            }}
            onEdit={() => setScreen("communityWrite")}
          />
        )}

        {screen === "communityWrite" && (
          <BoardWrite 
            postId={selectedPostId || undefined}
            user={user}
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
        <BusinessScreens
          screen={screen}
          setScreen={setScreen}
          setIsSidebarOpen={setIsSidebarOpen}
          user={user}
          sellerCollections={sellerCollections}
          setSellerCollections={setSellerCollections}
          editingCollectionId={editingCollectionId}
          setEditingCollectionId={setEditingCollectionId}
          winningHistory={winningHistory}
          inquiries={inquiries}
          setInquiries={setInquiries}
          showAlert={showAlert}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
          onRefreshAccount={handleFetchUserInfo}
          onFetchWinningHistory={handleFetchWinningHistory}
          onUpdateShipping={handleUpdateShipping}
        />

        {/* Admin Screens */}
        <AdminScreens
          screen={screen}
          setScreen={setScreen}
          setIsSidebarOpen={setIsSidebarOpen}
          banners={banners}
          setBanners={setBanners}
        />

        {screen === "kakaoCallback" && (
          <KakaoCallback
            onLoginSuccess={handleSocialLoginSuccess("로그인에 성공했습니다!")}
            onLoginFailure={handleSocialLoginFailure}
          />
        )}
        {screen === "naverCallback" && (
          <NaverCallback
            onLoginSuccess={handleSocialLoginSuccess("네이버 로그인에 성공했습니다!")}
            onLoginFailure={handleSocialLoginFailure}
          />
        )}
        {screen === "googleCallback" && (
          <GoogleCallback
            onLoginSuccess={handleSocialLoginSuccess("구글 로그인에 성공했습니다!")}
            onLoginFailure={handleSocialLoginFailure}
          />
        )}

    </div>

      {/* Sidebar - Different for Business Users */}
      {user?.type === "business" ? (
        <BusinessSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={{ ...user, type: "business" }}
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
          user={{ ...user, type: "admin" }}
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
          user={user ? { ...user, type: "social" } : null}
          onLogout={handleLogout}
          onLogin={() => {
            setIsSidebarOpen(false);
            setScreen("login");
          }}
          onNavigate={handleSidebarNavigate}
        />
      )}

      {pendingPayment && (
        <PaymentRecoveryNotice
          message={paymentRecoveryMessage}
          busy={paymentRecoveryBusy}
          needsLogin={!getToken()}
          onCheck={() => void recoverPayment(pendingPayment)}
          onLogin={() => setScreen("login")}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
      <Toaster
        position="top-center"
        richColors
        visibleToasts={1}
        duration={2500}
        offset="calc(env(safe-area-inset-top) + 12px)"
      />
    </div>
  );
}

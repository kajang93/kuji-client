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
import PolicyContent from "./components/PolicyContent";
import KujiExperience from "./components/KujiExperience";
import { POLICY_TITLES } from "./constants/policies";
import PrizeSelection from "./components/PrizeSelection";
import { useGlobalGestures } from "./hooks/useGlobalGestures";
import { useRefreshOnPageShow } from "./hooks/useRefreshOnPageShow";
import Notice from "./components/Notice";
import Events from "./components/Events";
import AlertModal from "./components/AlertModal";
import LiveTicker from "./components/LiveTicker";
import { ChevronLeft, Menu } from "./components/icons";
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
import { fetchCompletedKujiResult, fetchPaymentStatus, type CompletedKujiResult, type PaymentStatus } from "./api/payments";
import { clearPaymentRecovery, clearUnopenedKujiOrder, readPaymentRecovery, readUnopenedKujiOrder, resolvePaymentRecovery, savePaymentReturn, saveUnopenedKujiOrder, type PaymentKind, type PendingPaymentRecovery } from "./utils/paymentRecovery";
import { mapBoardToCollection, mapKujiItemToPrize, getRegularPrizeStock, isLastPrize } from "./utils/kujiMappers";
import { clearAuthReturn, parseBoardId, readAuthReturn, saveAuthReturn, type AuthReturnContext } from "./utils/authReturn";
import { trackFunnelEvent } from "./utils/funnelAnalytics";

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
  // 상품 상세에서 연 무료 체험이면 그 상품, 메인·목록에서 열었으면 null(달빛 서점 기본 체험)
  const [experienceSource, setExperienceSource] = useState<AnimeCollection | null>(null);
  const [selectedAnime, setSelectedAnime] =
    useState<AnimeCollection | null>(null);
  const [kujiStatus, setKujiStatus] = useState<boolean[]>([]);
  const [revealedPrizes, setRevealedPrizes] = useState<Prize[]>([]);
  const [purchaseCount, setPurchaseCount] = useState(1);
  const [boardLoading, setBoardLoading] = useState(false);
  const boardRequestVersion = useRef(0);
  const boardNavigationPending = useRef(false);
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
  const [pendingPayment, setPendingPayment] = useState<PendingPaymentRecovery | null>(() => {
    const recovery = readPaymentRecovery();
    const unopenedOrder = readUnopenedKujiOrder();
    return recovery || (unopenedOrder ? { kind: "kuji", orderId: unopenedOrder } : null);
  });
  const [paymentRecoveryBusy, setPaymentRecoveryBusy] = useState(false);
  const [viewingRecoveryHistory, setViewingRecoveryHistory] = useState(false);
  const [paymentRecoveryMessage, setPaymentRecoveryMessage] = useState("이전에 진행한 결제의 결과를 확인하고 있습니다.");
  const paymentRequests = useRef(new Map<string, number>());
  const activePayment = useRef(pendingPayment);
  const revealedOrder = useRef<string | null>(null);
  const mounted = useRef(false);
  const paymentRequestVersion = useRef(0);
  const authVersion = useRef(0);
  const currentScreen = useRef(screen);
  currentScreen.current = screen;
  const callbackParams = new URLSearchParams(window.location.search);
  const hasPaymentReturn = callbackParams.has("payment") || callbackParams.has("pointCharge");
  const isAuthCallback = screen === "kakaoCallback" || screen === "naverCallback" || screen === "googleCallback";
  const isPublicPolicy = screen === "privacy" || screen === "terms";
  const isPublicReadOnly = isPublicPolicy || screen === "experience";
  const showingPaymentReturn = screen === "paymentReturn" || (!isAuthCallback && !isPublicReadOnly && screen !== "support" && screen !== "login"
    && !(viewingRecoveryHistory && screen === "winning") && (Boolean(pendingPayment) || hasPaymentReturn));
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
  const [boardListState, setBoardListState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [sellerCollections, setSellerCollections] = useState<AnimeCollection[]>([]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      paymentRequestVersion.current += 1;
      boardRequestVersion.current += 1;
      paymentRequests.current.clear();
    };
  }, []);

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
          ...getRegularPrizeStock(detailPrizes),
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
    setBoardListState('loading');
    try {
      const boards = await fetchKujiBoards();

      const mappedCollections: AnimeCollection[] = boards.map(mapBoardToCollection);

      setAnimeCollections(mappedCollections);
      setBoardListState('ready');
      
      // 게시판 목록을 가져올 때 사용자의 찜 상태가 포함되어 있다면 wishlist ID 목록도 업데이트
      const wishedIds = boards
        .filter((b: KujiBoard) => b.isWished)
        .map((b: KujiBoard) => b.id.toString());
      if (wishedIds.length > 0) {
        setWishlist(wishedIds);
      }
    } catch (error) {
      setBoardListState('error');
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
    const sharedBoardId = parseBoardId(urlParams.get("boardId"));

    if (payment !== null) {
      handlePaymentReturn("kuji", orderId, payment === "success" && paymentKey && amount ? { paymentKey, amount } : undefined);
    } else if (pointCharge !== null) {
      handlePaymentReturn("points", orderId, pointCharge === "success" && paymentKey && amount ? { paymentKey, amount } : undefined);
    } else if (Number.isInteger(sharedPostId) && sharedPostId > 0) {
      setSelectedPostId(sharedPostId);
      setScreen("communityDetail");
      if (token && token !== "undefined" && token !== "null") {
        handleFetchUserInfo();
      }
    } else if (screen === "detail" && sharedBoardId) {
      void restoreProductContext({ boardId: sharedBoardId, count: 1 }, false);
      if (token) void handleFetchUserInfo(true);
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

    if (screen === "paymentReturn" && payment === null && pointCharge === null && !activePayment.current) {
      setPaymentRecoveryMessage("확인할 결제 정보가 없습니다. 결제한 계정과 결제 내역을 확인해 주세요.");
    }

    // 결제 복구와 미개봉 주문은 저장된 결과를 먼저 복원한다.
    if (payment !== null || pointCharge !== null || activePayment.current || screen === "paymentReturn") return;

    // 새로고침으로 화면에 필요한 선택 상태가 사라지면 목록으로 돌아갑니다.
    if (((screen === "detail" && !sharedBoardId) || screen === "selection") && payment !== "success") {
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
    setViewingRecoveryHistory(false);
    setScreen("paymentReturn");
    try {
      if (!orderId) throw new Error("주문 정보가 없습니다.");
      // 복구 정보를 저장한 뒤 주소에서 결제 키를 제거한다.
      const recovery = savePaymentReturn(kind, orderId, callback);
      activePayment.current = recovery;
      setPendingPayment(recovery);
      void recoverPayment(recovery);
    } catch {
      setPaymentRecoveryMessage("결제 정보를 확인하지 못했습니다. 추가 결제 없이 고객센터에 문의해 주세요.");
    } finally {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const applyPaymentStatus = async (payment: PendingPaymentRecovery, status: PaymentStatus) => {
    if (status === "COMPLETED") {
      // 쿠지 완료 결과를 받지 못했다면 복구 정보를 유지하고 재조회한다.
      if (payment.kind === "kuji") {
        setPaymentRecoveryMessage("결제는 완료됐지만 개봉 결과를 아직 불러오지 못했습니다. 추가 결제 없이 상태를 다시 확인해 주세요.");
        return;
      }
      clearPaymentRecovery(payment);
      activePayment.current = null;
      setPendingPayment(null);
      setScreen("main");
      void handleFetchUserInfo(true);
      toast.success("충전이 완료됐습니다. 포인트와 충전 내역을 확인해 주세요.");
    } else if (status === "CANCELLED" || status === "FAILED") {
      clearPaymentRecovery(payment);
      if (payment.kind === "kuji") clearUnopenedKujiOrder(payment.orderId);
      activePayment.current = null;
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

  const loadCompletedKuji = async (orderId: string, isCurrent: () => boolean) => {
    if (!isCurrent()) throw new Error("이전 결제 요청입니다.");
    const completed = await fetchCompletedKujiResult(orderId);
    if (!isCurrent()) throw new Error("이전 결제 요청입니다.");
    let collection: AnimeCollection | undefined;
    try {
      const [boards, items] = await Promise.all([fetchKujiBoards(), fetchKujiBoardDetail(completed.boardId)]);
      const board = boards.find(candidate => candidate.id === completed.boardId);
      if (board) {
        const prizes = items.map(mapKujiItemToPrize);
        collection = { ...mapBoardToCollection(board), prizes, ...getRegularPrizeStock(prizes) };
      }
    } catch {
      // 상품 정보 조회가 실패해도 결제가 끝난 쿠지의 개봉은 계속할 수 있다.
    }
    return { kind: "kuji" as const, completed, collection };
  };

  const recoverPayment = async (payment: PendingPaymentRecovery) => {
    if (paymentRequests.current.has(payment.orderId)) return;
    if (revealedOrder.current === payment.orderId && currentScreen.current === "reveal") return;
    clearAuthReturn();
    activePayment.current = payment;
    setViewingRecoveryHistory(false);
    setPendingPayment(payment);
    if (currentScreen.current !== "login" && !["kakaoCallback", "naverCallback", "googleCallback"].includes(currentScreen.current)) setScreen("paymentReturn");
    if (!getToken()) {
      setPaymentRecoveryBusy(false);
      setPaymentRecoveryMessage("결제한 계정으로 로그인하면 이전 결제 결과를 계속 확인할 수 있습니다.");
      return;
    }
    const requestVersion = ++paymentRequestVersion.current;
    const requestAuthVersion = authVersion.current;
    const isCurrent = () => mounted.current && requestVersion === paymentRequestVersion.current
      && requestAuthVersion === authVersion.current && activePayment.current?.orderId === payment.orderId
      && !["privacy", "terms", "experience", "support"].includes(currentScreen.current);
    paymentRequests.current.set(payment.orderId, requestVersion);
    setPaymentRecoveryBusy(true);
    setPaymentRecoveryMessage("이전에 진행한 결제의 결과를 확인하고 있습니다.");
    try {
      const outcome = await resolvePaymentRecovery<{ kind: "kuji"; completed: CompletedKujiResult; collection?: AnimeCollection } | { kind: "points"; totalPoints: number }>(payment, {
        getStatus: async orderId => {
          const status = await fetchPaymentStatus(orderId);
          if (!isCurrent()) throw new Error("이전 결제 요청입니다.");
          return status;
        },
        getCompletedResult: saved => saved.kind === "kuji" ? loadCompletedKuji(saved.orderId, isCurrent) : Promise.resolve(undefined),
        confirm: async (saved) => {
          if (!isCurrent()) throw new Error("이전 결제 요청입니다.");
          if (saved.kind === "kuji") {
            await drawKuji(saved.boardId!, {
              count: saved.count!,
              paymentType: "PG",
              paymentKey: saved.paymentKey,
              orderId: saved.orderId,
              amount: saved.amount,
            });
            return loadCompletedKuji(saved.orderId, isCurrent);
          }
          const result = await confirmPointCharge({ paymentKey: saved.paymentKey, orderId: saved.orderId, amount: saved.amount });
          return { kind: "points", totalPoints: result.totalPoints };
        },
      });
      if (!isCurrent()) return;
      if (outcome.result) {
        if (outcome.result.kind === "kuji") {
          const { completed, collection } = outcome.result;
          const prizes = completed.results.map(mapKujiItemToPrize);
          // 완료 결과와 결제 키를 저장하지 않고 개봉을 마칠 때까지 주문 번호만 남긴다.
          saveUnopenedKujiOrder(payment.orderId);
          revealedOrder.current = payment.orderId;
          setRevealedPrizes(prizes);
          setSelectedAnime(collection || null);
          if (collection) {
            setAnimeCollections(previous => previous.map(board => board.id === collection.id ? collection : board));
            const opened = collection.prizes.filter(prize => !isLastPrize(prize.rank)).flatMap(prize => prize.opened || []);
            setKujiStatus(opened.length ? opened : Array(collection.totalKuji).fill(false));
          }
          setPurchaseCount(completed.count);
          setPointsToUse(0);
        }
        clearPaymentRecovery(payment);
        activePayment.current = null;
        setPendingPayment(null);
        if (outcome.result.kind === "kuji") {
          setScreen("reveal");
        } else {
          setScreen("main");
          toast.success(`충전이 완료됐습니다. 총 보유 포인트는 ${outcome.result.totalPoints.toLocaleString()}P입니다.`);
        }
        void handleFetchUserInfo(true);
      } else {
        await applyPaymentStatus(payment, outcome.status);
      }
    } catch {
      if (!isCurrent()) return;
      setPaymentRecoveryMessage(getToken()
        ? "결제 상태를 아직 확인하지 못했습니다. 결제한 계정인지 확인하고 추가 결제 없이 상태를 다시 확인해 주세요."
        : "결제한 계정으로 로그인하면 이전 결제 결과를 계속 확인할 수 있습니다.");
    } finally {
      if (paymentRequests.current.get(payment.orderId) === requestVersion) paymentRequests.current.delete(payment.orderId);
      if (mounted.current && requestVersion === paymentRequestVersion.current) setPaymentRecoveryBusy(false);
    }
  };

  useEffect(() => {
    if (screen === "kakaoCallback" || screen === "naverCallback" || screen === "googleCallback") return;
    if (screen === "privacy" || screen === "terms" || screen === "experience" || screen === "support") return;
    if (viewingRecoveryHistory && screen === "winning") return;
    const unopenedOrder = readUnopenedKujiOrder();
    const recovery = activePayment.current || readPaymentRecovery() || (unopenedOrder ? { kind: "kuji" as const, orderId: unopenedOrder } : null);
    if (recovery) void recoverPayment(recovery);
  }, [user?.email, screen]);

  const handleFetchUserInfo = async (preserveScreen = false) => {
    const requestAuthVersion = authVersion.current;
    try {
      const userData = await fetchMyProfile();
      if (!mounted.current || requestAuthVersion !== authVersion.current) return;
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

      if (preserveScreen || boardNavigationPending.current || activePayment.current || revealedOrder.current || ["reveal", "privacy", "terms", "experience", "support"].includes(currentScreen.current)) return;
      if (formattedUser.type === "business" && formattedUser.isActive === false) {
        setScreen("businessPending");
      } else if (formattedUser.type === 'business' && screen === 'businessPending') {
        setScreen('businessDashboard');
      }
    } catch (error) {
      if (!mounted.current || requestAuthVersion !== authVersion.current) return;
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
          "adminMainBannerManagement", "adminUserManagement", "adminPromotionManagement", "adminStatistics", "adminRefunds", "adminSettlements", "adminSignupFunnel",
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
                recipient: { name: s.recipientName, phone: s.phone, address: s.address, detailAddress: s.detailAddress, message: s.deliveryMessage },
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
          needsOptionSelection: false, // 당첨 상품은 서버 추첨으로 이미 확정되며, 서버는 옵션 선택을 지원하지 않는다
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

  const restoreProductContext = async (context: { boardId: number; count: number; expiresAt?: number }, consumeSaved: boolean) => {
    const version = ++boardRequestVersion.current;
    const sessionVersion = authVersion.current;
    const sourceScreen = currentScreen.current;
    const isCurrent = () => mounted.current && version === boardRequestVersion.current && sessionVersion === authVersion.current
      && currentScreen.current === sourceScreen && !activePayment.current && !revealedOrder.current;
    boardNavigationPending.current = true;
    setBoardLoading(true);
    try {
      const [boards, items] = await Promise.all([fetchKujiBoards(), fetchKujiBoardDetail(context.boardId)]);
      if (!isCurrent()) return;
      const board = boards.find(candidate => candidate.id === context.boardId);
      const prizes = items.map(mapKujiItemToPrize);
      const stock = getRegularPrizeStock(prizes);
      if (consumeSaved) clearAuthReturn(context.expiresAt ? context as AuthReturnContext : undefined);
      if (!board || (consumeSaved && (board.previewOnly || board.status !== "ACTIVE" || stock.remainingKuji < 1))) {
        setSelectedAnime(null);
        setScreen("list");
        toast.info("선택한 상품의 판매가 종료되었거나 재고가 없습니다. 다른 상품을 확인해 주세요.");
        return;
      }
      const collection = { ...mapBoardToCollection(board), prizes, ...stock };
      setSelectedAnime(collection);
      setPurchaseCount(Math.min(context.count, stock.remainingKuji));
      setPointsToUse(0);
      setReturnToScreen(null);
      const opened = prizes.filter(prize => !isLastPrize(prize.rank)).flatMap(prize => prize.opened || []);
      setKujiStatus(opened.length ? opened : Array(stock.totalKuji).fill(false));
      navigate(`/detail?boardId=${context.boardId}`, { replace: true });
      if (consumeSaved) trackFunnelEvent('AUTH_RETURNED_ITEM', { audience: 'customer', method: 'none' });
    } catch {
      if (!isCurrent()) return;
      if (consumeSaved) clearAuthReturn(context.expiresAt ? context as AuthReturnContext : undefined);
      setScreen("list");
      toast.error("상품 정보를 다시 확인하지 못했습니다. 목록에서 상품을 다시 선택해 주세요.");
    } finally {
      if (mounted.current && version === boardRequestVersion.current) {
        boardNavigationPending.current = false;
        setBoardLoading(false);
      }
    }
  };

  const handleAnimeSelect = async (anime: AnimeCollection) => {
    const version = ++boardRequestVersion.current;
    boardNavigationPending.current = false;
    setBoardLoading(false);
    try {
      // 1. Fetch real detail data from server (Backend returns List<KujiItem>)
      const items = await fetchKujiBoardDetail(Number(anime.id));
      if (!mounted.current || version !== boardRequestVersion.current) return;

      // 2. Map backend items to frontend prizes structure
      const updatedPrizes = items.map(mapKujiItemToPrize);

      const updatedAnime = {
        ...anime,
        prizes: updatedPrizes,
        ...getRegularPrizeStock(updatedPrizes),
      };

      setSelectedAnime(updatedAnime);
      setPurchaseCount(1);
      navigate(`/detail?boardId=${anime.id}`);

      // Initialize kuji status from backend data
      const status: boolean[] = [];
      updatedPrizes.filter(prize => !isLastPrize(prize.rank)).forEach(p => {
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
    if (!selectedAnime || !Number.isSafeInteger(count) || count < 1 || count > selectedAnime.remainingKuji) return;
    if (selectedAnime.previewOnly || selectedAnime.operationStatus !== "active") {
      toast.info("현재 구매할 수 없는 상품입니다. 무료 개봉 체험을 이용해 주세요.");
      return;
    }
    if (!user) {
      try {
        saveAuthReturn(Number(selectedAnime.id), count);
      } catch {
        toast.info("상품 복귀 정보를 저장하지 못했습니다. 로그인 후 상품을 다시 확인해 주세요.");
      }
      setPurchaseCount(count);
      setPointsToUse(0);
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
    authVersion.current += 1;
    paymentRequestVersion.current += 1;
    paymentRequests.current.clear();
    setUser(userData);
    if (userData.type !== 'admin') trackFunnelEvent('LOGIN_COMPLETED', { audience: userData.type === 'business' ? 'business' : 'customer', method: 'email' });
    setIsSidebarOpen(false);

    handleFetchWinningHistory(userData.type);
    if (userData.type === "social") {
      handleFetchWishlist();
    }

    const recovery = activePayment.current || readPaymentRecovery();
    // 결제한 계정으로 돌아오면 일반 로그인 이동보다 개봉 복구를 먼저 처리한다.
    if (recovery) {
      setReturnToScreen(null);
      setScreen("paymentReturn");
      void recoverPayment(recovery);
    } else if (userData.type === "business") {
      if (userData.businessStatus !== 'APPROVED') {
        setScreen("businessPending");
      } else {
        setScreen("businessDashboard");
      }
    } else if (userData.type === "admin") {
      setScreen("adminDashboard");
    } else if (readAuthReturn() || (returnToScreen === "detail" && selectedAnime)) {
      const context = readAuthReturn() || { boardId: Number(selectedAnime!.id), count: purchaseCount };
      void restoreProductContext(context, true);
    } else {
      setScreen("main");
    }
  };

  const handleLogout = () => {
    showConfirm("로그아웃 하시겠습니까?", async () => {
      authVersion.current += 1;
      paymentRequestVersion.current += 1;
      paymentRequests.current.clear();
      try {
        await logout();
        clearAuthReturn();
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
  const handleSocialLoginSuccess = (successMessage: string, method: 'kakao' | 'naver' | 'google') =>
    (token: string, userData: any) => {
      authVersion.current += 1;
      paymentRequestVersion.current += 1;
      paymentRequests.current.clear();
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
      const formattedUser = {
        memberId: userData.memberId,
        name: userData.nickname || userData.email,
        email: userData.email,
        type: (userData.role === "BIZ" || userData.role === 'ROLE_BUSINESS' ? "business" : userData.role === 'ADMIN' || userData.role === 'ROLE_ADMIN' ? 'admin' : "social") as "business" | "admin" | "social",
        points: userData.points || 0,
        isActive: userData.role === 'BIZ' || userData.role === 'ROLE_BUSINESS' ? userData.businessStatus === 'APPROVED' : true,
        businessStatus: userData.businessStatus,
        businessRejectReason: userData.businessRejectReason,
        profileImageUrl: userData.profileImageUrl || "",
      };
      setUser(formattedUser);
      if (formattedUser.type !== 'admin') trackFunnelEvent('LOGIN_COMPLETED', { audience: formattedUser.type === 'business' ? 'business' : 'customer', method });

      // Remove OAuth params from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);

      const unopenedOrder = readUnopenedKujiOrder();
      const recovery = activePayment.current || readPaymentRecovery() || (unopenedOrder ? { kind: "kuji" as const, orderId: unopenedOrder } : null);
      if (recovery) {
        setReturnToScreen(null);
        setScreen("paymentReturn");
        void recoverPayment(recovery);
      } else if (formattedUser.type === "business") {
        setScreen(formattedUser.businessStatus === 'APPROVED' ? 'businessDashboard' : 'businessPending');
      } else if (formattedUser.type === 'admin') {
        setScreen('adminDashboard');
      } else if (readAuthReturn()) {
        void restoreProductContext(readAuthReturn()!, true);
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
        const countWon = response.results.filter((result: any) => String(result.id) === p.id).length;
        return {
          ...p,
          remainingCount: Math.max(0, p.remainingCount - countWon)
        };
      });

      const updatedAnime = {
        ...selectedAnime,
        prizes: updatedPrizes,
        ...getRegularPrizeStock(updatedPrizes),
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
    if (revealedOrder.current) clearUnopenedKujiOrder(revealedOrder.current);
    revealedOrder.current = null;
    const completionVersion = ++paymentRequestVersion.current;
    const completionAuthVersion = authVersion.current;
    const isCurrent = () => mounted.current && completionVersion === paymentRequestVersion.current
      && completionAuthVersion === authVersion.current && currentScreen.current === "reveal";
    try {
      const histories = await fetchMyDrawHistory();
      if (!isCurrent()) return;
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
          needsOptionSelection: false, // 당첨 상품은 서버 추첨으로 이미 확정되며, 서버는 옵션 선택을 지원하지 않는다
          isNew: revealedIds.includes(h.id),
          shippingId: h.shippingId,
          sellerName: h.sellerName || '알 수 없는 판매처'
        }));
        setWinningHistory(mappedWinnings);
      }
    } catch (error) {
      console.error("Failed to update winning history:", error);
    }

    // 라스트상 무료 지급이나 결제 복구가 포인트를 중복 적립한 것처럼 보이지 않게 서버 잔액을 사용합니다.
    if (user) {
      try {
        const profile = await fetchMyProfile();
        if (!isCurrent()) return;
        setUser(previous => previous ? { ...previous, points: profile.points || 0 } : previous);
      } catch (error) {
        console.warn("포인트 잔액 새로고침 실패", error);
      }
    }

    // Go to destination
    if (!isCurrent()) return;
    if (destination === "winning" || !selectedAnime) {
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
      | "adminStatistics"
      | "adminRefunds"
      | "adminSettlements"
      | "adminSignupFunnel",
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
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 overflow-hidden w-full relative">
      {/* 티켓 선택과 결제 복귀와 개봉 중에는 당첨 알림을 숨긴다. */}
      {!showingPaymentReturn && !pendingPayment && !isAuthCallback && !isPublicReadOnly && screen !== "login" && screen !== "selection" &&
        screen !== "reveal" &&
        screen !== "detail" && <LiveTicker />}

      {/* Hamburger Menu Button - Fixed position */}
      {!showingPaymentReturn && !isPublicReadOnly && screen !== "reveal" && screen !== "login" && screen !== "communityWrite" && screen !== "communityDetail" && (
        <button
          aria-label="메뉴 열기"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-[calc(env(safe-area-inset-top)+3rem)] right-4 z-30 p-3 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain relative w-full" id="main-scroll-container">
        {showingPaymentReturn ? (
          <PaymentRecoveryNotice
            fullScreen
            title={pendingPayment?.kind === "points" || callbackParams.has("pointCharge") ? "충전 결과를 확인하고 있어요" : undefined}
            message={paymentRecoveryMessage}
            busy={paymentRecoveryBusy}
            needsLogin={!getToken()}
            onCheck={() => { if (pendingPayment) void recoverPayment(pendingPayment); }}
            onLogin={() => setScreen("login")}
            onViewHistory={pendingPayment?.kind === "points" ? undefined : () => {
              if (!getToken()) {
                setScreen("login");
                return;
              }
              setViewingRecoveryHistory(true);
              setScreen("winning");
              void handleFetchWinningHistory();
            }}
          />
        ) : boardLoading && !isPublicReadOnly && screen !== "support" ? (
          <div role="status" className="flex min-h-full items-center justify-center bg-slate-950 p-6 text-cyan-100">선택한 상품과 남은 수량을 다시 확인하고 있어요.</div>
        ) : <>
        {screen === "main" && (
          <MainScreen
            onStart={() => setScreen("list")}
            onExperience={() => { setExperienceSource(null); setScreen("experience"); }}
            banners={banners}
          />
        )}
        {screen === "experience" && <KujiExperience collection={experienceSource} onBack={() => setScreen(experienceSource ? "detail" : "main")} />}
        {screen === "list" && (
          <AnimeList
            collections={animeCollections}
            loadState={boardListState}
            onExperience={() => { setExperienceSource(null); setScreen("experience"); }}
            onRetry={() => void handleFetchBoards()}
            onSelect={handleAnimeSelect}
            onBack={() => setScreen("main")}
            onToggleWishlist={(anime) => handleToggleWishlist(anime.id)}
          />
        )}
        {screen === "detail" && selectedAnime && (
          <PrizeDetail
            anime={selectedAnime}
            initialPurchaseCount={purchaseCount}
            onBack={() => setScreen("list")}
            onPurchase={handlePurchase}
            onExperience={() => { setExperienceSource(selectedAnime); setScreen("experience"); }}
            user={user ? { ...user, points: user.points || 0 } : null}
          />
        )}
        {screen === "login" && (
          <Login
            onLogin={handleLogin}
            onBack={() => {
              clearAuthReturn();
              boardRequestVersion.current += 1;
              boardNavigationPending.current = false;
              setBoardLoading(false);
              if (returnToScreen === "detail" && selectedAnime) navigate(`/detail?boardId=${selectedAnime.id}`);
              else setScreen(returnToScreen || "main");
              setReturnToScreen(null);
            }}
          />
        )}
        {screen === "selection" && selectedAnime && (
          <KujiSelection
            boardId={Number(selectedAnime.id)}
            totalKuji={selectedAnime.totalKuji}
            hasLastPrize={selectedAnime.hasLastPrize}
            lastPrizeAvailable={selectedAnime.lastPrizeAvailable}
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

        {isPublicPolicy && (screen === "terms" || screen === "privacy") && (
          <section className="min-h-full bg-slate-950 pb-12 text-slate-100">
            <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-slate-950/95 p-5 backdrop-blur">
              <button type="button" aria-label="홈으로 돌아가기" onClick={() => setScreen("main")} className="rounded-xl bg-white/5 p-2 transition-colors hover:bg-white/10">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold">{POLICY_TITLES[screen]}</h1>
            </header>
            <div className="mx-auto max-w-3xl px-5 py-6">
              <PolicyContent kind={screen} audience="all" />
            </div>
          </section>
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
            onLoginSuccess={handleSocialLoginSuccess("로그인에 성공했습니다!", 'kakao')}
            onLoginFailure={handleSocialLoginFailure}
          />
        )}
        {screen === "naverCallback" && (
          <NaverCallback
            onLoginSuccess={handleSocialLoginSuccess("네이버 로그인에 성공했습니다!", 'naver')}
            onLoginFailure={handleSocialLoginFailure}
          />
        )}
        {screen === "googleCallback" && (
          <GoogleCallback
            onLoginSuccess={handleSocialLoginSuccess("구글 로그인에 성공했습니다!", 'google')}
            onLoginFailure={handleSocialLoginFailure}
          />
        )}
        </>}
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
        offset={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
        mobileOffset={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
      />
    </div>
  );
}

import type { Dispatch, SetStateAction } from "react";
import BusinessDashboard from "../BusinessDashboard";
import BusinessProfile from "../BusinessProfile";
import BusinessProductList from "../BusinessProductList";
import BusinessProductEdit from "../BusinessProductEdit";
import BusinessProductRegister from "../BusinessProductRegister";
import BusinessShippingManagement from "../BusinessShippingManagement";
import BusinessPending from "../BusinessPending";
import SellerInquiries from "../SellerInquiries";
import { fetchKujiBoardDetail, deleteKujiBoard } from "../../api/kuji";
import { mapKujiItemToPrize } from "../../utils/kujiMappers";
import {
  AnimeCollection,
  CustomerInquiry,
  ScreenType,
  WinningItem,
} from "../../shared-types";

type BusinessScreensProps = {
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  setIsSidebarOpen: (open: boolean) => void;
  user: any;
  sellerCollections: AnimeCollection[];
  setSellerCollections: Dispatch<SetStateAction<AnimeCollection[]>>;
  editingCollectionId: string | null;
  setEditingCollectionId: (id: string | null) => void;
  winningHistory: WinningItem[];
  inquiries: CustomerInquiry[];
  setInquiries: Dispatch<SetStateAction<CustomerInquiry[]>>;
  showAlert: (
    message: string,
    type?: "success" | "error" | "warning" | "info",
    title?: string,
  ) => void;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
  onFetchWinningHistory: () => void;
  onUpdateShipping: (
    winningId: string,
    status: "preparing" | "shipped" | "delivered",
    trackingNumber?: string,
    courierName?: string,
    courierPhone?: string,
  ) => void;
};

// 사업자(판매자) 전용 화면 그룹 (App.tsx에서 분리)
export default function BusinessScreens({
  screen,
  setScreen,
  setIsSidebarOpen,
  user,
  sellerCollections,
  setSellerCollections,
  editingCollectionId,
  setEditingCollectionId,
  winningHistory,
  inquiries,
  setInquiries,
  showAlert,
  onLogout,
  onRefresh,
  onFetchWinningHistory,
  onUpdateShipping,
}: BusinessScreensProps) {
  return (
    <>
      {screen === "businessDashboard" && (
        <BusinessDashboard
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLogout={onLogout}
          onNavigate={(target) => {
            if (target === "productList")
              setScreen("businessProducts");
            else if (target === "productRegister")
              setScreen("businessRegister");
            else if (target === "shipping") {
              onFetchWinningHistory();
              setScreen("businessShipping");
            }
            else if (target === "inquiries")
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
              const updatedPrizes = items.map(mapKujiItemToPrize);

              // Update the collection in our global state to include prizes
              setSellerCollections(prev => prev.map(c =>
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
        sellerCollections.find(
          (c) => c.id === editingCollectionId,
        ) && (
          <BusinessProductEdit
            onBack={() => setScreen("businessProducts")}
            collection={sellerCollections.find((c) => c.id === editingCollectionId)!}
            user={user}
            onSave={async () => {
              showAlert("상품이 수정되었습니다", "success");
              await onRefresh();
              setScreen("businessProducts");
            }}
          />
        )}
      {screen === "businessRegister" && (
        <BusinessProductRegister
          onBack={() => setScreen("businessDashboard")}
          onComplete={async () => {
            showAlert("상품이 등록되었습니다!", "success");
            await onRefresh();
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
          onUpdateShipping={onUpdateShipping}
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
                        author: "seller" as const,
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
      {screen === "businessPending" && (
        <BusinessPending
          user={user}
          onBack={onLogout}
        />
      )}
    </>
  );
}

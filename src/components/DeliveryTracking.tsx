import { useState, useEffect } from 'react';
import { fetchTrackingInfo, type TrackingResponse } from '../api/shipping';
import { motion, AnimatePresence } from './motion';
import { X, ChevronDown, ChevronUp, Package, Truck, MapPin, CheckCircle, Phone, MessageCircle } from './icons';
import type { WinningItem } from '@/shared-types';
import SellerInquiryModal from './SellerInquiryModal';

type DeliveryTrackingProps = {
  orderNumber?: string;
  trackingNumber?: string;
  courier?: string;
  recipientAddress?: string;
  deliveryDriver?: string;
  deliveryDriverPhone?: string;
  sellerContact?: string;
  sellerName?: string;
  sellerId?: string;
  winning?: WinningItem;
  onClose: () => void;
  onSubmitInquiry?: (sellerId: string, sellerName: string, orderNumber: string, inquiryType: string, subject: string, content: string) => void;
};

export default function DeliveryTracking({
  orderNumber,
  trackingNumber,
  courier,
  recipientAddress,
  deliveryDriver = '미배정',
  deliveryDriverPhone = '010-1234-5678',
  sellerContact = '1588-0000',
  sellerName = '판매자',
  sellerId = 'seller1',
  winning,
  onClose,
  onSubmitInquiry,
}: DeliveryTrackingProps) {
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!winning?.shippingId) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTrackingInfo(winning.shippingId);
        setTrackingData(data);
      } catch (err: any) {
        setError(err.message || '배송 진행 상황을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [winning?.shippingId]);

  // Use winning item data if provided, otherwise use props
  const finalOrderNumber = trackingData?.orderNumber || winning?.id || orderNumber || 'N/A';
  const finalTrackingNumber = trackingData?.trackingNumber || winning?.trackingNumber || trackingNumber || '-';
  const finalCourier = trackingData?.courier || winning?.courierName || courier || '-';
  const finalRecipientAddress = trackingData?.recipientAddress || recipientAddress || '서울시 강남구 테헤란로 123';
  const finalDeliveryDriver = trackingData?.deliveryDriver || deliveryDriver;
  const finalDeliveryDriverPhone = trackingData?.deliveryDriverPhone || deliveryDriverPhone;
  const finalSellerContact = sellerContact;
  const finalSellerName = sellerName;
  const finalSellerId = sellerId;
  const deliveryHistory = trackingData?.history || [];

  // Current delivery stage
  const getCurrentStage = () => {
    const status = winning?.deliveryStatus || 'preparing';
    if (status === 'delivered') return 4;
    if (status === 'shipped') return 3;
    return 1;
  };

  const currentStage = getCurrentStage();

  const stages = [
    { icon: Package, label: '택배사 전달중', stage: 1 },
    { icon: Truck, label: '상품 이동중', stage: 2 },
    { icon: MapPin, label: '도착 예정', stage: 3 },
    { icon: CheckCircle, label: '배송 완료', stage: 4 },
  ];

  const displayedHistory = showAllHistory ? deliveryHistory : deliveryHistory.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-cyan-400/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl">배송 조회</h2>
          <button
            onClick={onClose}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Delivery Info Card */}
          <div className="bg-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">주문번호</span>
              <span className="text-white">{finalOrderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">택배사</span>
              <span className="text-white">{finalCourier}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">송장번호</span>
              <span className="text-yellow-400">{finalTrackingNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">배송지</span>
              <span className="text-white text-right text-sm">{finalRecipientAddress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">배송기사</span>
              <span className="text-white">{finalDeliveryDriver}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">배송기사 연락처</span>
              <span className="text-white">{finalDeliveryDriverPhone}</span>
            </div>
          </div>

          {/* Delivery Stage Progress */}
          <div className="bg-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-6 text-center">배송 진행 상황</h3>
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-white/20 -z-10">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all duration-500"
                  style={{ width: `${(currentStage / 4) * 100}%` }}
                />
                {/* Moving Truck Icon */}
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 -ml-3"
                  initial={{ left: '0%' }}
                  animate={{ left: `${(currentStage / 4) * 100}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                  <motion.div 
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="bg-white p-1.5 rounded-full shadow-lg"
                  >
                    <Truck className="w-4 h-4 text-pink-500" />
                  </motion.div>
                </motion.div>
              </div>

              {stages.map(({ icon: Icon, label, stage }) => (
                <div key={stage} className="flex flex-col items-center gap-2 flex-1">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: currentStage >= stage ? 1.1 : 1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStage >= stage
                        ? 'bg-gradient-to-r from-yellow-400 to-pink-500 shadow-lg'
                        : 'bg-white/20'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        currentStage >= stage ? 'text-white' : 'text-white/50'
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-xs text-center ${
                      currentStage >= stage ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery History Timeline */}
          <div className="bg-white/10 rounded-2xl p-6">
            <h3 className="text-white mb-4">배송 상세 내역</h3>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/70">배송 내역을 조회 중입니다...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="w-10 h-10 text-white/20 mb-3" />
                <span className="text-red-400 text-sm text-center">{error}</span>
              </div>
            ) : deliveryHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="w-10 h-10 text-white/20 mb-3" />
                <span className="text-white/50 text-sm">배송 내역이 없습니다.</span>
              </div>
            ) : (
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/20" />

              {/* History Items */}
              <div className="space-y-4">
                {displayedHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-10"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-400 to-pink-500'
                          : 'bg-white/30'
                      }`}
                    >
                      {index === 0 && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                          {item.status}
                        </span>
                        <span className="text-white/60 text-sm">
                          {item.date} {item.time}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{item.location}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            )}

            {/* Show More/Less Button */}
            {deliveryHistory.length > 3 && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white flex items-center justify-center gap-2 transition-colors"
              >
                {showAllHistory ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>접기</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>더보기 ({deliveryHistory.length - 3}개)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Contact Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = `tel:${finalDeliveryDriverPhone}`}
              className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>배송기사 연락</span>
            </button>
            <button
              onClick={() => setShowInquiryModal(true)}
              className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>판매자 문의</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all"
        >
          <div className="text-center">닫기</div>
        </button>
      </motion.div>

      {/* Seller Inquiry Modal */}
      <SellerInquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        onSubmit={(inquiryType, subject, content) => {
          if (onSubmitInquiry) {
            onSubmitInquiry(finalSellerId, finalSellerName, finalOrderNumber, inquiryType, subject, content);
          }
        }}
        orderNumber={finalOrderNumber}
        sellerName={finalSellerName}
      />
    </motion.div>
  );
}
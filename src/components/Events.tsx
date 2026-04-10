import { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { ChevronLeft, Gift, Calendar, Star, X, Sparkles } from './icons';
import { ImageWithFallback } from './figma/ImageWithFallback';

type EventsProps = {
  onBack: () => void;
};

type EventItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  badge?: string;
  details: string;
};

export default function Events({ onBack }: EventsProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const events: EventItem[] = [
    {
      id: 'EVENT-001',
      title: '🎄 크리스마스 특별 이벤트',
      description: '쿠지 5장 이상 구매 시 크리스마스 한정 굿즈 증정!',
      image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800',
      startDate: '2024-12-01',
      endDate: '2024-12-25',
      status: 'upcoming',
      badge: 'D-12',
      details: `🎄 크리스마스 특별 이벤트

【이벤트 기간】
2024년 12월 1일 ~ 12월 25일

【이벤트 내용】
1. 쿠지 5장 이상 구매 시 크리스마스 한정 굿즈 증정
   - 미니 트리 장식
   - 캐릭터 스티커 세트
   - 크리스마스 카드

2. 매일 자정 선착순 100명 할인 쿠폰 지급
   - 10% 할인 쿠폰

3. 크리스마스 당일 럭키박스 특가 판매
   - 정가 10,000원 → 7,000원

【참여 방법】
이벤트 기간 중 쿠지를 구매하시면 자동으로 참여됩니다.

여러분의 많은 참여 부탁드립니다! 🎅`,
    },
    {
      id: 'EVENT-002',
      title: '🎁 신규 회원 가입 이벤트',
      description: '지금 가입하고 무료 쿠지 1장 받아가세요!',
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800',
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      status: 'ongoing',
      details: `🎁 신규 회원 가입 이벤트

【이벤트 기간】
2024년 11월 1일 ~ 12월 31일

【이벤트 내용】
신규 회원 가입 시 무료 쿠지 1장 즉시 지급!

【참여 방법】
1. 앱에서 회원가입
2. 이메일 인증 완료
3. 무료 쿠지 자동 지급 (마이페이지 확인)

【유의사항】
- 1인 1회 한정
- 가입 후 7일 이내 사용 가능
- 타 이벤트와 중복 적용 불가

지금 바로 가입하고 행운의 주인공이 되어보세요! ✨`,
    },
    {
      id: 'EVENT-003',
      title: '⭐ 친구 초대 이벤트',
      description: '친구를 초대하고 둘 다 쿠지를 받으세요!',
      image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800',
      startDate: '2024-11-15',
      endDate: '2024-12-15',
      status: 'ongoing',
      details: `⭐ 친구 초대 이벤트

【이벤트 기간】
2024년 11월 15일 ~ 12월 15일

【이벤트 내용】
친구를 초대하면 초대한 사람과 초대받은 사람 모두에게 쿠지 1장씩 지급!

【참여 방법】
1. 마이페이지에서 초대 코드 확인
2. 친구에게 초대 코드 공유
3. 친구가 가입 시 코드 입력
4. 쿠지 자동 지급 (양쪽 모두)

【추가 혜택】
- 3명 초대 시: 추가 쿠지 1장
- 5명 초대 시: 한정 굿즈 증정
- 10명 초대 시: VIP 회원 등급 부여

친구들과 함께 즐겨보세요! 👯`,
    },
    {
      id: 'EVENT-004',
      title: '🎉 앱 리뷰 이벤트',
      description: '리뷰를 남기고 쿠폰을 받아가세요!',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800',
      startDate: '2024-11-10',
      endDate: '2024-11-30',
      status: 'ongoing',
      details: `🎉 앱 리뷰 이벤트

【이벤트 기간】
2024년 11월 10일 ~ 11월 30일

【이벤트 내용】
앱스토어 또는 구글 플레이에 리뷰를 남겨주시면 5% 할인 쿠폰 지급!

【참여 방법】
1. 앱스토어 또는 구글 플레이에서 리뷰 작성
2. 리뷰 스크린샷 촬영
3. 1:1 문의로 스크린샷 전송
4. 쿠폰 지급 (익일 지급)

【유의사항】
- 1인 1회 한정
- 10자 이상의 성의 있는 리뷰만 인정
- 별점 무관

여러분의 소중한 의견을 들려주세요! 💬`,
    },
    {
      id: 'EVENT-005',
      title: '🏆 럭키 세븐 이벤트',
      description: '7일, 17일, 27일에 7장 구매 시 특별 혜택!',
      image: 'https://images.unsplash.com/photo-1464983308776-8f0bd81e9b36?w=800',
      startDate: '2024-11-07',
      endDate: '2024-11-27',
      status: 'ongoing',
      details: `🏆 럭키 세븐 이벤트

【이벤트 기간】
2024년 11월 7일, 17일, 27일

【이벤트 내용】
7이 들어가는 날짜에 쿠지 7장을 구매하시면:
- 추가 쿠지 1장 증정
- 럭키박스 응모권 1장 지급
- 다음 구매 시 사용 가능한 10% 쿠폰 지급

【참여 방법】
이벤트 대상 날짜에 쿠지 7장을 한 번에 구매하시면 자동 적용됩니다.

【당첨 발표】
럭키박스 당첨자는 매월 말일 발표
(당첨 시 문자 및 앱 푸시 알림)

행운의 7을 잡아보세요! 🍀`,
    },
    {
      id: 'EVENT-006',
      title: '🎃 할로윈 이벤트',
      description: '할로윈 한정 시리즈 특가 판매!',
      image: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=800',
      startDate: '2024-10-25',
      endDate: '2024-10-31',
      status: 'ended',
      details: `🎃 할로윈 이벤트 (종료)

【이벤트 기간】
2024년 10월 25일 ~ 10월 31일

이벤트가 종료되었습니다.
많은 참여 감사드립니다! 🙏`,
    },
  ];

  const ongoingEvents = events.filter(e => e.status === 'ongoing');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const endedEvents = events.filter(e => e.status === 'ended');

  const getStatusBadge = (status: EventItem['status']) => {
    switch (status) {
      case 'ongoing':
        return <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 text-sm rounded-full">진행중</span>;
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm rounded-full">예정</span>;
      case 'ended':
        return <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/50 text-gray-300 text-sm rounded-full">종료</span>;
    }
  };

  const EventCard = ({ event, index }: { event: EventItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => setSelectedEvent(event)}
      className={`relative rounded-3xl overflow-hidden border-2 shadow-2xl transition-all cursor-pointer h-64 ${
        event.status === 'ended'
          ? 'border-white/10 opacity-60'
          : 'border-white/20 hover:border-yellow-400/50 hover:shadow-yellow-400/30'
      }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      </div>

      {/* Badge */}
      {event.badge && event.status !== 'ended' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="px-3 py-1 bg-red-500 text-white rounded-full flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            <span>{event.badge}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6">
        {/* Status Badge */}
        <div className="mb-3">
          {getStatusBadge(event.status)}
        </div>

        {/* Title */}
        <h3 className="text-white text-2xl mb-2" style={{ fontWeight: 700 }}>{event.title}</h3>

        {/* Description */}
        <p className="text-white/80 text-sm mb-3">{event.description}</p>

        {/* Date */}
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{event.startDate} ~ {event.endDate}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-orange-900 to-red-900 border-b-2 border-yellow-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">이벤트</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-white text-xl">진행중인 이벤트</h2>
            </div>
            <div className="space-y-4">
              {ongoingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-xl">예정된 이벤트</h2>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Ended Events */}
        {endedEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-gray-400" />
              <h2 className="text-white text-xl">종료된 이벤트</h2>
            </div>
            <div className="space-y-4">
              {endedEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-20">
            <Gift className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50">진행중인 이벤트가 없습니다</p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl max-w-lg w-full border-2 border-yellow-400/50 shadow-2xl relative max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image Header */}
              <div className="relative h-48 flex-shrink-0">
                <ImageWithFallback
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute bottom-4 left-4">
                  {getStatusBadge(selectedEvent.status)}
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                <h2 className="text-white text-2xl mb-3">{selectedEvent.title}</h2>
                
                <div className="flex items-center gap-2 text-white/60 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedEvent.startDate} ~ {selectedEvent.endDate}</span>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-white/90 whitespace-pre-line leading-relaxed text-sm">
                    {selectedEvent.details}
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="p-6 border-t border-white/10 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-400 hover:to-orange-400 transition-colors"
                >
                  닫기
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  const events: EventItem[] = [];

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

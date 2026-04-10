import { motion } from './motion';
import { ChevronLeft, Bell, MessageCircle, ChevronRight } from './icons';

type CommunityProps = {
  onBack: () => void;
  onNavigateToNotice: () => void;
  onNavigateToSupport: () => void;
  user: any;
};

export default function Community({ onBack, onNavigateToNotice, onNavigateToSupport, user }: CommunityProps) {
  const menuItems = [
    {
      icon: Bell,
      label: '공지사항',
      description: '새로운 소식과 공지를 확인하세요',
      color: 'from-blue-500/30 to-cyan-500/30',
      iconColor: 'text-cyan-300',
      onClick: onNavigateToNotice,
    },
    ...(user ? [{
      icon: MessageCircle,
      label: '1:1 문의',
      description: '궁금한 점을 문의해주세요',
      color: 'from-purple-500/30 to-pink-500/30',
      iconColor: 'text-pink-300',
      onClick: onNavigateToSupport,
    }] : []),
  ];

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white text-xl text-center">커뮤니티</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={item.onClick}
            className="w-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl hover:border-cyan-400/50 transition-all"
          >
            <div className="p-6 flex items-center gap-4">
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <item.icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <div className="text-white text-xl mb-1">{item.label}</div>
                <div className="text-white/60 text-sm">{item.description}</div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-6 h-6 text-white/30" />
            </div>
          </motion.button>
        ))}
        
        {!user && (
          <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <p className="text-white/60 mb-4">1:1 문의는 로그인 후 이용 가능합니다.</p>
            <div className="text-sm text-white/40">로그인하면 더 많은 기능을 이용할 수 있습니다.</div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="px-6 mt-8">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💬</div>
            <div>
              <h3 className="text-cyan-300 mb-2">커뮤니티 안내</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                공지사항에서 이벤트와 업데이트 소식을 확인하고,
                {user ? ' 1:1 문의를 통해 궁금한 점을 문의해주세요.' : ' 로그인 후 1:1 문의를 이용해보세요.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
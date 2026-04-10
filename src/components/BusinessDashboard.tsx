import { motion } from './motion';
import { Package, TrendingUp, ShoppingCart, Truck, DollarSign, Users } from './icons';

type BusinessDashboardProps = {
  onNavigate: (screen: 'productList' | 'productRegister' | 'shipping') => void;
};

export default function BusinessDashboard({ onNavigate }: BusinessDashboardProps) {
  // Mock data for demo
  const stats = [
    {
      title: '등록된 시리즈',
      value: '3',
      icon: Package,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-300',
    },
    {
      title: '오늘 판매',
      value: '12',
      icon: ShoppingCart,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-300',
    },
    {
      title: '배송 대기',
      value: '8',
      icon: Truck,
      color: 'from-pink-600 to-pink-700',
      bgColor: 'bg-pink-500/20',
      iconColor: 'text-pink-300',
    },
    {
      title: '이번 달 매출',
      value: '₩1,250,000',
      icon: DollarSign,
      color: 'from-cyan-600 to-cyan-700',
      bgColor: 'bg-cyan-500/20',
      iconColor: 'text-cyan-300',
    },
  ];

  const quickActions = [
    {
      title: '상품 등록',
      description: '새로운 쿠지 시리즈 등록',
      icon: Package,
      color: 'from-purple-600 to-purple-700',
      onClick: () => onNavigate('productRegister'),
    },
    {
      title: '등록 상품 조회',
      description: '등록된 상품 및 재고 관리',
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-700',
      onClick: () => onNavigate('productList'),
    },
    {
      title: '배송 관리',
      description: '주문 배송 상태 관리',
      icon: Truck,
      color: 'from-pink-600 to-pink-700',
      onClick: () => onNavigate('shipping'),
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header - Same as Profile */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-900 to-blue-900 border-b-2 border-cyan-400/50 shadow-lg">
        <div className="flex items-center justify-between p-4 min-h-[64px]">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" />
            <h1 className="text-white text-xl">사업자 대시보드</h1>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Statistics Cards - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
                <div className="text-white/60 text-xs">{stat.title}</div>
              </div>
              <div className="text-white text-xl ml-10">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions - Always Visible */}
        <div className="mb-4">
          <h2 className="text-white mb-2 px-1">빠른 작업</h2>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg hover:border-amber-400/50 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-white text-sm text-center mb-1">{action.title}</div>
                <div className="text-white/50 text-xs text-center">{action.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Recent Activity - Scrollable Section */}
        <div className="space-y-4">
          <h2 className="text-white px-1">최근 활동</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg"
          >
            <div className="space-y-3">
              {[
                { time: '10분 전', event: '원피스 시리즈 - B상 판매', icon: ShoppingCart, color: 'text-green-400' },
                { time: '1시간 전', event: '귀멸의 칼날 시리즈 배송 처리', icon: Truck, color: 'text-blue-400' },
                { time: '3시간 전', event: '나루토 시리즈 - A상 판매', icon: ShoppingCart, color: 'text-green-400' },
                { time: '5시간 전', event: '원피스 시리즈 - G상 판매', icon: ShoppingCart, color: 'text-green-400' },
                { time: '7시간 전', event: '나루토 시리즈 배송 처리', icon: Truck, color: 'text-blue-400' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 pb-3 border-b border-white/10 last:border-0 last:pb-0">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm">{activity.event}</div>
                    <div className="text-white/50 text-xs">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-400/50 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="text-amber-300 text-sm mb-1">판매 팁</h3>
                <p className="text-white/70 text-xs">
                  재고가 부족한 상품은 빨간색으로 표시됩니다. 배송 대기 중인 주문은 빠르게 처리하여 고객 만족도를 높이세요!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
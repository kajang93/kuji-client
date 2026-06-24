import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { motion } from './motion';
import { Package, TrendingUp, ShoppingCart, Truck, DollarSign, Users, Menu } from './icons';
import { fetchSellerSummary, fetchSellerDailySales, SellerSummary, DailySales } from '../api/statistics';

type BusinessDashboardProps = {
  onNavigate: (screen: 'productList' | 'productRegister' | 'shipping') => void;
  onOpenSidebar?: () => void;
  onLogout?: () => void;
};

export default function BusinessDashboard({ onNavigate, onOpenSidebar, onLogout }: BusinessDashboardProps) {
  const [sellerSummary, setSellerSummary] = useState<SellerSummary | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [summaryData, salesData] = await Promise.all([
          fetchSellerSummary(),
          fetchSellerDailySales(7)
        ]);
        setSellerSummary(summaryData);
        setDailySales(salesData);
      } catch (error) {
        console.error("Failed to load seller stats", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    loadStats();
  }, []);
  // Mock data for demo
  const stats = [
    {
      title: '총 발생 매출',
      value: isLoadingStats ? '-' : `₩${sellerSummary?.totalSalesPoints?.toLocaleString() || '0'}`,
      icon: ShoppingCart,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-300',
    },
    {
      title: '예상 정산금',
      value: isLoadingStats ? '-' : `₩${sellerSummary?.estimatedSettlement?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'from-cyan-600 to-cyan-700',
      bgColor: 'bg-cyan-500/20',
      iconColor: 'text-cyan-300',
    },
    {
      title: '적용 수수료율',
      value: isLoadingStats ? '-' : `${sellerSummary?.appliedFeeRate || '0'}%`,
      icon: Package,
      color: 'from-purple-600 to-purple-700',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-300',
    },
    {
      title: '배송 대기',
      value: isLoadingStats ? '-' : `${sellerSummary?.pendingShippingCount?.toLocaleString() || '0'}건`,
      icon: Truck,
      color: 'from-pink-600 to-pink-700',
      bgColor: 'bg-pink-500/20',
      iconColor: 'text-pink-300',
      onClick: () => onNavigate('shipping') // Click action added
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
    },
    theme: { mode: 'dark' },
    colors: ['#F59E0B'], // Amber/Gold color for business sales
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: dailySales.map(d => d.date),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#9ca3af' },
        formatter: (val) => `₩${(val / 10000).toLocaleString()}만`
      }
    },
    grid: { borderColor: '#ffffff10', strokeDashArray: 4 },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: { theme: 'dark' }
  };

  const chartSeries = [
    { name: '일일 판매액', data: dailySales.map(d => d.totalAmount) }
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onLogout?.();
              }}
              className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm hover:bg-red-500/30 transition-colors mr-2"
            >
              로그아웃
            </button>
            <button
              onClick={onOpenSidebar}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
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
              className={`bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg ${stat.onClick ? 'cursor-pointer hover:border-pink-400/50 hover:bg-white/10 transition-all' : ''}`}
              onClick={stat.onClick}
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
          <h2 className="text-white px-1">최근 7일 매출 추이</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg"
          >
            {isLoadingStats ? (
              <div className="h-[250px] flex items-center justify-center text-white/50">데이터를 불러오는 중입니다...</div>
            ) : (
              <div className="h-[250px] w-full">
                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />
              </div>
            )}
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
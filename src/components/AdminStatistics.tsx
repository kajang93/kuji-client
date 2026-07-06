import { useState, useEffect } from 'react';
import { fetchAdminSummary, fetchAdminDailySales, AdminSummary, DailySales } from '../api/statistics';
import { motion } from './motion';
import { BarChart as BarChartIcon, TrendingUp, Users, DollarSign, ShoppingCart, Package, Calendar, ArrowUp, ArrowDown, ChevronLeft } from './icons';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

type PeriodType = 'week' | 'month' | 'year';

type Props = {
  onBack: () => void;
};

export default function AdminStatistics({ onBack }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // 페이지 진입 시 스크롤을 최상단으로 이동
    window.scrollTo(0, 0);

    const loadStats = async () => {
      try {
        const [summaryData, salesData] = await Promise.all([
          fetchAdminSummary(),
          fetchAdminDailySales(7)
        ]);
        setAdminSummary(summaryData);
        setDailySales(salesData);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  // 매출 통계 데이터 (백엔드 연동)
  const salesData = dailySales.map(d => ({
    name: d.date,
    sales: d.totalAmount,
    users: 0, // 해당 API 미지원
    orders: 0 // 해당 API 미지원
  }));

  // 상품별 판매 데이터 (목데이터 제거)
  const productSalesData: any[] = [];

  // 등급별 당첨 통계 (목데이터 제거)
  const prizeRankData: any[] = [];

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#f97316'];

  // 관리자 차트 공통 옵션 (BusinessDashboard와 동일한 apexcharts 다크 테마)
  const axisChartBase: ApexOptions = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'inherit' },
    theme: { mode: 'dark' },
    dataLabels: { enabled: false },
    grid: { borderColor: 'rgba(255,255,255,0.1)', strokeDashArray: 4 },
    xaxis: {
      categories: salesData.map(d => d.name),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#9ca3af' } },
    },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    tooltip: { theme: 'dark' },
  };

  // 주요 통계 카드 (백엔드 연동)
  const mainStats = [
    {
      label: '총 매출',
      value: isLoadingStats ? '-' : `₩${adminSummary?.totalKujiSalesPoints?.toLocaleString() || '0'}`,
      change: '-',
      isPositive: true,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: '총 충전액',
      value: isLoadingStats ? '-' : `₩${adminSummary?.totalChargedPoints?.toLocaleString() || '0'}`,
      change: '-',
      isPositive: true,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: '전체 가입자',
      value: isLoadingStats ? '-' : `${adminSummary?.totalMembers?.toLocaleString() || '0'}명`,
      change: '-',
      isPositive: true,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: '오늘 신규 가입',
      value: isLoadingStats ? '-' : `${adminSummary?.newMembersToday?.toLocaleString() || '0'}명`,
      change: '-',
      isPositive: true,
      icon: Package,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-6">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-white text-3xl">통계 및 분석</h1>
            </div>
          </div>
          <p className="text-white/70">매출, 사용자, 상품 통계 대시보드</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-3 mb-6">
          {(['week', 'month', 'year'] as PeriodType[]).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl transition-all ${
                selectedPeriod === period
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              {period === 'week' && '주간'}
              {period === 'month' && '월간'}
              {period === 'year' && '연간'}
            </button>
          ))}
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-8 h-8 text-white" />
                <div className={`flex items-center gap-1 text-white text-sm`}>
                  {stat.isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="text-white text-2xl mb-1" style={{ fontWeight: 700 }}>
                {stat.value}
              </div>
              <div className="text-white/90 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Sales Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg">최근 매출 추이</h3>
                <p className="text-white/60 text-sm">최근 7일 매출 현황</p>
              </div>
            </div>
            <div className="h-80">
              <Chart
                type="line"
                height="100%"
                options={{
                  ...axisChartBase,
                  colors: ['#10b981'],
                  stroke: { curve: 'smooth', width: 3 },
                  markers: { size: 5 },
                  yaxis: {
                    labels: {
                      style: { colors: '#9ca3af' },
                      formatter: (val: number) => `₩${val.toLocaleString()}`,
                    },
                  },
                }}
                series={[{ name: '매출', data: salesData.map(d => d.sales) }]}
              />
            </div>
          </motion.div>

          {/* Product Sales Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg">상품별 판매 비율</h3>
                <p className="text-white/60 text-sm">인기 시리즈 분석</p>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              {productSalesData.length === 0 ? (
                <div className="text-white/50">상품별 판매 데이터가 없습니다.</div>
              ) : (
                <Chart
                  type="donut"
                  height="100%"
                  options={{
                    chart: { background: 'transparent', fontFamily: 'inherit' },
                    theme: { mode: 'dark' },
                    colors: COLORS,
                    labels: productSalesData.map(d => d.name),
                    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
                    tooltip: { theme: 'dark' },
                  }}
                  series={productSalesData.map(d => d.value)}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User & Order Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg">사용자 및 주문 증가율</h3>
                <p className="text-white/60 text-sm">월별 성장 추이</p>
              </div>
            </div>
            <div className="h-80">
              <Chart
                type="bar"
                height="100%"
                options={{
                  ...axisChartBase,
                  colors: ['#3b82f6', '#ec4899'],
                  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
                  legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#9ca3af' } },
                }}
                series={[
                  { name: '신규 사용자', data: salesData.map(d => d.users) },
                  { name: '주문 수', data: salesData.map(d => d.orders) },
                ]}
              />
            </div>
          </motion.div>

          {/* Prize Rank Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <BarChartIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg">등급별 당첨 통계</h3>
                <p className="text-white/60 text-sm">누적 당첨 현황</p>
              </div>
            </div>
            <div className="space-y-3">
              {prizeRankData.map((prize, index) => (
                <div key={prize.rank} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {prize.rank[0]}
                      </div>
                      <div>
                        <div className="text-white">{prize.rank}</div>
                        <div className="text-white/60 text-sm">{prize.count}개 당첨</div>
                      </div>
                    </div>
                    <div className="text-white" style={{ fontWeight: 700 }}>
                      {prize.rate}
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: prize.rate }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Performers (목데이터 제거) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-white text-lg mb-4">실시간 요약 (데이터 수집 중)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-white/50 py-10">
            실시간 데이터가 존재하지 않습니다.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
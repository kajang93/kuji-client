import { useState } from 'react';
import { motion } from './motion';
import { BarChart as BarChartIcon, TrendingUp, Users, DollarSign, ShoppingCart, Package, Calendar, ArrowUp, ArrowDown, ChevronLeft } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type PeriodType = 'week' | 'month' | 'year';

type Props = {
  onBack: () => void;
};

export default function AdminStatistics({ onBack }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

  // 매출 통계 데이터
  const salesData = [
    { name: '1월', sales: 4200000, users: 45, orders: 120 },
    { name: '2월', sales: 3800000, users: 38, orders: 105 },
    { name: '3월', sales: 5100000, users: 52, orders: 142 },
    { name: '4월', sales: 4700000, users: 48, orders: 135 },
    { name: '5월', sales: 6200000, users: 65, orders: 178 },
    { name: '6월', sales: 5800000, users: 60, orders: 165 },
    { name: '7월', sales: 7100000, users: 72, orders: 195 },
    { name: '8월', sales: 6500000, users: 68, orders: 182 },
    { name: '9월', sales: 5900000, users: 61, orders: 170 },
    { name: '10월', sales: 6800000, users: 70, orders: 188 },
    { name: '11월', sales: 7500000, users: 78, orders: 210 },
  ];

  // 상품별 판매 데이터
  const productSalesData = [
    { name: '원피스', value: 35, sales: 15800000 },
    { name: '귀멸의 칼날', value: 28, sales: 12600000 },
    { name: '나루토', value: 22, sales: 9900000 },
    { name: '포켓몬', value: 15, sales: 6700000 },
  ];

  // 등급별 당첨 통계
  const prizeRankData = [
    { rank: 'A상', count: 45, rate: '5.6%' },
    { rank: 'B상', count: 68, rate: '8.5%' },
    { rank: 'C상', count: 52, rate: '6.5%' },
    { rank: 'D상', count: 98, rate: '12.2%' },
    { rank: 'E상', count: 145, rate: '18.1%' },
    { rank: 'F상', count: 178, rate: '22.2%' },
    { rank: 'G상', count: 142, rate: '17.7%' },
    { rank: 'H상', count: 72, rate: '9.0%' },
  ];

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#f97316'];

  // 주요 통계 카드
  const mainStats = [
    {
      label: '총 매출',
      value: '¥68,600,000',
      change: '+15.3%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: '신규 사용자',
      value: '1,234',
      change: '+8.2%',
      isPositive: true,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: '총 주문',
      value: '2,090',
      change: '+12.5%',
      isPositive: true,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: '판매 상품',
      value: '45',
      change: '-2.1%',
      isPositive: false,
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
                <h3 className="text-white text-lg">월별 매출 추이</h3>
                <p className="text-white/60 text-sm">최근 11개월 매출 현황</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '매출']}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productSalesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `¥${props.payload.sales.toLocaleString()}`,
                      '매출액',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="users" fill="#3b82f6" name="신규 사용자" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="orders" fill="#ec4899" name="주문 수" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-white text-lg mb-4">실시간 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-2">오늘의 매출</div>
              <div className="text-white text-2xl mb-1" style={{ fontWeight: 700 }}>
                ¥2,580,000
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>전일 대비 +18.3%</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-2">오늘의 신규 가입</div>
              <div className="text-white text-2xl mb-1" style={{ fontWeight: 700 }}>
                48명
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>전일 대비 +12.5%</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-2">오늘의 주문</div>
              <div className="text-white text-2xl mb-1" style={{ fontWeight: 700 }}>
                87건
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>전일 대비 +8.7%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
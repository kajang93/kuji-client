import { useState, useEffect } from 'react';
import { motion } from './motion';
import { Search, Filter, UserCheck, UserX, Shield, Store, User, ChevronDown, Edit, Trash2, Plus, ChevronLeft } from './icons';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'customer' | 'business' | 'admin';
  points: number;
  createdAt: string;
  isActive: boolean;
  purchases?: number;
  winnings?: number;
  products?: number;
};

type Props = {
  onBack: () => void;
};

export default function AdminUserManagement({ onBack }: Props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'business' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: 'U001',
      name: '김철수',
      email: 'chulsoo@example.com',
      phone: '010-1234-5678',
      userType: 'customer',
      points: 1500,
      createdAt: '2024-01-15',
      isActive: true,
      purchases: 25,
      winnings: 12,
    },
    {
      id: 'U002',
      name: '박영희',
      email: 'younghee@example.com',
      phone: '010-2345-6789',
      userType: 'customer',
      points: 3200,
      createdAt: '2024-02-20',
      isActive: true,
      purchases: 48,
      winnings: 23,
    },
    {
      id: 'B001',
      name: '애니메이트 강남점',
      email: 'animate@example.com',
      phone: '02-1234-5678',
      userType: 'business',
      points: 0,
      createdAt: '2024-01-10',
      isActive: true,
      products: 15,
    },
    {
      id: 'B002',
      name: '반프레스토 공식',
      email: 'banpresto@example.com',
      phone: '02-2345-6789',
      userType: 'business',
      points: 0,
      createdAt: '2023-12-05',
      isActive: true,
      products: 32,
    },
    {
      id: 'A001',
      name: '관리자',
      email: 'admin@ichiban.com',
      phone: '02-9999-9999',
      userType: 'admin',
      points: 0,
      createdAt: '2023-10-01',
      isActive: true,
    },
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesType = filterType === 'all' || user.userType === filterType;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) || 
      (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'customer': return '일반 고객';
      case 'business': return '사업자';
      case 'admin': return '관리자';
      default: return type;
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'customer': return User;
      case 'business': return Store;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'from-blue-500 to-cyan-500';
      case 'business': return 'from-purple-500 to-pink-500';
      case 'admin': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const stats = [
    { label: '전체 사용자', value: users.length.toString(), icon: User, color: 'from-blue-500 to-cyan-500' },
    { label: '일반 고객', value: users.filter(u => u.userType === 'customer').length.toString(), icon: User, color: 'from-green-500 to-emerald-500' },
    { label: '사업자', value: users.filter(u => u.userType === 'business').length.toString(), icon: Store, color: 'from-purple-500 to-pink-500' },
    { label: '활성 사용자', value: users.filter(u => u.isActive).length.toString(), icon: UserCheck, color: 'from-yellow-500 to-orange-500' },
  ];

  const handleToggleActive = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('정말 이 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

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
              <h1 className="text-white text-3xl">사용자 관리</h1>
            </div>
          </div>
          <p className="text-white/70">전체 사용자 조회 및 관리</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-7 h-7 text-white" />
                <div className="text-white text-2xl" style={{ fontWeight: 700 }}>
                  {stat.value}
                </div>
              </div>
              <div className="text-white/90 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* User Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">전체 유형</option>
                <option value="customer" className="bg-gray-800">일반 고객</option>
                <option value="business" className="bg-gray-800">사업자</option>
                <option value="admin" className="bg-gray-800">관리자</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800">전체 상태</option>
                <option value="active" className="bg-gray-800">활성</option>
                <option value="inactive" className="bg-gray-800">비활성</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-white text-sm">사용자 정보</th>
                  <th className="px-6 py-4 text-left text-white text-sm">유형</th>
                  <th className="px-6 py-4 text-left text-white text-sm">포인트</th>
                  <th className="px-6 py-4 text-left text-white text-sm">활동</th>
                  <th className="px-6 py-4 text-left text-white text-sm">가입일</th>
                  <th className="px-6 py-4 text-left text-white text-sm">상태</th>
                  <th className="px-6 py-4 text-center text-white text-sm">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => {
                  const Icon = getUserTypeIcon(user.userType);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white">{user.name}</div>
                          <div className="text-white/60 text-sm">{user.email}</div>
                          <div className="text-white/40 text-xs">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 bg-gradient-to-br ${getUserTypeColor(user.userType)} rounded-lg`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white text-sm whitespace-nowrap">{getUserTypeLabel(user.userType)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{user.points.toLocaleString()}P</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/80 text-sm">
                          {user.userType === 'customer' && (
                            <>
                              <div>구매: {user.purchases}회</div>
                              <div>당첨: {user.winnings}회</div>
                            </>
                          )}
                          {user.userType === 'business' && (
                            <div>상품: {user.products}개</div>
                          )}
                          {user.userType === 'admin' && (
                            <div className="text-white/40">-</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/80 text-sm">{user.createdAt}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          className={`px-3 py-1 rounded-full text-xs ${
                            user.isActive
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {user.isActive ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-300" />
                          </button>
                          {user.userType !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-300" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        {isDetailOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 max-w-2xl w-full border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-xl">사용자 상세 정보</h3>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-white rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">이름</div>
                  <div className="text-white">{selectedUser.name}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">이메일</div>
                  <div className="text-white">{selectedUser.email}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">전화번호</div>
                  <div className="text-white">{selectedUser.phone}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">사용자 유형</div>
                  <div className="text-white">{getUserTypeLabel(selectedUser.userType)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">포인트</div>
                  <div className="text-white">{selectedUser.points.toLocaleString()}P</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/60 text-sm mb-1">가입일</div>
                  <div className="text-white">{selectedUser.createdAt}</div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleToggleActive(selectedUser.id)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {selectedUser.isActive ? '비활성화' : '활성화'}
                </button>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
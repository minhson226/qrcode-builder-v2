import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { LoadingCard } from './Loading.jsx'

function StatsCard({ title, value, icon, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗️' : '↘️'} {trend.value} so với tháng trước
            </p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function QuickActionsCard() {
  const actions = [
    {
      title: 'Tạo QR mới',
      description: 'Tạo QR code mới một cách nhanh chóng',
      icon: '➕',
      href: '/create',
      color: 'blue'
    },
    {
      title: 'Xem thống kê',
      description: 'Xem báo cáo chi tiết về hiệu suất',
      icon: '📊',
      href: '/analytics',
      color: 'green'
    },
    {
      title: 'Tạo hàng loạt',
      description: 'Upload CSV để tạo nhiều QR cùng lúc',
      icon: '📦',
      href: '/bulk',
      color: 'purple'
    },
    {
      title: 'Landing Page',
      description: 'Tạo trang đích cho QR code',
      icon: '🌐',
      href: '/landing-pages',
      color: 'orange'
    }
  ]

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">⚡ Thao tác nhanh</h3>
      <div className="grid grid-2 gap-4">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{action.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function RecentQRCodesCard() {
  const { qrCodes } = useApp()
  const recentQRs = qrCodes.slice(0, 5) // Show last 5 QR codes

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">📋 QR Code gần đây</h3>
        <a href="/qr" className="text-primary hover:underline text-sm">
          Xem tất cả →
        </a>
      </div>

      {recentQRs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <p>Chưa có QR code nào</p>
          <a href="/create" className="btn btn-primary mt-3">
            Tạo QR đầu tiên
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {recentQRs.map((qr) => (
            <div key={qr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  {qr.type === 'dynamic' ? '🔄' : '📌'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">
                    {qr.name || 'QR Code không tên'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {qr.type === 'dynamic' ? 'QR Động' : 'QR Tĩnh'} • 
                    {new Date(qr.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {qr.code}
                </span>
                <a href={`/qr/${qr.id}`} className="text-primary hover:text-primary-dark">
                  →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnalyticsChart({ chartData = [] }) {
  const [loading, setLoading] = useState(false)

  // Use provided chartData or fallback to default
  const defaultData = [
    { date: '2025-01-01', scans: 45 },
    { date: '2025-01-02', scans: 62 },
    { date: '2025-01-03', scans: 38 },
    { date: '2025-01-04', scans: 75 },
    { date: '2025-01-05', scans: 91 },
    { date: '2025-01-06', scans: 67 },
    { date: '2025-01-07', scans: 83 }
  ]

  const displayData = chartData.length > 0 ? chartData : defaultData

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📈 Lượt quét 7 ngày qua</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-2"></div>
            <p className="text-gray-500">Đang tải biểu đồ...</p>
          </div>
        </div>
      </div>
    )
  }

  const maxScans = Math.max(...displayData.map(d => d.scans), 1)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">📈 Lượt quét 7 ngày qua</h3>
      
      <div className="h-64 flex items-end justify-between gap-2 p-4 bg-gray-50 rounded-lg">
        {displayData.map((data, index) => {
          const height = (data.scans / maxScans) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-medium text-gray-700">
                {data.scans}
              </div>
              <div 
                className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-dark cursor-pointer"
                style={{ height: `${Math.max(height, 8)}%`, minHeight: '8px' }}
                title={`${data.scans} lượt quét ngày ${new Date(data.date).toLocaleDateString('vi-VN')}`}
              ></div>
              <div className="text-xs text-gray-600">
                {new Date(data.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Tổng: <span className="font-semibold">{displayData.reduce((sum, d) => sum + d.scans, 0)}</span> lượt quét
        </p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user, qrCodes, actions } = useApp()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch QR codes first
      const qrResponse = await fetch('/api/qr', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-builder-token')}`
        }
      })
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json()
        actions.setQrCodes(qrData)
      }

      // Fetch analytics data
      const analyticsResponse = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('qr-builder-token')}`
        }
      })
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
        setChartData(analyticsData.scan_data || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use fallback data if API fails
      setAnalytics({
        total_qrs: qrCodes.length,
        dynamic_qrs: qrCodes.filter(qr => qr.type === 'dynamic').length,
        static_qrs: qrCodes.filter(qr => qr.type === 'static').length,
        total_scans: 0,
        monthly_scans: 0
      })
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <LoadingCard loading={loading} message="Đang tải dashboard..." />
    )
  }

  const stats = analytics || {
    total_qrs: qrCodes.length,
    dynamic_qrs: qrCodes.filter(qr => qr.type === 'dynamic').length,
    static_qrs: qrCodes.filter(qr => qr.type === 'static').length,
    total_scans: 0,
    monthly_scans: 0
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👋 Chào mừng, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Quản lý QR code và theo dõi hiệu suất của bạn
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-2 lg:grid-4 gap-4 mb-6">
        <StatsCard
          title="Tổng QR Code"
          value={stats.total_qrs}
          icon="🔢"
          color="blue"
        />
        <StatsCard
          title="QR Động"
          value={stats.dynamic_qrs}
          icon="🔄"
          color="green"
        />
        <StatsCard
          title="Tổng lượt quét"
          value={stats.total_scans.toLocaleString()}
          icon="👁️"
          trend={{ value: '+15%', isPositive: true }}
          color="purple"
        />
        <StatsCard
          title="Quét tháng này"
          value={stats.monthly_scans.toLocaleString()}
          icon="📊"
          trend={{ value: '+8%', isPositive: true }}
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <AnalyticsChart chartData={chartData} />
          <RecentQRCodesCard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActionsCard />
          
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">🕒 Hoạt động gần đây</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>QR code mới được tạo</span>
                </div>
                <p className="text-xs text-gray-500 ml-4">5 phút trước</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>QR động được cập nhật</span>
                </div>
                <p className="text-xs text-gray-500 ml-4">2 giờ trước</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Xuất báo cáo thống kê</span>
                </div>
                <p className="text-xs text-gray-500 ml-4">1 ngày trước</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
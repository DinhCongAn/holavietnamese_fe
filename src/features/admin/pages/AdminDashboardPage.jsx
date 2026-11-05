import { BilingualText } from '@/shared/components/common/BilingualText';
import { useState, useEffect } from 'react';
import { adminService } from '@/features/admin/api/adminService';

function formatActivityTime(timeValue) {
  if (!timeValue) return '';
  try {
    const d = new Date(timeValue);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }).format(d);
    }
    return String(timeValue);
  } catch {
    return String(timeValue);
  }
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getDashboardStats()
      .then((data) => {
        setStats(data || {});
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải số liệu bảng điều khiển.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px', color: 'var(--color-muted)' }}>
        <BilingualText>{"Đang tải bảng điều khiển quản trị…"}</BilingualText>
      </div>
    );
  }
  if (error) {
    return (
      <div className="state" role="alert">
        <BilingualText>{error}</BilingualText>
      </div>
    );
  }

  const userGrowth = Array.isArray(stats?.userGrowth) ? stats.userGrowth : [];
  const recentActivities = Array.isArray(stats?.recentActivities) ? stats.recentActivities : [];

  const totalUsers = stats?.totalUsers ?? 0;
  const activeLearners = stats?.activeLearners ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const totalLessons = stats?.totalLessons ?? 0;
  const totalXp = stats?.totalXpGranted ?? stats?.totalXpAwarded ?? 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0' }}>
          <BilingualText>{"Bảng điều khiển Quản trị"}</BilingualText>
        </h1>
        <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>
          <BilingualText>{"Tổng quan số liệu người dùng, học tập và hoạt động hệ thống."}</BilingualText>
        </p>
      </div>

      {/* KPI Cards: Pure real data from BE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div className="admin-card">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
            <BilingualText>{"TỔNG NGƯỜI DÙNG"}</BilingualText>
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-ink)', margin: '8px 0 0 0' }}>
            {totalUsers}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            <BilingualText>{"Tài khoản trong hệ thống"}</BilingualText>
          </span>
        </div>

        <div className="admin-card">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
            <BilingualText>{"HỌC VIÊN HOẠT ĐỘNG"}</BilingualText>
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-ink)', margin: '8px 0 0 0' }}>
            {activeLearners}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            <BilingualText>{"Đang hoạt động"}</BilingualText>
          </span>
        </div>

        <div className="admin-card">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
            <BilingualText>{"TỔNG KHÓA HỌC"}</BilingualText>
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-ink)', margin: '8px 0 0 0' }}>
            {totalCourses}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            <BilingualText>{"Đang mở đăng ký"}</BilingualText>
          </span>
        </div>

        <div className="admin-card">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
            <BilingualText>{"TỔNG BÀI HỌC"}</BilingualText>
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-ink)', margin: '8px 0 0 0' }}>
            {totalLessons}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            <BilingualText>{"Bài học tương tác"}</BilingualText>
          </span>
        </div>

        <div className="admin-card">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
            <BilingualText>{"TỔNG XP ĐÃ CẤP"}</BilingualText>
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-forest)', margin: '8px 0 0 0' }}>
            {Number(totalXp).toLocaleString()}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600 }}>
            <BilingualText>{"Điểm thưởng học tập"}</BilingualText>
          </span>
        </div>
      </div>

      {/* Grid 2 Columns: Growth Chart & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px' }}>
        {/* Real User Growth */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>
            <BilingualText>{"Tăng trưởng người dùng (6 tháng qua)"}</BilingualText>
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
            {userGrowth.length === 0 ? (
              <div className="state" style={{ width: '100%' }}>
                <BilingualText>{"Chưa có dữ liệu tăng trưởng."}</BilingualText>
              </div>
            ) : (
              userGrowth.map((g, idx) => {
                const maxUsers = Math.max(...userGrowth.map((item) => Number(item.users) || 0), 1);
                const count = Number(g.users) || 0;
                const height = Math.min(Math.max((count / maxUsers) * 100, 4), 100);
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-forest)' }}>{count}</span>
                    <div style={{ width: '100%', height: `${height * 1.2}px`, background: 'var(--color-sage)', borderRadius: '4px 4px 0 0' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)' }}>{g.month}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Real Recent Activities */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}>
            <BilingualText>{"Hoạt động thời gian thực"}</BilingualText>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.length === 0 ? (
              <div className="state">
                <BilingualText>{"Chưa có hoạt động gần đây."}</BilingualText>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--color-ink)' }}>{act.user}</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-muted)', wordBreak: 'break-word' }}>
                      {act.action}{act.target ? ` · ${act.target}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatActivityTime(act.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

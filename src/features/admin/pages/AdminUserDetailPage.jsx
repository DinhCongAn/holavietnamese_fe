import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '@/features/admin/api/adminService';
import { useAuth } from '@/features/auth/context/AuthContext';

const EDITABLE_ROLES = ['LEARNER', 'CONTENT'];
const ROLE_LABELS = {
  LEARNER: { vi: 'Học viên', en: 'Learner' },
  CONTENT: { vi: 'Quản lý nội dung', en: 'Content' },
  ADMIN: { vi: 'Quản trị viên', en: 'Administrator' },
};

export function AdminUserDetailPage() {
  const { isAdmin } = useAuth();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [notice, setNotice] = useState({ type: '', message: '' });
  const [savingRole, setSavingRole] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const u = await adminService.getUserById(id);
      setUser(u);
      const userRole = String(u.role || '').replace(/^ROLE_/, '').trim();
      setSelectedRole(EDITABLE_ROLES.includes(userRole) ? userRole : 'LEARNER');
      setSelectedStatus(u.status || 'ACTIVE');
      return u;
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
      return null;
    }
  }, [id]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const handleRoleChange = async () => {
    if (!isAdmin || String(user?.role || '').replace(/^ROLE_/, '') === 'ADMIN') return;
    setSavingRole(true);
    setNotice({ type: '', message: '' });
    try {
      const res = await adminService.updateUserRole(id, selectedRole);
      const refreshed = await loadUser();
      if (refreshed) setNotice({ type: 'success', message: res.message || bilingualLabel('Đã cập nhật vai trò.', 'Role updated successfully.') });
    } catch(error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setSavingRole(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      const res = await adminService.updateUserStatus(id, selectedStatus);
      const refreshed = await loadUser();
      if (refreshed) setNotice({ type: 'success', message: res.message || bilingualLabel('Đã cập nhật trạng thái.', 'Status updated successfully.') });
    } catch (error) { setNotice({ type: 'error', message: error.message }); }
  };

  if (!user) return <div className="state" role={notice.message ? "alert" : "status"}><BilingualText>{notice.message || "Đang tải chi tiết người dùng…"}</BilingualText></div>;

  const userRole = String(user.role || '').replace(/^ROLE_/, '');
  const canEditRole = isAdmin && userRole !== 'ADMIN';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link to="/admin/users" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.85rem' }}><BilingualText>{"← Danh sách người dùng"}</BilingualText></Link>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <strong style={{ fontSize: '0.9rem' }}>{user.fullName}</strong>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0' }}>{user.fullName}</h1>
          <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}>@{user.username} • ID: #{user.id}</p>
        </div>
        <span className={`admin-badge ${user.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-danger'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          <BilingualText>{user.status === 'ACTIVE' ? 'Tài khoản Hoạt động' : 'Tài khoản Đã khóa'}</BilingualText>
        </span>
      </div>

      {notice.message && (
        <div role={notice.type === 'error' ? 'alert' : 'status'} style={{ padding: '10px 16px', background: notice.type === 'error' ? 'var(--color-red-soft)' : 'var(--color-sage-soft)', color: notice.type === 'error' ? 'var(--color-red)' : 'var(--color-forest)', borderRadius: '8px', marginBottom: '16px' }}>
          {notice.type === 'success' ? '✓ ' : ''}<BilingualText>{notice.message}</BilingualText>
        </div>
      )}

      {/* Account Status Changer */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3><BilingualText>{"Trạng thái tài khoản"}</BilingualText></h3>
        <div className="actions">
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {['ACTIVE', 'INACTIVE', 'LOCKED', 'DISABLED'].map((status) => <option key={status} value={status}>{bilingualLabel(status)}</option>)}
          </select>
          <button type="button" onClick={handleStatusChange}><BilingualText>{"Cập nhật trạng thái"}</BilingualText></button>
        </div>
      </div>

      {/* Grid: Left user details, Right role changer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}><BilingualText>{"Thông tin hồ sơ học viên"}</BilingualText></h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}><BilingualText>{"EMAIL"}</BilingualText></span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{user.email}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}><BilingualText>{"QUỐC GIA"}</BilingualText></span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{user.country || 'N/A'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}><BilingualText>{"TRÌNH ĐỘ MỤC TIÊU"}</BilingualText></span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}><BilingualText>{"Cấp độ"}</BilingualText>{user.targetLevel || 'A1'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}><BilingualText>{"MỤC TIÊU HỌC"}</BilingualText></span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}><BilingualText>{user.learningGoal || 'Giao tiếp'}</BilingualText></p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}><BilingualText>{"Phân vai trò"}</BilingualText></h3>
          {canEditRole ? <>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '16px' }}><BilingualText>{"Thay đổi quyền hạn truy cập của người dùng này."}</BilingualText></p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              disabled={savingRole}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            >
              {EDITABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {bilingualLabel(
                    ROLE_LABELS[role]?.vi ? `${ROLE_LABELS[role].vi} (${role})` : role,
                    ROLE_LABELS[role]?.en ? `${ROLE_LABELS[role].en} (${role})` : role
                  )}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={savingRole}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-red-hover)',
                color: 'var(--color-surface)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            ><BilingualText>{savingRole ? 'Đang cập nhật…' : 'Cập nhật'}</BilingualText></button>
          </div>
          </> : <div><span className="admin-badge admin-badge-info">{userRole || '—'}</span>{userRole === 'ADMIN' && <p className="muted"><BilingualText vi="Vai trò ADMIN chỉ được quản lý trực tiếp trong database." en="The ADMIN role can only be managed directly in the database." /></p>}</div>}
        </div>
      </div>

      {/* Enrolled Courses & History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}><BilingualText>{"Khóa học đã đăng ký"}</BilingualText></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {user.enrolledCourses?.map(c => (
              <div key={c.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-cream)', border: '1px solid var(--color-border)' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-ink)' }}>{c.name}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}><BilingualText>{"Đăng ký ngày"}</BilingualText>{c.enrolledAt} • <BilingualText>{"Tiến độ:"}</BilingualText>{c.progress}%</span>
                <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', marginTop: '6px' }}>
                  <div style={{ height: '100%', width: `${c.progress}%`, background: 'var(--color-red)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0' }}><BilingualText>{"Nhật ký hoạt động tài khoản"}</BilingualText></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {user.auditHistory?.map((h, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', display: 'block' }}>{h.date}</span>
                <strong style={{ color: 'var(--color-ink)' }}>{h.action}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserDetailPage;

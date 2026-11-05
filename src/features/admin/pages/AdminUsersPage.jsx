import { BilingualText, vietnameseLabel, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/features/admin/api/adminService';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  {
    key: 'ADMIN',
    name: 'Admin',
    nameVi: 'Quản trị viên',
    desc: 'Toàn quyền quản trị hệ thống, phê duyệt nội dung văn hóa & khóa học, quản lý người dùng.',
    bg: '#fee2e2',
    color: '#b91c1c',
    border: '#fecaca',
  },
  {
    key: 'CONTENT',
    name: 'Content Manager',
    nameVi: 'Quản lý nội dung',
    desc: 'Biên soạn và quản lý bài viết văn hóa, danh mục văn hóa, khóa học, bài học và từ vựng.',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
  },
  {
    key: 'LEARNER',
    name: 'User',
    nameVi: 'Người dùng',
    desc: 'Học viên tham gia lộ trình học tiếng Việt, luyện giao tiếp AI, tích lũy điểm và thành tích.',
    bg: '#f1f5f9',
    color: '#475569',
    border: '#e2e8f0',
  },
];

export function AdminUsersPage() {
  useTextLanguage();
  const [query, setQuery] = useState({ search: '', status: '', role: '', page: 0, size: PAGE_SIZE });
  const [input, setInput] = useState('');
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [state, setState] = useState({ loading: true, error: '', message: '' });
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('LEARNER');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [modalError, setModalError] = useState('');

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const result = await adminService.getUsers(query);
      setData(Array.isArray(result) ? { content: result, totalPages: 1, totalElements: result.length } : {
        content: result?.content ?? [], totalPages: result?.totalPages ?? 0, totalElements: result?.totalElements ?? 0,
      });
    } catch (error) {
      setState((s) => ({ ...s, error: error.message }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const notify = (message) => {
    setState((s) => ({ ...s, message }));
    window.setTimeout(() => setState((s) => ({ ...s, message: '' })), 3000);
  };

  const changeStatus = async (user) => {
    const next = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
      const targetId = user.id ?? user.userId;
      const response = await adminService.updateUserStatus(targetId, next);
      notify(response.message || bilingualLabel('Đã cập nhật trạng thái tài khoản.', 'Account status updated.'));
      toast.success(response.message || bilingualLabel('Đã cập nhật trạng thái tài khoản.', 'Account status updated.'));
      load();
    } catch (error) {
      setState((s) => ({ ...s, error: error.message }));
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const saveRole = async () => {
    if (!roleUser) return;
    setIsSavingRole(true);
    setModalError('');
    try {
      const targetId = roleUser.id ?? roleUser.userId;
      const response = await adminService.updateUserRole(targetId, selectedRole);
      const msg = response?.message || bilingualLabel('Đã cập nhật vai trò người dùng thành công.', 'User role updated successfully.');
      notify(msg);
      toast.success(msg);
      setRoleUser(null);
      load();
    } catch (error) {
      const errText = error?.response?.data?.message || error?.message || 'Lỗi khi cập nhật vai trò.';
      setModalError(errText);
      toast.error(errText);
    } finally {
      setIsSavingRole(false);
    }
  };

  const getRoleMeta = (roleRaw) => {
    const normalized = String(roleRaw || '').replace(/^ROLE_/, '').toUpperCase();
    if (normalized === 'ADMIN') return ROLE_OPTIONS[0];
    if (normalized === 'CONTENT' || normalized === 'CONTENT_MANAGER') return ROLE_OPTIONS[1];
    return ROLE_OPTIONS[2];
  };

  const users = data.content;
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px' }}><BilingualText>{"Quản lý người dùng"}</BilingualText></h1>
        <p style={{ color: 'var(--color-muted)', margin: 0 }}><BilingualText>{"Tìm kiếm, lọc, phân quyền và quản lý trạng thái tài khoản."}</BilingualText></p>
      </div>

      {state.message && <div className="success state" style={{ padding: 12 }}>✓ <BilingualText>{state.message}</BilingualText></div>}
      {state.error && <div className="state" role="alert"><p><BilingualText>{state.error}</BilingualText></p><button onClick={load}><BilingualText>{"Thử lại"}</BilingualText></button></div>}

      <form className="admin-card" onSubmit={(e) => { e.preventDefault(); setQuery((q) => ({ ...q, search: input.trim(), page: 0 })); }} style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input aria-label={bilingualLabel("Tìm người dùng", "Search users")} placeholder={vietnameseLabel("Tìm tên, username hoặc email…")} value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: '1 1 260px' }} />
        <select aria-label={bilingualLabel("Trạng thái", "Status")} value={query.status} onChange={(e) => setQuery((q) => ({ ...q, status: e.target.value, page: 0 }))}>
          <option value="">{vietnameseLabel("Tất cả trạng thái")}</option><option value="ACTIVE">{vietnameseLabel("ACTIVE")}</option><option value="INACTIVE">{vietnameseLabel("INACTIVE")}</option><option value="LOCKED">{vietnameseLabel("LOCKED")}</option><option value="DISABLED">{vietnameseLabel("DISABLED")}</option>
        </select>
        <select aria-label={bilingualLabel("Vai trò", "Role")} value={query.role} onChange={(e) => setQuery((q) => ({ ...q, role: e.target.value, page: 0 }))}>
          <option value="">{bilingualLabel("Tất cả vai trò", "All roles")}</option>
          <option value="ADMIN">Admin</option>
          <option value="CONTENT">Content Manager</option>
          <option value="LEARNER">User</option>
        </select>
        <button type="submit"><BilingualText>{"Tìm kiếm"}</BilingualText></button>
      </form>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        {state.loading ? <div className="state"><BilingualText>{"Đang tải người dùng…"}</BilingualText></div> : users.length === 0 ? <div className="state"><BilingualText>{"Không tìm thấy người dùng phù hợp."}</BilingualText></div> : (
          <table className="admin-table"><thead><tr><th><BilingualText>{"Người dùng"}</BilingualText></th><th><BilingualText>{"Thư điện tử"}</BilingualText></th><th><BilingualText>{"Vai trò"}</BilingualText></th><th><BilingualText>{"Trạng thái"}</BilingualText></th><th style={{ textAlign: 'right' }}><BilingualText>{"Thao tác"}</BilingualText></th></tr></thead>
            <tbody>{users.map((user) => {
              const userRoles = user.roles ?? (user.role ? [user.role] : []);
              const primaryRole = userRoles[0] || user.role || 'LEARNER';
              const roleMeta = getRoleMeta(primaryRole);

              return <tr key={user.id ?? user.userId}>
                <td><strong>{user.fullName || user.username}</strong><small style={{ display: 'block', color: 'var(--color-muted)' }}>@{user.username}</small></td>
                <td>{user.email || '—'}</td>
                <td>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: roleMeta.bg,
                      color: roleMeta.color,
                      border: `1px solid ${roleMeta.border}`,
                    }}
                  >
                    {roleMeta.name}
                  </span>
                </td>
                <td><span className={`admin-badge ${user.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-danger'}`}><BilingualText>{user.status}</BilingualText></span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    className="secondary"
                    onClick={() => {
                      setRoleUser(user);
                      setModalError('');
                      const current = String(user.role || userRoles[0] || 'LEARNER').replace(/^ROLE_/, '').toUpperCase();
                      setSelectedRole(current === 'CONTENT_MANAGER' ? 'CONTENT' : current);
                    }}
                  >
                    <BilingualText>{"Vai trò"}</BilingualText>
                  </button>{' '}
                  <Link className="button secondary" to={`/admin/users/${user.id ?? user.userId}`}><BilingualText>{"Chi tiết"}</BilingualText></Link>{' '}
                  <button className={user.status === 'ACTIVE' ? 'danger' : ''} onClick={() => changeStatus(user)}><BilingualText>{user.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}</BilingualText></button>
                </td>
              </tr>;
            })}</tbody>
          </table>
        )}
      </div>

      <div className="actions" style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <span className="muted"><BilingualText>{"Tổng cộng"}</BilingualText> {data.totalElements} <BilingualText>{"người dùng"}</BilingualText></span>
        <div className="actions"><button className="secondary" disabled={query.page === 0 || state.loading} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}><BilingualText>{"← Trước"}</BilingualText></button><span><BilingualText>{"Trang"}</BilingualText> {query.page + 1}/{Math.max(data.totalPages, 1)}</span><button className="secondary" disabled={query.page + 1 >= data.totalPages || state.loading} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}><BilingualText>{"Sau →"}</BilingualText></button></div>
      </div>

      {roleUser && (
        <Modal title={bilingualLabel("Cập nhật vai trò người dùng", "Update User Role")} onClose={() => { if (!isSavingRole) setRoleUser(null); }}>
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ fontSize: '15px' }}>{roleUser.fullName || roleUser.username}</strong>
            <p style={{ margin: '2px 0 0 0', color: 'var(--color-muted)', fontSize: '13px' }}>
              @{roleUser.username} • {roleUser.email || '—'}
            </p>
          </div>

          {modalError && (
            <div style={{ padding: '9px 12px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '14px', fontSize: '13px', fontWeight: 600 }}>
              ⚠️ {modalError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {ROLE_OPTIONS.map((item) => (
              <label
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: selectedRole === item.key ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
                  background: selectedRole === item.key ? '#fff7ed' : '#ffffff',
                  cursor: isSavingRole ? 'not-allowed' : 'pointer',
                  margin: 0,
                }}
              >
                <input
                  type="radio"
                  name="user-role-selection"
                  value={item.key}
                  disabled={isSavingRole}
                  checked={selectedRole === item.key}
                  onChange={() => setSelectedRole(item.key)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>{item.name} ({item.nameVi})</strong>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-forest)', lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="actions" style={{ justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="secondary" disabled={isSavingRole} onClick={() => setRoleUser(null)}>
              <BilingualText>{"Hủy"}</BilingualText>
            </button>
            <button type="button" disabled={isSavingRole} onClick={saveRole}>
              <BilingualText>{isSavingRole ? "Đang lưu…" : "Lưu vai trò"}</BilingualText>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { BilingualText, vietnameseLabel, bilingualLabel } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/features/admin/api/adminService';
import { useAuth } from '@/features/auth/context/AuthContext';

const PAGE_SIZE = 10;
const ALL_ROLES = ['LEARNER', 'CONTENT', 'ADMIN'];
const EDITABLE_ROLES = ['LEARNER', 'CONTENT'];
const ROLE_LABELS = {
  LEARNER: { vi: 'Học viên', en: 'Learner' },
  CONTENT: { vi: 'Quản lý nội dung', en: 'Content' },
  ADMIN: { vi: 'Quản trị viên', en: 'Administrator' },
};

export function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState({ search: '', status: '', role: '', page: 0, size: PAGE_SIZE });
  const [input, setInput] = useState('');
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [state, setState] = useState({ loading: true, error: '', message: '' });
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('LEARNER');
  const [savingRole, setSavingRole] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const result = await adminService.getUsers(query);
      setData(Array.isArray(result) ? { content: result, totalPages: 1, totalElements: result.length } : {
        content: result?.content ?? [], totalPages: result?.totalPages ?? 0, totalElements: result?.totalElements ?? 0,
      });
      return true;
    } catch (error) {
      setState((s) => ({ ...s, error: error.message }));
      return false;
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
      const response = await adminService.updateUserStatus(user.id, next);
      notify(response.message || bilingualLabel('Đã cập nhật trạng thái tài khoản.', 'Account status updated.'));
      load();
    } catch (error) { setState((s) => ({ ...s, error: error.message })); }
  };

  const saveRoles = async () => {
    if (!roleUser || !EDITABLE_ROLES.includes(selectedRole)) return;
    setSavingRole(true);
    setState((s) => ({ ...s, error: '', message: '' }));
    try {
      const response = await adminService.updateUserRole(roleUser.id ?? roleUser.userId, selectedRole);
      setRoleUser(null);
      const refreshed = await load();
      if (refreshed) notify(response.message || bilingualLabel('Đã cập nhật vai trò.', 'Role updated.'));
    } catch (error) {
      setState((s) => ({ ...s, error: error.message, message: '' }));
    } finally {
      setSavingRole(false);
    }
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
          <option value="">{vietnameseLabel("Tất cả vai trò")}</option>
          {ALL_ROLES.map((role) => (
            <option key={role} value={role}>
              {vietnameseLabel(ROLE_LABELS[role]?.vi ? `${role} (${ROLE_LABELS[role].vi})` : role)}
            </option>
          ))}
        </select>
        <button type="submit"><BilingualText>{"Tìm kiếm"}</BilingualText></button>
      </form>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        {state.loading ? <div className="state"><BilingualText>{"Đang tải người dùng…"}</BilingualText></div> : users.length === 0 ? <div className="state"><BilingualText>{"Không tìm thấy người dùng phù hợp."}</BilingualText></div> : (
          <table className="admin-table"><thead><tr><th><BilingualText>{"Người dùng"}</BilingualText></th><th><BilingualText>{"Thư điện tử"}</BilingualText></th><th><BilingualText>{"Vai trò"}</BilingualText></th><th><BilingualText>{"Trạng thái"}</BilingualText></th><th style={{ textAlign: 'right' }}><BilingualText>{"Thao tác"}</BilingualText></th></tr></thead>
            <tbody>{users.map((user) => {
              const userRole = String(user.role || '').replace(/^ROLE_/, '');
              return <tr key={user.id ?? user.userId}>
                <td><strong>{user.fullName || user.username}</strong><small style={{ display: 'block', color: 'var(--color-muted)' }}>@{user.username}</small></td>
                <td>{user.email || '—'}</td>
                <td><span className="admin-badge admin-badge-info">{userRole || '—'}</span></td>
                <td><span className={`admin-badge ${user.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-danger'}`}><BilingualText>{user.status}</BilingualText></span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {isAdmin && userRole !== 'ADMIN' && <><button className="secondary" onClick={() => { setRoleUser(user); setSelectedRole(EDITABLE_ROLES.includes(userRole) ? userRole : 'LEARNER'); }}><BilingualText>{"Vai trò"}</BilingualText></button>{' '}</>}
                  <Link className="button secondary" to={`/admin/users/${user.id ?? user.userId}`}><BilingualText>{"Chi tiết"}</BilingualText></Link>{' '}
                  <button className={user.status === 'ACTIVE' ? 'danger' : ''} onClick={() => changeStatus(user)}><BilingualText>{user.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}</BilingualText></button>
                </td>
              </tr>;
            })}</tbody>
          </table>
        )}
      </div>

      <div className="actions" style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <span className="muted"><BilingualText>{"Tổng cộng"}</BilingualText>{data.totalElements}<BilingualText>{"người dùng"}</BilingualText></span>
        <div className="actions"><button className="secondary" disabled={query.page === 0 || state.loading} onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}><BilingualText>{"← Trước"}</BilingualText></button><span><BilingualText>{"Trang"}</BilingualText>{query.page + 1}/{Math.max(data.totalPages, 1)}</span><button className="secondary" disabled={query.page + 1 >= data.totalPages || state.loading} onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}><BilingualText>{"Sau →"}</BilingualText></button></div>
      </div>

      {roleUser && <Modal title={bilingualLabel("Cập nhật vai trò", "Update Role")} onClose={()=>setRoleUser(null)}>
        <p className="muted">{roleUser.fullName || roleUser.username}</p>
        <label>
          <BilingualText vi="Vai trò" en="Role" />
          <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} disabled={savingRole}>
            {EDITABLE_ROLES.map((role) => (
              <option key={role} value={role}>{bilingualLabel(`${ROLE_LABELS[role].vi} (${role})`, `${ROLE_LABELS[role].en} (${role})`)}</option>
            ))}
          </select>
        </label>
        <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="secondary" disabled={savingRole} onClick={() => setRoleUser(null)}><BilingualText>{"Hủy"}</BilingualText></button>
          <button disabled={savingRole} onClick={saveRoles}><BilingualText>{savingRole ? 'Đang lưu…' : 'Lưu vai trò'}</BilingualText></button>
        </div>
      </Modal>}
    </div>
  );
}

export default AdminUsersPage;

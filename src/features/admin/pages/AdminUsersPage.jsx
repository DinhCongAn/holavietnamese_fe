import { BilingualText, vietnameseLabel, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/features/admin/api/adminService';

const PAGE_SIZE = 10;

export function AdminUsersPage() {
  useTextLanguage();
  const [query, setQuery] = useState({ search: '', status: '', role: '', page: 0, size: PAGE_SIZE });
  const [input, setInput] = useState('');
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [state, setState] = useState({ loading: true, error: '', message: '' });
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

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
      const response = await adminService.updateUserStatus(user.id, next);
      notify(response.message || bilingualLabel('Đã cập nhật trạng thái tài khoản.', 'Account status updated.'));
      load();
    } catch (error) { setState((s) => ({ ...s, error: error.message })); }
  };

  const saveRoles = async () => {
    try {
      const response = await adminService.updateUserRole(roleUser.id, selectedRoles);
      notify(response.message || bilingualLabel('Đã cập nhật vai trò.', 'Role updated.'));
      setRoleUser(null);
      load();
    } catch (error) { setState((s) => ({ ...s, error: error.message })); }
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
          <option value="">{vietnameseLabel("Tất cả vai trò")}</option><option value="LEARNER">{vietnameseLabel("LEARNER")}</option><option value="INSTRUCTOR">{vietnameseLabel("INSTRUCTOR")}</option><option value="ADMIN">{vietnameseLabel("ADMIN")}</option>
        </select>
        <button type="submit"><BilingualText>{"Tìm kiếm"}</BilingualText></button>
      </form>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        {state.loading ? <div className="state"><BilingualText>{"Đang tải người dùng…"}</BilingualText></div> : users.length === 0 ? <div className="state"><BilingualText>{"Không tìm thấy người dùng phù hợp."}</BilingualText></div> : (
          <table className="admin-table"><thead><tr><th><BilingualText>{"Người dùng"}</BilingualText></th><th><BilingualText>{"Thư điện tử"}</BilingualText></th><th><BilingualText>{"Vai trò"}</BilingualText></th><th><BilingualText>{"Trạng thái"}</BilingualText></th><th style={{ textAlign: 'right' }}><BilingualText>{"Thao tác"}</BilingualText></th></tr></thead>
            <tbody>{users.map((user) => {
              const userRoles = user.roles ?? (user.role ? [user.role] : []);
              return <tr key={user.id ?? user.userId}>
                <td><strong>{user.fullName || user.username}</strong><small style={{ display: 'block', color: 'var(--color-muted)' }}>@{user.username}</small></td>
                <td>{user.email || '—'}</td>
                <td>{userRoles.map((role) => <span key={role} className="admin-badge admin-badge-info" style={{ marginRight: 4 }}>{String(role).replace('ROLE_', '')}</span>)}</td>
                <td><span className={`admin-badge ${user.status === 'ACTIVE' ? 'admin-badge-success' : 'admin-badge-danger'}`}><BilingualText>{user.status}</BilingualText></span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="secondary" onClick={() => { setRoleUser(user); setSelectedRoles(userRoles.map((r) => String(r).replace('ROLE_', ''))); }}><BilingualText>{"Vai trò"}</BilingualText></button>{' '}
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
        {['LEARNER', 'INSTRUCTOR', 'ADMIN'].map((role) => <label key={role} style={{ flexDirection: 'row' }}><input type="checkbox" style={{ width: 'auto' }} checked={selectedRoles.includes(role)} onChange={(e) => setSelectedRoles((values) => e.target.checked ? [...values, role] : values.filter((item) => item !== role))} />{role}</label>)}
        <div className="actions" style={{ justifyContent: 'flex-end' }}><button className="secondary" onClick={() => setRoleUser(null)}><BilingualText>{"Hủy"}</BilingualText></button><button disabled={!selectedRoles.length} onClick={saveRoles}><BilingualText>{"Lưu vai trò"}</BilingualText></button></div>
      </Modal>}
    </div>
  );
}

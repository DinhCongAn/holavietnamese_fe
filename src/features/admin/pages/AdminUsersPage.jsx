import { BilingualText, vietnameseLabel, bilingualLabel } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { useCallback, useEffect, useRef, useState } from 'react';
import { adminService } from '@/features/admin/api/adminService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AdminActionButton, AdminActionGroup, AdminActionLink } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import {
  Search,
  X,
  ChevronDown,
  Check,
  Eye,
  Pencil,
  Lock,
  Unlock,
  Users,
  GraduationCap,
  PenTool,
  Shield,
} from 'lucide-react';

const PAGE_SIZE = 10;
const EDITABLE_ROLES = ['LEARNER', 'CONTENT'];
const ROLE_LABELS = {
  LEARNER: { vi: 'Học viên', en: 'Learner' },
  CONTENT: { vi: 'Quản lý nội dung', en: 'Content' },
  ADMIN: { vi: 'Quản trị viên', en: 'Administrator' },
};

const STATUS_OPTIONS = [
  { value: '', label: bilingualLabel('Tất cả trạng thái', 'All statuses'), dotColor: '#94A3B8' },
  { value: 'ACTIVE', label: bilingualLabel('Đang hoạt động', 'Active'), dotColor: '#10B981' },
  { value: 'INACTIVE', label: bilingualLabel('Chưa kích hoạt', 'Inactive'), dotColor: '#94A3B8' },
  { value: 'LOCKED', label: bilingualLabel('Đã khóa', 'Locked'), dotColor: '#EF4444' },
  { value: 'DISABLED', label: bilingualLabel('Vô hiệu hóa', 'Disabled'), dotColor: '#64748B' },
];

const ROLE_OPTIONS = [
  { value: '', label: bilingualLabel('Tất cả vai trò', 'All roles'), icon: Users, iconColor: '#64748B' },
  { value: 'LEARNER', label: bilingualLabel('Học viên', 'Learner'), icon: GraduationCap, iconColor: '#2563EB' },
  { value: 'CONTENT', label: bilingualLabel('Quản lý nội dung', 'Content Manager'), icon: PenTool, iconColor: '#EA580C' },
  { value: 'ADMIN', label: bilingualLabel('Quản trị viên', 'Administrator'), icon: Shield, iconColor: '#DC2626' },
];

const EDITABLE_ROLE_DETAILS = [
  {
    key: 'LEARNER',
    nameVi: 'Học viên',
    nameEn: 'Learner',
    code: 'LEARNER',
    icon: GraduationCap,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    badgeClass: 'admin-badge admin-badge-info',
    descVi: 'Tài khoản học viên tham gia lộ trình học tiếng Việt, luyện phát âm, làm bài kiểm tra và giao tiếp với trợ lý AI.',
    descEn: 'Learner account participating in courses, pronunciation practice, quizzes, and AI conversations.',
  },
  {
    key: 'CONTENT',
    nameVi: 'Quản lý nội dung',
    nameEn: 'Content Manager',
    code: 'CONTENT',
    icon: PenTool,
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
    badgeClass: 'admin-badge admin-badge-warning',
    descVi: 'Biên soạn, kiểm duyệt và quản lý các bài viết văn hóa, khóa học, bài học và ngân hàng từ vựng.',
    descEn: 'Create, review, and manage cultural articles, courses, lessons, and vocabulary database.',
  },
];

function AdminFilterSelect({
  value,
  options,
  onChange,
  ariaLabel,
  minWidth = '190px',
  align = 'left',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className={`admin-select-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        {selectedOption?.icon ? (
          <selectedOption.icon size={15} style={{ color: selectedOption.iconColor || '#64748B', flexShrink: 0 }} />
        ) : selectedOption?.dotColor ? (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: selectedOption.dotColor,
              flexShrink: 0,
            }}
          />
        ) : null}

        <span style={{ whiteSpace: 'nowrap', color: '#1E293B', fontWeight: 600 }}>
          {selectedOption?.label}
        </span>

        <ChevronDown
          size={14}
          style={{
            color: open ? 'var(--primary-orange, #F97316)' : '#94A3B8',
            flexShrink: 0,
            marginLeft: '4px',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            minWidth: minWidth,
            maxHeight: '280px',
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
            zIndex: 60,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#C2410C' : '#334155',
                  background: isSelected ? '#FFF7ED' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  {opt.icon ? (
                    <opt.icon
                      size={15}
                      style={{ color: opt.iconColor || (isSelected ? '#EA580C' : '#64748B'), flexShrink: 0 }}
                    />
                  ) : opt.dotColor ? (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: opt.dotColor,
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <Check size={14} style={{ color: '#EA580C', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
      const response = await adminService.updateUserStatus(user.id ?? user.userId, next);
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

      <form
        className="admin-card"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery((q) => ({ ...q, search: input.trim(), page: 0 }));
        }}
        style={{
          position: 'relative',
          zIndex: 40,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search input on the left */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 280px',
            maxWidth: '380px',
            minWidth: '220px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            aria-label={bilingualLabel("Tìm người dùng", "Search users")}
            placeholder={vietnameseLabel("Tìm tên, username hoặc email…")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 36px 0 36px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              fontSize: '13px',
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput('');
                setQuery((q) => ({ ...q, search: '', page: 0 }));
              }}
              aria-label={bilingualLabel("Xóa tìm kiếm", "Clear search")}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                padding: '4px',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                minHeight: '24px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* All statuses, All roles, and Search button pushed to the end (right) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginLeft: 'auto',
            flexWrap: 'wrap',
          }}
        >
          {/* Custom Status Dropdown Menu */}
          <AdminFilterSelect
            ariaLabel={bilingualLabel("Trạng thái", "Status")}
            value={query.status}
            options={STATUS_OPTIONS}
            onChange={(newStatus) => setQuery((q) => ({ ...q, status: newStatus, page: 0 }))}
            minWidth="190px"
            align="right"
          />

          {/* Custom Role Dropdown Menu */}
          <AdminFilterSelect
            ariaLabel={bilingualLabel("Vai trò", "Role")}
            value={query.role}
            options={ROLE_OPTIONS}
            onChange={(newRole) => setQuery((q) => ({ ...q, role: newRole, page: 0 }))}
            minWidth="200px"
            align="right"
          />

          {/* Balanced Search Button */}
          <button
            type="submit"
            style={{
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <Search size={15} strokeWidth={2.3} />
            <span><BilingualText>{"Tìm kiếm"}</BilingualText></span>
          </button>
        </div>
      </form>

      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        {state.loading ? <div className="state"><BilingualText>{"Đang tải người dùng…"}</BilingualText></div> : users.length === 0 ? <div className="state"><BilingualText>{"Không tìm thấy người dùng phù hợp."}</BilingualText></div> : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th><BilingualText>{"Người dùng"}</BilingualText></th>
                  <th><BilingualText>{"Thư điện tử"}</BilingualText></th>
                  <th><BilingualText>{"Vai trò"}</BilingualText></th>
                  <th><BilingualText>{"Trạng thái"}</BilingualText></th>
                  <th style={{ textAlign: 'right' }}><BilingualText>{"Thao tác"}</BilingualText></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userRole = String(user.role || '').replace(/^ROLE_/, '');
                  const isActive = user.status === 'ACTIVE';
                  const roleBadgeClass = userRole === 'ADMIN'
                    ? 'admin-badge admin-badge-danger'
                    : userRole === 'CONTENT'
                    ? 'admin-badge admin-badge-warning'
                    : 'admin-badge admin-badge-info';

                  return (
                    <tr key={user.id ?? user.userId}>
                      <td>
                        <strong>{user.fullName || user.username}</strong>
                        <small style={{ display: 'block', color: 'var(--color-muted)' }}>@{user.username}</small>
                      </td>
                      <td>{user.email || '—'}</td>
                      <td>
                        <span className={roleBadgeClass}>{userRole || '—'}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#10B981' : '#EF4444',
                            }}
                          />
                          <BilingualText>{user.status}</BilingualText>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <AdminActionGroup>
                          <AdminActionLink
                            tone="detail"
                            icon={Eye}
                            to={`/admin/users/${user.id ?? user.userId}`}
                          >
                            <BilingualText>{"Chi tiết"}</BilingualText>
                          </AdminActionLink>

                          {isAdmin && userRole !== 'ADMIN' && (
                            <AdminActionButton
                              tone="edit"
                              icon={Pencil}
                              onClick={() => {
                                setRoleUser(user);
                                setSelectedRole(EDITABLE_ROLES.includes(userRole) ? userRole : 'LEARNER');
                              }}
                            >
                              <BilingualText>{"Vai trò"}</BilingualText>
                            </AdminActionButton>
                          )}

                          <AdminActionButton
                            tone={isActive ? 'delete' : 'restore'}
                            icon={isActive ? Lock : Unlock}
                            onClick={() => changeStatus(user)}
                          >
                            <BilingualText>{isActive ? 'Khóa' : 'Kích hoạt'}</BilingualText>
                          </AdminActionButton>
                        </AdminActionGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <AdminPagination
              currentPage={query.page + 1}
              pageSize={query.size}
              totalItems={data.totalElements}
              onPageChange={(nextPage) => setQuery((q) => ({ ...q, page: nextPage - 1 }))}
            />
          </>
        )}
      </div>

      {/* Upgraded Modern Role Update Modal */}
      {roleUser && (
        <Modal
          title={bilingualLabel("Cập nhật vai trò tài khoản", "Update User Role")}
          onClose={() => !savingRole && setRoleUser(null)}
        >
          {/* User info card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
                color: '#C2410C',
                fontWeight: 700,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #FDBA74',
              }}
            >
              {(roleUser.fullName || roleUser.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '15px', color: '#1E293B', fontWeight: 700 }}>
                  {roleUser.fullName || roleUser.username}
                </strong>
                <span
                  className={
                    String(roleUser.role || '').replace(/^ROLE_/, '') === 'CONTENT'
                      ? 'admin-badge admin-badge-warning'
                      : 'admin-badge admin-badge-info'
                  }
                  style={{ fontSize: '11px', padding: '2px 8px' }}
                >
                  {String(roleUser.role || '').replace(/^ROLE_/, '') || 'LEARNER'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span>@{roleUser.username}</span>
                {roleUser.email && (
                  <>
                    <span>•</span>
                    <span>{roleUser.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Role Selection section */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
              }}
            >
              <BilingualText vi="Chọn vai trò áp dụng" en="Select Applied Role" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {EDITABLE_ROLE_DETAILS.map((item) => {
                const isSelected = selectedRole === item.key;
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => !savingRole && setSelectedRole(item.key)}
                    onKeyDown={(e) => {
                      if ((e.key === ' ' || e.key === 'Enter') && !savingRole) {
                        setSelectedRole(item.key);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #EA580C' : '1px solid #E2E8F0',
                      background: isSelected ? '#FFF7ED' : '#FFFFFF',
                      cursor: savingRole ? 'not-allowed' : 'pointer',
                      boxShadow: isSelected
                        ? '0 4px 14px rgba(234, 88, 12, 0.12)'
                        : '0 1px 3px rgba(15, 23, 42, 0.03)',
                      transition: 'all 0.18s ease',
                      userSelect: 'none',
                    }}
                  >
                    {/* Role Icon Container */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: item.iconBg,
                        color: item.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </div>

                    {/* Role Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#C2410C' : '#1E293B' }}>
                            <BilingualText vi={item.nameVi} en={item.nameEn} />
                          </span>
                          <span className={item.badgeClass} style={{ fontSize: '11px', padding: '1px 7px' }}>
                            {item.code}
                          </span>
                        </div>

                        {/* Radio Indicator */}
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #EA580C' : '2px solid #CBD5E1',
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                          }}
                        />
                      </div>

                      <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B', lineHeight: 1.45 }}>
                        <BilingualText vi={item.descVi} en={item.descEn} />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '22px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <button
              type="button"
              className="admin-modal-btn-cancel"
              disabled={savingRole}
              onClick={() => setRoleUser(null)}
            >
              <BilingualText vi="Hủy" en="Cancel" />
            </button>

            <button
              type="button"
              className="admin-modal-btn-save"
              disabled={savingRole}
              onClick={saveRoles}
            >
              <Check size={15} strokeWidth={2.4} />
              <BilingualText
                vi={savingRole ? 'Đang lưu…' : 'Lưu vai trò'}
                en={savingRole ? 'Saving…' : 'Save Role'}
              />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminUsersPage;

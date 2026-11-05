import { BilingualText } from '@/shared/components/common/BilingualText';
import { useState, useEffect } from 'react';
import { adminService } from '@/features/admin/api/adminService';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);

  useEffect(() => {
    adminService.getSystemSettings().then(setSettings).catch(err=>setError(err.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);setError('');
    try {const res = await adminService.updateSystemSettings(settings);
    setMsg(res.message);
    setTimeout(() => setMsg(''), 3000);
    }catch(err){setError(err.message);}finally{setBusy(false);}
  };

  if (!settings) return <div className="state" role={error?"alert":"status"}><BilingualText>{error || "Đang tải cấu hình hệ thống…"}</BilingualText></div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0' }}><BilingualText>{"Cấu hình Hệ thống"}</BilingualText></h1>
        <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}><BilingualText>{"Quản lý các thông số chung của ứng dụng, dịch vụ AI và các cổng xác thực."}</BilingualText></p>
      </div>

      {error && <div className="ui-notice ui-notice--error" role="alert"><BilingualText>{error}</BilingualText></div>}
      {msg && (
        <div style={{ padding: '10px 16px', background: 'var(--color-sage-soft)', color: 'var(--color-ink)', borderRadius: '8px', marginBottom: '16px' }}>
          ✓ <BilingualText>{msg}</BilingualText>
        </div>
      )}

      <form onSubmit={handleSave} className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}><BilingualText>{"Tên ứng dụng"}</BilingualText></label>
          <input
            type="text"
            value={settings.appName}
            onChange={e => setSettings({ ...settings, appName: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}><BilingualText>{"Email hỗ trợ hệ thống"}</BilingualText></label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '6px' }}><BilingualText>{"Nhà cung cấp AI Tutor (Hội thoại & Gợi ý phản hồi)"}</BilingualText></label>
          <input
            type="text"
            value={settings.aiTutorProvider}
            onChange={e => setSettings({ ...settings, aiTutorProvider: e.target.value })}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--color-ink)' }}><BilingualText>{"Cho phép đăng ký tài khoản mới"}</BilingualText></strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}><BilingualText>{"Bật/tắt biểu mẫu đăng ký học viên trên trang web"}</BilingualText></span>
            </div>
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={e => setSettings({ ...settings, allowRegistration: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-red-hover)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--color-ink)' }}><BilingualText>{"Kích hoạt đăng nhập Google OAuth"}</BilingualText></strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}><BilingualText>{"Bật nút Sign in with Google qua thư viện GSI"}</BilingualText></span>
            </div>
            <input
              type="checkbox"
              checked={settings.googleAuthEnabled}
              onChange={e => setSettings({ ...settings, googleAuthEnabled: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-red-hover)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', color: 'var(--color-ink)' }}><BilingualText>{"Chế độ bảo trì hệ thống"}</BilingualText></strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}><BilingualText>{"Chỉ cho phép tài khoản Admin đăng nhập khi bảo trì"}</BilingualText></span>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: 'var(--color-red-hover)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: 'flex-start',
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--color-red-hover)',
            color: 'var(--color-surface)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        ><BilingualText>{"Lưu cấu hình hệ thống"}</BilingualText></button>
      </form>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useSiteContent } from '@/features/admin/context/SiteContentContext';
import { siteContentService } from '@/features/admin/api/siteContentService';

const cardStyle = { padding: 0, overflowX: 'auto', marginBottom: 24 };
const headingStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--color-border)' };
const toggleStyle = { width: 20, height: 20, accentColor: 'var(--color-red-hover)', cursor: 'pointer' };

function Toggle({ checked, disabled, label, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
      style={toggleStyle}
    />
  );
}

function Status({ enabled }) {
  return (
    <span className={`admin-badge ${enabled ? 'admin-badge-success' : 'admin-badge-warning'}`}>
      <BilingualText vi={enabled ? 'Đang bật' : 'Đang tắt'} en={enabled ? 'Enabled' : 'Disabled'} />
    </span>
  );
}

export function AdminSiteContentPage() {
  const lang = useTextLanguage();
  const [content, setContent] = useState({ menus: [], banners: [], features: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const { refresh: refreshPublicContent } = useSiteContent();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [menus, banners, features] = await Promise.all([
        siteContentService.getAdminMenus(),
        siteContentService.getAdminBanners(),
        siteContentService.getAdminFeatures(),
      ]);
      setContent({
        menus: Array.isArray(menus) ? menus : [],
        banners: Array.isArray(banners) ? banners : [],
        features: Array.isArray(features) ? features : [],
      });
    } catch (requestError) {
      setError(requestError.message || 'Không thể tải cấu hình menu và banner.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (kind, item, enabled) => {
    const identity = kind === 'features' ? item.key : item.id;
    const token = `${kind}:${identity}`;
    setBusy(token);
    setError('');
    try {
      const updated = kind === 'menus'
        ? await siteContentService.setMenuEnabled(item.id, enabled)
        : kind === 'banners'
          ? await siteContentService.setBannerEnabled(item.id, enabled)
          : await siteContentService.setFeatureEnabled(item.key, enabled);
      setContent((current) => ({
        ...current,
        [kind]: current[kind].map((entry) => {
          const matches = kind === 'features' ? entry.key === item.key : entry.id === item.id;
          return matches ? { ...entry, ...(updated || {}), enabled } : entry;
        }),
      }));
      await refreshPublicContent();
    } catch (requestError) {
      setError(requestError.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setBusy('');
    }
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem' }}><BilingualText vi="Menu & banner" en="Menus & banners" /></h1>
          <p className="muted" style={{ margin: 0 }}>
            <BilingualText vi="Bật hoặc tắt menu, banner và nhóm chức năng hiển thị trên website." en="Enable or disable website menus, banners, and linked feature groups." />
          </p>
        </div>
        <button type="button" className="secondary" disabled={loading || Boolean(busy)} onClick={load}>
          <BilingualText vi="Tải lại" en="Reload" />
        </button>
      </div>

      {error && <div className="ui-notice ui-notice--error" role="alert" style={{ marginBottom: 20 }}><BilingualText>{error}</BilingualText></div>}
      {loading ? <div className="state" role="status"><BilingualText vi="Đang tải cấu hình…" en="Loading configuration…" /></div> : <>
        <section className="admin-card" style={cardStyle} aria-labelledby="feature-flags-heading">
          <div style={headingStyle}>
            <div><h2 id="feature-flags-heading" style={{ margin: 0 }}><BilingualText vi="Nhóm chức năng" en="Feature groups" /></h2><small className="muted"><BilingualText vi="Tắt một nhóm sẽ ẩn mọi menu và banner liên kết với nhóm đó." en="Disabling a group hides all menus and banners linked to it." /></small></div>
            <span className="badge">{content.features.length}</span>
          </div>
          <table className="admin-table">
            <thead><tr><th><BilingualText vi="Chức năng" en="Feature" /></th><th><BilingualText vi="Mã" en="Key" /></th><th><BilingualText vi="Trạng thái" en="Status" /></th><th><BilingualText vi="Bật / tắt" en="Toggle" /></th></tr></thead>
            <tbody>{content.features.map((feature) => {
              const token = `features:${feature.key}`;
              return <tr key={feature.key}>
                <td><strong><BilingualText vi={feature.nameVi || feature.key} en={feature.nameEn || feature.nameVi || feature.key} /></strong>{feature.description && <div className="muted">{feature.description}</div>}</td>
                <td><code>{feature.key}</code></td>
                <td><Status enabled={feature.enabled !== false} /></td>
                <td><Toggle checked={feature.enabled !== false} disabled={Boolean(busy)} label={`${feature.key}: ${feature.enabled !== false ? 'enabled' : 'disabled'}`} onChange={(enabled) => toggle('features', feature, enabled)} />{busy === token && <small className="muted"> …</small>}</td>
              </tr>;
            })}</tbody>
          </table>
        </section>

        <section className="admin-card" style={cardStyle} aria-labelledby="menus-heading">
          <div style={headingStyle}>
            <div><h2 id="menus-heading" style={{ margin: 0 }}><BilingualText vi="Menu điều hướng" en="Navigation menus" /></h2><small className="muted"><BilingualText vi="Thứ tự và nội dung lấy trực tiếp từ database." en="Order and content are loaded directly from the database." /></small></div>
            <span className="badge">{content.menus.length}</span>
          </div>
          <table className="admin-table">
            <thead><tr><th><BilingualText vi="Nhãn" en="Label" /></th><th><BilingualText vi="Vị trí" en="Placement" /></th><th><BilingualText vi="Đường dẫn" en="Path" /></th><th><BilingualText vi="Nhóm" en="Feature" /></th><th><BilingualText vi="Trạng thái" en="Status" /></th><th><BilingualText vi="Bật / tắt" en="Toggle" /></th></tr></thead>
            <tbody>{content.menus.map((menu) => {
              const token = `menus:${menu.id}`;
              return <tr key={menu.id ?? menu.code}>
                <td><strong><BilingualText vi={menu.labelVi || menu.code} en={menu.labelEn || menu.labelVi || menu.code} /></strong><div className="muted">{menu.code}</div></td>
                <td>{menu.placement}</td><td><code>{menu.path || '—'}</code></td><td>{menu.featureKey || '—'}</td>
                <td><Status enabled={menu.enabled !== false} /></td>
                <td><Toggle checked={menu.enabled !== false} disabled={Boolean(busy)} label={`${menu.code}: ${menu.enabled !== false ? 'enabled' : 'disabled'}`} onChange={(enabled) => toggle('menus', menu, enabled)} />{busy === token && <small className="muted"> …</small>}</td>
              </tr>;
            })}</tbody>
          </table>
        </section>

        <section className="admin-card" style={cardStyle} aria-labelledby="banners-heading">
          <div style={headingStyle}>
            <div><h2 id="banners-heading" style={{ margin: 0 }}><BilingualText vi="Banner trang chủ" en="Home banners" /></h2><small className="muted"><BilingualText vi="Banner đang tắt hoặc ngoài lịch sẽ không xuất hiện trên carousel." en="Disabled or out-of-schedule banners do not appear in the carousel." /></small></div>
            <span className="badge">{content.banners.length}</span>
          </div>
          <table className="admin-table">
            <thead><tr><th><BilingualText vi="Banner" en="Banner" /></th><th><BilingualText vi="Vị trí" en="Placement" /></th><th><BilingualText vi="Lịch hiển thị" en="Schedule" /></th><th><BilingualText vi="Nhóm" en="Feature" /></th><th><BilingualText vi="Trạng thái" en="Status" /></th><th><BilingualText vi="Bật / tắt" en="Toggle" /></th></tr></thead>
            <tbody>{content.banners.map((banner) => {
              const token = `banners:${banner.id}`;
              const schedule = [banner.startsAt, banner.endsAt].filter(Boolean).map((value) => new Date(value).toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN')).join(' → ') || '—';
              return <tr key={banner.id ?? banner.code}>
                <td><strong><BilingualText vi={banner.titleVi || banner.code} en={banner.titleEn || banner.titleVi || banner.code} /></strong><div className="muted">{banner.code}</div></td>
                <td>{banner.placement}</td><td>{schedule}</td><td>{banner.featureKey || '—'}</td>
                <td><Status enabled={banner.enabled !== false} /></td>
                <td><Toggle checked={banner.enabled !== false} disabled={Boolean(busy)} label={`${banner.code}: ${banner.enabled !== false ? 'enabled' : 'disabled'}`} onChange={(enabled) => toggle('banners', banner, enabled)} />{busy === token && <small className="muted"> …</small>}</td>
              </tr>;
            })}</tbody>
          </table>
        </section>
      </>}
    </section>
  );
}

export default AdminSiteContentPage;

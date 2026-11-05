import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { TUTOR_MODES } from '@/features/ai/api/aiTutorService';
import { toast } from 'sonner';

export function AdminAiSettingsPage() {
  useTextLanguage();
  const [settings, setSettings] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = () => {
    setLoading(true);
    return adminCultureAiService
      .loadAiSettings()
      .then(data => {
        if (data) {
          setSettings({
            ...data,
            allowedModels: Array.isArray(data.allowedModels) ? data.allowedModels : [],
            promptVersionsHistory: Array.isArray(data.promptVersionsHistory) ? data.promptVersionsHistory : [],
            enabledModes: Array.isArray(data.enabledModes) ? data.enabledModes : [],
            limits: data.limits || {},
            security: data.security || {},
          });
        }
      })
      .catch(err => {
        toast.error(
          err?.message ||
            bilingualLabel('Không tải được cấu hình AI từ Backend.', 'Failed to load AI configuration from Backend.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleMode = modeId => {
    if (!settings) return;
    const current = Array.isArray(settings.enabledModes) ? settings.enabledModes : [];
    const exists = current.includes(modeId);
    if (exists && current.length <= 1) {
      toast.error(
        bilingualLabel(
          'Cần bật ít nhất 1 chế độ AI Tutor cho người học.',
          'At least 1 AI Tutor mode must remain enabled.',
        ),
      );
      return;
    }
    const nextModes = exists ? current.filter(id => id !== modeId) : [...current, modeId];
    setSettings({ ...settings, enabledModes: nextModes });
  };

  const handleSave = async e => {
    if (e) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await adminCultureAiService.updateAiSettings({
        ...settings,
        apiKey: apiKeyInput.trim() || undefined,
      });
      setSettings({
        ...updated,
        allowedModels: Array.isArray(updated?.allowedModels) ? updated.allowedModels : [],
        promptVersionsHistory: Array.isArray(updated?.promptVersionsHistory) ? updated.promptVersionsHistory : [],
        enabledModes: Array.isArray(updated?.enabledModes) ? updated.enabledModes : [],
        limits: updated?.limits || {},
        security: updated?.security || {},
      });
      setApiKeyInput('');
      toast.success(
        bilingualLabel(
          'Đã đồng bộ và lưu cấu hình AI lên Backend thành công!',
          'AI configuration saved and synchronized with Backend!',
        ),
      );
    } catch (err) {
      toast.error(
        err?.message || bilingualLabel('Không thể lưu cấu hình AI.', 'Failed to save AI configuration.'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <BilingualText vi="Đang tải cấu hình AI từ Backend..." en="Loading AI settings from Backend..." />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-content">
        <div className="admin-card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ marginBottom: '12px', color: 'var(--color-ink)', fontWeight: 700 }}>
            <BilingualText
              vi="Không thể kết nối dữ liệu cấu hình AI từ Backend."
              en="Could not load AI configuration from Backend."
            />
          </p>
          <button type="button" className="button" onClick={loadSettings}>
            <BilingualText vi="Thử tải lại" en="Retry" />
          </button>
        </div>
      </div>
    );
  }

  const spendUsd = Number(settings.limits?.currentMonthSpendUsd ?? 0);
  const budgetCapUsd = Math.max(Number(settings.limits?.monthlyBudgetCapUsd ?? 1), 1);
  const spendPercent = Math.min(100, Math.round((spendUsd / budgetCapUsd) * 100));

  return (
    <div className="admin-content">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--color-red-hover)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <BilingualText vi="QUẢN TRỊ HỆ THỐNG AI & MÔ HÌNH NGÔN NGỮ" en="AI GOVERNANCE & LLM CONFIGURATION" />
          </span>
          <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}>
            <BilingualText vi="Cấu hình hệ thống AI" en="AI System Configuration" />
          </h1>
          <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}>
            <BilingualText
              vi="Quản trị mô hình ngôn ngữ lớn (LLM), phiên bản hướng dẫn hệ thống, chế độ hoạt động, giới hạn tần suất và bảo mật API."
              en="Manage Large Language Models (LLMs), system prompt versions, active modes, rate limits, and API security."
            />
          </p>
        </div>

        <button
          className="button"
          onClick={handleSave}
          disabled={saving}
          style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px' }}
        >
          <BilingualText
            vi={saving ? 'Đang lưu cấu hình...' : 'Lưu tất cả cấu hình'}
            en={saving ? 'Saving configuration...' : 'Save all settings'}
          />
        </button>
      </div>

      {/* Security Banner synced with Backend */}
      <div
        style={{
          background: 'var(--color-sage-soft)',
          border: '1px solid var(--color-border)',
          borderRadius: '14px',
          padding: '18px 22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 420px' }}>
          <span style={{ fontSize: '28px' }}>🛡️</span>
          <div>
            <strong style={{ fontSize: '14px', color: 'var(--color-ink)', display: 'block' }}>
              <BilingualText vi="Kiến trúc bảo mật API Key an toàn:" en="Secure API Key Architecture:" />
            </strong>
            <span style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
              <BilingualText
                vi="API key của nhà cung cấp chỉ được lưu trữ và gọi tại Backend Server ("
                en="Provider API keys are stored and invoked strictly on the Backend Server ("
              />
              <code>{settings.security?.backendProxyUrl || '/api/ai/sessions/{id}/messages'}</code>
              <BilingualText
                vi="). Không có bất kỳ API key nào lộ ra Frontend client."
                en="). No API key is ever exposed to the Frontend client."
              />
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              background: settings.apiKeyConfigured ? '#e6f4ea' : '#fef3c7',
              color: settings.apiKeyConfigured ? '#1e6f43' : '#92400e',
            }}
          >
            {settings.apiKeyConfigured ? (
              <>
                ● <BilingualText vi="API Key đã kết nối" en="API Key Connected" />
                {settings.apiKeyMasked ? ` (${settings.apiKeyMasked})` : ''}
              </>
            ) : (
              <>
                ● <BilingualText vi="Chưa cấu hình API Key" en="API Key Not Configured" />
              </>
            )}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="admin-settings-grid">
          {/* Column 1: Allowed Models, API Key & System Prompt Versioning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Allowed Models */}
            <div className="admin-card">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--color-ink)' }}>
                <BilingualText vi="1. Chọn mô hình & Kết nối nhà cung cấp" en="1. Active Model & Provider Connection" />
              </h2>

              <label>
                <BilingualText vi="Mô hình đang hoạt động chính:" en="Primary active model:" />
                <select
                  value={settings.activeModel || ''}
                  onChange={e => setSettings({ ...settings, activeModel: e.target.value })}
                >
                  {settings.allowedModels.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ marginTop: '12px' }}>
                <BilingualText
                  vi="Cập nhật API Key tại Backend (để trống nếu giữ nguyên key hiện tại):"
                  en="Update Backend API Key (leave blank to keep current key):"
                />
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  placeholder={
                    settings.apiKeyMasked
                      ? `${bilingualLabel('Đang dùng:', 'Current:')} ${settings.apiKeyMasked}`
                      : bilingualLabel('Nhập API Key mới (sk-or-..., AIza..., sk-...)', 'Enter new API Key (sk-or-..., AIza..., sk-...)')
                  }
                />
              </label>

              <div style={{ marginTop: '16px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  <BilingualText
                    vi="Danh sách mô hình được cấp phép từ Backend:"
                    en="Backend-authorized models:"
                  />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {settings.allowedModels.map(m => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: m.id === settings.activeModel ? 'var(--color-sage-soft)' : 'var(--color-cream)',
                        border: m.id === settings.activeModel ? '1px solid var(--color-forest)' : '1px solid transparent',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <strong>{m.name}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-forest)' }}>
                          <BilingualText vi="Nhà cung cấp: " en="Provider: " />
                          {m.provider}
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--color-ink)', fontWeight: 700 }}>
                        ${m.costPer1kTokens} / 1k tokens
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Prompt Versioning */}
            <div className="admin-card">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--color-ink)' }}>
                <BilingualText vi="2. Phiên bản & Nội dung hướng dẫn hệ thống" en="2. System Prompt Version & Instructions" />
              </h2>

              <label>
                <BilingualText vi="Phiên bản hướng dẫn hệ thống hiện hành:" en="Current system prompt version:" />
                <input
                  type="text"
                  value={settings.systemPromptVersion || ''}
                  onChange={e => setSettings({ ...settings, systemPromptVersion: e.target.value })}
                  style={{ fontWeight: 700, color: 'var(--color-red-hover)' }}
                />
              </label>

              <label style={{ marginTop: '12px' }}>
                <BilingualText
                  vi="Quy tắc hệ thống bổ sung (áp dụng trực tiếp cho AI Tutor trên Backend):"
                  en="Custom system prompt instructions (applied directly to Backend AI Tutor):"
                />
                <textarea
                  rows={3}
                  value={settings.systemPrompt || ''}
                  onChange={e => setSettings({ ...settings, systemPrompt: e.target.value })}
                  placeholder={bilingualLabel(
                    'Nhập quy tắc hướng dẫn hệ thống cho AI...',
                    'Enter system instructions for AI...',
                  )}
                />
              </label>

              <div style={{ marginTop: '16px' }}>
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  <BilingualText vi="Lịch sử các phiên bản hướng dẫn:" en="Prompt version history:" />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {settings.promptVersionsHistory.map(v => (
                    <div
                      key={v.version}
                      style={{
                        fontSize: '12px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: 'var(--color-red-hover)',
                          fontWeight: 700,
                        }}
                      >
                        <span>{v.version}</span>
                        <span>{v.releasedAt}</span>
                      </div>
                      <div style={{ color: 'var(--color-ink)', marginTop: '2px' }}>{v.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Limits, Quotas, Modes & Cost Caps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Conversation & Rate Limits */}
            <div className="admin-card">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--color-ink)' }}>
                <BilingualText vi="3. Giới hạn hội thoại & Tần suất sử dụng" en="3. Conversation & Rate Limits" />
              </h2>

              <label>
                <BilingualText vi="Số lượt hội thoại tối đa mỗi phiên:" en="Max turns per session:" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.limits?.maxTurnsPerSession ?? 25}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxTurnsPerSession: parseInt(e.target.value, 10) || 25 },
                    })
                  }
                />
              </label>

              <label style={{ marginTop: '12px' }}>
                <BilingualText vi="Giới hạn số token đầu ra:" en="Max output tokens per response:" />
                <input
                  type="number"
                  min={64}
                  max={4096}
                  value={settings.limits?.maxTokensPerResponse ?? 1024}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxTokensPerResponse: parseInt(e.target.value, 10) || 1024 },
                    })
                  }
                />
              </label>

              <label style={{ marginTop: '12px' }}>
                <BilingualText
                  vi="Giới hạn tần suất gọi API (Rate limit / phút / người dùng):"
                  en="API rate limit (requests / minute / user):"
                />
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={settings.limits?.rateLimitPerMinute ?? 30}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, rateLimitPerMinute: parseInt(e.target.value, 10) || 30 },
                    })
                  }
                />
              </label>

              <label style={{ marginTop: '12px' }}>
                <BilingualText vi="Số phiên tối đa trong ngày mỗi học viên:" en="Max daily sessions per learner:" />
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={settings.limits?.dailySessionsPerUser ?? 40}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, dailySessionsPerUser: parseInt(e.target.value, 10) || 40 },
                    })
                  }
                />
              </label>
            </div>

            {/* Budget & Cost Cap */}
            <div className="admin-card">
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--color-ink)' }}>
                <BilingualText vi="4. Kiểm soát ngân sách & Chế độ AI Tutor" en="4. Budget Control & Enabled AI Modes" />
              </h2>

              <label>
                <BilingualText vi="Ngân sách tối đa hàng tháng (USD):" en="Monthly budget cap (USD):" />
                <input
                  type="number"
                  step="10"
                  min={0}
                  value={settings.limits?.monthlyBudgetCapUsd ?? 150}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, monthlyBudgetCapUsd: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </label>

              <label style={{ marginTop: '12px' }}>
                <BilingualText
                  vi="Ngưỡng cảnh báo chi phí (% Budget Alert Threshold):"
                  en="Cost alert threshold (%):"
                />
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.limits?.costAlertThresholdPercent ?? 80}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, costAlertThresholdPercent: parseInt(e.target.value, 10) || 80 },
                    })
                  }
                />
              </label>

              <div style={{ marginTop: '16px', background: 'var(--color-cream)', padding: '14px', borderRadius: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginBottom: '6px',
                  }}
                >
                  <span>
                    <BilingualText vi="Chi phí tháng hiện tại (từ Backend):" en="Current month spend (from Backend):" />
                  </span>
                  <span style={{ color: 'var(--color-ink)' }}>
                    ${spendUsd} / ${settings.limits?.monthlyBudgetCapUsd ?? 150}
                  </span>
                </div>
                <div
                  style={{
                    height: '8px',
                    background: 'var(--color-border)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--color-ink)',
                      width: `${spendPercent}%`,
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-forest)', display: 'block', marginTop: '4px' }}>
                  <BilingualText
                    vi="Hệ thống đang hoạt động trong ngưỡng ngân sách ("
                    en="System operating within budget threshold ("
                  />
                  {spendPercent}%).
                </span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  <BilingualText vi="Các chế độ AI Tutor được phép hoạt động:" en="Enabled AI Tutor modes:" />
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '8px' }}>
                  {TUTOR_MODES.map(mode => {
                    const checked = (settings.enabledModes || []).includes(mode.id);
                    return (
                      <label
                        key={mode.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: checked ? 'var(--color-sage-soft)' : 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          margin: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleMode(mode.id)}
                          style={{ width: 'auto', margin: 0 }}
                        />
                        <span>
                          {mode.icon} <BilingualText vi={mode.title} en={mode.titleEn} />
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

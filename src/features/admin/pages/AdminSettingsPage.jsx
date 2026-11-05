import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState, useEffect } from 'react';
import { adminService } from '@/features/admin/api/adminService';
import {
  Globe,
  Mail,
  Cpu,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Info,
  Server,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Baseline default system settings for HolaVietnamese
 * Ensures the form is always populated with realistic, production-ready values.
 */
const DEFAULT_SYSTEM_SETTINGS = {
  // 1. Thông tin chung & Thương hiệu
  appName: 'HolaVietnamese',
  contactEmail: 'support@holavietnamese.edu.vn',
  supportHotline: '1900 6868',
  defaultLanguage: 'vi',
  defaultDailyGoalMinutes: 15,

  // 2. Dịch vụ AI & Gia sư ảo
  aiTutorProvider: 'Google Gemini 2.5 Flash (Google DeepMind)',
  aiSpeechModel: 'Gemini Multimodal Live & Audio API',
  maxDailyAiTurns: 20,
  aiTemperature: 0.7,
  aiAutoFeedback: true,

  // 3. Bảo mật & Xác thực
  allowRegistration: true,
  googleAuthEnabled: true,
  requireEmailVerification: true,
  sessionTimeoutMinutes: 120,

  // 4. Vận hành & Bảo trì
  maintenanceMode: false,
  maintenanceNotice:
    'Hệ thống HolaVietnamese đang bảo trì kỹ thuật định kỳ để nâng cấp chất lượng bài học. Quý học viên vui lòng quay lại sau ít phút.',
};

/**
 * Metadata mapping between frontend properties and backend database keys
 */
const SETTINGS_METADATA = [
  // Thông tin chung
  {
    key: 'APP_NAME',
    prop: 'appName',
    label: 'Tên ứng dụng',
    labelEn: 'Application Name',
    desc: 'Tên hiển thị chính thức của nền tảng học tiếng Việt',
    descEn: 'Official display name of the Vietnamese learning platform',
    type: 'string',
  },
  {
    key: 'CONTACT_EMAIL',
    prop: 'contactEmail',
    label: 'Email hỗ trợ hệ thống',
    labelEn: 'Support Email',
    desc: 'Hộp thư tiếp nhận thắc mắc và hỗ trợ kỹ thuật cho học viên',
    descEn: 'Mailbox for learner inquiries and technical support',
    type: 'string',
  },
  {
    key: 'SUPPORT_HOTLINE',
    prop: 'supportHotline',
    label: 'Hotline hỗ trợ',
    labelEn: 'Support Hotline',
    desc: 'Đường dây nóng hỗ trợ học viên khi cần giải đáp nhanh',
    descEn: 'Direct phone line for learner urgent inquiries',
    type: 'string',
  },
  {
    key: 'DEFAULT_LANGUAGE',
    prop: 'defaultLanguage',
    label: 'Ngôn ngữ giao diện mặc định',
    labelEn: 'Default Interface Language',
    desc: 'Ngôn ngữ hiển thị khởi tạo cho người dùng mới',
    descEn: 'Default display language for new users',
    type: 'select',
  },
  {
    key: 'DEFAULT_DAILY_GOAL_MINUTES',
    prop: 'defaultDailyGoalMinutes',
    label: 'Mục tiêu học hàng ngày mặc định (phút)',
    labelEn: 'Default Daily Learning Goal (minutes)',
    desc: 'Thời lượng học tập đề xuất cho học viên mới (phút)',
    descEn: 'Recommended daily learning duration for new learners',
    type: 'number',
  },

  // AI & Gia sư ảo
  {
    key: 'AI_TUTOR_PROVIDER',
    prop: 'aiTutorProvider',
    label: 'Nhà cung cấp AI Tutor chính',
    labelEn: 'Primary AI Tutor Provider',
    desc: 'Mô hình AI xử lý hội thoại phản xạ, gợi ý phản hồi và sửa ngữ pháp',
    descEn: 'AI model powering conversational drills and grammar feedback',
    type: 'string',
  },
  {
    key: 'AI_SPEECH_MODEL',
    prop: 'aiSpeechModel',
    label: 'Mô hình nhận diện giọng nói & thanh điệu',
    labelEn: 'Speech & Tone Recognition Model',
    desc: 'Mô hình phân tích cao độ và thanh điệu tiếng Việt',
    descEn: 'Model for pitch contour and Vietnamese tones analysis',
    type: 'string',
  },
  {
    key: 'MAX_DAILY_AI_TURNS',
    prop: 'maxDailyAiTurns',
    label: 'Giới hạn hội thoại AI / ngày',
    labelEn: 'Daily AI Conversation Turn Limit',
    desc: 'Số lượt trò chuyện AI Tutor miễn phí mỗi ngày cho tài khoản chuẩn',
    descEn: 'Daily free AI tutor interaction quota for standard learners',
    type: 'number',
  },
  {
    key: 'AI_AUTO_FEEDBACK',
    prop: 'aiAutoFeedback',
    label: 'Tự động phản hồi & sửa lỗi câu',
    labelEn: 'Auto Feedback & Grammar Correction',
    desc: 'AI chủ động phân tích và gợi ý cách diễn đạt tự nhiên hơn sau mỗi lượt nói',
    descEn: 'AI proactively suggests natural phrasing after each speech turn',
    type: 'boolean',
  },

  // Bảo mật & Cổng xác thực
  {
    key: 'ENABLE_USER_REGISTRATION',
    prop: 'allowRegistration',
    label: 'Cho phép đăng ký tài khoản mới',
    labelEn: 'Allow New User Registration',
    desc: 'Bật hoặc tắt biểu mẫu tạo tài khoản học viên mới trên trang web',
    descEn: 'Enable or disable the new student signup form on the web app',
    type: 'boolean',
  },
  {
    key: 'ENABLE_GOOGLE_AUTH',
    prop: 'googleAuthEnabled',
    label: 'Kích hoạt đăng nhập Google OAuth',
    labelEn: 'Enable Google OAuth Login',
    desc: 'Bật nút Sign in with Google qua thư viện GSI một chạm',
    descEn: 'Enable one-tap Sign in with Google via GSI library',
    type: 'boolean',
  },
  {
    key: 'REQUIRE_EMAIL_VERIFICATION',
    prop: 'requireEmailVerification',
    label: 'Yêu cầu xác thực Email qua OTP',
    labelEn: 'Require Email OTP Verification',
    desc: 'Bắt buộc người dùng nhập mã OTP 6 số để kích hoạt tài khoản',
    descEn: 'Enforce 6-digit OTP code verification before account activation',
    type: 'boolean',
  },
  {
    key: 'SESSION_TIMEOUT_MINUTES',
    prop: 'sessionTimeoutMinutes',
    label: 'Thời gian hết hạn phiên đăng nhập (phút)',
    labelEn: 'Session Timeout Duration (minutes)',
    desc: 'Tự động yêu cầu đăng nhập lại sau thời gian không hoạt động',
    descEn: 'Automatically require re-login after inactive period',
    type: 'number',
  },

  // Vận hành & Bảo trì
  {
    key: 'SYSTEM_MAINTENANCE_MODE',
    prop: 'maintenanceMode',
    label: 'Chế độ bảo trì hệ thống',
    labelEn: 'System Maintenance Mode',
    desc: 'Chỉ cho phép tài khoản Admin đăng nhập khi kích hoạt',
    descEn: 'Only Administrator accounts can log in while active',
    type: 'boolean',
  },
  {
    key: 'MAINTENANCE_NOTICE',
    prop: 'maintenanceNotice',
    label: 'Thông báo bảo trì hiển thị học viên',
    labelEn: 'Maintenance Notice Displayed to Users',
    desc: 'Nội dung thông điệp khi học viên truy cập trong lúc bảo trì',
    descEn: 'Message shown to learners when maintenance mode is turned on',
    type: 'string',
  },
];

/**
 * Normalizes backend settings response into a complete structured state object
 */
function normalizeSettings(raw) {
  const result = { ...DEFAULT_SYSTEM_SETTINGS };
  if (!raw) return result;

  const list = Array.isArray(raw)
    ? raw
    : raw?.content && Array.isArray(raw.content)
      ? raw.content
      : typeof raw === 'object'
        ? Object.entries(raw).map(([key, value]) => ({ key, value }))
        : [];

  for (const item of list) {
    if (!item || !item.key) continue;
    const rawKey = String(item.key).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const val = item.value;

    const meta = SETTINGS_METADATA.find(
      m =>
        m.key === rawKey ||
        m.prop.toUpperCase() === rawKey ||
        m.key.replace(/_/g, '') === rawKey.replace(/_/g, ''),
    );

    if (meta) {
      if (meta.type === 'boolean') {
        result[meta.prop] =
          String(val).toLowerCase() === 'true' || val === true || val === '1' || val === 1;
      } else if (meta.type === 'number') {
        const num = Number(val);
        if (!isNaN(num)) result[meta.prop] = num;
      } else {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          result[meta.prop] = String(val);
        }
      }
    }
  }

  return result;
}

/**
 * Modern SaaS Toggle Switch
 */
function SwitchToggle({ checked, onChange, id, label, description, disabled = false }) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: checked ? '#FFFBF5' : '#FFFFFF',
        border: checked ? '1px solid #FED7AA' : '1px solid #E2E8F0',
        transition: 'all 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div style={{ paddingRight: '16px', flex: 1 }}>
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 700,
            color: '#1E293B',
            cursor: disabled ? 'not-allowed' : 'pointer',
            marginBottom: '3px',
          }}
        >
          {label}
        </label>
        {description && (
          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.45 }}>
            {description}
          </p>
        )}
      </div>

      <div
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        style={{
          position: 'relative',
          width: '46px',
          height: '26px',
          flexShrink: 0,
          borderRadius: '999px',
          backgroundColor: checked ? '#EA580C' : '#CBD5E1',
          transition: 'background-color 0.22s ease',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  useTextLanguage();
  const [settings, setSettings] = useState(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Load and normalize system settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    setFeedback({ type: '', text: '' });
    try {
      const data = await adminService.getSystemSettings();
      const normalized = normalizeSettings(data);
      setSettings(normalized);
    } catch (err) {
      console.warn('System settings fetch warning:', err);
      // Keep baseline defaults so form is never blank
      setSettings((prev) => ({ ...DEFAULT_SYSTEM_SETTINGS, ...prev }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update a specific field in local state
  const updateField = (prop, value) => {
    setSettings((prev) => ({ ...prev, [prop]: value }));
  };

  // Reset all settings to baseline defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        bilingualLabel(
          'Bạn có chắc chắn muốn khôi phục tất cả cấu hình về thông số mặc định khuyến nghị?',
          'Are you sure you want to restore all settings to recommended defaults?',
        ),
      )
    ) {
      setSettings(DEFAULT_SYSTEM_SETTINGS);
      toast.info(
        bilingualLabel(
          'Đã nạp lại các thông số mặc định khuyến nghị. Nhấn "Lưu cấu hình hệ thống" để áp dụng lên máy chủ.',
          'Recommended defaults reloaded. Click "Save System Settings" to apply to server.',
        ),
      );
    }
  };

  // Save all settings to backend
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', text: '' });

    try {
      // Upsert each setting key to backend
      const promises = SETTINGS_METADATA.map((meta) => {
        const rawVal = settings[meta.prop];
        const stringVal =
          meta.type === 'boolean' ? (rawVal ? 'true' : 'false') : String(rawVal ?? '');

        return adminService.updateSystemSettings({
          key: meta.key,
          value: stringVal,
          description: meta.desc,
        });
      });

      await Promise.allSettled(promises);

      setFeedback({
        type: 'success',
        text: bilingualLabel(
          'Đã lưu và đồng bộ toàn bộ cấu hình hệ thống thành công!',
          'All system settings saved and synchronized successfully!',
        ),
      });

      toast.success(
        bilingualLabel(
          'Đã lưu cấu hình hệ thống thành công!',
          'System settings updated successfully!',
        ),
      );

      setTimeout(() => {
        setFeedback({ type: '', text: '' });
      }, 4000);
    } catch (err) {
      const errMsg =
        err?.message ||
        bilingualLabel(
          'Không thể lưu cấu hình hệ thống. Vui lòng thử lại.',
          'Failed to save system settings. Please try again.',
        );
      setFeedback({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '360px',
          gap: '14px',
          color: '#64748B',
        }}
      >
        <Loader2 size={32} className="spin-animation" style={{ color: '#EA580C' }} />
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          <BilingualText
            vi="Đang tải dữ liệu cấu hình hệ thống…"
            en="Loading system configuration…"
          />
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#FFF7ED',
              border: '1px solid #FFEDD5',
              color: '#C2410C',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <Server size={13} />
            <BilingualText vi="HỆ THỐNG · QUẢN TRỊ NỀN TẢNG" en="SYSTEM · PLATFORM GOVERNANCE" />
          </div>

          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              margin: '0 0 6px 0',
              color: '#1E293B',
              letterSpacing: '-0.02em',
            }}
          >
            <BilingualText vi="Cấu hình Hệ thống" en="System Settings" />
          </h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
            <BilingualText
              vi="Quản lý các thông số chung của ứng dụng, dịch vụ AI và các cổng xác thực học viên."
              en="Manage global platform parameters, AI tutor services, and learner authentication."
            />
          </p>
        </div>

        {/* Status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: settings.maintenanceMode ? '#FEF2F2' : '#F0FDF4',
            border: settings.maintenanceMode ? '1px solid #FECACA' : '1px solid #BBF7D0',
            color: settings.maintenanceMode ? '#991B1B' : '#166534',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: settings.maintenanceMode ? '#EF4444' : '#22C55E',
              display: 'inline-block',
            }}
          />
          {settings.maintenanceMode ? (
            <BilingualText vi="Đang bật chế độ bảo trì" en="Maintenance Mode Active" />
          ) : (
            <BilingualText vi="Hệ thống hoạt động bình thường" en="System Operational" />
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '22px',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: feedback.type === 'error' ? '#FEF2F2' : '#F0FDF4',
            border: feedback.type === 'error' ? '1px solid #FCA5A5' : '1px solid #86EFAC',
            color: feedback.type === 'error' ? '#991B1B' : '#166534',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          {feedback.type === 'error' ? (
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Form with 4 Grouped Cards */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* CARD 1: Thông tin chung & Nhận diện */}
        <div
          className="admin-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: '#1E293B' }}>
                <BilingualText vi="Thông tin chung & Nhận diện" en="General & Branding" />
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                <BilingualText
                  vi="Cấu hình tên hiển thị, kênh hỗ trợ và thiết lập học tập mặc định."
                  en="Platform display name, support channels, and default learning settings."
                />
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText vi="Tên ứng dụng" en="Application Name" />{' '}
                <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => updateField('appName', e.target.value)}
                placeholder="HolaVietnamese"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EA580C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                <BilingualText
                  vi="Tên thương hiệu xuất hiện trên tiêu đề trang, email và hệ thống thông báo."
                  en="Brand name appearing on page title, emails, and notifications."
                />
              </span>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText vi="Email hỗ trợ hệ thống" en="System Support Email" />{' '}
                <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="support@holavietnamese.edu.vn"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EA580C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                <BilingualText
                  vi="Email tiếp nhận phản hồi, thắc mắc bài học và báo lỗi kỹ thuật."
                  en="Email receiving feedback, course inquiries, and technical issues."
                />
              </span>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText vi="Hotline hỗ trợ học viên" en="Student Support Hotline" />
              </label>
              <input
                type="text"
                value={settings.supportHotline}
                onChange={(e) => updateField('supportHotline', e.target.value)}
                placeholder="1900 6868"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EA580C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText vi="Mục tiêu học hàng ngày mặc định" en="Default Daily Learning Goal" />
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={settings.defaultDailyGoalMinutes}
                  onChange={(e) => updateField('defaultDailyGoalMinutes', Number(e.target.value))}
                  style={{
                    width: '120px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EA580C';
                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                  <BilingualText vi="phút / ngày" en="minutes / day" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Dịch vụ Trí tuệ Nhân tạo (AI Tutor & Speech) */}
        <div
          className="admin-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#FFF7ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
              }}
            >
              <Cpu size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: '#1E293B' }}>
                <BilingualText vi="Dịch vụ Trí tuệ Nhân tạo & AI Tutor" en="AI Tutor & Language Intelligence" />
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                <BilingualText
                  vi="Điều phối mô hình ngôn ngữ lớn (LLM), kịch bản đàm thoại và phân tích phát âm."
                  en="Configure LLM provider, conversational simulation drills, and tone analysis."
                />
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText
                  vi="Nhà cung cấp AI Tutor (Hội thoại & Gợi ý phản hồi)"
                  en="AI Tutor Provider (Dialogue & Smart Suggestions)"
                />{' '}
                <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={settings.aiTutorProvider}
                onChange={(e) => updateField('aiTutorProvider', e.target.value)}
                placeholder="Google Gemini 2.5 Flash (Google DeepMind)"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EA580C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                <BilingualText
                  vi="Mô hình AI chủ đạo phục vụ luyện nói phản xạ, gợi ý câu trả lời và đóng vai tình huống thực tế."
                  en="Primary AI model powering conversational drills, roleplay, and instant feedback."
                />
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '18px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1E293B',
                    marginBottom: '6px',
                  }}
                >
                  <BilingualText vi="Mô hình nhận diện giọng đọc & thanh điệu" en="Speech & Tone Model" />
                </label>
                <input
                  type="text"
                  value={settings.aiSpeechModel}
                  onChange={(e) => updateField('aiSpeechModel', e.target.value)}
                  placeholder="Gemini Multimodal Live & Audio API"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '14px',
                    fontWeight: 500,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EA580C';
                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#1E293B',
                    marginBottom: '6px',
                  }}
                >
                  <BilingualText vi="Giới hạn hội thoại AI / ngày (tài khoản thường)" en="Daily Free AI Turns Limit" />
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={settings.maxDailyAiTurns}
                    onChange={(e) => updateField('maxDailyAiTurns', Number(e.target.value))}
                    style={{
                      width: '120px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1E293B',
                      fontSize: '14px',
                      fontWeight: 500,
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#EA580C';
                      e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                    <BilingualText vi="lượt / học viên" en="turns / learner" />
                  </span>
                </div>
              </div>
            </div>

            <SwitchToggle
              id="aiAutoFeedback"
              checked={settings.aiAutoFeedback}
              onChange={(checked) => updateField('aiAutoFeedback', checked)}
              label={bilingualLabel(
                'Tự động gợi ý phản hồi & sửa lỗi câu tự nhiên',
                'Auto Feedback & Conversational Suggestions',
              )}
              description={bilingualLabel(
                'Khi bật, AI Gia sư sẽ tự động phân tích câu trả lời của học viên và đưa ra gợi ý cách nói tự nhiên của người bản xứ.',
                'When enabled, AI Tutor analyzes student responses and provides authentic native Vietnamese expressions.',
              )}
            />
          </div>
        </div>

        {/* CARD 3: Bảo mật, Đăng ký & Xác thực */}
        <div
          className="admin-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: '#1E293B' }}>
                <BilingualText vi="Bảo mật & Cổng xác thực" en="Security & Authentication" />
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                <BilingualText
                  vi="Kiểm soát luồng đăng ký học viên mới, Google OAuth GSI và chính sách phiên đăng nhập."
                  en="Manage learner registration flows, Google OAuth GSI, and session security policies."
                />
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <SwitchToggle
              id="allowRegistration"
              checked={settings.allowRegistration}
              onChange={(checked) => updateField('allowRegistration', checked)}
              label={bilingualLabel(
                'Cho phép đăng ký tài khoản mới',
                'Allow New User Registration',
              )}
              description={bilingualLabel(
                'Bật/tắt biểu mẫu đăng ký học viên trên trang web. Nếu tắt, chỉ Admin mới có thể tạo người dùng.',
                'Enable or disable signup forms. When off, only Admin can create accounts.',
              )}
            />

            <SwitchToggle
              id="googleAuthEnabled"
              checked={settings.googleAuthEnabled}
              onChange={(checked) => updateField('googleAuthEnabled', checked)}
              label={bilingualLabel(
                'Kích hoạt đăng nhập Google OAuth (GSI)',
                'Enable Google OAuth Sign-In (GSI)',
              )}
              description={bilingualLabel(
                'Bật nút "Sign in with Google" một chạm qua thư viện Google Identity Services.',
                'Enable one-tap "Sign in with Google" button via Google Identity Services.',
              )}
            />

            <SwitchToggle
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onChange={(checked) => updateField('requireEmailVerification', checked)}
              label={bilingualLabel(
                'Yêu cầu xác thực Email qua mã OTP',
                'Require Email OTP Verification',
              )}
              description={bilingualLabel(
                'Học viên mới đăng ký bắt buộc phải nhập mã OTP 6 số gửi về hòm thư trước khi bắt đầu bài học.',
                'New signups must verify their account with a 6-digit email OTP code before accessing courses.',
              )}
            />

            <div style={{ paddingTop: '8px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText vi="Thời gian hết hạn phiên đăng nhập (phút)" en="Session Timeout (minutes)" />
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="15"
                  max="1440"
                  step="15"
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => updateField('sessionTimeoutMinutes', Number(e.target.value))}
                  style={{
                    width: '120px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#EA580C';
                    e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                  <BilingualText vi="phút (Mặc định 120 phút = 2 giờ)" en="minutes (Default 120m = 2h)" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Vận hành & Chế độ Bảo trì */}
        <div
          className="admin-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: settings.maintenanceMode ? '1.5px solid #F87171' : '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: settings.maintenanceMode ? '#FEF2F2' : '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: settings.maintenanceMode ? '#DC2626' : '#475569',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0', color: '#1E293B' }}>
                <BilingualText vi="Vận hành & Chế độ Bảo trì" en="Operations & Maintenance Mode" />
              </h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                <BilingualText
                  vi="Kiểm soát trạng thái phục vụ của toàn bộ hệ thống trong thời gian bảo trì nâng cấp."
                  en="Control platform availability during scheduled server maintenance and upgrades."
                />
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SwitchToggle
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(checked) => updateField('maintenanceMode', checked)}
              label={bilingualLabel(
                'Chế độ bảo trì hệ thống',
                'System Maintenance Mode',
              )}
              description={bilingualLabel(
                'Khi kích hoạt, chỉ các tài khoản có vai trò Admin mới có thể đăng nhập. Học viên và khách sẽ thấy màn hình thông báo bảo trì.',
                'When enabled, only Administrator accounts can log in. Learners will see the maintenance announcement.',
              )}
            />

            {settings.maintenanceMode && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#DC2626' }} />
                <div>
                  <strong>
                    <BilingualText vi="Lưu ý quan trọng: " en="Important notice: " />
                  </strong>
                  <BilingualText
                    vi="Hệ thống đang được chuyển sang chế độ bảo trì. Tất cả các luồng học tập và đăng ký của người học sẽ tạm hoãn cho đến khi bạn tắt chế độ này."
                    en="The platform is being put into maintenance mode. All learning activities and registrations are suspended until disabled."
                  />
                </div>
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '6px',
                }}
              >
                <BilingualText
                  vi="Thông báo bảo trì hiển thị cho học viên"
                  en="Maintenance Notice Shown to Learners"
                />
              </label>
              <textarea
                rows={3}
                value={settings.maintenanceNotice}
                onChange={(e) => updateField('maintenanceNotice', e.target.value)}
                placeholder="Hệ thống HolaVietnamese đang bảo trì kỹ thuật..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EA580C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            padding: '18px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#94A3B8';
                e.currentTarget.style.color = '#1E293B';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#475569';
              }
            }}
            onMouseDown={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#FFF7E8';
                e.currentTarget.style.borderColor = '#EA580C';
                e.currentTarget.style.color = '#253044';
              }
            }}
          >
            <RotateCcw size={15} />
            <BilingualText vi="Khôi phục mặc định" en="Restore Defaults" />
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 28px',
              borderRadius: '10px',
              border: '1px solid transparent',
              background: saving
                ? '#94A3B8'
                : 'linear-gradient(135deg, #FF7514 0%, #EA580C 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving
                ? 'none'
                : '0 4px 14px rgba(234, 88, 12, 0.28)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(194, 65, 12, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF7514 0%, #EA580C 100%)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.28)';
              }
            }}
            onMouseDown={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = '#FFF7E8';
                e.currentTarget.style.background = '#FFF7E8';
                e.currentTarget.style.borderColor = '#EA580C';
                e.currentTarget.style.color = '#253044';
              }
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <BilingualText vi="Đang lưu cấu hình…" en="Saving Configuration…" />
              </>
            ) : (
              <>
                <Save size={16} />
                <BilingualText vi="Lưu cấu hình hệ thống" en="Save System Settings" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

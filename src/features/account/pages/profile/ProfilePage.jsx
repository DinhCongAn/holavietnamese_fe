import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useRef, useState } from 'react';
import { learnerService } from '@/features/learning/api/learnerService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import {
  Camera,
  LoaderCircle,
  Upload,
  TrendingUp,
  Award,
  Flame,
  Zap,
  Clock,
  BookOpen,
  Languages,
} from 'lucide-react';
import { toast } from 'sonner';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function ProfilePage() {
  useTextLanguage();
  const { fetchProfile, updateCurrentUser } = useAuth();
  const avatarInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState({ loading: true, error: '', message: '' });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarState, setAvatarState] = useState({ uploading: false, error: '' });

  useEffect(() => () => {
    if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  useEffect(() => {
    learnerService
      .getProfile()
      .then((p) => {
        setProfile(p);
        setForm(p);
      })
      .catch((e) => setState((s) => ({ ...s, error: e.message })))
      .finally(() => setState((s) => ({ ...s, loading: false })));

    learnerService
      .getProgressData()
      .then((data) => setProgress(data))
      .catch((err) => console.warn('Could not load progress data in profile:', err));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setState({ ...state, loading: true, error: '', message: '' });
    try {
      const r = await learnerService.updateProfile(form);
      const p = r.result ?? form;
      setProfile(p);
      setEditing(false);
      setState({ loading: false, error: '', message: r.message || bilingualLabel('Đã cập nhật hồ sơ thành công!', 'Profile updated successfully!') });
      fetchProfile();
    } catch (err) {
      setState({ loading: false, error: err.message, message: '' });
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarState({ uploading: false, error: bilingualLabel('Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.', 'Only JPEG, PNG, or WebP images are accepted.') });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarState({ uploading: false, error: bilingualLabel('Ảnh đại diện không được vượt quá 5MB.', 'Avatar image must not exceed 5MB.') });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarState({ uploading: true, error: '' });
    setState((current) => ({ ...current, error: '', message: '' }));
    try {
      const response = await learnerService.uploadAvatar(file);
      const updatedUser = response?.result ?? response;
      if (!updatedUser?.avatarUrl) throw new Error(response?.message || bilingualLabel('Máy chủ không trả về ảnh đại diện mới.', 'Server did not return a new avatar.'));
      setProfile((current) => ({ ...current, ...updatedUser }));
      setForm((current) => ({ ...current, ...updatedUser }));
      updateCurrentUser(updatedUser);
      setAvatarPreview('');
      setState((current) => ({ ...current, message: response?.message || bilingualLabel('Cập nhật ảnh đại diện thành công.', 'Avatar updated successfully.') }));
      toast.success(response?.message || bilingualLabel('Cập nhật ảnh đại diện thành công.', 'Avatar updated successfully.'));
    } catch (error) {
      setAvatarState({ uploading: false, error: error.message || bilingualLabel('Không thể tải ảnh đại diện lên.', 'Failed to upload avatar.') });
      return;
    }
    setAvatarState({ uploading: false, error: '' });
  };

  if (state.loading && !profile) {
    return <div className="account-empty"><BilingualText>{"Đang tải hồ sơ…"}</BilingualText></div>;
  }

  if (!profile) {
    return <div className="account-empty" role="alert"><BilingualText>{state.error}</BilingualText></div>;
  }

  const goalLabels = {
    daily_communication: { vi: '🗣️ Giao tiếp hằng ngày', en: '🗣️ Daily Communication' },
    travel: { vi: '✈️ Du lịch & Khám phá', en: '✈️ Travel & Exploration' },
    work: { vi: '💼 Công việc & Định cư', en: '💼 Work & Career' },
    exam_vsl: { vi: '🎓 Thi chứng chỉ VSL', en: '🎓 VSL Exam' },
    culture: { vi: '🏮 Văn hóa & Đời sống', en: '🏮 Culture & Life' },
  };

  const languageLabels = {
    en: '🇬🇧 English',
    ko: '🇰🇷 한국어',
    ja: '🇯🇵 日本語',
    zh: '🇨🇳 中文',
    fr: '🇫🇷 Français',
  };

  return (
    <div className="account-page space-y-6">
      <div className="account-header">
        <span className="account-pill"><BilingualText>{"👤 Thông tin cá nhân"}</BilingualText></span>
        <h1 className="account-title"><BilingualText>{"Hồ sơ người học"}</BilingualText></h1>
        <p className="account-desc"><BilingualText>{"Quản lý thông tin tài khoản, mục tiêu học tập và cấp độ tiếng Việt của bạn."}</BilingualText></p>
      </div>

      {state.error && <div className="auth-message auth-message-error"><BilingualText>{state.error}</BilingualText></div>}
      {state.message && <div className="auth-message auth-message-success"><BilingualText>{state.message}</BilingualText></div>}

      {/* Hero Avatar & Identity Card */}
      <section className="profile-hero">
        <div className={`profile-avatar profile-avatar--editable ${avatarState.uploading ? 'is-uploading' : ''}`}>
            <ContentImage
              src={avatarPreview || profile.avatarUrl}
              alt={bilingualLabel(`Ảnh đại diện của ${profile.fullName || profile.username || 'học viên'}`, `Avatar of ${profile.fullName || profile.username || 'learner'}`)}
              fallback={profile.fullName?.[0]?.toUpperCase() || 'H'}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
            <input ref={avatarInputRef} className="profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={avatarState.uploading} aria-label={bilingualLabel("Chọn ảnh đại diện", "Select profile avatar")} />
            <button type="button" className="profile-avatar-action" onClick={() => avatarInputRef.current?.click()} disabled={avatarState.uploading} aria-label={bilingualLabel("Thay đổi ảnh đại diện", "Change profile photo")}>
              {avatarState.uploading ? <LoaderCircle className="profile-avatar-spinner" size={19}/> : <Camera size={19}/>}
            </button>
        </div>
        <div className="profile-identity">
          <h2>{profile.fullName || profile.username}</h2>
          <p>{profile.email}</p>
          <div className="profile-identity-progress my-2">
            <Link
              to={ROUTES.PROGRESS}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7E8] hover:bg-[#FFEECB] text-[#EA580C] text-xs font-bold border border-[#FDBA74]/50 transition-colors shadow-2xs"
            >
              <TrendingUp size={13} />
              <BilingualText
                vi={`Tiến trình: Cấp ${progress?.currentLevel ?? 1} · ${progress?.totalXp ?? profile?.totalXp ?? 0} XP · Chuỗi ${progress?.streakCount ?? profile?.streakCount ?? 0} ngày`}
                en={`Progress: Lv. ${progress?.currentLevel ?? 1} · ${progress?.totalXp ?? profile?.totalXp ?? 0} XP · ${progress?.streakCount ?? profile?.streakCount ?? 0}-Day Streak`}
              />
              <span className="text-[11px] opacity-75">→</span>
            </Link>
          </div>
          <button type="button" className="profile-upload-link" onClick={() => avatarInputRef.current?.click()} disabled={avatarState.uploading}><Upload size={14}/><BilingualText>{avatarState.uploading ? 'Đang tải ảnh lên…' : 'Đổi ảnh đại diện'}</BilingualText></button>
          <small><BilingualText>{"JPEG, PNG hoặc WebP · tối đa 5MB"}</BilingualText></small>
          {avatarState.error && <span className="profile-avatar-error" role="alert"><BilingualText>{avatarState.error}</BilingualText></span>}
        </div>
        <button
          type="button"
          className="account-outline-btn !bg-white hover:!bg-[#FFF7E8] !text-[#EA580C] border-2 border-[#EA580C] font-bold"
          onClick={() => setEditing((v) => !v)}
        >
          <BilingualText>{editing ? 'Hủy bỏ' : '✏️ Chỉnh sửa'}</BilingualText>
        </button>
      </section>

            {/* Learning Progress Section right inside Profile page */}
      {progress && (
        <section className="p-6 rounded-2xl bg-gradient-to-br from-[#FFF7E8] via-[#FFFCF7] to-[#F7F0E3] border border-[#E8E5DF] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF]/70 pb-4">
            <div>
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider block">
                <BilingualText vi="Tiến trình học tập" en="Learning Progress" />
              </span>
              <h2 className="text-xl font-black text-[#253044] mt-0.5">
                <BilingualText
                  vi={`Cấp độ ${progress.currentLevel ?? 1}: ${progress.levelTitle || 'Tập Sự Khởi Đầu'}`}
                  en={`Level ${progress.currentLevel ?? 1}: ${progress.levelTitleEn || 'Novice Beginner'}`}
                />
              </h2>
            </div>
            <Link
              to={ROUTES.PROGRESS}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl !bg-white hover:!bg-[#FFF7E8] !text-[#EA580C] border-2 border-[#EA580C] font-bold text-xs shadow-xs transition-all active:!bg-white"
            >
              <TrendingUp size={14} />
              <BilingualText vi="Xem chi tiết tiến trình →" en="View Detailed Progress →" />
            </Link>
          </div>

          {/* KPIs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[





              { labelVi: 'Cấp độ', labelEn: 'Level', valueVi: `Lv.${progress.currentLevel ?? 1}`, valueEn: `Lv.${progress.currentLevel ?? 1}`, icon: Award },
              { labelVi: 'Chuỗi học', labelEn: 'Streak', valueVi: `${progress.streakCount ?? 1} ngày`, valueEn: `${progress.streakCount ?? 1} days`, icon: Flame },
              { labelVi: 'Tổng XP', labelEn: 'Total XP', valueVi: `${progress.totalXp ?? 0} XP`, valueEn: `${progress.totalXp ?? 0} XP`, icon: Zap },
              { labelVi: 'Bài đã học', labelEn: 'Lessons', valueVi: `${progress.completedLessonsCount ?? 0} bài`, valueEn: `${progress.completedLessonsCount ?? 0} lessons`, icon: BookOpen },
              { labelVi: 'Từ đã thuộc', labelEn: 'Vocab', valueVi: `${progress.learnedVocabulariesCount ?? 0} từ`, valueEn: `${progress.learnedVocabulariesCount ?? 0} words`, icon: Languages },
              { labelVi: 'Thời gian', labelEn: 'Time', valueVi: `${progress.totalTimeMinutes ?? 45} phút`, valueEn: `${progress.totalTimeMinutes ?? 45} mins`, icon: Clock },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#E8E5DF] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] mb-1">
                    <Icon size={13} className="text-[#EA580C]" />
                    <BilingualText vi={kpi.labelVi} en={kpi.labelEn} />
                  </div>
                  <strong className="text-base font-black text-[#253044] block">
                    <BilingualText vi={kpi.valueVi ?? kpi.value} en={kpi.valueEn ?? kpi.value} />
                  </strong>
                </div>
              );
            })}
          </div>

          {/* Progress Bar to Next Level */}
          <div className="p-4 rounded-xl bg-white border border-[#E8E5DF] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#253044]">
                <BilingualText
                  vi="Tiến độ nâng cấp độ tiếp theo"
                  en="Progress to next level"
                />
              </span>
              <span className="text-[#EA580C]">
                {progress.levelProgressPercent ?? 0}% ({progress.totalXp ?? 0}/{progress.nextLevelRequiredXp ?? 100} XP)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#E8E5DF]/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-[#EA580C] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, progress.levelProgressPercent ?? 10))}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Edit Form vs Display List */}
      {editing ? (
        <form className="account-panel account-form" onSubmit={save}>
          <label>
            <span><BilingualText>{"Họ và tên"}</BilingualText></span>
            <input
              type="text"
              value={form.fullName || ''}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </label>

          <label>
            <span><BilingualText>{"Số điện thoại"}</BilingualText></span>
            <input
              type="tel"
              value={form.phoneNumber || ''}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder={bilingualLabel("VD: 0912345678", "e.g., 0912345678")}
            />
          </label>

          <label>
            <span><BilingualText>{"Quốc gia"}</BilingualText></span>
            <input
              type="text"
              value={form.country || ''}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder={bilingualLabel("VD: United States", "e.g., United States")}
            />
          </label>

          <label>
            <span><BilingualText>{"Ngôn ngữ mẹ đẻ"}</BilingualText></span>
            <select
              value={form.nativeLanguage || 'en'}
              onChange={(e) => setForm({ ...form, nativeLanguage: e.target.value })}
            >
              <option value="en">{bilingualLabel("English")}</option>
              <option value="ko">{bilingualLabel("한국어 (Korean)")}</option>
              <option value="ja">{bilingualLabel("日本語 (Japanese)")}</option>
              <option value="zh">{bilingualLabel("中文 (Chinese)")}</option>
              <option value="fr">{bilingualLabel("Français (French)")}</option>
            </select>
          </label>

          <label>
            <span><BilingualText>{"Mục tiêu học tập"}</BilingualText></span>
            <select
              value={form.learningGoal || 'travel'}
              onChange={(e) => setForm({ ...form, learningGoal: e.target.value })}
            >
              <option value="travel">{bilingualLabel("Du lịch & Khám phá")}</option>
              <option value="work">{bilingualLabel("Công việc & Định cư")}</option>
              <option value="exam_vsl">{bilingualLabel("Thi chứng chỉ VSL")}</option>
              <option value="culture">{bilingualLabel("Văn hóa & Đời sống")}</option>
            </select>
          </label>

          <label>
            <span><BilingualText>{"Cấp độ mong muốn"}</BilingualText></span>
            <select
              value={form.targetLevel || 'A1'}
              onChange={(e) => setForm({ ...form, targetLevel: e.target.value })}
            >
              <option value="A1">{bilingualLabel("A1 – Mới bắt đầu")}</option>
              <option value="A2">{bilingualLabel("A2 – Sơ cấp")}</option>
              <option value="B1">{bilingualLabel("B1 – Trung cấp")}</option>
              <option value="B2">{bilingualLabel("B2 – Trung cấp nâng cao")}</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={state.loading}
            className="!bg-white hover:!bg-[#FFF7E8] !text-[#EA580C] border-2 border-[#EA580C] font-bold py-2.5 px-6 rounded-xl shadow-xs transition-all active:!bg-white"
          >
            <BilingualText>{state.loading ? 'Đang lưu…' : 'Lưu thay đổi hồ sơ'}</BilingualText>
          </button>
        </form>
      ) : (
        <div className="profile-rows">
          <div>
            <b><BilingualText>{"Mục tiêu học tiếng Việt"}</BilingualText></b>
            <span>
              <BilingualText
                vi={goalLabels[profile.learningGoal]?.vi || profile.learningGoal || 'Du lịch & Khám phá'}
                en={goalLabels[profile.learningGoal]?.en || profile.learningGoal || 'Travel & Exploration'}
              />
            </span>
            <i>✓</i>
          </div>
          <div>
            <b><BilingualText>{"Trình độ hiện tại"}</BilingualText></b>
            <span><BilingualText>{profile.targetLevel ? `Cấp độ ${profile.targetLevel}` : 'A1 - Mới bắt đầu'}</BilingualText></span>
            <i>✓</i>
          </div>
          <div>
            <b><BilingualText>{"Ngôn ngữ mẹ đẻ"}</BilingualText></b>
            <span><BilingualText>{languageLabels[profile.nativeLanguage] || profile.nativeLanguage || 'English'}</BilingualText></span>
            <i>✓</i>
          </div>
          <div>
            <b><BilingualText>{"Quốc gia"}</BilingualText></b>
            <span><BilingualText>{profile.country || 'Chưa cập nhật'}</BilingualText></span>
            <i>✓</i>
          </div>
          <div>
            <b><BilingualText>{"Số điện thoại"}</BilingualText></b>
            <span><BilingualText>{profile.phoneNumber || 'Chưa cập nhật'}</BilingualText></span>
            <i>✓</i>
          </div>
        </div>
      )}
    </div>
  );
}

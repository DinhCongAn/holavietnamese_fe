import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useCallback, useEffect, useState } from 'react';
import { learnerService } from '@/features/learning/api/learnerService';

const defaultSettings = {
  audioSpeed: 1,
  pronunciationHintsEnabled: true,
  autoTranslateEnabled: true,
  notificationsEnabled: true,
  dailyLearningGoalMinutes: 15,
};

export function SettingsPage() {
  useTextLanguage();
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ loading: true, error: '', message: '' });

  const load = useCallback(async () => {
    try {
      const remote = await learnerService.getSettings();
      setForm({ ...defaultSettings, ...remote });
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || 'Không thể tải cài đặt.' }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setState({ ...state, loading: true, error: '', message: '' });
    try {
      const res = await learnerService.updateSettings(form);
      setState({
        loading: false,
        error: '',
        message: res.message || 'Đã lưu thiết lập thành công!',
      });
    } catch (err) {
      setState({ loading: false, error: err.message, message: '' });
    }
  };

  if (!form) {
    return (
      <div className="account-empty">
        <BilingualText>{state.error || 'Đang tải cài đặt…'}</BilingualText>
      </div>
    );
  }

  const toggle = (key) => setForm({ ...form, [key]: !form[key] });

  return (
    <div className="account-page">
      <div className="account-header">
        <span className="account-pill"><BilingualText>{"Tùy biến trải nghiệm"}</BilingualText></span>
        <h1 className="account-title"><BilingualText>{"Cài đặt ứng dụng"}</BilingualText></h1>
        <p className="account-desc"><BilingualText>{"Tùy chỉnh tốc độ bài học, tính năng trợ giảng và thông báo nhắc nhở hàng ngày."}</BilingualText></p>
      </div>

      {state.error && <div className="auth-message auth-message-error"><BilingualText>{state.error}</BilingualText></div>}
      {state.message && <div className="auth-message auth-message-success"><BilingualText>{state.message}</BilingualText></div>}

      <form className="settings-list" onSubmit={save}>
        {/* Audio settings */}
        <label>
          <div>
            <b><BilingualText>{"Tốc độ phát âm (Audio Speed)"}</BilingualText></b>
            <small style={{ display: 'block', color: 'var(--color-forest)', marginTop: '2px' }}><BilingualText>{"Điều chỉnh tốc độ đọc các đoạn hội thoại mẫu"}</BilingualText></small>
          </div>
          <select
            value={form.audioSpeed || 1}
            onChange={(e) => setForm({ ...form, audioSpeed: Number(e.target.value) })}
          >
            <option value={0.75}>{bilingualLabel("0.75× Chậm rãi")}</option>
            <option value={1}>{bilingualLabel("1.0× Bình thường (Chuẩn)")}</option>
            <option value={1.25}>{bilingualLabel("1.25× Nhanh tự nhiên")}</option>
          </select>
        </label>

        {/* Daily Goal */}
        <label>
          <div>
            <b><BilingualText>{"Mục tiêu thời gian mỗi ngày"}</BilingualText></b>
            <small style={{ display: 'block', color: 'var(--color-forest)', marginTop: '2px' }}><BilingualText>{"Thời lượng học kỳ vọng để hệ thống thông báo nhắc nhở"}</BilingualText></small>
          </div>
          <select
            value={form.dailyLearningGoalMinutes || 15}
            onChange={(e) => setForm({ ...form, dailyLearningGoalMinutes: Number(e.target.value) })}
          >
            <option value={10}>{bilingualLabel("10 phút / ngày (Thư giãn)")}</option>
            <option value={15}>{bilingualLabel("15 phút / ngày (Tiêu chuẩn)")}</option>
            <option value={30}>{bilingualLabel("30 phút / ngày (Nghiêm túc)")}</option>
            <option value={45}>{bilingualLabel("45 phút / ngày (Cấp tốc)")}</option>
          </select>
        </label>

        {/* Toggleable features */}
        <label>
          <div>
            <b><BilingualText>{"Gợi ý phát âm & khẩu hình"}</BilingualText></b>
            <small style={{ display: 'block', color: 'var(--color-forest)', marginTop: '2px' }}><BilingualText>{"Hiển thị mẹo đặt lưỡi và lấy hơi cho 6 thanh điệu tiếng Việt"}</BilingualText></small>
          </div>
          <input
            type="checkbox"
            checked={!!form.pronunciationHintsEnabled}
            onChange={() => toggle('pronunciationHintsEnabled')}
          />
        </label>

        <label>
          <div>
            <b><BilingualText>{"Tự động dịch nghĩa song ngữ"}</BilingualText></b>
            <small style={{ display: 'block', color: 'var(--color-forest)', marginTop: '2px' }}><BilingualText>{"Hiển thị nghĩa tiếng Anh bên dưới các cụm từ mới"}</BilingualText></small>
          </div>
          <input
            type="checkbox"
            checked={!!form.autoTranslateEnabled}
            onChange={() => toggle('autoTranslateEnabled')}
          />
        </label>

        <label>
          <div>
            <b><BilingualText>{"Thông báo nhắc nhở chuỗi Streak"}</BilingualText></b>
            <small style={{ display: 'block', color: 'var(--color-forest)', marginTop: '2px' }}><BilingualText>{"Nhắc bạn học bài trước 21h hàng ngày để không bị đứt chuỗi"}</BilingualText></small>
          </div>
          <input
            type="checkbox"
            checked={!!form.notificationsEnabled}
            onChange={() => toggle('notificationsEnabled')}
          />
        </label>

        <button type="submit" disabled={state.loading}>
          <BilingualText>{state.loading ? 'Đang lưu…' : 'Lưu tất cả cài đặt'}</BilingualText>
        </button>
      </form>
    </div>
  );
}

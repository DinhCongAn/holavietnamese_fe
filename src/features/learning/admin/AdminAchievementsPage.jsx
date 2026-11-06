import { useState, useEffect, useMemo } from 'react';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { adminService } from '@/features/admin/api/adminService';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { Trophy, Award, Flame, BookOpen, Sparkles, Plus, Power } from 'lucide-react';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

const PAGE_SIZE = 10;

const CATEGORIES = [
  { value: 'LESSON', label: 'Bài học', icon: BookOpen, color: '#2563EB' },
  { value: 'STREAK', label: 'Chuỗi học', icon: Flame, color: '#EA580C' },
  { value: 'VOCABULARY', label: 'Từ vựng', icon: BookOpen, color: '#059669' },
  { value: 'QUIZ', label: 'Kiểm tra', icon: Award, color: '#7C3AED' },
  { value: 'AI_TUTOR', label: 'Hội thoại AI', icon: Sparkles, color: '#D97706' },
  { value: 'GENERAL', label: 'Chung', icon: Trophy, color: '#4B5563' },
];

const CONDITION_TYPES = [
  { value: 'LESSON_COMPLETED', label: 'Số bài học hoàn thành', unit: 'bài' },
  { value: 'STREAK_DAYS', label: 'Chuỗi ngày học liên tục', unit: 'ngày' },
  { value: 'VOCAB_LEARNED', label: 'Số từ vựng ghi nhớ', unit: 'từ' },
  { value: 'QUIZ_PERFECT', label: 'Số bài quiz đạt điểm tối đa', unit: 'bài' },
  { value: 'AI_ROLEPLAY_COMPLETED', label: 'Số lượt hội thoại AI hoàn thành', unit: 'lượt' },
];

const initialBadge = {
  code: '',
  name: '',
  description: '',
  iconUrl: '',
  category: 'LESSON',
  conditionType: 'LESSON_COMPLETED',
  conditionValue: 1,
  xpReward: 50,
  status: 'ACTIVE',
};

export function AdminAchievementsPage() {
  useTextLanguage();
  const [achievements, setAchievements] = useState([]);
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialBadge);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { confirm, confirmationDialog } = useConfirmDialog();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAchievements();
      setAchievements(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách thành tích.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(initialBadge);
    setShowModal(true);
  };

  const handleOpenEdit = (badge) => {
    setEditingId(badge.id);
    setForm({
      code: badge.code || '',
      name: badge.name || badge.title || '',
      description: badge.description || badge.desc || '',
      iconUrl: badge.iconUrl || '',
      category: badge.category || 'LESSON',
      conditionType: badge.conditionType || 'LESSON_COMPLETED',
      conditionValue: badge.conditionValue ?? 1,
      xpReward: badge.xpReward ?? 50,
      status: badge.status || (badge.active ? 'ACTIVE' : 'INACTIVE'),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
      name: form.name.trim(),
      description: form.description ? form.description.trim() : '',
      iconUrl: form.iconUrl ? form.iconUrl.trim() : '',
      category: form.category || 'GENERAL',
      conditionType: form.conditionType,
      conditionValue: parseInt(form.conditionValue, 10) || 1,
      xpReward: parseInt(form.xpReward, 10) || 0,
      status: form.status || 'ACTIVE',
      active: form.status === 'ACTIVE',
    };

    try {
      if (editingId) {
        await adminService.updateAchievement(editingId, payload);
        setMsg('Cập nhật huy hiệu thành công!');
      } else {
        await adminService.createAchievement(payload);
        setMsg('Khởi tạo huy hiệu mới thành công!');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(initialBadge);
      await loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi lưu thông tin huy hiệu.');
    }
  };

  const handleToggleStatus = async (badge) => {
    const isCurrentlyActive = badge.status === 'ACTIVE' || badge.active === true;
    const nextStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';

    try {
      await adminService.updateAchievement(badge.id, {
        code: badge.code,
        name: badge.name || badge.title,
        description: badge.description || badge.desc || '',
        iconUrl: badge.iconUrl || '',
        category: badge.category || 'GENERAL',
        conditionType: badge.conditionType || 'LESSON_COMPLETED',
        conditionValue: badge.conditionValue ?? 1,
        xpReward: badge.xpReward ?? 50,
        status: nextStatus,
        active: nextStatus === 'ACTIVE',
      });
      setMsg(nextStatus === 'ACTIVE' ? 'Đã bật huy hiệu hoạt động.' : 'Đã tạm ẩn huy hiệu.');
      await loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật trạng thái huy hiệu.');
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: bilingualLabel('Xóa huy hiệu?', 'Delete badge?'),
      description: bilingualLabel(
        `Bạn có chắc muốn xóa huy hiệu "${name}"? Hành động này không thể hoàn tác.`,
        `Are you sure you want to delete badge "${name}"? This action cannot be undone.`
      ),
      confirmLabel: bilingualLabel('Xóa huy hiệu', 'Delete badge'),
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await adminService.deleteAchievement(id);
      setMsg('Đã xóa huy hiệu thành công.');
      await loadData();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa huy hiệu.');
    }
  };

  const stats = useMemo(() => {
    const total = achievements.length;
    const active = achievements.filter((a) => a.status === 'ACTIVE' || a.active === true).length;
    const totalXp = achievements.reduce((acc, a) => acc + (a.xpReward || 0), 0);
    return { total, active, totalXp };
  }, [achievements]);

  const totalPages = Math.max(1, Math.ceil(achievements.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedAchievements = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return achievements.slice(start, start + PAGE_SIZE);
  }, [achievements, currentPage]);

  return (
    <div className="space-y-6">
      {confirmationDialog}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-1.5">
            <Trophy size={13} /> QUẢN TRỊ HỆ THỐNG
          </div>
          <h1 className="text-2xl font-black text-[#253044] m-0"><BilingualText>Quản lý Thành tích & Huy hiệu</BilingualText></h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">
            <BilingualText>Cấu hình danh mục huy hiệu, điều kiện mở khóa và điểm thưởng XP tự động cho học viên.</BilingualText>
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold shadow-xs transition-all cursor-pointer !min-h-0 !border-0"
        >
          <Plus size={16} /> <BilingualText>Thêm huy hiệu mới</BilingualText>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-2xs">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide"><BilingualText>Tổng số huy hiệu</BilingualText></div>
          <div className="text-2xl font-black text-[#253044] mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide"><BilingualText>Đang hoạt động (Bật)</BilingualText></div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-2xs">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wide"><BilingualText>Tổng điểm thưởng XP</BilingualText></div>
          <div className="text-2xl font-black text-amber-600 mt-1">+{stats.totalXp} XP</div>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">×</button>
        </div>
      )}
      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center justify-between">
          <span>{msg}</span>
          <button type="button" onClick={() => setMsg('')} className="text-emerald-500 hover:text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Achievements Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E8E5DF] bg-[#FFFBF5] text-xs font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3 px-4"><BilingualText>Mã Code & Biểu tượng</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Tên & Mô tả huy hiệu</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Danh mục</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Điều kiện mở khóa</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Thưởng XP</BilingualText></th>
                <th className="py-3 px-4 text-center"><BilingualText>Trạng thái</BilingualText></th>
                <th className="py-3 px-4 text-right"><BilingualText>Thao tác</BilingualText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent mr-2" />
                    <BilingualText>Đang tải danh sách huy hiệu…</BilingualText>
                  </td>
                </tr>
              ) : achievements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    Chưa có huy hiệu nào trong hệ thống. Hãy bấm <strong>+ Thêm huy hiệu mới</strong> để tạo.
                  </td>
                </tr>
              ) : (
                paginatedAchievements.map((badge) => {
                  const isActive = badge.status === 'ACTIVE' || badge.active === true;
                  const categoryMeta = CATEGORIES.find((c) => c.value === badge.category) || CATEGORIES[5];
                  const conditionMeta = CONDITION_TYPES.find((c) => c.value === badge.conditionType) || { label: badge.conditionType, unit: '' };

                  return (
                    <tr key={badge.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Code & Icon */}
                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] text-base">
                            {badge.iconUrl && badge.iconUrl.startsWith('http') ? (
                              <img src={badge.iconUrl} alt={badge.name} className="h-5 w-5 object-contain" />
                            ) : (
                              '🏆'
                            )}
                          </span>
                          <span className="font-bold text-[#253044]">{badge.code}</span>
                        </div>
                      </td>

                      {/* Name & Desc */}
                      <td className="py-3 px-4 max-w-xs">
                        <strong className="block text-[#253044]">{badge.name || badge.title}</strong>
                        <span className="text-xs text-[#64748B] line-clamp-1">{badge.description || badge.desc || '—'}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-[#253044]">
                          <BilingualText>{categoryMeta.label}</BilingualText>
                        </span>
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <span className="text-[#64748B]">{conditionMeta.label}:</span>{' '}
                          <strong className="text-[#253044]">{badge.conditionValue ?? 1} {conditionMeta.unit}</strong>
                        </div>
                      </td>

                      {/* XP Reward */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          +{badge.xpReward ?? 0} XP
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(badge)}
                          title={isActive ? 'Nhấn để tạm ẩn' : 'Nhấn để kích hoạt'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer !min-h-0 !border ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-stone-100 border-stone-300 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          <Power size={12} />
                          <BilingualText>{isActive ? 'Hoạt động' : 'Tạm ẩn'}</BilingualText>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <AdminActionGroup>
                          <AdminActionButton tone="neutral" onClick={() => handleOpenEdit(badge)}><BilingualText>Sửa</BilingualText></AdminActionButton>
                          <AdminActionButton tone="delete" iconOnly onClick={() => handleDelete(badge.id, badge.name || badge.title)} title="Xóa huy hiệu" aria-label="Xóa huy hiệu" />
                        </AdminActionGroup>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {achievements.length > 0 && (
          <AdminPagination
            currentPage={currentPage + 1}
            pageSize={PAGE_SIZE}
            totalItems={achievements.length}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
          />
        )}
      </div>

      {/* Modal Create / Edit */}
      {showModal && (
        <Modal
          title={editingId ? bilingualLabel("Cập nhật huy hiệu", "Update Badge") : bilingualLabel("Khởi tạo huy hiệu mới", "Create New Badge")}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Mã Code duy nhất *
                </label>
                <input
                  type="text"
                  placeholder="VD: STREAK_30_DAYS"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Tên huy hiệu *
                </label>
                <input
                  type="text"
                  placeholder="VD: Chiến Binh Kiên Trì"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253044] mb-1">
                Mô tả huy hiệu
              </label>
              <textarea
                placeholder="Mô tả ý nghĩa và hướng dẫn học viên cách nhận huy hiệu này…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Danh mục
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {bilingualLabel(cat.label)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="ACTIVE">Hoạt động (Hiển thị cho học viên)</option>
                  <option value="INACTIVE">Tạm ẩn (Không khả dụng)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Loại điều kiện mở khóa *
                </label>
                <select
                  value={form.conditionType}
                  onChange={(e) => setForm({ ...form, conditionType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                >
                  {CONDITION_TYPES.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {bilingualLabel(cond.label)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Giá trị cần đạt *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.conditionValue}
                  onChange={(e) => setForm({ ...form, conditionValue: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Điểm thưởng XP *
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={form.xpReward}
                  onChange={(e) => setForm({ ...form, xpReward: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#253044] mb-1">
                  Icon URL / Ảnh huy hiệu (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="https://... hoặc /badges/icon.png"
                  value={form.iconUrl}
                  onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E5DF] mt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-sm font-semibold text-[#64748B] hover:bg-stone-50 cursor-pointer !min-h-0"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-sm font-bold shadow-xs cursor-pointer !min-h-0 !border-0"
              >
                {editingId ? 'Lưu thay đổi' : 'Tạo huy hiệu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminAchievementsPage;

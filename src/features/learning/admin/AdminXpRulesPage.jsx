import { useCallback, useEffect, useMemo, useState } from 'react';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { adminService } from '@/features/admin/api/adminService';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { Zap, Power, Sparkles, BookOpen, Flame, Award, CheckCircle2 } from 'lucide-react';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

const PAGE_SIZE = 10;

const PRESETS = [
  { eventType: 'LESSON_COMPLETE', eventName: 'Hoàn thành 1 bài học', xpReward: 20, dailyCap: 200, icon: BookOpen },
  { eventType: 'DAILY_LOGIN', eventName: 'Đăng nhập mỗi ngày', xpReward: 10, dailyCap: 10, icon: CheckCircle2 },
  { eventType: 'DAILY_CHECKIN', eventName: 'Điểm danh hàng ngày', xpReward: 10, dailyCap: 10, icon: Flame },
  { eventType: 'QUIZ_PASS', eventName: 'Đạt bài kiểm tra', xpReward: 15, dailyCap: 150, icon: Award },
  { eventType: 'VOCAB_LEARNED', eventName: 'Học 1 từ mới', xpReward: 5, dailyCap: 50, icon: BookOpen },
  { eventType: 'AI_ROLEPLAY_COMPLETE', eventName: 'Hoàn thành hội thoại AI', xpReward: 25, dailyCap: 100, icon: Sparkles },
  { eventType: 'STREAK_MAINTAIN', eventName: 'Duy trì chuỗi học tập', xpReward: 30, dailyCap: 30, icon: Flame },
];

const emptyDraft = {
  eventType: '',
  eventName: '',
  xpReward: 10,
  dailyCap: 100,
  active: true,
};

export function AdminXpRulesPage() {
  useTextLanguage();
  const { confirm, confirmationDialog } = useConfirmDialog();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getXpRules();
      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (e) {
      setError(e.message || 'Không thể tải danh sách quy tắc XP.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyPreset = (preset) => {
    setDraft({
      eventType: preset.eventType,
      eventName: preset.eventName,
      xpReward: preset.xpReward,
      dailyCap: preset.dailyCap,
      active: true,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      eventType: draft.eventType.trim().toUpperCase().replace(/\s+/g, '_'),
      eventName: draft.eventName.trim(),
      xpReward: parseInt(draft.xpReward, 10) || 0,
      dailyCap: draft.dailyCap !== '' && draft.dailyCap !== null ? parseInt(draft.dailyCap, 10) : null,
      active: Boolean(draft.active),
    };

    try {
      if (editingId) {
        await adminService.updateXpRule(editingId, payload);
        setMsg('Đã cập nhật quy tắc XP thành công!');
      } else {
        await adminService.createXpRule(payload);
        setMsg('Đã khởi tạo quy tắc XP mới!');
      }
      setEditingId(null);
      setDraft(emptyDraft);
      await load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu quy tắc XP.');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft({
      eventType: item.eventType || '',
      eventName: item.eventName || '',
      xpReward: item.xpReward ?? 0,
      dailyCap: item.dailyCap ?? 0,
      active: item.active !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const toggleActive = async (item) => {
    const nextActive = !item.active;
    try {
      await adminService.updateXpRule(item.id, {
        eventType: item.eventType,
        eventName: item.eventName,
        xpReward: item.xpReward,
        dailyCap: item.dailyCap,
        active: nextActive,
      });
      setMsg(nextActive ? 'Đã kích hoạt quy tắc XP.' : 'Đã tạm dừng quy tắc XP.');
      await load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật trạng thái quy tắc XP.');
    }
  };

  const remove = async (id, eventName) => {
    const ok = await confirm({
      title: bilingualLabel('Xóa quy tắc XP?', 'Delete XP rule?'),
      description: bilingualLabel(
        `Quy tắc tính điểm "${eventName}" sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn?`,
        `The scoring rule "${eventName}" will be deleted. Are you sure?`
      ),
      confirmLabel: bilingualLabel('Xóa quy tắc', 'Delete rule'),
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await adminService.deleteXpRule(id);
      setMsg('Đã xóa quy tắc XP thành công.');
      await load();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setError(e.message || 'Lỗi xóa quy tắc XP.');
    }
  };

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.active !== false).length;
    const maxDailyPotential = items
      .filter((i) => i.active !== false)
      .reduce((acc, i) => acc + (i.dailyCap || 0), 0);
    return { total, active, maxDailyPotential };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedItems = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, currentPage]);

  return (
    <div className="space-y-6">
      {confirmationDialog}

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold w-fit">
          <Zap size={13} /> QUY TẮC TÍNH ĐIỂM
        </div>
        <h1 className="text-2xl font-black text-[#253044] m-0"><BilingualText>Quy tắc cộng điểm XP</BilingualText></h1>
        <p className="text-sm text-[#64748B] m-0">
          <BilingualText>Quản lý cơ chế thưởng XP cho từng hoạt động học tập và cấu hình giới hạn chống cày điểm lạm phát.</BilingualText>
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-2xs">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wide"><BilingualText>Tổng số quy tắc</BilingualText></div>
          <div className="text-2xl font-black text-[#253044] mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide"><BilingualText>Đang áp dụng (Bật)</BilingualText></div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-2xs">
          <div className="text-xs font-bold text-[#EA580C] uppercase tracking-wide"><BilingualText>Giới hạn tối đa/ngày</BilingualText></div>
          <div className="text-2xl font-black text-[#EA580C] mt-1">~{stats.maxDailyPotential} XP</div>
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

      {/* Form Add / Edit */}
      <div className="rounded-2xl border border-[#E8E5DF] bg-white p-5 shadow-2xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-[#253044] m-0">
            <BilingualText>{editingId ? 'Chỉnh sửa quy tắc XP' : 'Thêm quy tắc XP mới'}</BilingualText>
          </h2>

          {!editingId && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[#64748B] font-medium mr-1">Mẫu nhanh:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.eventType}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#EA580C] border border-orange-200 text-xs font-semibold transition-colors cursor-pointer !min-h-0"
                  title={`Điền mẫu: ${p.eventName}`}
                >
                  {p.eventName}
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#253044] mb-1">
                Mã sự kiện (Event Type) *
              </label>
              <input
                type="text"
                placeholder="VD: LESSON_COMPLETE"
                value={draft.eventType}
                onChange={(e) => setDraft({ ...draft, eventType: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C] font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253044] mb-1">
                Tên sự kiện hiển thị *
              </label>
              <input
                type="text"
                placeholder="VD: Hoàn thành 1 bài học"
                value={draft.eventName}
                onChange={(e) => setDraft({ ...draft, eventName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253044] mb-1">
                Điểm thưởng (XP) *
              </label>
              <input
                type="number"
                min="0"
                step="5"
                placeholder="20"
                value={draft.xpReward}
                onChange={(e) => setDraft({ ...draft, xpReward: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#253044] mb-1">
                Giới hạn ngày (Daily Cap)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="200 (để trống = vô hạn)"
                value={draft.dailyCap ?? ''}
                onChange={(e) => setDraft({ ...draft, dailyCap: e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5DF] text-sm focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#E8E5DF]">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#253044]">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                className="h-4 w-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
              />
              Kích hoạt áp dụng quy tắc này ngay
            </label>

            <div className="flex items-center gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl border border-[#E8E5DF] text-xs font-bold text-[#64748B] hover:bg-stone-50 transition-colors cursor-pointer !min-h-0"
                >
                  Hủy chỉnh sửa
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer !min-h-0 !border-0"
              >
                {editingId ? 'Lưu thay đổi quy tắc' : '+ Thêm quy tắc XP'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Rules Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E8E5DF] bg-[#FFFBF5] text-xs font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3 px-4"><BilingualText>Mã sự kiện (Event Type)</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Tên hoạt động</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Điểm XP thưởng</BilingualText></th>
                <th className="py-3 px-4"><BilingualText>Giới hạn / ngày (Chống spam)</BilingualText></th>
                <th className="py-3 px-4 text-center"><BilingualText>Trạng thái</BilingualText></th>
                <th className="py-3 px-4 text-right"><BilingualText>Thao tác</BilingualText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#EA580C] border-t-transparent mr-2" />
                    <BilingualText>Đang tải danh sách quy tắc XP…</BilingualText>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    Chưa có quy tắc XP nào. Hãy chọn mẫu nhanh phía trên để tạo.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isActive = item.active !== false;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Event Type */}
                      <td className="py-3 px-4 font-mono text-xs font-bold text-[#EA580C]">
                        {item.eventType}
                      </td>

                      {/* Event Name */}
                      <td className="py-3 px-4 font-semibold text-[#253044]">
                        {item.eventName}
                      </td>

                      {/* XP Reward */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          +{item.xpReward} XP
                        </span>
                      </td>

                      {/* Daily Cap */}
                      <td className="py-3 px-4 text-xs text-[#64748B]">
                        {item.dailyCap && item.dailyCap > 0 ? (
                          <span className="font-semibold text-[#253044]">
                            Tối đa {item.dailyCap} XP/ngày
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">Không giới hạn</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          title={isActive ? 'Nhấn để tạm dừng' : 'Nhấn để kích hoạt'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer !min-h-0 !border ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-stone-100 border-stone-300 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          <Power size={12} />
                          <BilingualText>{isActive ? 'Hoạt động' : 'Tạm dừng'}</BilingualText>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <AdminActionGroup>
                          <AdminActionButton tone="neutral" onClick={() => startEdit(item)}><BilingualText>Sửa</BilingualText></AdminActionButton>
                          <AdminActionButton tone="delete" iconOnly onClick={() => remove(item.id, item.eventName)} title="Xóa quy tắc" aria-label="Xóa quy tắc" />
                        </AdminActionGroup>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {items.length > 0 && (
          <AdminPagination
            currentPage={currentPage + 1}
            pageSize={PAGE_SIZE}
            totalItems={items.length}
            onPageChange={(nextPage) => setPage(nextPage - 1)}
          />
        )}
      </div>
    </div>
  );
}

export default AdminXpRulesPage;

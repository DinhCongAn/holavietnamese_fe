import { BilingualText, vietnameseLabel, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { useState, useEffect } from 'react';
import { adminService } from '@/features/admin/api/adminService';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';

export function AdminAchievementsPage() {
  useTextLanguage();
  const [achievements, setAchievements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAch, setNewAch] = useState({
    code: '',
    title: '',
    desc: '',
    icon: '',
    iconUrl: '',
    conditionType: 'LESSON_COUNT',
    criteria: '',
    xpReward: 50,
  });
  const [msg, setMsg] = useState('');
  const [error,setError]=useState('');
  const { confirm, confirmationDialog } = useConfirmDialog();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    adminService.getAchievements().then(setAchievements).catch(err=>setError(err.message));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {const res = editingId
      ? await adminService.updateAchievement(editingId, newAch)
      : await adminService.createAchievement(newAch);
    setMsg(res.message);
    setShowModal(false);
    setEditingId(null);
    setNewAch({
      code: '',
      title: '',
      desc: '',
      icon: '',
      iconUrl: '',
      conditionType: 'LESSON_COUNT',
      criteria: '',
      xpReward: 50,
    });
    loadData();
    setTimeout(() => setMsg(''), 3000);
    }catch(err){setError(err.message);}
  };

  const handleEdit = (achievement) => {
    setEditingId(achievement.id);
    setNewAch({ ...newAch, ...achievement });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!await confirm({
      title: bilingualLabel('Xóa huy hiệu?', 'Delete badge?'),
      description: bilingualLabel('Huy hiệu sẽ bị xóa khỏi hệ thống và không thể khôi phục.', 'The badge will be permanently deleted and cannot be restored.'),
      confirmLabel: bilingualLabel('Xóa huy hiệu', 'Delete badge'),
    })) return;
    try { const res = await adminService.deleteAchievement(id); setMsg(res.message || 'Đã xóa huy hiệu.'); loadData(); }
    catch (error) { setMsg(error.message); }
  };

  return (
    <div>
      {confirmationDialog}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0' }}><BilingualText>{"Quản lý Thành tích & Huy hiệu"}</BilingualText></h1>
          <p style={{ color: 'var(--color-muted)', margin: 0, fontSize: '0.9rem' }}><BilingualText>{"Tạo huy hiệu, cấu hình điều kiện mở khóa và điểm thưởng XP cho người học."}</BilingualText></p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--color-red-hover)',
            color: 'var(--color-surface)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        ><BilingualText>{"+ Thêm huy hiệu mới"}</BilingualText></button>
      </div>

      {error&&<div className="ui-notice ui-notice--error" role="alert"><BilingualText>{error}</BilingualText></div>}
      {msg && (
        <div style={{ padding: '10px 16px', background: 'var(--color-sage-soft)', color: 'var(--color-ink)', borderRadius: '8px', marginBottom: '16px' }}>
          <BilingualText>{msg}</BilingualText>
        </div>
      )}

      {/* Achievements Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><BilingualText>{"Mã Code / Icon"}</BilingualText></th>
              <th><BilingualText>{"Tên huy hiệu"}</BilingualText></th>
              <th><BilingualText>{"Điều kiện mở khóa"}</BilingualText></th>
              <th><BilingualText>{"Loại điều kiện"}</BilingualText></th>
              <th><BilingualText>{"Thưởng XP"}</BilingualText></th>
              <th><BilingualText>{"Trạng thái"}</BilingualText></th>
              <th><BilingualText>{"Thao tác"}</BilingualText></th>
            </tr>
          </thead>
          <tbody>
            {achievements.map(ach => (
              <tr key={ach.id}>
                <td>
                  <span style={{ fontSize: '1.4rem', marginRight: '8px' }}>{ach.icon}</span>
                  <strong>{ach.code || ach.id}</strong>
                </td>
                <td><button className="secondary" onClick={() => handleEdit(ach)}><BilingualText>{"Sửa"}</BilingualText></button>{' '}<button className="danger" onClick={() => handleDelete(ach.id)}><BilingualText>{"Xóa"}</BilingualText></button></td>
                <td><strong style={{ color: 'var(--color-ink)' }}><BilingualText vi={ach.titleVi || ach.title} en={ach.title} /></strong></td>
                <td>{ach.criteria}</td>
                <td>
                  <span style={{ background: 'var(--color-cream)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {ach.conditionType || 'GENERAL'}
                  </span>
                </td>
                <td><span style={{ color: 'var(--color-forest)', fontWeight: 700 }}>+{ach.xpReward} XP</span></td>
                <td>
                  <span className={`admin-badge ${ach.active ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                    <BilingualText>{ach.active ? 'Hoạt động' : 'Tạm ẩn'}</BilingualText>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Achievement */}
      {showModal && (
        <Modal title={editingId ? bilingualLabel("Cập nhật huy hiệu", "Update Badge") : bilingualLabel("Khởi tạo huy hiệu mới", "Create New Badge")} onClose={()=>setShowModal(false)}>
<form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Biểu tượng"}</BilingualText></label>
                  <input
                    type="text"
                    value={newAch.icon}
                    onChange={e => setNewAch({ ...newAch, icon: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Mã Code duy nhất"}</BilingualText></label>
                  <input
                    type="text"
                    placeholder={bilingualLabel("VD: PHO_MASTER_01", "E.g., PHO_MASTER_01")}
                    value={newAch.code}
                    onChange={e => setNewAch({ ...newAch, code: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Tên huy hiệu"}</BilingualText></label>
                <input
                  type="text"
                  placeholder={vietnameseLabel("Ví dụ: Bậc Thầy Phở Bò")}
                  value={newAch.title}
                  onChange={e => setNewAch({ ...newAch, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Mô tả huy hiệu"}</BilingualText></label>
                <input
                  type="text"
                  placeholder={vietnameseLabel("Ví dụ: Hoàn thành chủ đề Gọi món Phở Hà Nội")}
                  value={newAch.desc}
                  onChange={e => setNewAch({ ...newAch, desc: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Loại điều kiện"}</BilingualText></label>
                  <select
                    value={newAch.conditionType}
                    onChange={e => setNewAch({ ...newAch, conditionType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  >
                    <option value="LESSON_COUNT">{vietnameseLabel("Số bài học hoàn thành")}</option>
                    <option value="VOCAB_COUNT">{vietnameseLabel("Số từ vựng ghi nhớ")}</option>
                    <option value="STREAK_DAYS">{vietnameseLabel("Chuỗi ngày liên tiếp")}</option>
                    <option value="JOURNEY_CITY">{vietnameseLabel("Hoàn thành chặng Hành trình")}</option>
                    <option value="QUIZ_SCORE">{vietnameseLabel("Điểm số bài kiểm tra")}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Điểm XP thưởng"}</BilingualText></label>
                  <input
                    type="number"
                    value={newAch.xpReward}
                    onChange={e => setNewAch({ ...newAch, xpReward: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Chi tiết điều kiện mở khóa"}</BilingualText></label>
                <textarea
                  placeholder={vietnameseLabel("Mô tả hành động cần đạt để mở khóa huy hiệu…")}
                  value={newAch.criteria}
                  onChange={e => setNewAch({ ...newAch, criteria: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', height: '60px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}><BilingualText>{"Link Icon SVG/PNG (Tùy chọn)"}</BilingualText></label>
                <input
                  type="text"
                  placeholder={bilingualLabel("https://... (để trống nếu dùng Emoji)", "https://... (leave blank for Emoji)")}
                  value={newAch.iconUrl}
                  onChange={e => setNewAch({ ...newAch, iconUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer' }}
                ><BilingualText>{"Hủy"}</BilingualText></button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: 'var(--color-red-hover)', color: 'var(--color-surface)', fontWeight: 700, cursor: 'pointer' }}
                >
                  <BilingualText>{editingId ? 'Lưu thay đổi' : 'Khởi tạo huy hiệu'}</BilingualText>
                </button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
}

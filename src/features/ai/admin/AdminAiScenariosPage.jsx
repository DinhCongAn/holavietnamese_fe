import { BilingualText, bilingualLabel, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { toast } from 'sonner';
import { Check, Pencil, Play, Power, Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

const TOPIC_MAP = {
  dining: { vi: 'Ẩm thực & Quán xá', en: 'Dining & Street Food' },
  shopping: { vi: 'Mua sắm & Mặc cả', en: 'Shopping & Bargaining' },
  travel: { vi: 'Di chuyển & Du lịch', en: 'Travel & Transport' },
  hospitality: { vi: 'Khách sạn & Nghỉ dưỡng', en: 'Hotels & Hospitality' },
  social: { vi: 'Gia đình & Bạn bè', en: 'Family & Social' },
  work: { vi: 'Giao tiếp công sở', en: 'Workplace Communication' },
};

const DIFFICULTY_MAP = {
  'Dễ': { vi: 'Dễ', en: 'Easy' },
  'Dễ - Trung bình': { vi: 'Dễ - Trung bình', en: 'Easy - Medium' },
  'Trung bình': { vi: 'Trung bình', en: 'Medium' },
  'Nâng cao': { vi: 'Nâng cao', en: 'Advanced' },
  'Thử thách': { vi: 'Thử thách', en: 'Challenging' },
};

export function AdminAiScenariosPage() {
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { confirm, confirmationDialog } = useConfirmDialog();
  const label = useBilingualLabel();

  useEffect(() => {
    adminCultureAiService
      .listScenarioRecords()
      .then(setScenarios)
      .catch(error => toast.error(error.message))
      .finally(() => setLoading(false));

    // Tự cập nhật "Lượt hoàn thành" khi learner hoàn thành kịch bản
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      adminCultureAiService.listScenarioRecords().then(setScenarios).catch(() => {});
    };
    const timer = setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, topicFilter, levelFilter, statusFilter]);

  const filteredScenarios = scenarios.filter(sc => {
    const q = search.trim().toLowerCase();
    return (
      (!q || `${sc.title} ${sc.destination || ''}`.toLowerCase().includes(q)) &&
      (topicFilter === 'all' || sc.topic === topicFilter) &&
      (levelFilter === 'all' || sc.level === levelFilter) &&
      (statusFilter === 'all' || sc.status === statusFilter)
    );
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminCultureAiService.updateScenarioRecordStatus(id, newStatus);
      adminCultureAiService.updateScenarioStatus(id, newStatus);
      setScenarios(prev => prev.map(sc => (sc.id === id ? { ...sc, status: newStatus } : sc)));
      toast.success(
        bilingualLabel(
          `Đã đổi trạng thái kịch bản sang: ${newStatus}`,
          `Scenario status changed to: ${newStatus}`,
        ),
      );
    } catch (error) {
      toast.error(
        error?.message ||
          bilingualLabel('Không thể cập nhật trạng thái kịch bản.', 'Failed to update scenario status.'),
      );
    }
  };

  const handleDelete = async (id, title) => {
    const accepted = await confirm({
      title: bilingualLabel('Xóa kịch bản AI?', 'Delete AI scenario?'),
      description: bilingualLabel(
        `Kịch bản “${title}” sẽ bị xóa và không thể khôi phục.`,
        `Scenario “${title}” will be deleted and cannot be recovered.`,
      ),
      confirmLabel: bilingualLabel('Xóa kịch bản', 'Delete scenario'),
    });
    if (!accepted) return;
    try {
      await adminCultureAiService.deleteScenarioRecord(id);
      adminCultureAiService.deleteScenario(id);
      setScenarios(prev => prev.filter(sc => sc.id !== id));
      toast.success(bilingualLabel('Đã xóa kịch bản.', 'Scenario deleted.'));
    } catch (error) {
      toast.error(
        error?.message ||
          bilingualLabel('Không thể xóa kịch bản. Vui lòng thử lại.', 'Failed to delete scenario. Please try again.'),
      );
    }
  };

  const getStatusBadge = status => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      height: '28px',
      padding: '0 11px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      lineHeight: 1,
    };

    switch (status) {
      case 'ACTIVE':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <span>{label('Đang hoạt động', 'Active')}</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
            <span>{label('Bản nháp', 'Draft')}</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            <span>{label('Đã khóa', 'Archived')}</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              ...baseStyle,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            <span>{status}</span>
          </span>
        );
    }
  };

  const thStyle = {
    padding: '14px 14px',
    whiteSpace: 'nowrap',
    fontSize: '11.5px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-ink)',
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
  };

  const tdStyle = {
    padding: '16px 14px',
    verticalAlign: 'middle',
    borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
  };

  // Override global heritage.css button min-height: 46px/54px & min-width: 64px
  const actionBtnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    height: '32px',
    minHeight: '32px',
    maxHeight: '32px',
    minWidth: 'auto',
    padding: '0 10px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    lineHeight: 1,
    textDecoration: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const totalPages = Math.max(1, Math.ceil(filteredScenarios.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedScenarios = filteredScenarios.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="admin-content">
      {confirmationDialog}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <BilingualText vi="THIẾT KẾ KỊCH BẢN & AI PROMPT" en="ROLEPLAY AND AI PROMPT DESIGN" />
          </span>
          <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}>
            <BilingualText vi="Quản lý kịch bản AI" en="Manage AI scenarios" />
          </h1>
          <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}>
            <BilingualText
              vi="Thiết lập danh mục kịch bản nhập vai giao tiếp thực tế, gán nhân vật AI, kiểm soát độ khó và tiêu chí đánh giá phản xạ."
              en="Configure real-life roleplay scenarios, AI characters, difficulty and communication assessment criteria."
            />
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to="/admin/ai-settings"
            className="button secondary"
            style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px' }}
          >
            <span>{label('Cấu hình mô hình AI', 'AI model configuration')}</span>
          </Link>
          <Link
            to="/admin/ai-scenarios/new"
            className="button"
            style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px' }}
          >
            <span>{label('+ Tạo kịch bản mới', '+ Create new scenario')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={label('Tìm theo tên kịch bản, địa điểm...', 'Search by scenario title, location...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
            <option value="all">{label('Tất cả chủ đề', 'All topics')}</option>
            <option value="dining">{label('Ẩm thực & Quán xá', 'Dining & Street Food')}</option>
            <option value="shopping">{label('Mua sắm & Mặc cả', 'Shopping & Bargaining')}</option>
            <option value="travel">{label('Di chuyển & Du lịch', 'Travel & Transport')}</option>
            <option value="hospitality">{label('Khách sạn & Nghỉ dưỡng', 'Hotels & Hospitality')}</option>
            <option value="social">{label('Gia đình & Bạn bè', 'Family & Social')}</option>
            <option value="work">{label('Giao tiếp công sở', 'Workplace Communication')}</option>
          </select>

          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="all">{label('Tất cả trình độ', 'All levels')}</option>
            <option value="A1">{label('A1 - Sơ cấp 1', 'A1 - Beginner 1')}</option>
            <option value="A2">{label('A2 - Sơ cấp 2', 'A2 - Elementary 2')}</option>
            <option value="B1">{label('B1 - Trung cấp 1', 'B1 - Intermediate 1')}</option>
            <option value="B2">{label('B2 - Trung cấp 2', 'B2 - Upper Intermediate 2')}</option>
            <option value="C1">{label('C1 - Nâng cao', 'C1 - Advanced')}</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">{label('Tất cả trạng thái', 'All statuses')}</option>
            <option value="ACTIVE">{label('Đang hoạt động', 'Active')}</option>
            <option value="DRAFT">{label('Bản nháp', 'Draft')}</option>
            <option value="ARCHIVED">{label('Đã khóa', 'Archived')}</option>
          </select>

          {(search || topicFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="button secondary"
              style={{ fontSize: '12px', minHeight: '40px', height: '40px', padding: '0 14px', whiteSpace: 'nowrap' }}
              onClick={() => {
                setSearch('');
                setTopicFilter('all');
                setLevelFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
            >
              <span>{label('Đặt lại', 'Reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: '1060px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '24%', paddingLeft: '20px' }}>
                {label('Kịch bản & Bối cảnh', 'Scenario and Context')}
              </th>
              <th style={{ ...thStyle, width: '21%' }}>
                {label('Nhân vật AI', 'AI Character')}
              </th>
              <th style={{ ...thStyle, width: '7%', textAlign: 'center' }}>
                {label('Trình độ', 'Level')}
              </th>
              <th style={{ ...thStyle, width: '11%' }}>
                {label('Địa điểm', 'Location')}
              </th>
              <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>
                {label('Hoàn thành', 'Completions')}
              </th>
              <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>
                {label('Trạng thái', 'Status')}
              </th>
              <th style={{ ...thStyle, width: '17%', minWidth: '245px', textAlign: 'right', paddingRight: '20px' }}>
                {label('Thao tác', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  {label('Đang tải danh sách kịch bản AI...', 'Loading AI scenarios...')}
                </td>
              </tr>
            ) : filteredScenarios.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  {label('Không tìm thấy kịch bản AI nào phù hợp.', 'No matching AI scenarios found.')}
                </td>
              </tr>
            ) : (
              pagedScenarios.map(sc => {
                const count = sc.completionsCount || 0;
                const topicObj = TOPIC_MAP[sc.topic];
                const topicDisplay = topicObj ? label(topicObj.vi, topicObj.en) : (sc.topicName || sc.topic);
                const diffObj = DIFFICULTY_MAP[sc.difficulty];
                const diffDisplay = diffObj ? label(diffObj.vi, diffObj.en) : sc.difficulty;

                return (
                  <tr key={sc.id}>
                    <td style={{ ...tdStyle, paddingLeft: '20px' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)', display: 'block', marginBottom: '4px', lineHeight: 1.35 }}>
                          {sc.title}
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 500 }}>
                          {topicDisplay} • {diffDisplay}
                        </span>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span
                          style={{
                            fontSize: '19px',
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: '#fff7ed',
                            border: '1px solid #ffedd5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {sc.aiRole?.avatar || '🤖'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '13px', color: 'var(--color-ink)', display: 'block', marginBottom: '2px', lineHeight: 1.3 }}>
                            {sc.aiRole?.name}
                          </strong>
                          <span style={{ fontSize: '11.5px', color: 'var(--color-forest)', display: 'block', lineHeight: 1.35 }}>
                            {sc.aiRole?.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '24px',
                          padding: '0 9px',
                          borderRadius: '6px',
                          background: 'var(--color-red-hover)',
                          color: 'var(--color-surface)',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {sc.level}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500 }}>
                        📍 {sc.destination}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          height: '28px',
                          padding: '0 11px',
                          borderRadius: '999px',
                          background: count > 0 ? '#eff6ff' : '#f1f5f9',
                          color: count > 0 ? '#1d4ed8' : '#475569',
                          border: count > 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                          fontSize: '12px',
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        <span>{count}</span>
                        <span>{label('lượt', count === 1 ? 'time' : 'times')}</span>
                      </span>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {getStatusBadge(sc.status)}
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                        {sc.status !== 'ACTIVE' ? (
                          <button
                            type="button"
                            className="button secondary"
                            style={{
                              ...actionBtnBase,
                              color: '#15803d',
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                            }}
                            title={label('Kích hoạt kịch bản', 'Enable scenario')}
                            onClick={() => handleStatusChange(sc.id, 'ACTIVE')}
                          >
                            <Check size={13} strokeWidth={2.4} />
                            <span>{label('Bật', 'On')}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="button secondary"
                            style={{
                              ...actionBtnBase,
                              color: '#c2410c',
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                            }}
                            title={label('Tạm khóa kịch bản', 'Disable scenario')}
                            onClick={() => handleStatusChange(sc.id, 'DRAFT')}
                          >
                            <Power size={13} strokeWidth={2.2} />
                            <span>{label('Tắt', 'Off')}</span>
                          </button>
                        )}

                        <Link
                          to={`/admin/ai-scenarios/${sc.id}`}
                          className="button secondary"
                          style={{
                            ...actionBtnBase,
                            color: '#334155',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                          }}
                          title={label('Chỉnh sửa kịch bản', 'Edit scenario')}
                        >
                          <Pencil size={13} strokeWidth={2.1} />
                          <span>{label('Sửa', 'Edit')}</span>
                        </Link>

                        <Link
                          to={`/ai-roleplay/${sc.id}`}
                          target="_blank"
                          className="button secondary"
                          style={{
                            ...actionBtnBase,
                            color: '#0f766e',
                            background: '#f0fdfa',
                            border: '1px solid #99f6e4',
                          }}
                          title={label('Thử nghiệm trực tiếp phiên nhập vai', 'Test roleplay session live')}
                        >
                          <Play size={13} strokeWidth={2.2} />
                          <span>{label('Thử', 'Try')}</span>
                        </Link>

                        <button
                          type="button"
                          className="button secondary"
                          style={{
                            ...actionBtnBase,
                            width: '32px',
                            minWidth: '32px',
                            padding: 0,
                            color: '#dc2626',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                          }}
                          title={label('Xóa kịch bản', 'Delete scenario')}
                          onClick={() => handleDelete(sc.id, sc.title)}
                        >
                          <Trash2 size={14} strokeWidth={2.1} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && filteredScenarios.length > 0 && (
          <AdminPagination
            currentPage={safePage}
            pageSize={pageSize}
            totalItems={filteredScenarios.length}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

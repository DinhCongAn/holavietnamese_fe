import { BilingualText, bilingualLabel, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Check, Eye, Loader2, Pencil, Power, RotateCcw, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

export function AdminCultureListPage() {
  const { confirm, confirmationDialog } = useConfirmDialog();
  const { isAdmin, isContentManager } = useAuth();
  const cultureBasePath = isAdmin ? '/admin/culture' : '/content/culture';
  const categoriesBasePath = isAdmin ? '/admin/culture-categories' : '/content/culture-categories';
  const label = useBilingualLabel();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories
  useEffect(() => {
    let mounted = true;
    adminCultureAiService.getCategories().then((res) => {
      if (mounted && Array.isArray(res)) setCategories(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const loadArticles = () => {
    setIsLoading(true);
    adminCultureAiService
      .getArticles({
        search,
        category: categoryFilter,
        status: statusFilter,
      })
      .then((res) => {
        setArticles(Array.isArray(res) ? res : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching articles:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    setCurrentPage(1);
    loadArticles();
  }, [search, categoryFilter, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminCultureAiService.updateArticleStatus(id, newStatus);
      let successMsg = `Đã cập nhật trạng thái bài viết sang: ${newStatus}`;
      if (newStatus === 'PUBLISHED') {
        successMsg = 'Đã phê duyệt và xuất bản bài viết thành công!';
      } else if (newStatus === 'IN_REVIEW') {
        successMsg = 'Đã gửi bài viết cho Admin phê duyệt!';
      } else if (newStatus === 'DRAFT') {
        successMsg = isAdmin
          ? 'Đã chuyển bài viết về bản nháp / từ chối duyệt.'
          : 'Đã rút lại yêu cầu, chuyển bài viết về bản nháp.';
      }
      toast.success(bilingualLabel(successMsg));
      loadArticles();
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi cập nhật trạng thái.'));
    }
  };

  const handleDelete = async (id, title) => {
    const accepted = await confirm({
      title: bilingualLabel('Xóa bài viết văn hóa?', 'Delete cultural article?'),
      description: bilingualLabel(
        `Bài viết “${title}” sẽ bị xóa và không thể khôi phục.`,
        `Article “${title}” will be deleted and cannot be recovered.`
      ),
      confirmLabel: bilingualLabel('Xóa bài viết', 'Delete article'),
    });
    if (!accepted) return;

    try {
      await adminCultureAiService.deleteArticle(id);
      toast.success(bilingualLabel('Đã xóa bài viết thành công.', 'Article deleted successfully.'));
      loadArticles();
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi khi xóa bài viết.'));
    }
  };

  const getStatusBadge = (status) => {
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
      case 'PUBLISHED':
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
            <span>{label('Đã xuất bản', 'Published')}</span>
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
            <span>{label('Chờ duyệt', 'In Review')}</span>
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
            <span>{label('Đã lưu trữ', 'Archived')}</span>
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

  return (
    <div className="admin-content">
      {confirmationDialog}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <BilingualText
              vi={isAdmin ? "VĂN HÓA & NỘI DUNG • KIỂM DUYỆT" : "VĂN HÓA & NỘI DUNG • BIÊN TẬP"}
              en={isAdmin ? "CULTURE & CONTENT • ADMIN APPROVAL" : "CULTURE & CONTENT • AUTHORING"}
            />
          </span>
          <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}>
            <BilingualText
              vi={isAdmin ? "Kiểm duyệt & Quản lý bài viết văn hóa" : "Quản lý bài viết văn hóa"}
              en={isAdmin ? "Review & manage culture articles" : "Manage culture articles"}
            />
          </h1>
          <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}>
            <BilingualText
              vi={isAdmin
                ? "Kiểm duyệt các bài viết văn hóa từ Content Manager, phê duyệt xuất bản hoặc yêu cầu chỉnh sửa."
                : "Soạn thảo bài viết, biên tập nội dung văn hóa và gửi Admin kiểm duyệt để xuất bản cho học viên."}
              en={isAdmin
                ? "Review culture articles from Content Managers, approve publication, or request revisions."
                : "Author articles, edit culture content, and submit for Admin approval to publish."}
            />
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            to={categoriesBasePath}
            className="button secondary"
            style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px' }}
          >
            <span>{label('Quản lý danh mục', 'Manage categories')}</span>
          </Link>
          <Link
            to={`${cultureBasePath}/new`}
            className="button"
            style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px' }}
          >
            <span>{label('+ Thêm bài viết mới', '+ Add new article')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={label('Tìm theo tiêu đề bài viết hoặc tác giả...', 'Search by title or author...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">{label('Tất cả danh mục', 'All categories')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug || c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">{label('Tất cả trạng thái', 'All statuses')}</option>
            <option value="PUBLISHED">{label('Đã xuất bản', 'Published')}</option>
            <option value="IN_REVIEW">{label('Chờ duyệt', 'In Review')}</option>
            <option value="DRAFT">{label('Bản nháp', 'Draft')}</option>
            <option value="ARCHIVED">{label('Đã lưu trữ', 'Archived')}</option>
          </select>

          {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              className="button secondary"
              style={{ fontSize: '12px', minHeight: '40px', height: '40px', padding: '0 14px', whiteSpace: 'nowrap' }}
              onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); setCurrentPage(1); }}
            >
              <span>{label('Đặt lại', 'Reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Articles Table */}
      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: '1060px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '34%', paddingLeft: '20px' }}>
                {label('Bài viết & Tác giả', 'Article & Author')}
              </th>
              <th style={{ ...thStyle, width: '16%' }}>
                {label('Danh mục', 'Category')}
              </th>
              <th style={{ ...thStyle, width: '14%' }}>
                {label('Vùng miền / Điểm đến', 'Region / Location')}
              </th>
              <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>
                {label('Lượt xem', 'Views')}
              </th>
              <th style={{ ...thStyle, width: '10%', textAlign: 'center' }}>
                {label('Trạng thái', 'Status')}
              </th>
              <th style={{ ...thStyle, width: '16%', minWidth: '220px', textAlign: 'right', paddingRight: '20px' }}>
                {label('Thao tác', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-red-hover)' }}>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{label('Đang tải danh sách bài viết...', 'Loading culture articles...')}</span>
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  {label('Không tìm thấy bài viết văn hóa nào phù hợp với bộ lọc.', 'No matching culture articles found.')}
                </td>
              </tr>
            ) : (
              (() => {
                const totalPages = Math.max(1, Math.ceil(articles.length / pageSize));
                const safePage = Math.min(currentPage, totalPages);
                const pagedArticles = articles.slice((safePage - 1) * pageSize, safePage * pageSize);

                return pagedArticles.map(article => {
                  const viewsCount = article.views || 0;
                  return (
                    <tr key={article.id}>
                    <td style={{ ...tdStyle, paddingLeft: '20px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <ContentImage
                          src={article.coverImage}
                          alt={article.title}
                          style={{ width: '56px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', color: 'var(--color-ink)', fontSize: '14px', lineHeight: 1.35, marginBottom: '2px' }}>
                            <BilingualText vi={article.titleVi || article.title} en={article.title} />
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--color-forest)', display: 'block' }}>
                            {label('Bởi:', 'By:')} <strong>{article.author}</strong> • {label('Ngày:', 'Date:')} {article.publishedDate || article.publishedAt}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--color-ink)',
                          background: '#fff7ed',
                          padding: '4px 9px',
                          borderRadius: '6px',
                          border: '1px solid #ffedd5',
                        }}
                      >
                        {article.categoryNameVi || article.categoryName}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500 }}>
                        📍 {article.destinationName || article.destination || article.region}
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
                          background: viewsCount > 0 ? '#eff6ff' : '#f1f5f9',
                          color: viewsCount > 0 ? '#1d4ed8' : '#475569',
                          border: viewsCount > 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                          fontSize: '12px',
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        <span>{viewsCount.toLocaleString()}</span>
                        <span>{label('lượt', viewsCount === 1 ? 'view' : 'views')}</span>
                      </span>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {getStatusBadge(article.status)}
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                        {isAdmin ? (
                          article.status !== 'PUBLISHED' ? (
                            <>
                              <button
                                type="button"
                                className="button secondary"
                                style={{
                                  ...actionBtnBase,
                                  color: '#15803d',
                                  background: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                }}
                                title={label('Duyệt & Xuất bản bài viết', 'Approve & publish article')}
                                onClick={() => handleStatusChange(article.id, 'PUBLISHED')}
                              >
                                <Check size={13} strokeWidth={2.4} />
                                <span>{label('Duyệt', 'Approve')}</span>
                              </button>
                              {article.status === 'IN_REVIEW' && (
                                <button
                                  type="button"
                                  className="button secondary"
                                  style={{
                                    ...actionBtnBase,
                                    color: '#b45309',
                                    background: '#fffbeb',
                                    border: '1px solid #fde68a',
                                  }}
                                  title={label('Từ chối duyệt, trả về bản nháp', 'Reject to draft')}
                                  onClick={() => handleStatusChange(article.id, 'DRAFT')}
                                >
                                  <RotateCcw size={13} strokeWidth={2.2} />
                                  <span>{label('Từ chối', 'Reject')}</span>
                                </button>
                              )}
                            </>
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
                              title={label('Gỡ bài về bản nháp', 'Revert to draft')}
                              onClick={() => handleStatusChange(article.id, 'DRAFT')}
                            >
                              <Power size={13} strokeWidth={2.2} />
                              <span>{label('Gỡ bài', 'Revert')}</span>
                            </button>
                          )
                        ) : (
                          // Content Manager actions
                          article.status === 'DRAFT' ? (
                            <button
                              type="button"
                              className="button secondary"
                              style={{
                                ...actionBtnBase,
                                color: '#1d4ed8',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                              }}
                              title={label('Gửi bài viết cho Admin duyệt', 'Submit for admin review')}
                              onClick={() => handleStatusChange(article.id, 'IN_REVIEW')}
                            >
                              <Send size={13} strokeWidth={2.2} />
                              <span>{label('Gửi duyệt', 'Submit')}</span>
                            </button>
                          ) : article.status === 'IN_REVIEW' ? (
                            <button
                              type="button"
                              className="button secondary"
                              style={{
                                ...actionBtnBase,
                                color: '#64748b',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                              }}
                              title={label('Rút lại yêu cầu duyệt', 'Withdraw review request')}
                              onClick={() => handleStatusChange(article.id, 'DRAFT')}
                            >
                              <RotateCcw size={13} strokeWidth={2.2} />
                              <span>{label('Rút lại', 'Withdraw')}</span>
                            </button>
                          ) : null
                        )}

                        <Link
                          to={`${cultureBasePath}/${article.id}`}
                          className="button secondary"
                          style={{
                            ...actionBtnBase,
                            color: '#334155',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                          }}
                          title={label('Chỉnh sửa bài viết', 'Edit article')}
                        >
                          <Pencil size={13} strokeWidth={2.1} />
                          <span>{label('Sửa', 'Edit')}</span>
                        </Link>

                        <Link
                          to={`/culture/${article.id}`}
                          target="_blank"
                          className="button secondary"
                          style={{
                            ...actionBtnBase,
                            color: '#0f766e',
                            background: '#f0fdfa',
                            border: '1px solid #99f6e4',
                          }}
                          title={label('Xem trực tiếp trên giao diện học viên', 'View live as learner')}
                        >
                          <Eye size={13} strokeWidth={2.2} />
                          <span>{label('Xem', 'View')}</span>
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
                          title={label('Xóa bài viết', 'Delete article')}
                          onClick={() => handleDelete(article.id, article.title)}
                        >
                          <Trash2 size={14} strokeWidth={2.1} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              });
            })()
          )}
        </tbody>
      </table>

      {!isLoading && articles.length > 0 && (
        <AdminPagination
          currentPage={Math.min(currentPage, Math.max(1, Math.ceil(articles.length / pageSize)))}
          pageSize={pageSize}
          totalItems={articles.length}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
    </div>
  );
}

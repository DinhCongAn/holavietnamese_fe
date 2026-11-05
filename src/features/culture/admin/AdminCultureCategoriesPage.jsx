import { BilingualText, bilingualLabel, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { Modal } from '@/shared/components/common/Modal';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ChevronDown, ChevronUp, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

export function AdminCultureCategoriesPage() {
  const { confirm, confirmationDialog } = useConfirmDialog();
  const { isAdmin } = useAuth();
  const cultureBasePath = isAdmin ? '/admin/culture' : '/content/culture';
  const label = useBilingualLabel();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadCategories = () => {
    setIsLoading(true);
    Promise.all([
      adminCultureAiService.getCategories(),
      adminCultureAiService.getArticles().catch(() => []),
    ])
      .then(([catsRes, articlesRes]) => {
        const catList = Array.isArray(catsRes) ? catsRes : [];
        const articleList = Array.isArray(articlesRes) ? articlesRes : [];

        const computed = catList.map((cat) => {
          const catId = String(cat.id || '').trim().toLowerCase();
          const catSlug = String(cat.slug || '').trim().toLowerCase();
          const catName = String(cat.name || '').trim().toLowerCase();
          const catNameVi = String(cat.nameVi || '').trim().toLowerCase();
          const catNameEn = String(cat.nameEn || '').trim().toLowerCase();

          const matchedArticles = articleList.filter((a) => {
            const aCat = String(a.category || a.categoryId || '').trim().toLowerCase();
            const aCatName = String(a.categoryName || a.categoryNameVi || a.categoryNameEn || '').trim().toLowerCase();

            return (
              (aCat && (aCat === catId || aCat === catSlug)) ||
              (aCatName && (
                aCatName === catName ||
                aCatName === catNameVi ||
                aCatName === catNameEn ||
                aCatName === catId ||
                aCatName === catSlug ||
                (catName && aCatName.includes(catName)) ||
                (catNameVi && aCatName.includes(catNameVi)) ||
                (catNameEn && aCatName.includes(catNameEn))
              ))
            );
          });

          const count = matchedArticles.length > 0
            ? Math.max(typeof cat.articleCount === 'number' ? cat.articleCount : 0, matchedArticles.length)
            : (typeof cat.articleCount === 'number' ? cat.articleCount : 0);

          return {
            ...cat,
            articleCount: count,
          };
        });

        setCategories(computed);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Error loading categories:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const list = [...categories];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((item, idx) => ({ ...item, displayOrder: idx + 1, order: idx + 1 }));
    setCategories(reordered);
    try {
      await adminCultureAiService.reorderCategories(reordered);
      toast.success(bilingualLabel('Đã cập nhật thứ tự danh mục!', 'Category order updated!'));
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi sắp xếp danh mục.'));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingCategory.name?.trim()) return;

    try {
      await adminCultureAiService.saveCategory(editingCategory);
      setEditingCategory(null);
      toast.success(bilingualLabel('Đã lưu thông tin danh mục thành công!', 'Category saved successfully!'));
      loadCategories();
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi lưu danh mục.'));
    }
  };

  const handleDelete = async (id, name) => {
    const accepted = await confirm({
      title: bilingualLabel('Xóa danh mục văn hóa?', 'Delete cultural category?'),
      description: bilingualLabel(
        `Danh mục “${name}” sẽ bị xóa khỏi hệ thống.`,
        `Category “${name}” will be removed from the system.`
      ),
      confirmLabel: bilingualLabel('Xóa danh mục', 'Delete category'),
    });
    if (!accepted) return;

    try {
      await adminCultureAiService.deleteCategory(id);
      toast.success(bilingualLabel('Đã xóa danh mục.', 'Category deleted.'));
      loadCategories();
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi khi xóa danh mục.'));
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
          <nav style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)', marginBottom: '6px' }}>
            <Link to={cultureBasePath} style={{ color: 'var(--color-red-hover)', textDecoration: 'none', fontWeight: 600 }}>
              ← {label('Quản lý bài viết văn hóa', 'Manage culture articles')}
            </Link>
          </nav>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <BilingualText vi="DANH MỤC & CHỦ ĐỀ VĂN HÓA" en="CULTURE TOPICS & CATEGORIES" />
          </span>
          <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}>
            <BilingualText vi="Danh mục văn hóa" en="Culture categories" />
          </h1>
          <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}>
            <BilingualText
              vi="Quản lý các chủ đề lớn và sắp xếp thứ tự hiển thị cho học viên trên thư viện văn hóa."
              en="Manage major topics and arrange display order for learners on the culture library."
            />
          </p>
        </div>

        <button
          type="button"
          className="button"
          onClick={() => setEditingCategory({ id: '', name: '', slug: '', icon: '', description: '', order: categories.length + 1 })}
          style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px', cursor: 'pointer' }}
        >
          <span>{label('+ Thêm danh mục mới', '+ Add new category')}</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: '960px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '110px', textAlign: 'center', paddingLeft: '20px' }}>
                {label('Thứ tự', 'Order')}
              </th>
              <th style={{ ...thStyle, width: '32%' }}>
                {label('Tên danh mục & Slug', 'Category & Slug')}
              </th>
              <th style={{ ...thStyle, width: '38%' }}>
                {label('Mô tả chuyên mục', 'Description')}
              </th>
              <th style={{ ...thStyle, width: '12%', textAlign: 'center' }}>
                {label('Số bài viết', 'Articles')}
              </th>
              <th style={{ ...thStyle, width: '15%', minWidth: '130px', textAlign: 'right', paddingRight: '20px' }}>
                {label('Thao tác', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-red-hover)' }}>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{label('Đang tải danh mục...', 'Loading categories...')}</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                  {label('Chưa có danh mục nào.', 'No categories found.')}
                </td>
              </tr>
            ) : (
              (() => {
                const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
                const safePage = Math.min(currentPage, totalPages);
                const pagedCategories = categories.slice((safePage - 1) * pageSize, safePage * pageSize);

                return pagedCategories.map((cat, idx) => {
                  const globalIndex = (safePage - 1) * pageSize + idx;
                  return (
                    <tr key={cat.id}>
                      <td style={{ ...tdStyle, textAlign: 'center', paddingLeft: '20px', whiteSpace: 'nowrap' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            height: '28px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '2px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                        >
                          <button
                            type="button"
                            className="secondary"
                            disabled={globalIndex === 0}
                            onClick={() => handleMove(globalIndex, -1)}
                            style={{
                              width: '22px',
                              minWidth: '22px',
                              maxWidth: '22px',
                              height: '22px',
                              minHeight: '22px',
                              maxHeight: '22px',
                              padding: 0,
                              margin: 0,
                              borderRadius: '5px',
                              border: 'none',
                              background: globalIndex === 0 ? 'transparent' : '#ffffff',
                              color: globalIndex === 0 ? '#cbd5e1' : '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: globalIndex === 0 ? 'not-allowed' : 'pointer',
                              boxShadow: globalIndex === 0 ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                              transition: 'all 0.15s ease',
                            }}
                            title={label('Chuyển lên trên', 'Move up')}
                          >
                            <ChevronUp size={13} strokeWidth={2.4} />
                          </button>

                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 800,
                              color: '#ea580c',
                              padding: '0 5px',
                              minWidth: '24px',
                              textAlign: 'center',
                              userSelect: 'none',
                              lineHeight: 1,
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            #{cat.displayOrder || cat.order || globalIndex + 1}
                          </span>

                          <button
                            type="button"
                            className="secondary"
                            disabled={globalIndex === categories.length - 1}
                            onClick={() => handleMove(globalIndex, 1)}
                            style={{
                              width: '22px',
                              minWidth: '22px',
                              maxWidth: '22px',
                              height: '22px',
                              minHeight: '22px',
                              maxHeight: '22px',
                              padding: 0,
                              margin: 0,
                              borderRadius: '5px',
                              border: 'none',
                              background: globalIndex === categories.length - 1 ? 'transparent' : '#ffffff',
                              color: globalIndex === categories.length - 1 ? '#cbd5e1' : '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: globalIndex === categories.length - 1 ? 'not-allowed' : 'pointer',
                              boxShadow: globalIndex === categories.length - 1 ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
                              transition: 'all 0.15s ease',
                            }}
                            title={label('Chuyển xuống dưới', 'Move down')}
                          >
                            <ChevronDown size={13} strokeWidth={2.4} />
                          </button>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <strong style={{ fontSize: '14px', color: 'var(--color-ink)', display: 'block', marginBottom: '2px', lineHeight: 1.35 }}>
                          {cat.name}
                        </strong>
                        <code style={{ fontSize: '11px', color: '#ea580c', background: '#fff7ed', padding: '2px 7px', borderRadius: '5px', fontWeight: 600, border: '1px solid #fed7aa' }}>
                          /{cat.slug}
                        </code>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ fontSize: '13px', color: 'var(--color-forest)', lineHeight: 1.4, display: 'block' }}>
                          <BilingualText vi={cat.descriptionVi || cat.description} en={cat.description} />
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
                            background: (cat.articleCount || 0) > 0 ? '#eff6ff' : '#f1f5f9',
                            color: (cat.articleCount || 0) > 0 ? '#1d4ed8' : '#475569',
                            border: (cat.articleCount || 0) > 0 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            fontSize: '12px',
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          <span>{cat.articleCount || 0}</span>
                          <span>{label('bài', 'articles')}</span>
                        </span>
                      </td>

                      <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap' }}>
                          <button
                            type="button"
                            className="button secondary"
                            style={{
                              ...actionBtnBase,
                              color: '#334155',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                            }}
                            title={label('Chỉnh sửa danh mục', 'Edit category')}
                            onClick={() => setEditingCategory(cat)}
                          >
                            <Pencil size={13} strokeWidth={2.1} />
                            <span>{label('Sửa', 'Edit')}</span>
                          </button>

                          {categories.length > 1 && (
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
                              title={label('Xóa danh mục', 'Delete category')}
                              onClick={() => handleDelete(cat.id, cat.name)}
                            >
                              <Trash2 size={14} strokeWidth={2.1} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()
            )}
          </tbody>
        </table>

        {!isLoading && categories.length > 0 && (
          <AdminPagination
            currentPage={Math.min(currentPage, Math.max(1, Math.ceil(categories.length / pageSize)))}
            pageSize={pageSize}
            totalItems={categories.length}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingCategory && (
        <Modal
          title={editingCategory.id ? label('Chỉnh sửa danh mục', 'Edit Category') : label('Thêm danh mục văn hóa', 'Add Cultural Category')}
          onClose={() => setEditingCategory(null)}
        >
          <form onSubmit={handleSave}>
            <label style={{ display: 'block' }}>
              <BilingualText vi="Tên danh mục:" en="Category Name:" />
              <input
                type="text"
                value={editingCategory.name}
                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                placeholder={label('Ẩm thực & Quán xá...', 'Food & Cuisine...')}
                required
              />
            </label>

            <label style={{ marginTop: '14px', display: 'block' }}>
              <BilingualText vi="Slug (Đường dẫn):" en="Slug (URL path):" />
              <input
                type="text"
                value={editingCategory.slug}
                onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="culinary, festivals, etiquette..."
                required
              />
            </label>

            <label style={{ marginTop: '14px', display: 'block' }}>
              <BilingualText vi="Mô tả chuyên mục:" en="Category Description:" />
              <textarea
                rows={3}
                value={editingCategory.description || ''}
                onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                placeholder={label('Mô tả nội dung học viên sẽ khám phá trong danh mục này...', 'Brief overview of this cultural topic...')}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setEditingCategory(null)}
                style={{ fontSize: '13px', minHeight: '38px', height: '38px', padding: '0 16px' }}
              >
                <span>{label('Hủy', 'Cancel')}</span>
              </button>
              <button
                type="submit"
                className="button"
                style={{ fontSize: '13px', minHeight: '38px', height: '38px', padding: '0 16px' }}
              >
                <span>{label('Lưu danh mục', 'Save Category')}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

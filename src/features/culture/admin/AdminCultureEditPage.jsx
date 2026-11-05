import { BilingualText, vietnameseLabel, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { toast } from 'sonner';

export function AdminCultureEditPage() {
  useTextLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    category: 'culinary',
    categoryName: 'Food (Ẩm thực)',
    region: 'Toàn quốc',
    destination: 'Hà Nội',
    author: 'Biên tập viên Hola',
    authorRole: 'Chuyên gia văn hóa ẩm thực',
    readTime: '5 phút đọc',
    status: 'PUBLISHED',
    coverImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    summary: '',
    content: '',
    usefulPhrases: [
      { word: '', pronunciation: '', meaning: '', context: '' },
    ],
  });

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    adminCultureAiService.getCategories().then((res) => {
      if (mounted && Array.isArray(res)) setCategories(res);
    });

    if (!isNew) {
      adminCultureAiService.getArticle(id).then((existing) => {
        if (!mounted || !existing) return;
        setFormData({
          ...existing,
          category: existing.category || existing.categoryId || 'culinary',
          usefulPhrases: existing.usefulPhrases || [],
        });
      });
    }

    return () => {
      mounted = false;
    };
  }, [id, isNew]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCategoryChange = (catId) => {
    const selected = categories.find(c => c.id === catId || c.slug === catId || (c.slug || c.id) === catId);
    setFormData(prev => ({
      ...prev,
      category: selected?.id || catId,
      categoryName: selected?.name || 'Khác',
    }));
  };

  const handlePhraseChange = (index, field, value) => {
    const list = [...formData.usefulPhrases];
    list[index][field] = value;
    setFormData(prev => ({ ...prev, usefulPhrases: list }));
  };

  const handleAddPhrase = () => {
    setFormData(prev => ({
      ...prev,
      usefulPhrases: [
        ...prev.usefulPhrases,
        { word: '', pronunciation: '', meaning: '', context: '' },
      ],
    }));
  };

  const handleRemovePhrase = (index) => {
    setFormData(prev => ({
      ...prev,
      usefulPhrases: prev.usefulPhrases.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.title?.trim()) {
      toast.error(bilingualLabel('Vui lòng nhập tiêu đề bài viết.', 'Please enter an article title.'));
      return;
    }

    const payload = {
      ...formData,
      id: isNew ? undefined : formData.id,
      usefulPhrases: formData.usefulPhrases.filter(p => p.word?.trim()),
    };

    setIsSubmitting(true);
    try {
      await adminCultureAiService.saveArticle(payload);
      showToast(bilingualLabel('Đã lưu bài viết văn hóa thành công!', 'Cultural article saved successfully!'));
      toast.success(bilingualLabel('Lưu bài viết thành công!', 'Article saved successfully!'));
      setTimeout(() => {
        navigate('/admin/culture');
      }, 700);
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi khi lưu bài viết.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-content">
      {toastMessage && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: 'var(--color-ink)', color: 'var(--color-surface)', padding: '12px 20px', borderRadius: '10px', zIndex: 9999, fontWeight: 700 }}>
          <BilingualText>{toastMessage}</BilingualText>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <nav style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)', marginBottom: '6px' }}>
            <Link to="/admin/culture" style={{ color: 'var(--primary-orange, #F97316)', textDecoration: 'none', fontWeight: 600 }}><BilingualText>{"← Quay lại danh sách bài viết"}</BilingualText></Link>
          </nav>
          <h1 style={{ margin: 0, fontSize: '30px' }}>
            <BilingualText>{isNew ? 'Soạn thảo bài viết văn hóa mới' : `Biên tập: ${formData.title}`}</BilingualText>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className={`button ${activeTab === 'editor' ? '' : 'secondary'}`}
            onClick={() => setActiveTab('editor')}
            style={{ fontSize: '13px' }}
          ><BilingualText>{"Trình biên tập"}</BilingualText></button>
          <button
            type="button"
            className={`button ${activeTab === 'preview' ? '' : 'secondary'}`}
            onClick={() => setActiveTab('preview')}
            style={{ fontSize: '13px' }}
          ><BilingualText>{"Xem trước"}</BilingualText></button>
          <button
            type="button"
            className="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            style={{ background: 'var(--color-ink)', borderColor: 'var(--color-ink)', fontSize: '13px', cursor: 'pointer' }}
          >
            <BilingualText>{isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}</BilingualText>
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Title, Content, Phrases */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-card">
                <label><BilingualText>{"Tiêu đề bài viết:"}</BilingualText><input
                    type="text"
                    required
                    value={formData.title ?? ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder={vietnameseLabel("Ví dụ: Văn hóa cà phê Việt Nam: Từ Cà phê phin đến Cà phê trứng...")}
                  />
                </label>

                <label style={{ marginTop: '14px' }}><BilingualText>{"Tiêu đề phụ / Mô tả ngắn:"}</BilingualText><input
                    type="text"
                    value={formData.subtitle ?? ''}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder={vietnameseLabel("Mô tả tóm lược nét hấp dẫn của bài viết...")}
                  />
                </label>

                <label style={{ marginTop: '14px' }}><BilingualText>{"Tóm tắt mở đầu:"}</BilingualText><textarea
                    rows={3}
                    value={formData.summary ?? ''}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    placeholder={vietnameseLabel("Đoạn văn ngắn làm nổi bật ý nghĩa văn hóa...")}
                  />
                </label>
              </div>

              {/* Markdown Content */}
              <div className="admin-card">
                <label><BilingualText>{"Nội dung chi tiết bài viết (Hỗ trợ Markdown):"}</BilingualText><textarea
                    rows={16}
                    required
                    value={formData.content ?? ''}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder={vietnameseLabel("Soạn nội dung bài viết với các đề mục ###, đoạn văn, và hình ảnh...")}
                    style={{ fontFamily: 'monospace', fontSize: '13.5px', lineHeight: 1.6 }}
                  />
                </label>
              </div>

              {/* Useful phrases builder */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Từ vựng & Cụm từ liên quan"}</BilingualText></h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}><BilingualText>{"Học viên có thể nghe phát âm và lưu trực tiếp vào Sổ từ vựng khi đọc bài viết này."}</BilingualText></p>
                  </div>
                  <button type="button" className="button secondary" onClick={handleAddPhrase} style={{ fontSize: '12px', padding: '6px 12px' }}><BilingualText>{"+ Thêm từ"}</BilingualText></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.usefulPhrases.map((phrase, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr auto', gap: '10px', alignItems: 'center', background: 'var(--color-cream)', padding: '10px', borderRadius: '10px' }}>
                      <input
                        type="text"
                        placeholder={vietnameseLabel("Từ tiếng Việt (vd: Cà phê phin)")}
                        value={phrase.word ?? ''}
                        onChange={e => handlePhraseChange(idx, 'word', e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                      <input
                        type="text"
                        placeholder={vietnameseLabel("Phiên âm (vd: kà-phê-phin)")}
                        value={phrase.pronunciation ?? ''}
                        onChange={e => handlePhraseChange(idx, 'pronunciation', e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                      <input
                        type="text"
                        placeholder={vietnameseLabel("Nghĩa tiếng Anh / Diễn giải")}
                        value={phrase.meaning ?? ''}
                        onChange={e => handlePhraseChange(idx, 'meaning', e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhrase(idx)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--color-red)', cursor: 'pointer', fontSize: '16px' }}
                        title={bilingualLabel("Xóa cụm từ này", "Delete this phrase")}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Settings & Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="admin-card">
                <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Phân loại & Trạng thái"}</BilingualText></h3>

                <label><BilingualText>{"Trạng thái xuất bản:"}</BilingualText><select
                    value={formData.status ?? ''}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="PUBLISHED">{vietnameseLabel("Đã xuất bản")}</option>
                    <option value="IN_REVIEW">{vietnameseLabel("Chờ duyệt")}</option>
                    <option value="DRAFT">{vietnameseLabel("Bản nháp")}</option>
                    <option value="ARCHIVED">{vietnameseLabel("Lưu trữ")}</option>
                  </select>
                </label>

                <label style={{ marginTop: '12px' }}><BilingualText>{"Danh mục văn hóa:"}</BilingualText><select
                    value={formData.category ?? ''}
                    onChange={e => handleCategoryChange(e.target.value)}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug || c.id}>
                        {c.icon || '🏮'} {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ marginTop: '12px' }}><BilingualText>{"Vùng miền:"}</BilingualText><select
                    value={formData.region ?? ''}
                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                  >
                    <option value="Toàn quốc">{vietnameseLabel("Toàn quốc")}</option>
                    <option value="Miền Bắc">{vietnameseLabel("Miền Bắc")}</option>
                    <option value="Miền Trung">{vietnameseLabel("Miền Trung")}</option>
                    <option value="Miền Nam">{vietnameseLabel("Miền Nam")}</option>
                  </select>
                </label>

                <label style={{ marginTop: '12px' }}><BilingualText>{"Điểm đến cụ thể:"}</BilingualText><input
                    type="text"
                    value={formData.destination ?? ''}
                    onChange={e => setFormData({ ...formData, destination: e.target.value })}
                    placeholder={vietnameseLabel("Ví dụ: Hà Nội, Hội An, Huế...")}
                  />
                </label>
              </div>

              <div className="admin-card">
                <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Ảnh bìa bài viết"}</BilingualText></h3>

                <label><BilingualText>{"URL hình ảnh:"}</BilingualText><input
                    type="text"
                    value={formData.coverImage ?? ''}
                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                </label>

                {formData.coverImage && (
                  <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', height: '160px', border: '1px solid var(--color-border)' }}>
                    <ContentImage
                      src={formData.coverImage}
                      alt={formData.title || bilingualLabel('Ảnh bìa bài viết', 'Article cover image')}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <div className="admin-card">
                <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Thông tin tác giả"}</BilingualText></h3>

                <label><BilingualText>{"Tên tác giả:"}</BilingualText><input
                    type="text"
                    value={formData.author ?? ''}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                  />
                </label>

                <label style={{ marginTop: '12px' }}><BilingualText>{"Chức danh tác giả:"}</BilingualText><input
                    type="text"
                    value={formData.authorRole ?? ''}
                    onChange={e => setFormData({ ...formData, authorRole: e.target.value })}
                  />
                </label>

                <label style={{ marginTop: '12px' }}><BilingualText>{"Thời lượng ước tính:"}</BilingualText><input
                    type="text"
                    value={formData.readTime ?? ''}
                    onChange={e => setFormData({ ...formData, readTime: e.target.value })}
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* Live Preview Mode */
        <div className="admin-card" style={{ padding: '36px', background: 'var(--color-surface)' }}>
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '18px', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', textTransform: 'uppercase' }}><BilingualText>{"PREVIEW TRÊN GIAO DIỆN HỌC VIÊN"}</BilingualText></span>
            <h1 style={{ fontSize: '32px', margin: '8px 0', color: 'var(--color-ink)' }}><BilingualText>{formData.title || 'Chưa có tiêu đề'}</BilingualText></h1>
            <p style={{ fontSize: '16px', color: 'var(--color-red-hover)' }}>{formData.subtitle}</p>
            <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}><BilingualText>{"Tác giả:"}</BilingualText><strong>{formData.author}</strong><BilingualText>{"• Điểm đến: "}</BilingualText>{formData.destination}
            </div>
          </div>

          {formData.coverImage && (
            <div style={{ borderRadius: '16px', overflow: 'hidden', height: '320px', marginBottom: '28px' }}>
              <ContentImage src={formData.coverImage} alt={formData.title || bilingualLabel('Ảnh bìa bài viết', 'Article cover image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ whiteSpace: 'pre-line', fontSize: '16px', lineHeight: 1.8, color: 'var(--color-ink)' }}>
            <BilingualText>{formData.content || '(Nội dung bài viết chưa được nhập)'}</BilingualText>
          </div>

          {formData.usefulPhrases?.length > 0 && (
            <div style={{ marginTop: '36px', padding: '24px', background: 'var(--color-cream)', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 14px 0', color: 'var(--color-red-hover)' }}><BilingualText>{"Cụm từ hữu ích kèm theo bài viết:"}</BilingualText></h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {formData.usefulPhrases.filter(p => p.word).map((p, idx) => (
                  <div key={idx} style={{ background: 'var(--color-surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <strong style={{ color: 'var(--color-red-hover)' }}>{p.word}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-forest)' }}>{p.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

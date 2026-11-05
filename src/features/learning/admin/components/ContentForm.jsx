import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { Notice } from '@/shared/components/common/Ui';
import { contentService } from '@/features/learning/api/contentService';

const definitions = {
  courses: [ ['code','Mã khóa học'], ['slug','Đường dẫn (slug)'], ['title','Tên khóa học'], ['titleVi','Tên tiếng Việt',false], ['description','Mô tả','textarea'], ['descriptionVi','Mô tả tiếng Việt','textarea',false], ['level','Trình độ',['A0','A1','A2','B1','B2','C1']], ['estimatedMinutes','Thời lượng (phút)','number'], ['learningOutcomes','Mục tiêu học tập','textarea',false] ],
  lessons: [ ['code','Mã bài học'], ['slug','Đường dẫn (slug)'], ['title','Tên bài học'], ['titleVi','Tên tiếng Việt',false], ['description','Mô tả','textarea',false], ['lessonType','Loại bài',['NORMAL','VOCABULARY','GRAMMAR','CONVERSATION','CULTURE','REVIEW']], ['estimatedMinutes','Thời lượng (phút)','number'], ['descriptionVi','Mô tả tiếng Việt','textarea',false], ['learningObjective','Mục tiêu học tập','textarea',false], ['learningObjectiveVi','Mục tiêu tiếng Việt','textarea',false] ],
  quizzes: [ ['title','Tên quiz'], ['titleVi','Tên tiếng Việt',false], ['description','Mô tả','textarea',false], ['descriptionVi','Mô tả tiếng Việt','textarea',false], ['quizType','Loại quiz',['LESSON','COURSE','PLACEMENT','PRACTICE']], ['courseId','ID khóa học','number',false], ['lessonId','ID bài học','number',false], ['passingScore','Điểm đạt (%)','number'], ['timeLimitMinutes','Giới hạn (phút)','number',false], ['maxAttempts','Số lần tối đa','number',false] ],
  modules: [ ['title','Tên module'], ['titleVi','Tên tiếng Việt',false], ['description','Mô tả','textarea',false], ['descriptionVi','Mô tả tiếng Việt','textarea',false] ],
};
const defaults = { courses:{level:'A1',estimatedMinutes:0,isFree:true}, lessons:{lessonType:'NORMAL',estimatedMinutes:10,prerequisiteIds:[]}, quizzes:{quizType:'PRACTICE',passingScore:70,timeLimitMinutes:null,maxAttempts:null,randomizeQuestions:false}, modules:{} };

function slugFromTitle(title) {
  return String(title || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
    .replace(/-+$/g, '');
}

export function ContentForm({ kind, initial = {}, fixedFields = [], onSave, onCancel, onBusyChange }) {
  useTextLanguage();
  const [form,setForm] = useState({ ...defaults[kind], ...initial, estimatedMinutes:initial.estimatedMinutes ?? initial.estimatedDuration ?? defaults[kind]?.estimatedMinutes });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initial.slug));
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial.thumbnailUrl || '');

  function updateField(key, value) {
    if (key === 'slug') setSlugManuallyEdited(Boolean(value));
    setForm(current => {
      const next = { ...current, [key]: value };
      if ((kind === 'courses' || kind === 'lessons') && (key === 'title' || key === 'titleVi') && !slugManuallyEdited) {
        next.slug = slugFromTitle(next.titleVi || next.title);
      }
      return next;
    });
  }

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(form.thumbnailUrl || '');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [coverFile, form.thumbnailUrl]);

  function chooseCover(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Ảnh bìa phải là file JPG, PNG hoặc WebP.');
      setCoverFile(null);
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh bìa không được vượt quá 5 MB.');
      setCoverFile(null);
      event.target.value = '';
      return;
    }
    setError('');
    setCoverFile(file);
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    try {
      const payload = Object.fromEntries(definitions[kind].map(([key,,type]) => [key, type === 'number' ? form[key] == null || form[key] === '' ? null : Number(form[key]) : form[key] || '']));
      if (kind === 'courses') {
        if (!coverFile && !form.thumbnailUrl) throw new Error('Vui lòng chọn ảnh bìa khóa học.');
        payload.isFree = !!form.isFree;
        payload.thumbnailUrl = coverFile ? await contentService.uploadCourseCover(coverFile) : form.thumbnailUrl;
      }
      if (kind === 'lessons') payload.prerequisiteIds = form.prerequisiteIds || [];
      if (kind === 'quizzes') payload.randomizeQuestions = !!form.randomizeQuestions;
      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Không thể lưu nội dung.');
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return <form onSubmit={submit}>
    <div className="form-grid">{definitions[kind].filter(([key]) => !fixedFields.includes(key)).map(([key,label,type,required=true]) => {
      const optional = type === false || required === false;
      return <label key={key} className={type === 'textarea' ? 'full-width' : ''}>
        <BilingualText>{label}</BilingualText>
        {Array.isArray(type) ? <select disabled={busy} value={form[key] || type[0]} onChange={event => updateField(key, event.target.value)}>{type.map(option => <option key={option} value={option}>{bilingualLabel(option)}</option>)}</select>
          : type === 'textarea' ? <textarea disabled={busy} required={!optional} rows={3} value={form[key] || ''} onChange={event => updateField(key, event.target.value)}/>
            : <input disabled={busy} required={!optional} type={typeof type === 'string' ? type : 'text'} min={key === 'maxAttempts' || key === 'timeLimitMinutes' ? 1 : 0} max={key === 'passingScore' ? 100 : undefined} pattern={key === 'slug' ? '[a-z0-9]+(?:-[a-z0-9]+)*' : undefined} value={form[key] ?? ''} onChange={event => updateField(key, event.target.value)}/>}
        {key === 'slug' && !initial.slug && <small><BilingualText vi="Tự tạo từ tên; bạn có thể sửa nếu muốn." en="Auto-generated from title; edit if needed." /></small>}
      </label>;
    })}</div>
    {kind === 'courses' && <>
      <label className="course-cover-upload"><BilingualText>Ảnh bìa khóa học</BilingualText>
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} required={!form.thumbnailUrl && !coverFile} onChange={chooseCover}/>
        <small><BilingualText vi="JPG, PNG hoặc WebP, tối đa 5 MB. Ảnh được tải lên Cloudinary khi lưu khóa học." en="JPG, PNG or WebP, max 5 MB. Uploaded to Cloudinary on save." /></small>
      </label>
      {coverPreview && <img className="course-cover-upload-preview" src={coverPreview} alt={bilingualLabel("Xem trước ảnh bìa khóa học", "Course cover preview")}/>}
      <label className="checkbox-row"><input type="checkbox" disabled={busy} checked={!!form.isFree} onChange={event => setForm({...form,isFree:event.target.checked})}/><BilingualText>Khóa học miễn phí</BilingualText></label>
    </>}
    {kind === 'quizzes' && <label className="checkbox-row"><input type="checkbox" disabled={busy} checked={!!form.randomizeQuestions} onChange={event => setForm({...form,randomizeQuestions:event.target.checked})}/><BilingualText>Xáo trộn câu hỏi</BilingualText></label>}
    {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
    <div className="form-actions actions"><button type="button" className="secondary" disabled={busy} onClick={onCancel}><BilingualText>Hủy</BilingualText></button><button disabled={busy}><BilingualText>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</BilingualText></button></div>
  </form>;
}

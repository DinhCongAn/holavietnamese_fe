import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, ChevronUp, Clock, Download, Eye, FileSpreadsheet, FileText, Globe, ImagePlus, Layers, Plus, Save, Send, ShieldCheck, Upload } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { contentService } from '@/features/learning/api/contentService';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { Notice } from '@/shared/components/common/Ui';
import { Modal } from '@/shared/components/common/Modal';
import { ContentForm } from '@/features/learning/admin/components/ContentForm';
import { CourseThumbnail } from '@/features/learning/components/course/CourseInfo';
import { LessonActivities } from '@/features/learning/components/learning/LessonActivities';
import { moveItem } from '@/features/learning/components/learning/answerUtils';
import { BilingualText, useBilingualLabel, bilingualLabel } from '@/shared/components/common/BilingualText';
import '@/features/learning/admin/components/course-studio.css';

const steps = [
  { id: 'info', title: 'Thông tin khóa học', description: 'Tên, mục tiêu và ảnh bìa', icon: FileText },
  { id: 'curriculum', title: 'Cấu trúc & bài học', description: 'Học phần, nội dung và quiz', icon: Layers },
  { id: 'preview', title: 'Xem trước', description: 'Trải nghiệm của học viên', icon: Eye },
  { id: 'publish', title: 'Kiểm tra & xuất bản', description: 'Hoàn thiện và gửi duyệt', icon: Send },
];
const stepGuidance = {
  info: { eyebrow: 'BƯỚC 1 / 4', title: 'Kiểm tra thông tin khóa học', description: 'Hoàn thiện tên, mô tả, mục tiêu, trình độ và ảnh bìa. Lưu thay đổi trước khi sang bước tiếp theo.' },
  curriculum: { eyebrow: 'BƯỚC 2 / 4', title: 'Hoàn thiện cấu trúc và nội dung', description: 'Kiểm tra thứ tự học phần, bài học, hoạt động, quiz bài học và quiz cuối khóa.' },
  preview: { eyebrow: 'BƯỚC 3 / 4', title: 'Xem lại như một học viên', description: 'Mở từng bài để kiểm tra cách nội dung, ảnh, âm thanh, video và quiz được hiển thị.' },
  publish: { eyebrow: 'BƯỚC 4 / 4', title: 'Kiểm tra và gửi duyệt', description: 'Xử lý các mục còn thiếu, kiểm tra lại lần cuối rồi gửi khóa học cho Admin.' },
};
const statusNames = { DRAFT: 'Bản nháp', REVIEW: 'Chờ kiểm duyệt', REJECTED: 'Cần chỉnh sửa', PUBLISHED: 'Đã xuất bản', ARCHIVED: 'Đã lưu trữ' };
const issueNames = {
  'Add at least one module.': 'Thêm ít nhất một học phần.',
  'Add at least one lesson.': 'Thêm ít nhất một bài học.',
  'Every module needs a lesson.': 'Mỗi học phần cần có bài học.',
  'Publish every lesson before submitting.': 'Xuất bản tất cả bài học.',
  'Every lesson needs a published required learning activity.': 'Mỗi bài cần một hoạt động học bắt buộc đã xuất bản.',
  'Every lesson needs a published quiz activity.': 'Mỗi bài cần một quiz đã xuất bản và gắn vào bài.',
  'Set a published final course quiz and attach it to a lesson.': 'Thêm quiz cuối khóa, xuất bản và gắn vào bài học.',
};
const slugify = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 190).replace(/-$/g, '');

export function AdminCourseCreatePage() {
  const { isContentManager, isAdmin } = useAuth();
  if (!isContentManager || isAdmin) return <Notice><BilingualText vi="Bạn cần tài khoản Content Manager để tạo khóa học." en="You need a Content Manager account to create courses." /> <Link to={isAdmin ? "/admin/courses" : "/content/courses"}><BilingualText vi="Về danh sách" en="Back to list" /></Link></Notice>;
  return <CourseStudio />;
}

export function CourseStudio({ course, reload = () => {} }) {
  const label = useBilingualLabel();
  const { isAdmin, isContentManager, user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const selectedStep = params.get('step');
  const step = steps.some(s => s.id === selectedStep) && course ? selectedStep : 'info';
  const canEdit = isContentManager && !isAdmin && (!course || ['DRAFT', 'REJECTED'].includes(course.status));
  const canReview = isAdmin && course?.status === 'REVIEW';
  const ownsCourse = Boolean(course && String(course.createdBy) === String(user?.userId ?? user?.id));
  const canRequestEdit = isContentManager && !isAdmin && ownsCourse && course?.status === 'PUBLISHED' && course?.editRequestStatus !== 'PENDING';
  const canReviewEditRequest = isAdmin && course?.status === 'PUBLISHED' && course?.editRequestStatus === 'PENDING';
  const [modal, setModal] = useState(null), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [editRequestReason, setEditRequestReason] = useState('');
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [importedCourseId, setImportedCourseId] = useState(null);
  const [infoEditorOpen, setInfoEditorOpen] = useState(true);
  const dirty = useRef(false);
  const modules = course?.modules || [];
  const lessons = modules.flatMap(m => m.lessons || []);
  const readiness = useAsyncResource(useCallback(signal => course ? contentService.courseReadiness(course.id, signal) : Promise.resolve(null), [course?.id, course?.updatedAt, course?.status]));
  const metadataIssues = course ? [!course.thumbnailUrl && 'Thêm ảnh bìa khóa học.', !course.learningOutcomes?.trim() && 'Bổ sung mục tiêu học tập.'].filter(Boolean) : [];
  const issues = [...metadataIssues, ...(readiness.data?.issues || [])];
  const ready = Boolean(course && readiness.data?.ready && !readiness.isValidating && !readiness.error && !metadataIssues.length);
  const infoComplete = Boolean(course?.title && course?.description && course?.thumbnailUrl && course?.learningOutcomes?.trim());
  const structureStarted = Boolean(modules.length && lessons.length);
  const structureComplete = Boolean(structureStarted && readiness.data && !(readiness.data.issues || []).length);
  const stepComplete = { info: infoComplete, curriculum: structureComplete, preview: false, publish: ready };
  const currentStepIndex = steps.findIndex(item => item.id === step);
  const completionCount = Number(infoComplete) + Number(structureComplete) + Number(ready);
  const completionPercent = Math.round((completionCount / 3) * 100);
  const currentSummary = step === 'info'
    ? infoComplete ? label('Thông tin bắt buộc đã đầy đủ.') : `${metadataIssues.length || 1} ${label('mục thông tin cần bổ sung.')}`
    : step === 'curriculum' ? `${modules.length} ${label('học phần')} · ${lessons.length} ${label('bài học')} · ${readiness.data?.issues?.length || 0} ${label('mục cần hoàn thiện.')}`
      : step === 'preview' ? `${lessons.length} ${label('bài học đang sẵn sàng để xem trước.')}`
        : ready ? label('Khóa học đã đủ điều kiện gửi duyệt.') : `${issues.length} ${label('mục cần hoàn thiện trước khi gửi duyệt.')}`;

  function changeStep(next) {
    if (dirty.current && !window.confirm(label('Thông tin chưa được lưu. Rời bước này và bỏ thay đổi?'))) return;
    dirty.current = false;
    setHasUnsaved(false);
    if (next === 'info' && canEdit) setInfoEditorOpen(true);
    setParams({ step: next });
    setError('');
  }
  function closeInfoEditor() {
    if (dirty.current && !window.confirm(label('Đóng cửa sổ và bỏ những thay đổi chưa lưu?'))) return;
    dirty.current = false;
    setHasUnsaved(false);
    setInfoEditorOpen(false);
  }
  async function mutate(action, success = 'Đã lưu thay đổi.') {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(label(success)); reload(); readiness.reload(); }
    catch (failure) { setError(failure.message || label('Không thể lưu thay đổi.')); }
    finally { setBusy(false); }
  }
  async function saveModal(body) {
    if (modal.kind === 'module') {
      if (modal.initial?.id) await contentService.updateModule(modal.initial.id, body);
      else await contentService.addModule(course.id, body);
    } else if (modal.kind === 'lesson') {
      if (modal.initial?.id) await contentService.update('lessons', modal.initial.id, body);
      else await contentService.addLesson(modal.module.id, body);
    } else if (modal.kind === 'finalQuiz') {
      const quiz = await contentService.create('quizzes', body);
      setModal({ kind: 'linkFinalQuiz', quiz });
      await contentService.setFinalAssessment(course.id, quiz.id);
      setModal(null);
      navigate(`${isAdmin ? '/admin' : '/content'}/quizzes/${quiz.id}?newQuestion=1`);
      return;
    }
    setModal(null); reload(); readiness.reload(); setMessage(label('Đã lưu nội dung.'));
  }
  async function editLesson(lesson) {
    await mutate(async () => setModal({ kind: 'lesson', initial: await contentService.get('lessons', lesson.id) }), '');
  }
  function newLesson(module) {
    const suffix = crypto.randomUUID().slice(0, 8);
    setModal({ kind: 'lesson', module, initial: { code: `${course.code.slice(0, 65)}-L-${suffix}` } });
  }

  return <section className="course-studio">
    <Link className="studio-back" to={isAdmin ? "/admin/courses" : "/content/courses"} onClick={event => { if (dirty.current && !window.confirm(label('Bỏ những thay đổi chưa lưu?'))) event.preventDefault(); }}><ArrowLeft size={16} /> <BilingualText>{"Tất cả khóa học"}</BilingualText></Link>
    <header className="studio-header">
      <div>
        <p className="studio-eyebrow"><BilingualText>{"KHÔNG GIAN BIÊN SOẠN"}</BilingualText></p>
        <h1>{!course ? <BilingualText>{"Thêm khóa học bằng Excel"}</BilingualText> : isAdmin ? <BilingualText>{"Kiểm duyệt khóa học"}</BilingualText> : <BilingualText>{"Chỉnh sửa khóa học"}</BilingualText>}</h1>
        <p>{course ? <BilingualText vi={course.titleVi || course.title} en={course.title} /> : <BilingualText vi="Tải file mẫu, điền nội dung rồi import để tạo khóa học nháp." en="Download the template, fill in content, then import to create a draft course." />}</p>
      </div>
      <div className="studio-save-state">
        {course ? <>
          <span className={`studio-status studio-status--${course.status}`}><span /><BilingualText>{statusNames[course.status] || course.status}</BilingualText></span>
          <small role="status"><BilingualText>{hasUnsaved ? 'Có thay đổi chưa lưu' : 'Nội dung đã lưu trên hệ thống'}</BilingualText></small>
        </> : <>
          <span className="studio-status studio-status--DRAFT"><span /><BilingualText>{"Tạo bằng Excel"}</BilingualText></span>
          <small role="status"><BilingualText>{importedCourseId ? 'Đã tạo khóa học nháp' : 'Chưa import file'}</BilingualText></small>
        </>}
      </div>
    </header>
    {course && <nav className="studio-steps" aria-label={label("Các bước chỉnh sửa khóa học")}>
      {steps.map((item, index) => <button key={item.id} type="button" className={`${step === item.id ? 'is-active ' : ''}${stepComplete[item.id] ? 'is-complete' : ''}`.trim()} aria-current={step === item.id ? 'step' : undefined} disabled={busy} onClick={() => changeStep(item.id)}>
        <span className="studio-step-number">{stepComplete[item.id] ? <Check size={17} /> : index + 1}</span>
        <span>
          <strong><BilingualText>{item.title}</BilingualText></strong>
          <small><BilingualText>{item.description}</BilingualText></small>
          <span className="studio-step-state"><BilingualText>{stepComplete[item.id] ? 'Hoàn tất' : step === item.id ? 'Đang thực hiện' : item.id === 'preview' ? 'Bước kiểm tra' : 'Chưa hoàn tất'}</BilingualText></span>
        </span>
      </button>)}
    </nav>}
    {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}{message && <Notice kind="success"><BilingualText>{message}</BilingualText></Notice>}
    {course?.status === 'REJECTED' && <Notice kind="error"><strong><BilingualText vi="Yêu cầu chỉnh sửa: " en="Revision requested: " /></strong>{course.reviewNote || label('Vui lòng kiểm tra lại nội dung.')}</Notice>}
    {course?.editRequestStatus === 'PENDING' && <Notice><strong><BilingualText vi="Yêu cầu mở chỉnh sửa đang chờ Admin duyệt. " en="The edit request is awaiting Admin approval. " /></strong>{course.editRequestReason}</Notice>}
    {course?.editRequestStatus === 'REJECTED' && ownsCourse && <Notice kind="error"><strong><BilingualText vi="Yêu cầu mở chỉnh sửa đã bị từ chối: " en="The edit request was rejected: " /></strong>{course.editRequestReviewNote || label('Không có phản hồi.')}</Notice>}
    {canRequestEdit && <section className="studio-panel">
      <div className="studio-review">
        <h2><BilingualText vi="Yêu cầu chỉnh sửa khóa học đã xuất bản" en="Request changes to a published course" /></h2>
        <p><BilingualText vi="Nêu rõ lý do và phạm vi cần cập nhật. Khóa học vẫn hiển thị cho học viên cho đến khi Admin phê duyệt yêu cầu." en="Describe why and what you need to update. The course remains available to learners until Admin approves the request." /></p>
        <label><BilingualText vi="Lý do chỉnh sửa" en="Reason for editing" /><textarea rows={4} maxLength={2000} value={editRequestReason} onChange={event => setEditRequestReason(event.target.value)} placeholder={label('Ví dụ: cập nhật nội dung bài 3 và thay quiz cuối khóa…')} disabled={busy} /></label>
        <div className="studio-actions"><button disabled={busy || !editRequestReason.trim()} onClick={() => mutate(() => contentService.requestCourseEdit(course.id, editRequestReason), 'Đã gửi yêu cầu chỉnh sửa cho Admin.')}><Send size={16} /> <BilingualText vi="Gửi yêu cầu chỉnh sửa" en="Submit edit request" /></button></div>
      </div>
    </section>}
    {course && !canEdit && <Notice>{canReview ? <BilingualText vi="Xem nội dung và bản xem trước trước khi quyết định phê duyệt." en="Review content and preview before deciding on approval." /> : <BilingualText vi="Khóa học đang ở chế độ chỉ đọc. Bạn vẫn có thể xem cấu trúc và trải nghiệm học." en="Course is in read-only mode. You can still inspect structure and learning flow." />}</Notice>}
    {course && <section className="studio-step-intro">
      <div>
        <p className="studio-eyebrow"><BilingualText>{stepGuidance[step].eyebrow}</BilingualText></p>
        <h2><BilingualText>{stepGuidance[step].title}</BilingualText></h2>
        <p><BilingualText>{stepGuidance[step].description}</BilingualText></p>
      </div>
      <div className={`studio-step-summary ${stepComplete[step] ? 'is-complete' : ''}`}>
        {stepComplete[step] && <CheckCircle2 size={17} />}
        <span>{currentSummary}</span>
      </div>
    </section>}
    <div className={`studio-layout${course ? '' : ' studio-layout--import'}`}>
      <div className="studio-main">
        {!course && <CourseWorkbookPanel canImport={!importedCourseId} importedCourseId={importedCourseId} busy={busy} onBusyChange={setBusy} onImported={setImportedCourseId} />}
        {course && step === 'info' && <>
          {canEdit ? <section className="studio-panel studio-editor-launch">
            <div>
              <p className="studio-eyebrow"><BilingualText>{"CHỈNH SỬA THEO TỪNG BƯỚC"}</BilingualText></p>
              <h2><BilingualText>{"Thông tin khóa học"}</BilingualText></h2>
              <p><BilingualText vi="Mở cửa sổ chỉnh sửa để lần lượt hoàn thiện phần giới thiệu, ảnh bìa và thiết lập. Sau khi lưu, hệ thống tự chuyển sang cấu trúc bài học." en="Open the editor wizard to complete introduction, cover image, and settings. Once saved, you will proceed to course curriculum." /></p>
            </div>
            <button onClick={() => setInfoEditorOpen(true)}><FileText size={17} /> <BilingualText>{"Mở cửa sổ chỉnh sửa"}</BilingualText></button>
          </section> : <CourseDetailsForm key={`${course.id}-${course.updatedAt}`} course={course} canEdit={false} onBusyChange={setBusy} onDirty={() => {}} onSave={() => {}} />}
          {canEdit && infoEditorOpen && <Modal title={label("Chỉnh sửa thông tin khóa học")} className="studio-wizard-modal" busy={busy} onClose={closeInfoEditor}>
            <CourseDetailsForm key={`${course.id}-${course.updatedAt}`} wizard course={course} canEdit onCancel={closeInfoEditor} onBusyChange={setBusy} onDirty={value => { dirty.current = value; setHasUnsaved(value); }} onSave={async body => {
              await contentService.update('courses', course.id, body);
              dirty.current = false;
              setHasUnsaved(false);
              setInfoEditorOpen(false);
              reload(); readiness.reload(); setMessage(label('Đã lưu thông tin. Tiếp tục hoàn thiện cấu trúc khóa học.'));
              setParams({ step: 'curriculum' });
            }} />
          </Modal>}
        </>}
        {step === 'curriculum' && <>
          <div className="studio-content-flow" aria-label={label("Luồng biên soạn nội dung")}>
            <div className="is-current"><span>1</span><strong><BilingualText vi="Khóa học" en="Course" /></strong><small><BilingualText vi="Thông tin và cấu trúc" en="Info & structure" /></small></div><ArrowRight size={16} />
            <div><span>2</span><strong><BilingualText vi="Bài học" en="Lessons" /></strong><small><BilingualText vi="Nội dung và media" en="Content & media" /></small></div><ArrowRight size={16} />
            <div><span>3</span><strong><BilingualText vi="Quiz" en="Quiz" /></strong><small><BilingualText vi="Đánh giá trong bài" en="Lesson quizzes" /></small></div><ArrowRight size={16} />
            <div><span>4</span><strong><BilingualText vi="Câu hỏi" en="Questions" /></strong><small><BilingualText vi="Câu hỏi và đáp án" en="Questions & keys" /></small></div>
          </div>
          <div className="studio-section-heading">
            <div>
              <p className="studio-eyebrow"><BilingualText>{"XÂY DỰNG LỘ TRÌNH"}</BilingualText></p>
              <h2><BilingualText>{"Cấu trúc khóa học"}</BilingualText></h2>
              <p><BilingualText>{"Chia nội dung thành học phần, rồi thêm bài học theo thứ tự."}</BilingualText></p>
            </div>
            {canEdit && <button disabled={busy} onClick={() => setModal({ kind: 'module' })}><Plus size={17} /> <BilingualText>{"Thêm học phần"}</BilingualText></button>}
          </div>
          {!modules.length && <div className="studio-empty"><Layers size={38} /><h3><BilingualText>{"Bắt đầu với học phần đầu tiên"}</BilingualText></h3><p><BilingualText vi="Ví dụ: Làm quen tiếng Việt, Giao tiếp ở quán ăn, Khám phá Hà Nội." en="e.g. Getting Started with Vietnamese, Ordering at a Restaurant, Exploring Hanoi." /></p>{canEdit && <button onClick={() => setModal({ kind: 'module' })}><Plus size={16} /> <BilingualText>{"Tạo học phần"}</BilingualText></button>}</div>}
          {modules.map((module, index) => <details className="studio-module" key={module.id} open>
            <summary>
              <span className="studio-module-icon"><Layers size={20} /></span>
              <span>
                <small><BilingualText vi={`HỌC PHẦN ${index + 1}`} en={`MODULE ${index + 1}`} /></small>
                <strong><BilingualText vi={module.titleVi || module.title} en={module.title} /></strong>
                <small>{module.lessons?.length || 0} <BilingualText>{"bài học"}</BilingualText></small>
              </span>
              <ChevronDown size={18} />
            </summary>
            {module.descriptionVi || module.description ? <p className="studio-module-description"><BilingualText vi={module.descriptionVi || module.description} en={module.description} /></p> : null}
            {canEdit && module.id !== 0 && <div className="studio-module-tools">
              <button className="secondary" disabled={busy} onClick={() => setModal({ kind: 'module', initial: module })}><BilingualText>{"Sửa học phần"}</BilingualText></button>
              <button className="secondary studio-icon-button" disabled={busy || index === 0 || modules.some(m => m.id === 0)} aria-label={label(`Đưa học phần ${index + 1} lên`)} onClick={() => mutate(() => contentService.reorder(`courses/${course.id}/modules`, moveItem(modules.map(m => m.id), index, -1)))}><ChevronUp size={17} /></button>
              <button className="secondary studio-icon-button" disabled={busy || index === modules.length - 1 || modules.some(m => m.id === 0)} aria-label={label(`Đưa học phần ${index + 1} xuống`)} onClick={() => mutate(() => contentService.reorder(`courses/${course.id}/modules`, moveItem(modules.map(m => m.id), index, 1)))}><ChevronDown size={17} /></button>
            </div>}
            <div className="studio-lessons">{(module.lessons || []).map((lesson, lessonIndex) => <div className="studio-lesson" key={lesson.id}>
              <span className="studio-lesson-number">{String(lessonIndex + 1).padStart(2, '0')}</span>
              <div className="studio-lesson-title">
                <Link to={canEdit ? `${isAdmin ? '/admin' : '/content'}/lessons/${lesson.id}` : `${isAdmin ? '/admin' : '/content'}/lessons/${lesson.id}/preview`}>
                  <BilingualText vi={lesson.titleVi || lesson.title} en={lesson.title} />
                </Link>
                <small><Clock size={12} /> {lesson.estimatedMinutes || 0} <BilingualText vi="phút" en="min" /> <span className={`studio-status studio-status--${lesson.status}`}><BilingualText>{statusNames[lesson.status] || lesson.status}</BilingualText></span></small>
              </div>
              <div className="studio-lesson-actions">
                <Link className="studio-icon-link" aria-label={label(`Xem trước ${lesson.titleVi || lesson.title}`)} to={`${isAdmin ? '/admin' : '/content'}/lessons/${lesson.id}/preview`}><Eye size={17} /></Link>
                {canEdit && <>
                  <button className="secondary" disabled={busy} onClick={() => editLesson(lesson)}><BilingualText>{"Sửa"}</BilingualText></button>
                  <Link className="button secondary" to={`${isAdmin ? '/admin' : '/content'}/lessons/${lesson.id}`}><BilingualText>{"Nội dung"}</BilingualText> <ArrowRight size={14} /></Link>
                  {module.id !== 0 && <>
                    <button className="secondary studio-icon-button" aria-label={label(`Đưa bài ${lessonIndex + 1} lên`)} disabled={busy || lessonIndex === 0} onClick={() => mutate(() => contentService.reorder(`modules/${module.id}/lessons`, moveItem(module.lessons.map(l => l.id), lessonIndex, -1)))}><ChevronUp size={15} /></button>
                    <button className="secondary studio-icon-button" aria-label={label(`Đưa bài ${lessonIndex + 1} xuống`)} disabled={busy || lessonIndex === module.lessons.length - 1} onClick={() => mutate(() => contentService.reorder(`modules/${module.id}/lessons`, moveItem(module.lessons.map(l => l.id), lessonIndex, 1)))}><ChevronDown size={15} /></button>
                  </>}
                </>}
              </div>
            </div>)}</div>
            {canEdit && module.id !== 0 && <button className="secondary studio-add-lesson" disabled={busy} onClick={() => newLesson(module)}><Plus size={17} /> <BilingualText>{"Thêm bài học vào học phần"}</BilingualText></button>}
          </details>)}
          <section className="studio-panel studio-assessment">
            <div className="studio-section-heading">
              <div>
                <h3><ShieldCheck size={19} /> <BilingualText>{"Đánh giá cuối khóa"}</BilingualText></h3>
                <p><BilingualText>{"Quiz tổng kết để kiểm tra mục tiêu của toàn khóa học."}</BilingualText></p>
              </div>
              {canEdit && !course.finalAssessmentQuizId && <button className="secondary" disabled={busy || !lessons.length} onClick={() => setModal({ kind: 'finalQuiz' })}><Plus size={16} /> <BilingualText>{"Tạo quiz cuối khóa"}</BilingualText></button>}
            </div>
            {course.finalAssessmentQuizId ? <Link className="text-link" to={`${isAdmin ? '/admin' : '/content'}/quizzes/${course.finalAssessmentQuizId}`}><BilingualText>{"Quản lý câu hỏi và đáp án của quiz cuối khóa"}</BilingualText> <ArrowRight size={15} /></Link> : <small><BilingualText>{"Thêm ít nhất một bài học để tạo quiz tổng kết."}</BilingualText></small>}
          </section>
        </>}
        {step === 'preview' && <CoursePreview course={course} />}
        {step === 'publish' && <section className="studio-panel studio-publish">
          <p className="studio-eyebrow"><BilingualText>{"SẴN SÀNG CHO HỌC VIÊN"}</BilingualText></p>
          <h2><BilingualText>{"Kiểm tra trước khi xuất bản"}</BilingualText></h2>
          <p><BilingualText>{"Hoàn thiện nội dung, xem trước và gửi Admin kiểm duyệt."}</BilingualText></p>
          <div className="studio-publish-check">
            <CheckCircle2 size={20} />
            <div>
              <strong><BilingualText>{"Thông tin khóa học"}</BilingualText></strong>
              <span>{metadataIssues.length ? metadataIssues.map(i => label(i)).join(' ') : label('Đã có ảnh bìa và mục tiêu học tập.')}</span>
            </div>
            {metadataIssues.length ? <button className="secondary" onClick={() => changeStep('info')}><BilingualText>{"Bổ sung"}</BilingualText></button> : <Check size={18} />}
          </div>
          <ResourceState resource={readiness}>{data => <>
            {data?.issues?.length ? <ul className="studio-issue-list">{data.issues.map(issue => <li key={issue}><span className="studio-pending-dot" /><span>{label(issueNames[issue] || issue)}</span><button className="secondary" onClick={() => changeStep('curriculum')}><BilingualText vi="Hoàn thiện" en="Complete" /> <ArrowRight size={14} /></button></li>)}</ul> : <Notice kind="success"><BilingualText>{"Cấu trúc bài học, hoạt động và quiz đã đủ điều kiện."}</BilingualText></Notice>}
          </>}</ResourceState>
          <button className="secondary" disabled={busy || readiness.isValidating} onClick={readiness.reload}><BilingualText>{"Kiểm tra lại nội dung"}</BilingualText></button>
          {canEdit && <div className="studio-publish-action">
            <ShieldCheck size={25} />
            <div>
              <h3><BilingualText>{ready ? 'Khóa học đã sẵn sàng gửi duyệt' : 'Hoàn thiện các mục còn thiếu'}</BilingualText></h3>
              <p><BilingualText>{"Sau khi gửi, khóa học chuyển sang chỉ đọc. Admin phê duyệt sẽ xuất bản cho học viên."}</BilingualText></p>
            </div>
            <button disabled={busy || !ready} onClick={() => mutate(() => contentService.submitCourse(course.id), 'Đã gửi Admin kiểm duyệt.')}><Send size={16} />{busy ? label('Đang gửi…') : label('Gửi kiểm duyệt')}</button>
          </div>}
          {canReview && <div className="studio-review">
            <h3><BilingualText>{"Quyết định kiểm duyệt"}</BilingualText></h3>
            <label><BilingualText>{"Nhận xét cho người biên soạn"}</BilingualText><textarea rows={4} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder={label("Nêu nội dung cần chỉnh sửa nếu từ chối…")} disabled={busy} /></label>
            <div className="studio-actions">
              <button disabled={busy || !ready} onClick={() => mutate(() => contentService.reviewCourse(course.id, 'APPROVE', reviewNote), 'Khóa học đã được phê duyệt và xuất bản.')}><Globe size={17} /> <BilingualText>{"Phê duyệt & xuất bản"}</BilingualText></button>
              <button className="secondary" disabled={busy || !reviewNote.trim()} onClick={() => mutate(() => contentService.reviewCourse(course.id, 'REJECT', reviewNote), 'Đã gửi yêu cầu chỉnh sửa.')} ><BilingualText>{"Yêu cầu chỉnh sửa"}</BilingualText></button>
            </div>
          </div>}
          {canReviewEditRequest && <div className="studio-review">
            <h3><BilingualText vi="Duyệt yêu cầu chỉnh sửa khóa học" en="Review course edit request" /></h3>
            <p><strong><BilingualText vi="Lý do của Content Manager: " en="Content Manager's reason: " /></strong>{course.editRequestReason}</p>
            <label><BilingualText vi="Phản hồi của Admin" en="Admin response" /><textarea rows={4} value={reviewNote} onChange={event => setReviewNote(event.target.value)} placeholder={label('Ghi chú cho Content Manager…')} disabled={busy} /></label>
            <div className="studio-actions">
              <button disabled={busy} onClick={() => mutate(() => contentService.reviewCourseEditRequest(course.id, 'APPROVE', reviewNote), 'Đã duyệt. Khóa học được chuyển về bản nháp để chỉnh sửa.')}><CheckCircle2 size={17} /> <BilingualText vi="Duyệt & mở quyền chỉnh sửa" en="Approve & unlock editing" /></button>
              <button className="secondary" disabled={busy || !reviewNote.trim()} onClick={() => mutate(() => contentService.reviewCourseEditRequest(course.id, 'REJECT', reviewNote), 'Đã từ chối yêu cầu chỉnh sửa.')}><BilingualText vi="Từ chối yêu cầu" en="Reject request" /></button>
            </div>
          </div>}
          {course.status === 'PUBLISHED' && <Notice kind="success"><BilingualText>{"Khóa học đã xuất bản."}</BilingualText> <Link to={`/courses/${course.id}`}><BilingualText>{"Mở trang khóa học dành cho học viên →"}</BilingualText></Link></Notice>}
        </section>}
        {course && <footer className="studio-footer">
          {currentStepIndex > 0 ? <button className="secondary" disabled={busy} onClick={() => changeStep(steps[currentStepIndex - 1].id)}><ArrowLeft size={16} /> <BilingualText>{steps[currentStepIndex - 1].title}</BilingualText></button> : <span />}
          <span role="status"><BilingualText>{hasUnsaved ? 'Lưu thay đổi để tiếp tục.' : step === 'publish' ? 'Kiểm tra đầy đủ trước khi gửi duyệt.' : `Tiếp theo: ${label(steps[currentStepIndex + 1]?.title)}`}</BilingualText></span>
          {currentStepIndex < steps.length - 1 && <button disabled={busy || hasUnsaved} onClick={() => changeStep(steps[currentStepIndex + 1].id)}><BilingualText>{steps[currentStepIndex + 1].title}</BilingualText> <ArrowRight size={16} /></button>}
        </footer>}
      </div>
      {course && <aside className="studio-sidebar">
        <div className="studio-side-card">
          <span className="studio-eyebrow"><BilingualText>{"TỔNG QUAN KHÓA HỌC"}</BilingualText></span>
          <CourseThumbnail course={course} />
          <h3><BilingualText vi={course.titleVi || course.title} en={course.title} /></h3>
          <p>{course.level} · <BilingualText>{course.isFree ? 'Miễn phí' : 'Có phí'}</BilingualText></p>
          <div className="studio-stats">
            <div><Layers size={17} /><strong>{modules.length}</strong><span><BilingualText>{"học phần"}</BilingualText></span></div>
            <div><BookOpen size={17} /><strong>{lessons.length}</strong><span><BilingualText>{"bài học"}</BilingualText></span></div>
            <div><Clock size={17} /><strong>{lessons.reduce((sum, l) => sum + Number(l.estimatedMinutes || 0), 0)}</strong><span><BilingualText>{"phút nội dung"}</BilingualText></span></div>
          </div>
        </div>
        <section className="studio-progress-card">
          <div className="studio-progress-heading">
            <div><span className="studio-eyebrow"><BilingualText>{"TIẾN ĐỘ HOÀN THIỆN"}</BilingualText></span><strong>{completionPercent}%</strong></div>
            <span>{completionCount}/3 <BilingualText>{"nhóm yêu cầu"}</BilingualText></span>
          </div>
          <div className="studio-progress-track"><span style={{ width: `${completionPercent}%` }} /></div>
          <button className={infoComplete ? 'is-complete' : ''} onClick={() => changeStep('info')}>
            <span>{infoComplete ? <Check size={14} /> : '1'}</span>
            <div><strong><BilingualText>{"Thông tin khóa học"}</BilingualText></strong><small><BilingualText>{infoComplete ? 'Đã đầy đủ' : 'Cần bổ sung'}</BilingualText></small></div>
          </button>
          <button className={structureComplete ? 'is-complete' : ''} onClick={() => changeStep('curriculum')}>
            <span>{structureComplete ? <Check size={14} /> : '2'}</span>
            <div><strong><BilingualText>{"Bài học & hoạt động"}</BilingualText></strong><small><BilingualText>{structureComplete ? 'Đã đầy đủ' : structureStarted ? 'Đang hoàn thiện' : 'Chưa có nội dung'}</BilingualText></small></div>
          </button>
          <button className={ready ? 'is-complete' : ''} onClick={() => changeStep('publish')}>
            <span>{ready ? <Check size={14} /> : '3'}</span>
            <div><strong><BilingualText>{"Gửi kiểm duyệt"}</BilingualText></strong><small><BilingualText>{ready ? 'Đã sẵn sàng' : `${issues.length} mục còn thiếu`}</BilingualText></small></div>
          </button>
        </section>
        <div className="studio-side-tip">
          <ShieldCheck size={21} />
          <h3><BilingualText>{"Mẹo biên soạn"}</BilingualText></h3>
          <p><BilingualText>{"Lưu thông tin trước khi chuyển bước. Mở Xem trước để kiểm tra nội dung theo góc nhìn học viên."}</BilingualText></p>
          <button className="secondary" disabled={busy || hasUnsaved} onClick={() => changeStep('preview')}><BilingualText>{"Mở xem trước"}</BilingualText> <ArrowRight size={14} /></button>
        </div>
      </aside>}
    </div>
    {canEdit && modal && modal.kind !== 'linkFinalQuiz' && <Modal title={label(modal.kind === 'module' ? (modal.initial?.id ? 'Chỉnh sửa học phần' : 'Thêm học phần') : modal.kind === 'finalQuiz' ? 'Tạo quiz cuối khóa' : (modal.initial?.id ? 'Chỉnh sửa bài học' : 'Thêm bài học'))} busy={busy} onClose={() => setModal(null)}><ContentForm kind={modal.kind === 'module' ? 'modules' : modal.kind === 'finalQuiz' ? 'quizzes' : 'lessons'} initial={modal.kind === 'finalQuiz' ? { quizType: 'COURSE', courseId: course.id, lessonId: lessons.at(-1)?.id, passingScore: 70 } : modal.initial || {}} fixedFields={modal.kind === 'finalQuiz' ? ['quizType', 'courseId', 'lessonId'] : []} onCancel={() => setModal(null)} onSave={saveModal} onBusyChange={setBusy} /></Modal>}
    {modal?.kind === 'linkFinalQuiz' && <Modal title={label("Hoàn tất liên kết quiz")} busy={busy} onClose={() => { setModal(null); reload(); }}><p><BilingualText vi="Quiz đã được tạo. Nếu liên kết chưa hoàn tất, bạn có thể thử lại mà không tạo thêm quiz." en="Quiz has been created. If linking did not finish, you can retry without creating duplicates." /></p><button disabled={busy} onClick={() => mutate(async () => { await contentService.setFinalAssessment(course.id, modal.quiz.id); navigate(`/content/quizzes/${modal.quiz.id}?newQuestion=1`); })}><BilingualText vi="Liên kết và thêm câu hỏi" en="Link and add questions" /></button><Link to={`/content/quizzes/${modal.quiz.id}`}><BilingualText vi="Mở quiz đã tạo" en="Open created quiz" /></Link></Modal>}
  </section>;
}

function downloadWorkbook(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function CourseWorkbookPanel({ canImport, importedCourseId, busy, onBusyChange, onImported }) {
  const label = useBilingualLabel();
  const [file, setFile] = useState(null), [preview, setPreview] = useState(null);
  const [error, setError] = useState(''), [working, setWorking] = useState(false);
  async function run(action) {
    setWorking(true); onBusyChange(true); setError('');
    try { await action(); } catch (failure) { setError(failure.message || label('Không thể xử lý file Excel.')); }
    finally { setWorking(false); onBusyChange(false); }
  }
  const locked = busy || working;
  return <section className="studio-panel studio-workbook" aria-label={label("Nhập khóa học từ Excel")}>
    <div className="studio-section-heading">
      <div>
        <p className="studio-eyebrow"><BilingualText>{"TẠO KHÓA HỌC"}</BilingualText></p>
        <h2><FileSpreadsheet size={22} /> <BilingualText vi="Import khóa học từ Excel" en="Import course from Excel" /></h2>
        <p><BilingualText vi="File mẫu chứa trọn một khóa học cụ thể: thông tin khóa, học phần, bài học, hoạt động, quiz từng bài, quiz cuối khóa và câu hỏi/đáp án." en="The template contains one complete sample course: course info, modules, lessons, activities, lesson quizzes, a final quiz, and questions/answers." /></p>
      </div>
    </div>
    <div className="studio-workbook-flow" aria-label={label("Quy trình import khóa học")}>
      <div><strong>1</strong><span><BilingualText vi="Tải file mẫu" en="Download template" /></span></div>
      <div><strong>2</strong><span><BilingualText vi="Điền nội dung" en="Fill content" /></span></div>
      <div><strong>3</strong><span><BilingualText vi="Kiểm tra và import" en="Verify & import" /></span></div>
    </div>
    <div className="studio-workbook-actions">
      <button className="secondary" type="button" disabled={locked} onClick={() => run(async () => downloadWorkbook(await contentService.courseWorkbookTemplate(), 'course-studio-template.xlsx'))}><Download size={16} /> <BilingualText vi="Tải file Excel mẫu" en="Download Excel template" /></button>
    </div>
    {importedCourseId && <Notice kind="success"><strong><BilingualText vi="Đã tạo khóa học nháp từ file Excel." en="Draft course created from Excel file." /></strong><div className="studio-workbook-success-actions"><Link className="button" to={`/content/courses/${importedCourseId}`}><BilingualText vi="Chỉnh sửa khóa học" en="Edit course" /> <ArrowRight size={15} /></Link><Link className="button secondary" to="/content/courses"><BilingualText vi="Về danh sách khóa học" en="Back to courses list" /></Link></div></Notice>}
    {canImport && <>
      <label className="studio-workbook-file"><span><BilingualText vi="Chọn file Excel đã điền (.xlsx, tối đa 10 MB)" en="Select completed Excel file (.xlsx, max 10 MB)" /></span><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={locked} onChange={event => { setFile(event.target.files?.[0] || null); setPreview(null); setError(''); }} /></label>
      <div className="studio-workbook-actions">
        <button className="secondary" type="button" disabled={locked || !file} onClick={() => run(async () => setPreview(await contentService.courseWorkbookValidate(file)))}><Eye size={16} /> <BilingualText vi="Kiểm tra file" en="Inspect file" /></button>
        <button type="button" disabled={locked || !preview?.valid || !file} onClick={() => run(async () => { const result = await contentService.courseWorkbookImport(file); onImported(result.courseId); })}><Upload size={16} /> {working ? label('Đang nhập…') : label('Nhập thành khóa học nháp')}</button>
      </div>
      {preview && <div className="studio-workbook-preview" role="status">
        <strong>{preview.valid ? label('File hợp lệ') : label('Cần sửa file trước khi nhập')}</strong>
        <p>{preview.counts?.MODULES || 0} {label('học phần')} · {preview.counts?.LESSONS || 0} {label('bài học')} · {preview.counts?.ACTIVITIES || 0} {label('hoạt động')} · {preview.counts?.QUIZZES || 0} quiz · {preview.counts?.QUESTIONS || 0} {label('câu hỏi')}.</p>
        <p>{preview.pendingMedia || 0} {label('mục media cần bổ sung sau khi nhập.')}</p>
        {preview.errors?.length > 0 && <ul>{preview.errors.slice(0, 20).map((item, index) => <li key={index}>{item}</li>)}</ul>}
      </div>}
      <p className="studio-workbook-hint"><BilingualText vi="Sau khi import, khóa học được giữ ở trạng thái nháp để bạn kiểm tra. Nội dung mẫu đã đủ cấu trúc bắt buộc và có thể gửi Admin duyệt sau khi chỉnh sửa thông tin cần thiết." en="After import, the course remains a draft for inspection. The sample already includes the required structure and can be submitted for Admin review after any needed edits." /></p>
    </>}
    {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
  </section>;
}

function CoursePreview({ course }) {
  const label = useBilingualLabel();
  const lessons = (course.modules || []).flatMap(m => m.lessons || []);
  const [lessonId, setLessonId] = useState(null);
  return <section className="studio-preview">
    <div className="studio-section-heading">
      <div>
        <p className="studio-eyebrow"><BilingualText vi="GÓC NHÌN HỌC VIÊN" en="LEARNER PERSPECTIVE" /></p>
        <h2><BilingualText vi="Xem trước khóa học" en="Course Preview" /></h2>
        <p><BilingualText vi="Kiểm tra cách trình bày trước khi gửi duyệt." en="Verify layout and content before submission." /></p>
      </div>
      <span className="studio-preview-label"><Eye size={15} /> <BilingualText vi="Bao gồm bản nháp" en="Includes draft" /></span>
    </div>
    <article className="studio-preview-hero">
      <CourseThumbnail course={course} />
      <div>
        <span className="studio-preview-level">{course.level} · <BilingualText>{course.isFree ? 'Miễn phí' : 'Có phí'}</BilingualText></span>
        <h2><BilingualText vi={course.titleVi || course.title} en={course.title} /></h2>
        <p><BilingualText vi={course.descriptionVi || course.description} en={course.description} /></p>
        <span><BookOpen size={16} /> {lessons.length} <BilingualText>{"bài học"}</BilingualText> · {course.estimatedMinutes || lessons.reduce((sum, lesson) => sum + Number(lesson.estimatedMinutes || 0), 0)} <BilingualText vi="phút" en="min" /></span>
      </div>
    </article>
    <section className="studio-panel">
      <h3><BilingualText vi="Bạn sẽ học được gì?" en="What will you learn?" /></h3>
      <p className="studio-outcomes">{course.learningOutcomes || label('Chưa thêm mục tiêu học tập.')}</p>
    </section>
    <section className="studio-panel">
      <h3><BilingualText vi="Nội dung khóa học" en="Course Curriculum" /></h3>
      {course.modules?.map((module, index) => <div className="studio-preview-module" key={module.id}>
        <h4>{index + 1}. <BilingualText vi={module.titleVi || module.title} en={module.title} /></h4>
        {module.lessons?.map(lesson => <div className="studio-preview-lesson-block" key={lesson.id}>
          <button
            className={`secondary studio-preview-lesson ${lessonId === lesson.id ? 'is-selected' : ''}`}
            aria-expanded={lessonId === lesson.id}
            onClick={() => setLessonId(current => current === lesson.id ? null : lesson.id)}
          >
            <BookOpen size={17} />
            <span><BilingualText vi={lesson.titleVi || lesson.title} en={lesson.title} /></span>
            <small><BilingualText>{statusNames[lesson.status] || lesson.status}</BilingualText> · {lesson.estimatedMinutes || 0} <BilingualText vi="phút" en="min" /></small>
            <Eye size={16} />
          </button>
          {lessonId === lesson.id && <section className="studio-lesson-preview-inline">
            <div className="studio-section-heading">
              <h3><BilingualText vi="Nội dung bài học" en="Lesson Content" /></h3>
              <button className="secondary" onClick={() => setLessonId(null)}><BilingualText vi="Đóng xem trước" en="Close preview" /></button>
            </div>
            <StudioLessonPreview lessonId={lesson.id} />
          </section>}
        </div>)}
      </div>)}
      {!lessons.length && <p><BilingualText vi="Thêm bài học tại bước Cấu trúc để xem trước." en="Add lessons in Curriculum step to preview." /></p>}
    </section>
  </section>;
}

function StudioLessonPreview({ lessonId }) {
  return <ResourceState resource={useAsyncResource(useCallback(signal => contentService.preview('lessons', lessonId, signal), [lessonId]))}>
    {lesson => <LessonActivities key={lesson.id} lessonId={lesson.id} previewLesson={lesson} previewAll fallback={<p><BilingualText vi="Bài học chưa có hoạt động." en="Lesson has no activities." /></p>} />}
  </ResourceState>;
}

function CourseDetailsForm({ course, canEdit, onSave, onDirty, onBusyChange, wizard = false, onCancel = () => {} }) {
  const label = useBilingualLabel();
  const [form, setForm] = useState(() => ({ title: course?.title || '', titleVi: course?.titleVi || '', description: course?.description || '', descriptionVi: course?.descriptionVi || '', code: course?.code || '', slug: course?.slug || '', level: course?.level || 'A1', estimatedMinutes: course?.estimatedMinutes ?? course?.estimatedDuration ?? 0, learningOutcomes: course?.learningOutcomes || '', isFree: course?.isFree ?? true, thumbnailUrl: course?.thumbnailUrl || '' }));
  const [manualSlug, setManualSlug] = useState(Boolean(course)), [manualCode, setManualCode] = useState(Boolean(course));
  const [file, setFile] = useState(null), [preview, setPreview] = useState(course?.thumbnailUrl || '');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [dirty, setDirty] = useState(false);
  const [phase, setPhase] = useState(0);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!file) { setPreview(form.thumbnailUrl); return; }
    const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url);
  }, [file, form.thumbnailUrl]);

  useEffect(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function changed() { setDirty(true); onDirty(true); }
  function update(key, value) {
    changed();
    if (key === 'slug') setManualSlug(Boolean(value));
    if (key === 'code') setManualCode(Boolean(value));
    setForm(current => {
      const next = { ...current, [key]: value };
      if (key === 'title' || key === 'titleVi') {
        const slug = slugify(next.titleVi || next.title);
        if (!manualSlug) next.slug = slug;
        if (!manualCode) next.code = slug.toUpperCase().slice(0, 80);
      }
      return next;
    });
  }
  function chooseFile(e) {
    const candidate = e.target.files?.[0]; if (!candidate) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(candidate.type) || candidate.size > 5 * 1024 * 1024) {
      setError(label('Chọn ảnh JPG, PNG hoặc WebP không quá 5 MB.')); e.target.value = ''; return;
    }
    setFile(candidate); setError(''); changed();
  }
  function nextPhase() {
    if (phase === 0 && (!form.title.trim() || !form.description.trim())) {
      setError(label('Điền tên và phần giới thiệu tiếng Anh trước khi tiếp tục.'));
      return;
    }
    setError('');
    setPhase(current => Math.min(current + 1, 2));
  }
  async function submit(e) {
    e.preventDefault(); if (!canEdit || busy) return;
    setBusy(true); onBusyChange(true); setError('');
    try {
      const payload = { ...form, title: form.title.trim(), titleVi: form.titleVi.trim(), description: form.description.trim(), code: form.code.trim(), slug: form.slug.trim(), estimatedMinutes: Number(form.estimatedMinutes) };
      if (!payload.title || !payload.description || !payload.code || !payload.slug) throw new Error(label('Điền tên tiếng Anh, mô tả, mã và đường dẫn khóa học.'));
      if (file) {
        payload.thumbnailUrl = await contentService.uploadCourseCover(file);
        setForm(current => ({ ...current, thumbnailUrl: payload.thumbnailUrl })); setFile(null);
      }
      await onSave(payload); setDirty(false); onDirty(false);
    } catch (failure) { setError(failure.message || label('Không thể lưu khóa học.')); }
    finally { setBusy(false); onBusyChange(false); }
  }

  const field = (key, fieldLabel, options = {}) => <label className={options.wide ? 'studio-full-width' : ''}>
    <span><BilingualText>{fieldLabel}</BilingualText>{options.required && <span className="studio-required"> *</span>}</span>
    {options.area ? <textarea rows={options.rows || 4} required={options.required} maxLength={options.maxLength} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={options.placeholder ? label(options.placeholder) : undefined} /> : <input type={options.type || 'text'} required={options.required} maxLength={options.maxLength} min={options.type === 'number' ? 0 : undefined} pattern={key === 'slug' ? '[a-z0-9]+(?:-[a-z0-9]+)*' : undefined} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={options.placeholder ? label(options.placeholder) : undefined} />}
    {options.help && <small><BilingualText>{options.help}</BilingualText></small>}
  </label>;

  const phaseLabels = ['Giới thiệu', 'Ảnh bìa', 'Thiết lập'];

  return <form className={`studio-details-form${wizard ? ' studio-details-form--wizard' : ''}`} onSubmit={submit}>
    {wizard && <div className="studio-wizard-steps" aria-label={label("Các phần thông tin khóa học")}>{phaseLabels.map((pLabel, index) => <button key={pLabel} type="button" className={`${index === phase ? 'is-active ' : ''}${index < phase ? 'is-complete' : ''}`.trim()} aria-current={index === phase ? 'step' : undefined} onClick={() => index <= phase && setPhase(index)}><span>{index < phase ? <Check size={14} /> : index + 1}</span><strong><BilingualText>{pLabel}</BilingualText></strong></button>)}</div>}
    <fieldset disabled={busy || !canEdit}>
      {(!wizard || phase === 0) && <section className="studio-panel">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow"><BilingualText vi="ĐẶT NỀN TẢNG" en="FOUNDATION" /></p>
            <h2><BilingualText vi="Giới thiệu khóa học" en="Course Introduction" /></h2>
            <p><BilingualText vi="Cho học viên biết họ sẽ học gì và khóa học dành cho ai." en="Let learners know what they will study and who the course is for." /></p>
          </div>
          <FileText size={24} />
        </div>
        <div className="studio-form-grid">
          {field('title', 'Tên khóa học · English', { required: true, maxLength: 200, placeholder: 'e.g. Vietnamese for everyday adventures' })}
          {field('titleVi', 'Tên khóa học · Tiếng Việt', { maxLength: 200, placeholder: 'VD: Tiếng Việt cho những chuyến đi' })}
          {field('description', 'Giới thiệu · English', { required: true, area: true, wide: true, placeholder: 'Who is this course for? What can learners do after completing it?' })}
          {field('descriptionVi', 'Giới thiệu · Tiếng Việt', { area: true, wide: true, placeholder: 'Đối tượng học, chủ đề và trải nghiệm nổi bật của khóa học…' })}
        </div>
      </section>}
      {(!wizard || phase === 1) && <section className="studio-panel">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow"><BilingualText vi="HÌNH ẢNH ĐẠI DIỆN" en="COVER MEDIA" /></p>
            <h2><BilingualText vi="Ảnh bìa khóa học" en="Course Cover Image" /></h2>
            <p><BilingualText vi="Chọn hình đại diện cho chủ đề và tinh thần của khóa học." en="Choose an image reflecting the theme and spirit of the course." /></p>
          </div>
          <ImagePlus size={24} />
        </div>
        <div className="studio-cover-editor">
          {preview ? <img src={preview} alt={label("Xem trước ảnh bìa khóa học")} /> : <div className="studio-cover-empty"><ImagePlus size={36} /><span><BilingualText vi="Xem trước ảnh bìa" en="Cover preview" /></span></div>}
          <div>
            <label className="studio-file-label"><BilingualText vi="Chọn ảnh từ thiết bị" en="Select image from device" /><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} /></label>
            <p><BilingualText vi="JPG, PNG hoặc WebP · tối đa 5 MB." en="JPG, PNG or WebP · max 5 MB." /><br /><BilingualText vi="Gợi ý tỉ lệ 16:9, ảnh rõ nét." en="Recommended 16:9 ratio, sharp image." /></p>
            <small><BilingualText vi="Ảnh được tải lên Cloudinary khi lưu. Bạn có thể lưu nháp trước và thêm ảnh sau." en="Images upload to Cloudinary upon save. You can save draft now and upload later." /></small>
            {file && <button type="button" className="secondary" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}><BilingualText vi="Bỏ ảnh vừa chọn" en="Remove chosen image" /></button>}
          </div>
        </div>
      </section>}
      {(!wizard || phase === 2) && <section className="studio-panel">
        <div className="studio-section-heading">
          <div>
            <p className="studio-eyebrow"><BilingualText vi="HOÀN TẤT THIẾT LẬP" en="FINAL SETTINGS" /></p>
            <h2><BilingualText vi="Kết quả học tập & thiết lập" en="Learning Outcomes & Settings" /></h2>
            <p><BilingualText vi="Xác định mục tiêu, trình độ và thời lượng trước khi tạo cấu trúc bài học." en="Define outcomes, level, and estimated duration before structuring lessons." /></p>
          </div>
          <CheckCircle2 size={24} />
        </div>
        <div className="studio-form-grid">
          {field('learningOutcomes', 'Sau khóa học, học viên có thể…', { area: true, wide: true, placeholder: 'Mỗi dòng một mục tiêu:\nGiới thiệu bản thân bằng tiếng Việt\nGọi món và thanh toán tại quán ăn', help: 'Mục tiêu rõ ràng giúp bạn thiết kế bài học và quiz phù hợp.' })}
          <label><span><BilingualText>{"Trình độ"}</BilingualText></span><select value={form.level} onChange={e => update('level', e.target.value)}>{['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].map(level => <option key={level}>{level}</option>)}</select></label>
          {field('estimatedMinutes', 'Thời lượng dự kiến (phút)', { type: 'number' })}
          <label className="studio-checkbox studio-full-width"><input type="checkbox" checked={form.isFree} onChange={e => update('isFree', e.target.checked)} /><span><BilingualText vi="Khóa học miễn phí" en="Free course" /></span></label>
        </div>
        <details className="studio-advanced">
          <summary><BilingualText vi="Mã khóa học & đường dẫn tự động" en="Course code & automatic slug" /></summary>
          <p><BilingualText vi="Mã và đường dẫn được tạo từ tên khóa học. Bạn có thể sửa nếu cần." en="Code and slug are generated from title. You can edit if necessary." /></p>
          <div className="studio-form-grid">
            {field('code', 'Mã khóa học', { required: true, maxLength: 80 })}
            {field('slug', 'Đường dẫn (slug)', { required: true, maxLength: 200, help: 'Ví dụ: tieng-viet-cho-nhung-chuyen-di' })}
          </div>
        </details>
      </section>}
    </fieldset>
    {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
    {wizard ? <div className="studio-wizard-actions">
      <button type="button" className="secondary" disabled={busy} onClick={phase === 0 ? onCancel : () => { setError(''); setPhase(current => current - 1); }}><ArrowLeft size={16} /> <BilingualText>{phase === 0 ? 'Đóng' : 'Quay lại'}</BilingualText></button>
      <span><BilingualText vi="Bước" en="Step" /> {phase + 1} / {phaseLabels.length}</span>
      {phase < 2 ? <button type="button" disabled={busy} onClick={nextPhase}><BilingualText vi="Tiếp tục" en="Continue" />: <BilingualText>{phaseLabels[phase + 1]}</BilingualText> <ArrowRight size={16} /></button> : <button disabled={busy}><Save size={17} /> {busy ? label('Đang lưu…') : label('Lưu và sang Cấu trúc')}</button>}
    </div> : canEdit && <div className={`studio-form-save ${dirty ? 'has-changes' : ''}`}>
      <span role="status"><BilingualText>{dirty ? 'Bạn có thay đổi chưa lưu.' : 'Thông tin khóa học đã được lưu.'}</BilingualText></span>
      <button disabled={busy || !dirty}><Save size={17} /> {busy ? label('Đang lưu…') : dirty ? label('Lưu thay đổi') : label('Đã lưu')}</button>
    </div>}
  </form>;
}

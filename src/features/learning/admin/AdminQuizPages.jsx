import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { MediaPlayer } from '@/features/learning/components/learning/MediaPlayer';
import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { contentService } from '@/features/learning/api/contentService';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { PageHeader, EmptyState, Notice, Breadcrumb } from '@/shared/components/common/Ui';
import { Modal } from '@/shared/components/common/Modal';
import { QuestionForm } from '@/features/learning/admin/components/QuestionForm';
import { ContentForm } from '@/features/learning/admin/components/ContentForm';
import { QuestionInput } from '@/features/learning/components/learning/QuestionInput';
import { moveItem } from '@/features/learning/components/learning/answerUtils';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import { AdminFilterSelect } from '@/shared/components/common/AdminFilterSelect';
import { Search, X, Pencil } from 'lucide-react';

const QUESTION_STATUS_OPTIONS = [
  { value: '', label: bilingualLabel('Tất cả trạng thái', 'All statuses'), dotColor: '#94A3B8' },
  { value: 'DRAFT', label: bilingualLabel('Bản nháp (DRAFT)', 'Draft'), dotColor: '#F59E0B' },
  { value: 'PUBLISHED', label: bilingualLabel('Đã xuất bản (PUBLISHED)', 'Published'), dotColor: '#10B981' },
  { value: 'ARCHIVED', label: bilingualLabel('Lưu trữ (ARCHIVED)', 'Archived'), dotColor: '#64748B' },
];

export function AdminQuestionBankPage() {
  const { isAdmin, isContentManager } = useAuth();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null);

  const resource = useAsyncResource(
    useCallback((signal) => contentService.list('questions', { q: query, status, page, size: 12 }, signal), [query, status, page])
  );
  const canEdit = isContentManager && !isAdmin;

  return (
    <section>
      <PageHeader
        title={<BilingualText vi="Ngân hàng câu hỏi" en="Question Bank" />}
        description={
          <BilingualText
            vi={
              canEdit
                ? 'Tạo và quản lý câu hỏi dùng trong các bài học và quiz của bạn.'
                : 'Xem câu hỏi do Content Manager biên soạn; nội dung được duyệt cùng khóa học.'
            }
            en={
              canEdit
                ? 'Create and manage questions for your lessons and quizzes.'
                : 'Review Content Manager questions as part of the course approval flow.'
            }
          />
        }
        actions={
          canEdit ? (
            <button onClick={() => setModal({})}>
              <BilingualText>{"+ Tạo câu hỏi"}</BilingualText>
            </button>
          ) : null
        }
      />

      {/* Filter Toolbar matching the exact ratio & style of AdminUsersPage */}
      <form
        className="admin-card"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search.trim());
          setPage(0);
        }}
        style={{
          position: 'relative',
          zIndex: 40,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input on the Left */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 280px',
            maxWidth: '380px',
            minWidth: '220px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            aria-label={bilingualLabel("Tìm câu hỏi", "Search questions")}
            placeholder={bilingualLabel("Tìm câu hỏi…", "Search questions…")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: '100%',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 36px 0 36px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              fontSize: '13px',
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setQuery('');
                setPage(0);
              }}
              aria-label={bilingualLabel("Xóa tìm kiếm", "Clear search")}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                padding: '4px',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                minHeight: '24px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Dropdown and Search Button on the Right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginLeft: 'auto',
            flexWrap: 'wrap',
          }}
        >
          <AdminFilterSelect
            ariaLabel={bilingualLabel("Trạng thái câu hỏi", "Question status")}
            value={status}
            options={QUESTION_STATUS_OPTIONS}
            onChange={(val) => {
              setStatus(val);
              setPage(0);
            }}
            minWidth="190px"
            align="right"
          />

          <button
            type="submit"
            style={{
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <Search size={15} strokeWidth={2.3} />
            <span><BilingualText>{"Tìm kiếm"}</BilingualText></span>
          </button>
        </div>
      </form>

      <ResourceState resource={resource}>
        {(data) => (
          <>
            {data.content?.length ? (
              <div className="admin-card table-scroll" style={{ padding: 0 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th><BilingualText>{"Câu hỏi"}</BilingualText></th>
                      <th><BilingualText>{"Loại"}</BilingualText></th>
                      <th><BilingualText>{"Độ khó"}</BilingualText></th>
                      <th><BilingualText>{"Chủ đề"}</BilingualText></th>
                      <th><BilingualText>{"Phiên bản"}</BilingualText></th>
                      <th><BilingualText>{"Trạng thái"}</BilingualText></th>
                      {canEdit && <th style={{ textAlign: 'right' }}><BilingualText>{"Thao tác"}</BilingualText></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((question) => (
                      <tr key={question.id}>
                        <td>
                          <strong><BilingualText vi={question.promptVi || question.prompt} en={question.prompt} /></strong>
                        </td>
                        <td>{question.questionType}</td>
                        <td>{question.difficulty}</td>
                        <td>{question.topic}</td>
                        <td>v{question.currentVersion}</td>
                        <td>
                          <span
                            className={`admin-badge ${
                              question.status === 'PUBLISHED'
                                ? 'admin-badge-success'
                                : question.status === 'ARCHIVED'
                                ? 'admin-badge-danger'
                                : 'admin-badge-warning'
                            }`}
                          >
                            <BilingualText>{question.status}</BilingualText>
                          </span>
                        </td>
                        {canEdit && (
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <AdminActionGroup>
                              <AdminActionButton tone="edit" icon={Pencil} onClick={() => setModal(question)}>
                                <BilingualText>{"Sửa"}</BilingualText>
                              </AdminActionButton>
                            </AdminActionGroup>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <AdminPagination
                  currentPage={page + 1}
                  pageSize={12}
                  totalItems={data.totalElements ?? data.content.length}
                  onPageChange={(nextPage) => setPage(nextPage - 1)}
                />
              </div>
            ) : (
              <EmptyState title={bilingualLabel("Chưa có câu hỏi phù hợp", "No matching questions")} />
            )}
          </>
        )}
      </ResourceState>

      <section className="admin-card question-version-note">
        <h2><BilingualText>{"Phiên bản câu hỏi"}</BilingualText></h2>
        <p className="muted">
          <BilingualText>{"Chỉnh sửa câu hỏi đã được dùng trong quiz sẽ tạo phiên bản mới. Lịch sử làm bài luôn giữ bản chụp câu hỏi ban đầu."}</BilingualText>
        </p>
        <span className="badge"><BilingualText>{"Lịch sử được bảo toàn"}</BilingualText></span>
      </section>

      {canEdit && modal && (
        <Modal
          title={modal.id ? bilingualLabel("Chỉnh sửa câu hỏi") : bilingualLabel("Tạo câu hỏi")}
          onClose={() => setModal(null)}
        >
          {modal.id ? (
            <QuestionEdit
              id={modal.id}
              onCancel={() => setModal(null)}
              onSaved={() => {
                setModal(null);
                resource.reload();
              }}
            />
          ) : (
            <QuestionForm
              onCancel={() => setModal(null)}
              onSave={async (body) => {
                await contentService.create('questions', body);
                setModal(null);
                resource.reload();
              }}
            />
          )}
        </Modal>
      )}
    </section>
  );
}

function QuestionEdit({ id, onCancel, onSaved }) {
  const resource = useAsyncResource(useCallback((signal) => contentService.get('questions', id, signal), [id]));
  return (
    <ResourceState resource={resource}>
      {(question) => (
        <QuestionForm
          initial={question}
          onCancel={onCancel}
          onSave={async (body) => {
            await contentService.update('questions', id, body);
            onSaved();
          }}
        />
      )}
    </ResourceState>
  );
}

export function AdminQuizBuilderPage() {
  const { quizId } = useParams();
  const resource = useAsyncResource(useCallback((signal) => contentService.get('quizzes', quizId, signal), [quizId]));
  return <ResourceState resource={resource}>{(quiz) => <QuizBuilder key={quiz.id} quiz={quiz} reload={resource.reload} />}</ResourceState>;
}

function QuizBuilder({ quiz, reload }) {
  const { isAdmin, isContentManager } = useAuth();
  const [edit, setEdit] = useState(false),
    [adding, setAdding] = useState(false),
    [creatingQuestion, setCreatingQuestion] = useState(() => new URLSearchParams(window.location.search).has('newQuestion')),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const navigate = useNavigate();
  const questions = quiz.questions || [];
  const canEdit = isContentManager && !isAdmin && ['DRAFT', 'REJECTED'].includes(quiz.courseStatus);
  const lessonResource = useAsyncResource(
    useCallback((signal) => (quiz.lessonId ? contentService.get('lessons', quiz.lessonId, signal) : Promise.resolve(null)), [quiz.lessonId])
  );
  const hasLinkedQuiz = lessonResource.data?.activities?.some((activity) => activity.activityType === 'QUIZ' && Number(activity.quizId) === Number(quiz.id));
  const basePath = isAdmin ? '/admin' : '/content';
  const breadcrumbItems =
    isContentManager && !isAdmin
      ? [
          { to: '/content/courses', label: bilingualLabel('Khóa học', 'Courses') },
          ...(quiz.courseId ? [{ to: `/content/courses/${quiz.courseId}?step=curriculum`, label: bilingualLabel('Cấu trúc khóa học', 'Course curriculum') }] : []),
          ...(quiz.lessonId ? [{ to: `/content/lessons/${quiz.lessonId}`, label: bilingualLabel('Bài học', 'Lesson') }] : []),
          { label: quiz.title },
        ]
      : [{ to: `${basePath}/quizzes`, label: 'Quiz' }, { label: quiz.title }];
  const parentUrl = quiz.lessonId ? `${basePath}/lessons/${quiz.lessonId}` : quiz.courseId ? `${basePath}/courses/${quiz.courseId}?step=curriculum` : `${basePath}/courses`;
  function closeQuestionDialog() {
    setCreatingQuestion(false);
    if (new URLSearchParams(window.location.search).has('newQuestion')) navigate(`${basePath}/quizzes/${quiz.id}`, { replace: true });
  }
  async function attachQuiz() {
    await contentService.addActivity(quiz.lessonId, {
      activityType: 'QUIZ',
      title: quiz.title,
      titleVi: quiz.titleVi,
      instruction: 'Complete this lesson quiz.',
      contentJson: {},
      isRequired: true,
      maxScore: 0,
      status: 'PUBLISHED',
      quizId: quiz.id,
      grammarTopicIds: [],
    });
    lessonResource.reload();
  }
  async function mutate(action) {
    setBusy(true);
    setError('');
    try {
      await action();
      setMessage(bilingualLabel('Đã lưu thay đổi.', 'Changes saved.'));
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title={<BilingualText vi="Trình tạo Quiz" en="Quiz Builder" />}
        description={<BilingualText vi={quiz.titleVi || quiz.title} en={quiz.title} />}
        actions={
          <>
            <Link className="button secondary" to={parentUrl}>
              <BilingualText>{quiz.lessonId ? "← Quay lại bài học" : "← Quay lại khóa học"}</BilingualText>
            </Link>
            <Link className="button secondary" to={`${basePath}/quizzes/${quiz.id}/preview`}>
              <BilingualText>{"Xem trước quiz"}</BilingualText>
            </Link>
          </>
        }
      />
      {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
      {message && <Notice kind="success"><BilingualText>{message}</BilingualText></Notice>}
      <section className="admin-card">
        <div className="builder-heading">
          <h2><BilingualText>{"Cấu hình chung"}</BilingualText></h2>
          <button className="secondary" disabled={!canEdit} onClick={() => setEdit(true)}>
            <BilingualText>{"Chỉnh sửa"}</BilingualText>
          </button>
        </div>
        <div className="quiz-config-grid">
          <div>
            <small><BilingualText>{"Điểm đạt"}</BilingualText></small>
            <strong>{quiz.passingScore}%</strong>
          </div>
          <div>
            <small><BilingualText>{"Số lần tối đa"}</BilingualText></small>
            <strong><BilingualText>{quiz.maxAttempts || 'Không giới hạn'}</BilingualText></strong>
          </div>
          <div>
            <small><BilingualText>{"Giới hạn thời gian"}</BilingualText></small>
            <strong><BilingualText>{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} phút` : 'Không giới hạn'}</BilingualText></strong>
          </div>
          <div>
            <small><BilingualText>{"Xáo trộn câu hỏi"}</BilingualText></small>
            <strong><BilingualText>{quiz.randomizeQuestions ? 'Bật' : 'Tắt'}</BilingualText></strong>
          </div>
        </div>
      </section>
      <section className="admin-card">
        <p><Link className="text-link" to={parentUrl}>← Quay lại {quiz.lessonId ? "bài học" : "khóa học"}</Link></p>
        {quiz.lessonId && (
          <div className="actions">
            <span>{hasLinkedQuiz ? "Quiz đã gắn vào bài học." : "Sau khi xuất bản quiz, gắn nó vào bài học."}</span>
            {canEdit && quiz.status === "PUBLISHED" && !hasLinkedQuiz && <button disabled={busy} onClick={() => mutate(attachQuiz)}>Gắn quiz vào bài học</button>}
          </div>
        )}
      </section>
      <div className="builder-heading">
        <h2><BilingualText>{"Câu hỏi và đáp án"}</BilingualText></h2>
        <div className="actions">
          <button className="secondary" disabled={!canEdit} onClick={() => setCreatingQuestion(true)}>
            <BilingualText>{"+ Tạo câu hỏi và đáp án"}</BilingualText>
          </button>
          <button disabled={!canEdit} onClick={() => setAdding(true)}>
            <BilingualText>{"+ Thêm từ ngân hàng"}</BilingualText>
          </button>
        </div>
      </div>
      {questions.length ? (
        questions.map((question, index) => (
          <div className="list-row" key={question.questionId}>
            <strong>
              <span className="badge">{index + 1}</span> <BilingualText vi={question.promptVi || question.prompt} en={question.prompt} />
            </strong>
            <div className="actions">
              <label className="quiz-points">
                <BilingualText>{"Điểm"}</BilingualText>
                <input
                  aria-label={`Điểm câu ${index + 1}`}
                  disabled={!canEdit}
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  defaultValue={question.points}
                  key={`${question.questionId}-${question.points}`}
                  onBlur={(event) => {
                    const points = Number(event.target.value);
                    if (points !== Number(question.points) && points > 0) mutate(() => contentService.addQuestion(quiz.id, question.questionId, points));
                  }}
                />
              </label>
              <button className="secondary" disabled={!canEdit || busy || index === 0} aria-label={`Đưa câu ${index + 1} lên`} onClick={() => mutate(() => contentService.reorder(`quizzes/${quiz.id}/questions`, moveItem(questions.map((item) => item.questionId), index, -1)))}>↑</button>
              <button className="secondary" disabled={!canEdit || busy || index === questions.length - 1} aria-label={`Đưa câu ${index + 1} xuống`} onClick={() => mutate(() => contentService.reorder(`quizzes/${quiz.id}/questions`, moveItem(questions.map((item) => item.questionId), index, 1)))}>↓</button>
              <button className="secondary" disabled={!canEdit || busy} aria-label={`Gỡ câu ${index + 1}`} onClick={() => mutate(() => contentService.removeQuestion(quiz.id, question.questionId))}>×</button>
            </div>
          </div>
        ))
      ) : (
        <EmptyState title={<BilingualText vi="Thêm câu hỏi đầu tiên" en="Add your first question" />} />
      )}
      <section className="admin-card publication-checks">
        <div>
          <h2><BilingualText>{"Kiểm tra xuất bản"}</BilingualText></h2>
          <p>{questions.length ? '✓' : '○'}<BilingualText>{"Có ít nhất một câu hỏi"}</BilingualText></p>
          <p>{questions.every((item) => item.status === 'PUBLISHED') && questions.length ? '✓' : '○'}<BilingualText>{"Các câu hỏi đã xuất bản"}</BilingualText></p>
          <p><BilingualText>{"✓ Điểm đạt:"}</BilingualText>{quiz.passingScore}%</p>
          <small className="muted"><BilingualText>{"Trạng thái hiện tại:"}</BilingualText><BilingualText>{quiz.status}</BilingualText></small>
        </div>
        <div className="actions">
          <button disabled={!canEdit || busy || quiz.status === 'PUBLISHED' || questions.length === 0} onClick={() => mutate(() => contentService.status('quizzes', quiz.id, 'PUBLISHED'))}><BilingualText>{"Xuất bản quiz"}</BilingualText></button>
          {quiz.status === 'PUBLISHED' && <button className="secondary" disabled={!canEdit || busy} onClick={() => mutate(() => contentService.status('quizzes', quiz.id, 'DRAFT'))}><BilingualText>{"Chuyển về bản nháp"}</BilingualText></button>}
        </div>
      </section>
      {edit && (
        <Modal title={bilingualLabel("Cấu hình quiz")} onClose={() => setEdit(false)}>
          <ContentForm kind="quizzes" initial={quiz} onCancel={() => setEdit(false)} onSave={async (body) => { await contentService.update('quizzes', quiz.id, body); setEdit(false); reload(); }} />
        </Modal>
      )}
      {adding && (
        <Modal title={bilingualLabel("Chọn từ ngân hàng câu hỏi")} onClose={() => setAdding(false)}>
          <QuestionPicker selected={questions.map((item) => item.questionId)} onAdd={async (id) => { await contentService.addQuestion(quiz.id, id, 1); setAdding(false); reload(); }} />
        </Modal>
      )}
      {canEdit && creatingQuestion && (
        <Modal title={bilingualLabel("Tạo câu hỏi cho quiz")} onClose={closeQuestionDialog}>
          <QuestionForm initial={{ status: "PUBLISHED" }} onCancel={closeQuestionDialog} onSave={async (body) => { const question = await contentService.create("questions", body); await contentService.addQuestion(quiz.id, question.id, 1); closeQuestionDialog(); reload(); }} />
        </Modal>
      )}
    </section>
  );
}

function QuestionPicker({ selected, onAdd }) {
  const [search, setSearch] = useState(''), [page, setPage] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const resource = useAsyncResource(useCallback((signal) => contentService.list('questions', { q: search, page, size: 10, status: 'PUBLISHED' }, signal), [search, page]));
  return (
    <>
      <input aria-label={bilingualLabel("Tìm câu hỏi trong ngân hàng", "Search question bank")} placeholder={bilingualLabel("Tìm câu hỏi…")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} />
      {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
      <ResourceState resource={resource}>
        {(data) => (
          <>
            {data.content?.map((question) => (
              <div className="list-row" key={question.id}>
                <div>
                  <strong><BilingualText vi={question.promptVi || question.prompt} en={question.prompt} /></strong>
                  <small>{question.questionType} · v{question.currentVersion}</small>
                </div>
                <button disabled={busy || selected.includes(question.id)} onClick={async () => { setBusy(true); try { await onAdd(question.id); } catch (err) { setError(err.message); } finally { setBusy(false); } }}>
                  <BilingualText>{selected.includes(question.id) ? 'Đã thêm' : 'Thêm'}</BilingualText>
                </button>
              </div>
            ))}
            {!data.content?.length && (
              <EmptyState title={<BilingualText vi="Chưa có câu hỏi đã xuất bản" en="No published questions yet" />}>
                <Link className="text-link" to={`${basePath}/questions`}><BilingualText>{"Mở ngân hàng câu hỏi →"}</BilingualText></Link>
              </EmptyState>
            )}
            <AdminPagination currentPage={page + 1} pageSize={10} totalItems={data.totalElements ?? data.content?.length ?? 0} onPageChange={(nextPage) => setPage(nextPage - 1)} />
          </>
        )}
      </ResourceState>
    </>
  );
}

export function AdminQuizPreviewPage() {
  const { quizId } = useParams();
  const resource = useAsyncResource(useCallback(async (signal) => {
    const [quiz, questions] = await Promise.all([contentService.get('quizzes', quizId, signal), contentService.preview('quizzes', quizId, signal)]);
    return { quiz, questions };
  }, [quizId]));
  return <ResourceState resource={resource}>{({ quiz, questions }) => <QuizPreview key={quiz.id} quiz={quiz} questions={questions} />}</ResourceState>;
}

function QuizPreview({ quiz, questions }) {
  const { isAdmin } = useAuth();
  const [index, setIndex] = useState(0), [answers, setAnswers] = useState({});
  return (
    <section>
      <PageHeader title={<BilingualText vi={quiz.titleVi || quiz.title} en={quiz.title} />} description={<BilingualText vi="Xem trước trải nghiệm học viên." en="Preview learner experience." />} actions={<Link className="button secondary" to={`${isAdmin ? '/admin' : '/content'}/quizzes/${quiz.id}`}><BilingualText>{"← Quiz Builder"}</BilingualText></Link>} />
      <Notice><BilingualText>{"Chế độ xem trước không tạo lượt làm bài, chấm điểm hoặc cập nhật dữ liệu."}</BilingualText></Notice>
      {questions.length ? (
        <div className="quiz-workspace">
          <article className="quiz-question card">
            <p className="eyebrow"><BilingualText>{"Câu"}</BilingualText>{index + 1} / {questions.length}</p>
            <h2>{questions[index].promptVi || questions[index].prompt}</h2>
            {questions[index].imageUrl && <ContentImage className="question-media" src={questions[index].imageUrl} alt={bilingualLabel("Hình minh họa câu hỏi")} />}
            <MediaPlayer audioUrl={questions[index].audioUrl} />
            <QuestionInput question={questions[index]} answer={answers[index]} onChange={(answer) => setAnswers({ ...answers, [index]: answer })} />
          </article>
          <div className="lesson-navigation">
            <button className="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}><BilingualText>{"← Trước"}</BilingualText></button>
            <button disabled={index === questions.length - 1} onClick={() => setIndex(index + 1)}><BilingualText>{"Tiếp theo →"}</BilingualText></button>
          </div>
        </div>
      ) : (
        <EmptyState title={<BilingualText vi="Quiz chưa có câu hỏi" en="Quiz has no questions yet" />} />
      )}
    </section>
  );
}

export default AdminQuestionBankPage;

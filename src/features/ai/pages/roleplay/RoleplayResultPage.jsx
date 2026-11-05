import { BilingualText, bilingualLabel, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/shared/components/common/Ui';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { aiRoleplayService } from '@/features/ai/api/aiRoleplayService';
import { vocabularyService } from '@/features/vocabulary/api/vocabularyService';
import axiosClient from '@/shared/api/axiosClient';

export function RoleplayResultPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isVi = (i18n?.resolvedLanguage || i18n?.language || 'vi').startsWith('vi');
  const bLabel = useBilingualLabel();
  const navigate = useNavigate();
  const [result, setResult] = useState(() => aiRoleplayService.getResult(id));
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const resolvedScenarioId = aiRoleplayService.resolveScenarioId(id);
    const initial = aiRoleplayService.getResult(id);
    setResult(initial);

    if (id) {
      const syncKey = `hola_rp_synced_${id}_${initial?.sessionId || 'default'}`;
      if (!sessionStorage.getItem(syncKey)) {
        sessionStorage.setItem(syncKey, '1');
        aiRoleplayService.syncCompletion(resolvedScenarioId, initial?.totalScore || 85).catch(() => {});
      }

      if (localStorage.getItem('token')) {
        axiosClient.get(`/api/ai/sessions/${id}`)
          .then(res => {
            if (!isCurrent) return;
            const sessionData = res?.result ?? res;
            if (sessionData) {
              setResult(prev => {
                const score = typeof sessionData.score === 'number' ? sessionData.score : (typeof sessionData.totalScore === 'number' ? sessionData.totalScore : prev?.totalScore ?? 85);
                const scenario = aiRoleplayService.getScenario(sessionData.scenarioId || resolvedScenarioId);
                return {
                  ...(prev || aiRoleplayService.buildRoleplayResult(resolvedScenarioId)),
                  sessionId: sessionData.id || id,
                  scenarioId: sessionData.scenarioId || resolvedScenarioId,
                  scenarioTitle: sessionData.title || scenario?.title || prev?.scenarioTitle,
                  totalScore: score,
                  rating: score >= 90 ? 'Xuất sắc' : score >= 80 ? 'Rất tốt' : score >= 65 ? 'Khá tốt' : score >= 50 ? 'Đạt yêu cầu' : 'Cần cố gắng thêm',
                  aiFeedback: sessionData.feedbackSummary || prev?.aiFeedback,
                };
              });
            }
          })
          .catch(() => {});
      }
    }
    return () => { isCurrent = false; };
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveExpression = async (item) => {
    try {
      await vocabularyService.add({
        word: item.phrase,
        meaning: item.meaning,
        notes: `Biểu thức Roleplay: ${result.scenarioTitle}`,
      });
      showToast(`Đã lưu "${item.phrase}" vào Sổ từ vựng!`);
    } catch (e) {
      showToast(`Lưu từ vựng: ${e.message || 'Không thể lưu từ vựng.'}`);
    }
  };

  const [reviewRating, setReviewRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const resolvedId = aiRoleplayService.resolveScenarioId(id);
      const session = aiRoleplayService.getRoleplaySession(resolvedId);
      const effectiveSessionId = session?.backendSessionId || result?.sessionId || `session-${id}`;
      await axiosClient.post('/api/ai/reviews', {
        sessionId: effectiveSessionId,
        scenarioId: result?.scenarioId || id,
        scenarioTitle: result?.scenarioTitle || 'Kịch bản Roleplay',
        rating: reviewRating,
        userFeedback: feedbackComment.trim() || (selectedIssues.length > 0 ? selectedIssues.join(', ') : 'Đánh giá phiên Roleplay hoàn thành tốt.'),
        taggedIssues: selectedIssues,
      });
      setIsReviewSubmitted(true);
      showToast('Đã gửi đánh giá thành công! Dữ liệu đã đồng bộ lên Admin kiểm toán.');
    } catch (err) {
      console.warn('[Roleplay Result] Backend review post failed, syncing fallback:', err);
      try {
        const stored = JSON.parse(localStorage.getItem('hola_admin_ai_reviews_v1') || '[]');
        stored.unshift({
          id: `rev-${Date.now()}`,
          sessionId: result?.sessionId || `session-${id}`,
          userIdentifier: 'learner (bạn)',
          scenarioId: result?.scenarioId || id,
          scenarioTitle: result?.scenarioTitle || 'Kịch bản Roleplay',
          rating: reviewRating,
          userFeedback: feedbackComment.trim() || (selectedIssues.length > 0 ? selectedIssues.join(', ') : 'Đánh giá phiên Roleplay hoàn thành tốt.'),
          taggedIssues: selectedIssues,
          hasPermissionToView: true,
          reviewedByAdmin: false,
          status: 'FLAGGED',
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        });
        localStorage.setItem('hola_admin_ai_reviews_v1', JSON.stringify(stored));
      } catch (ignored) {}
      setIsReviewSubmitted(true);
      showToast('Đã ghi nhận đánh giá của bạn vào hệ thống!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRetry = () => {
    const resolvedId = aiRoleplayService.resolveScenarioId(id);
    aiRoleplayService.resetRoleplaySession(resolvedId);
    navigate(`/ai-roleplay/${resolvedId}`);
  };

  if (!result) return <EmptyState title={bLabel("Chưa có kết quả phiên hội thoại", "No conversation session results")} description={bLabel("Hoàn thành một cuộc trò chuyện để xem đánh giá.", "Complete a conversation to view the evaluation.")}><Link className="button" to="/ai-scenarios"><BilingualText vi="Chọn kịch bản →" en="Choose scenario →" /></Link></EmptyState>;

  return (
    <div className="p4-container roleplay-result-page w-full max-w-full px-0 py-6 space-y-8">
      {toastMessage && (
        <div className="p4-toast">
          
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-forest)', marginBottom: '16px' }}>
        <Link to="/ai-scenarios" style={{ color: 'var(--color-red-hover)', textDecoration: 'none' }}><BilingualText vi="← Danh sách kịch bản" en="← Scenario List" /></Link>
        <span>/</span>
        <span>{result.scenarioTitle}</span>
        <span>/</span>
        <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}><BilingualText vi="Kết quả đánh giá" en="Evaluation Results" /></span>
      </nav>

      {/* Screen Title */}
      <div style={{ marginBottom: '24px' }}>
        <span className="p4-header-badge"><BilingualText vi="Đánh giá phiên hội thoại" en="Conversation Evaluation" /></span>
        <h1 className="p4-title"><BilingualText vi="Kết quả phiên Roleplay" en="Roleplay Session Results" /></h1>
        <p className="p4-subtitle"><BilingualText vi="Kịch bản: " en="Scenario: " /><strong>{result.scenarioTitle}</strong> <BilingualText vi="• Hoàn thành ngày " en="• Completed on " />{result.completedDate}</p>
      </div>

      {/* Hero Scorecard */}
      <div className="result-card-hero">
        <div className="score-circle-box">
          <div className="score-number">{result.totalScore}</div>
          <div className="score-rating"><BilingualText vi="Xếp loại: " en="Rating: " />{isVi ? (result.ratingVi || result.rating) : (result.ratingEn || result.rating)}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-forest)', marginTop: '6px' }}><BilingualText vi="Nhiệm vụ: " en="Tasks: " />{result.completedTasksRatio}</div>
        </div>

        <div>
          <h2 style={{ margin: '0 0 12px', fontSize: '20px', color: 'var(--color-ink)' }}><BilingualText vi="Chi tiết các chỉ số năng lực:" en="Competency Index Details:" /></h2>

          <div className="score-breakdown-grid">
            <div className="score-bar-item">
              <div className="score-bar-header">
                <span><BilingualText vi="Độ lưu loát (Fluency)" en="Fluency" /></span>
                <span>{result.stats.fluency}%</span>
              </div>
              <div className="score-progress-track">
                <div className="score-progress-fill" style={{ width: `${result.stats.fluency}%` }} />
              </div>
            </div>

            <div className="score-bar-item">
              <div className="score-bar-header">
                <span><BilingualText vi="Vốn từ vựng (Vocabulary)" en="Vocabulary" /></span>
                <span>{result.stats.vocabulary}%</span>
              </div>
              <div className="score-progress-track">
                <div className="score-progress-fill" style={{ width: `${result.stats.vocabulary}%` }} />
              </div>
            </div>

            <div className="score-bar-item">
              <div className="score-bar-header">
                <span><BilingualText vi="Ngữ pháp (Grammar)" en="Grammar" /></span>
                <span>{result.stats.grammar}%</span>
              </div>
              <div className="score-progress-track">
                <div className="score-progress-fill" style={{ width: `${result.stats.grammar}%` }} />
              </div>
            </div>

            <div className="score-bar-item">
              <div className="score-bar-header">
                <span><BilingualText vi="Phù hợp văn hóa (Culture)" en="Cultural Nuance" /></span>
                <span>{result.stats.culture}%</span>
              </div>
              <div className="score-progress-track">
                <div className="score-progress-fill" style={{ width: `${result.stats.culture}%` }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)', fontSize: '13.5px', color: 'var(--color-ink)', lineHeight: 1.6 }}>
            <strong><BilingualText vi="Nhận xét từ AI Tutor:" en="Feedback from AI Tutor:" /></strong> {isVi ? (result.aiFeedbackVi || result.aiFeedback) : (result.aiFeedbackEn || result.aiFeedback)}
          </div>
        </div>
      </div>

      {/* 2-Column Section: Corrections & Practiced Expressions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-9">
        {/* Errors & Native Suggestions */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 16px', color: 'var(--color-red-hover)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BilingualText vi="Lỗi cần sửa & Cách nói tự nhiên hơn" en="Corrections & More Natural Expressions" /></h2>

          <div>
            {result.corrections?.map((cor, idx) => (
              <div key={idx} className="correction-card">
                <div className="correction-original"><BilingualText vi='✕ Bạn đã nói: "' en='✕ You said: "' />{cor.original}"</div>
                <div className="correction-native"><BilingualText vi='✓ Người bản xứ nói: "' en='✓ Native speakers say: "' />{cor.nativeSuggestion}"</div>
                <div className="correction-reason"><span className="font-bold text-amber-800 mr-1"><BilingualText vi="Lý do:" en="Reason:" /></span> {isVi ? (cor.reasonVi || cor.reason) : (cor.reasonEn || cor.reason)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Practiced Key Expressions */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 16px', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BilingualText vi="Biểu thức & Cấu trúc đã luyện tập" en="Practiced Expressions & Structures" /></h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.practicedExpressions?.map((expr, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '12px' }}
              >
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>"{expr.phrase}"</strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-red-hover)' }}>{expr.meaning}</div>
                </div>

                <button
                  className="message-action-btn"
                  onClick={() => handleSaveExpression(expr)}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-gold)', color: 'var(--color-red-hover)' }}
                >
                  <BilingualText vi="Lưu từ" en="Save word" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learner AI Review & Quality Feedback Card */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '24px', marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 10px', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⭐</span>
          <BilingualText vi="Đánh giá chất lượng hội thoại của AI" en="Rate AI Conversation Quality" />
        </h2>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--color-forest)' }}>
          <BilingualText vi="Ý kiến đánh giá của bạn được gửi trực tiếp đến trang Kiểm toán AI của Quản trị viên để cải tiến kịch bản." en="Your review will be synchronized directly with the Admin AI Quality Audit console." />
        </p>

        {isReviewSubmitted ? (
          <div style={{ padding: '14px 18px', background: 'var(--color-cream)', borderRadius: '12px', border: '1px solid var(--color-border)', color: 'var(--color-ink)', fontSize: '13.5px', fontWeight: 600 }}>
            🎉 <BilingualText vi="Cảm ơn bạn đã gửi đánh giá! Phản hồi của bạn đã được đồng bộ lên hệ thống quản trị chất lượng AI." en="Thank you for your review! Your feedback has been synchronized with the Admin AI audit system." />
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Star Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>
                <BilingualText vi="Mức độ hài lòng:" en="Satisfaction:" />
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '24px',
                      color: star <= reviewRating ? '#f59e0b' : '#cbd5e1',
                      padding: '2px',
                    }}
                    title={isVi ? `${star} sao` : `${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 600, marginLeft: '6px' }}>
                <BilingualText
                  vi={reviewRating === 5 ? '⭐⭐⭐⭐⭐ Rất tự nhiên' : reviewRating === 4 ? '⭐⭐⭐⭐ Tốt' : reviewRating === 3 ? '⭐⭐⭐ Bình thường' : reviewRating === 2 ? '⭐⭐ Cần cải thiện' : '⭐ Chưa đạt'}
                  en={reviewRating === 5 ? '⭐⭐⭐⭐⭐ Very natural' : reviewRating === 4 ? '⭐⭐⭐⭐ Good' : reviewRating === 3 ? '⭐⭐⭐ Fair' : reviewRating === 2 ? '⭐⭐ Needs improvement' : '⭐ Poor'}
                />
              </span>
            </div>

            {/* Quick Feedback Tags */}
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-ink)', display: 'block', marginBottom: '8px' }}>
                <BilingualText vi="Nhận xét chi tiết (chọn nếu có):" en="Key observations (optional):" />
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Giao tiếp tự nhiên',
                  'Phản xạ nhanh & nhạy',
                  'Đúng ngữ cảnh văn hóa',
                  'Từ vựng phong phú',
                  'Xưng hô chuẩn mực',
                  'Cần sửa lỗi ngữ pháp kỹ hơn',
                  'Cần bổ sung giải thích từ vựng',
                ].map((tag) => {
                  const isSelected = selectedIssues.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedIssues(curr =>
                          isSelected ? curr.filter(t => t !== tag) : [...curr, tag]
                        );
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: isSelected ? '1px solid var(--color-red)' : '1px solid var(--color-border)',
                        background: isSelected ? 'var(--color-red-soft)' : 'var(--color-cream)',
                        color: isSelected ? 'var(--color-red)' : 'var(--color-ink)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}<BilingualText>{tag}</BilingualText>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback textarea */}
            <div>
              <textarea
                rows={2}
                placeholder={isVi ? "Ý kiến hoặc góp ý thêm của bạn về lời thoại và phản hồi của nhân vật AI..." : "Additional feedback or suggestions about the AI character's dialogue and responses..."}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                className="button"
                disabled={isSubmittingReview}
                style={{
                  fontSize: '13px',
                  padding: '10px 22px',
                  background: 'var(--color-red-hover)',
                  borderColor: 'var(--color-red-hover)',
                }}
              >
                <BilingualText vi={isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá cho Admin'} en={isSubmittingReview ? 'Submitting...' : 'Submit review to Admin'} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Action Footer: Retry & Next Scenario */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-cream)', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '20px 24px', flexWrap: 'wrap', gap: '16px' }}>
        <button className="button secondary" onClick={handleRetry} style={{ fontSize: '14px', padding: '12px 20px' }}><BilingualText vi="Thử lại kịch bản này" en="Retry this scenario" /></button>

        {result.nextScenario && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-forest)' }}><BilingualText vi="Kịch bản đề xuất tiếp theo: " en="Recommended next scenario: " /><strong>{isVi ? (result.nextScenario.titleVi || result.nextScenario.title) : (result.nextScenario.titleEn || result.nextScenario.title)}</strong>
            </span>
            <Link
              to={`/ai-roleplay/${result.nextScenario.id}`}
              className="button"
              style={{ background: 'var(--color-red-hover)', borderColor: 'var(--color-red-hover)', fontSize: '14px', padding: '12px 22px' }}
            ><BilingualText vi="Tiếp tục kịch bản mới" en="Continue to next scenario" /></Link>
          </div>
        )}
      </div>
    </div>
  );
}

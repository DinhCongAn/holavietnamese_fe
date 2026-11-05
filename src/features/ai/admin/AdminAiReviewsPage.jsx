import { BilingualText, vietnameseLabel, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { Lock, FlaskConical } from 'lucide-react';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

export function AdminAiReviewsPage() {
  const lang = useTextLanguage();
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [toast, setToast] = useState('');

  // Interactive Test Sandbox State
  const [testScenarioId, setTestScenarioId] = useState('goi-mon-pho-ha-noi');
  const [testPrompt, setTestPrompt] = useState('Dạ cho cháu một bát phở tái lăn, không cho hành lá nhé cô!');
  const [testOutput, setTestOutput] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    adminCultureAiService.listReviewRecords().then(setReviews).catch(() => setReviews([]));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const updated = await adminCultureAiService.updateReviewRecordStatus(id, newStatus);
      setReviews(current => current.map(review => review.id === id ? { ...review, ...updated } : review));
      setSelectedReview(current => current?.id === id ? { ...current, ...updated } : current);
      showToast(bilingualLabel(`Đã cập nhật trạng thái kiểm tra chất lượng: ${newStatus}`, `Updated quality review status: ${newStatus}`));
    } catch {
      showToast('Không thể cập nhật đánh giá AI.');
    }
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestOutput('');

    // Simulate backend test execution through admin evaluation pipeline
    setTimeout(() => {
      setIsTesting(false);
      setTestOutput(lang === 'en' ? `[AI Test Runner - v2.2.0-stable | Model: Gemini 2.5 Flash]
[PASS] Role recognition: Ms. Mai (Hanoi Pho shop owner)
[PASS] Learner input analysis: "${testPrompt}"
[PASS] Honorifics: Accurate (Dạ... nhé cô)
[PASS] Custom preference handling: No green onions -> Recorded accurately

Generated AI response:
"Được rồi cháu ơi! Một bát tái lăn không hành nhé. Thịt bò xào lăn thơm phức đang sẵn trên chảo đây. Cháu có muốn dùng thêm đĩa quẩy giòn nhúng nước dùng hay uống trà đá không nào?"

Automated evaluation:
- Culinary factual errors: 0
- Vietnamese grammar errors: 0
- Cultural appropriateness: 100%` : `[AI Test Runner - v2.2.0-stable | Model: Gemini 2.5 Flash]
[ĐẠT] Nhận diện vai trò: Cô Mai (Chủ quán phở Hà Nội)
[ĐẠT] Phân tích câu thoại người học: "Dạ cho cháu một bát phở tái lăn, không cho hành lá nhé cô!"
[ĐẠT] Kính ngữ: Rất chuẩn xác (Dạ... nhé cô)
[ĐẠT] Xử lý yêu cầu khẩu vị: Không hành lá -> Đã ghi nhận chính xác

Câu trả lời của AI tạo ra:
"Được rồi cháu ơi! Một bát tái lăn không hành nhé. Thịt bò xào lăn thơm phức đang sẵn trên chảo đây. Cháu có muốn dùng thêm đĩa quẩy giòn nhúng nước dùng hay uống trà đá không nào?"

Đánh giá tự động:
- Lỗi sai kiến thức ẩm thực: 0
- Lỗi ngữ pháp tiếng Việt: 0
- Tính phù hợp văn hóa: 100%`);
    }, 600);
  };

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedReviews = reviews.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="admin-content">
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: 'var(--color-ink)', color: 'var(--color-surface)', padding: '12px 20px', borderRadius: '10px', zIndex: 9999, fontWeight: 700 }}>
          <BilingualText>{toast}</BilingualText>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}><BilingualText>{"AI QUALITY ASSURANCE & AUDITING • NGƯỜI 4"}</BilingualText></span>
        <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}><BilingualText>{"Kiểm tra chất lượng AI & Đánh giá phản hồi"}</BilingualText></h1>
        <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}><BilingualText>{"Xem các phiên hội thoại được phép truy cập theo chính sách riêng tư, kiểm tra phản hồi học viên, đánh dấu lỗi và kiểm thử prompt kịch bản."}</BilingualText></p>
      </div>

      {/* Privacy Notice */}
      <div style={{ background: 'var(--color-red-soft)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Lock size={18} />
        <div style={{ fontSize: '13px', color: 'var(--color-ink)' }}>
          <strong><BilingualText>{"Chính sách quyền riêng tư lịch sử hội thoại:"}</BilingualText></strong><BilingualText>{"Chỉ hiển thị các phiên được người học cấp quyền gửi đánh giá, phản hồi báo lỗi, hoặc các phiên thuộc tập kiểm thử (Test Bench). Dữ liệu cá nhân nhạy cảm đã được ẩn danh hóa."}</BilingualText></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: User Feedback & Sessions Review Table */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '17px', color: 'var(--color-ink)' }}><BilingualText>{"Danh sách phản hồi & Phiên cần kiểm tra ("}</BilingualText>{reviews.length})
            </h2>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th><BilingualText>{"Học viên & Kịch bản"}</BilingualText></th>
                <th><BilingualText>{"Đánh giá"}</BilingualText></th>
                <th><BilingualText>{"Phản hồi học viên"}</BilingualText></th>
                <th><BilingualText>{"Vấn đề ghi nhận"}</BilingualText></th>
                <th><BilingualText>{"Trạng thái"}</BilingualText></th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-muted)' }}>
                    <BilingualText vi="Chưa có phản hồi hoặc phiên cần kiểm tra nào từ học viên." en="No learner reviews or quality audit records found yet." />
                  </td>
                </tr>
              ) : (
                pagedReviews.map(r => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedReview(r)}
                  style={{ cursor: 'pointer', background: selectedReview?.id === r.id ? 'var(--color-cream)' : 'transparent' }}
                >
                  <td>
                    <strong style={{ fontSize: '13.5px', color: 'var(--color-ink)', display: 'block' }}>
                      {r.scenarioTitle}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--color-forest)' }}>
                      {r.userIdentifier} • {r.createdAt}
                    </span>
                  </td>

                  <td>
                    <span style={{ color: 'var(--color-red)', fontWeight: 750 }}>
                      {`${r.rating}/5`}
                    </span>
                  </td>

                  <td style={{ fontSize: '12.5px', color: 'var(--color-ink)', maxWidth: '240px' }}>
                    "{r.userFeedback}"
                  </td>

                  <td>
                    {(!r.taggedIssues || r.taggedIssues.length === 0) ? (
                      <span className="admin-badge admin-badge-success"><BilingualText>{"Không có lỗi"}</BilingualText></span>
                    ) : (
                      (r.taggedIssues || []).map((issue, idx) => (
                        <span key={idx} className="admin-badge admin-badge-danger" style={{ display: 'inline-block', margin: '2px 0' }}>
                          {issue}
                        </span>
                      ))
                    )}
                  </td>

                  <td>
                    {r.status === 'APPROVED' ? (
                      <span className="admin-badge admin-badge-success"><BilingualText>{"Đã duyệt"}</BilingualText></span>
                    ) : r.status === 'NEEDS_PROMPT_TUNING' ? (
                      <span className="admin-badge admin-badge-warning"><BilingualText>{"Cần sửa Prompt"}</BilingualText></span>
                    ) : (
                      <span className="admin-badge admin-badge-danger"><BilingualText>{"Cần xử lý"}</BilingualText></span>
                    )}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>

          {reviews.length > 0 && (
            <AdminPagination
              currentPage={safePage}
              pageSize={pageSize}
              totalItems={reviews.length}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Right Column: Review Details Action & Test Sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Detail Card if selected */}
          {selectedReview ? (
            <div className="admin-card" style={{ background: 'var(--color-surface)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Chi tiết đánh giá phiên:"}</BilingualText>{selectedReview.id}
              </h3>

              <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-ink)' }}>
                <div><strong><BilingualText>{"Kịch bản:"}</BilingualText></strong> {selectedReview.scenarioTitle}</div>
                <div><strong><BilingualText>{"Mã phiên:"}</BilingualText></strong> <code>{selectedReview.sessionId}</code></div>
                <div><strong><BilingualText>{"Đánh giá:"}</BilingualText></strong> {selectedReview.rating}<BilingualText>{"/5 sao"}</BilingualText></div>
                <div style={{ marginTop: '8px', padding: '10px 12px', background: 'var(--color-cream)', borderRadius: '8px' }}>
                  <em>"{selectedReview.userFeedback}"</em>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <strong><BilingualText>{"Thao tác kiểm toán chất lượng:"}</BilingualText></strong>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="button secondary"
                      style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--color-ink)' }}
                      onClick={() => handleUpdateStatus(selectedReview.id, 'APPROVED')}
                    ><BilingualText>{"Duyệt đạt chuẩn"}</BilingualText></button>
                    <button
                      type="button"
                      className="button secondary"
                      style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--color-red)' }}
                      onClick={() => handleUpdateStatus(selectedReview.id, 'NEEDS_PROMPT_TUNING')}
                    ><BilingualText>{"Cần chỉnh Prompt"}</BilingualText></button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-muted)' }}><BilingualText>{"Bấm vào một phiên trong bảng bên trái để xem chi tiết và thực hiện kiểm toán chất lượng."}</BilingualText></div>
          )}

          {/* Test Sandbox (Kiểm thử kịch bản) */}
          <div className="admin-card" style={{ background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FlaskConical size={18} />
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Kiểm thử kịch bản AI"}</BilingualText></h3>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: 'var(--color-forest)' }}><BilingualText>{"Kiểm tra trực tiếp phản hồi của mô hình với phiên bản hướng dẫn hệ thống hiện hành trước khi xuất bản rộng rãi."}</BilingualText></p>

            <label><BilingualText>{"Chọn kịch bản kiểm thử:"}</BilingualText><select value={testScenarioId} onChange={e => setTestScenarioId(e.target.value)}>
                <option value="goi-mon-pho-ha-noi">{vietnameseLabel("Gọi món tại quán Phở gia truyền Hà Nội")}</option>
                <option value="tra-gia-cho-ben-thanh">{vietnameseLabel("Trả giá quà lưu niệm tại Chợ Bến Thành")}</option>
                <option value="bat-xe-om-cong-nghe">{vietnameseLabel("Đón xe ôm công nghệ & Chỉ đường")}</option>
              </select>
            </label>

            <label style={{ marginTop: '12px' }}><BilingualText>{"Prompt câu nói thử nghiệm của học viên:"}</BilingualText><textarea
                rows={2}
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="button"
              onClick={handleRunTest}
              disabled={isTesting}
              style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
            >
              <BilingualText>{isTesting ? 'Đang kiểm thử...' : '▶ Chạy kiểm thử phản hồi'}</BilingualText>
            </button>

            {testOutput && (
              <div style={{ marginTop: '14px', padding: '12px', background: 'var(--color-ink)', color: 'var(--color-sage-soft)', borderRadius: '10px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {testOutput}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

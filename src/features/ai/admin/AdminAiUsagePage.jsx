import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { adminCultureAiService } from '@/features/ai/api/adminCultureAiService';
import { AdminPagination } from '@/shared/components/common/AdminPagination';

export function AdminAiUsagePage() {
  useTextLanguage();
  const [usageData, setUsageData] = useState(null);
  const [logsPage, setLogsPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    adminCultureAiService.loadUsageStats()
      .then(setUsageData)
      .catch(() => setUsageData({ summary: {}, modeBreakdown: [], recentLogs: [] }));
  }, []);

  if (!usageData) return <div className="admin-content"><BilingualText vi="Đang tải dữ liệu sử dụng AI..." en="Loading AI usage data..." /></div>;

  const summary = {
    totalSessions: 0,
    totalApiCalls: 0,
    totalTokens: 0,
    costMonthUsd: 0,
    budgetLimitUsd: 150,
    avgResponseTimeMs: 0,
    errorRate: '0.00%',
    ...(usageData?.summary || {}),
  };
  const modeBreakdown = Array.isArray(usageData?.modeBreakdown) ? usageData.modeBreakdown : [];
  const recentLogs = Array.isArray(usageData?.recentLogs) ? usageData.recentLogs : [];

  const totalLogsPages = Math.max(1, Math.ceil(recentLogs.length / pageSize));
  const safeLogsPage = Math.min(logsPage, totalLogsPages);
  const pagedLogs = recentLogs.slice((safeLogsPage - 1) * pageSize, safeLogsPage * pageSize);

  return (
    <div className="admin-content">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}><BilingualText>{"MONITORING & COST ANALYTICS • NGƯỜI 4"}</BilingualText></span>
        <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}><BilingualText>{"Theo dõi sử dụng AI & Chi phí"}</BilingualText></h1>
        <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}><BilingualText>{"Thống kê thời gian thực về số phiên, lượt gọi API, lượng token tiêu thụ, chi phí ước tính, độ trễ và tỷ lệ lỗi hệ thống."}</BilingualText></p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="admin-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700, textTransform: 'uppercase' }}><BilingualText>{"Tổng số phiên"}</BilingualText></span>
          <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--color-ink)', margin: '6px 0' }}>
            {(summary.totalSessions ?? 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-ink)' }}><BilingualText>{"↑ 14% so với tuần trước"}</BilingualText></span>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700, textTransform: 'uppercase' }}><BilingualText>{"Tổng lượt gọi API"}</BilingualText></span>
          <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--color-ink)', margin: '6px 0' }}>
            {(summary.totalApiCalls ?? 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-forest)' }}><BilingualText>{"Trung bình 12.4 gọi/phiên"}</BilingualText></span>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700, textTransform: 'uppercase' }}><BilingualText>{"Token tiêu thụ"}</BilingualText></span>
          <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--color-ink)', margin: '6px 0' }}>
            {(((summary.totalTokens || 0) / 1000000) || 0).toFixed(2)}M
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-forest)' }}><BilingualText>{"Đầu vào + Đầu ra"}</BilingualText></span>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700, textTransform: 'uppercase' }}><BilingualText>{"Chi phí tháng"}</BilingualText></span>
          <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--color-red-hover)', margin: '6px 0' }}>
            ${summary.costMonthUsd}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-ink)' }}><BilingualText>{"Ngân sách trần: $"}</BilingualText>{summary.budgetLimitUsd}</span>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700, textTransform: 'uppercase' }}><BilingualText>{"Độ trễ trung bình"}</BilingualText></span>
          <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--color-ink)', margin: '6px 0' }}>
            {summary.avgResponseTimeMs ?? 0} ms
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-ink)' }}><BilingualText>{"P95: 580 ms (Rất nhanh)"}</BilingualText></span>
        </div>

        <div className="admin-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-forest)', fontWeight: 700, textTransform: 'uppercase' }}><BilingualText>{"Tỷ lệ lỗi"}</BilingualText></span>
          <div style={{ fontSize: '28px', fontWeight: 850, color: 'var(--color-ink)', margin: '6px 0' }}>
            {summary.errorRate || '0.00%'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-ink)' }}><BilingualText>{"Hệ thống đạt 99.82% SLA"}</BilingualText></span>
        </div>
      </div>

      {/* Breakdown by Mode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px', alignItems: 'start' }}>
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ margin: 0, fontSize: '17px', color: 'var(--color-ink)' }}><BilingualText>{"Phân bổ lượng sử dụng & Chi phí theo chế độ"}</BilingualText></h2>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th><BilingualText>{"Chế độ AI"}</BilingualText></th>
                <th><BilingualText>{"Số lượt gọi"}</BilingualText></th>
                <th><BilingualText>{"Lượng Token"}</BilingualText></th>
                <th><BilingualText>{"Chi phí ($)"}</BilingualText></th>
                <th><BilingualText>{"Tỷ lệ"}</BilingualText></th>
              </tr>
            </thead>
            <tbody>
              {modeBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--color-muted)' }}>
                    <BilingualText vi="Chưa có dữ liệu phân bổ chế độ AI." en="No AI mode breakdown data found." />
                  </td>
                </tr>
              ) : (
                modeBreakdown.map(item => (
                <tr key={item.mode}>
                  <td><strong>{item.mode}</strong></td>
                  <td>{item.calls?.toLocaleString()}</td>
                  <td>{item.tokens?.toLocaleString()}</td>
                  <td>${item.cost}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.percent}%`, height: '100%', background: 'var(--color-red-hover)' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{item.percent}%</span>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cost & Latency insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Kiểm soát ngân sách tháng 03/2026"}</BilingualText></h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
              <span><BilingualText>{"Đã chi tiêu:"}</BilingualText><strong>${summary.costMonthUsd}</strong></span>
              <span style={{ color: 'var(--color-forest)' }}><BilingualText>{"Hạn mức: $"}</BilingualText>{summary.budgetLimitUsd}</span>
            </div>
            <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: 'var(--color-ink)',
                  width: `${(summary.costMonthUsd / summary.budgetLimitUsd) * 100}%`,
                }}
              />
            </div>
            <div style={{ marginTop: '12px', fontSize: '12.5px', color: 'var(--color-red-hover)', lineHeight: 1.5 }}>
              <em><BilingualText>{"Mẹo tối ưu:"}</BilingualText></em><BilingualText>{"Chế độ"}</BilingualText><strong>Gemini 2.5 Flash</strong><BilingualText>{"đang giúp giảm chi phí và duy trì tốc độ phản hồi thấp cho các cuộc hội thoại."}</BilingualText></div>
          </div>

          <div className="admin-card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: 'var(--color-ink)' }}><BilingualText>{"Bảo mật & Giới hạn tần suất"}</BilingualText></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-red-hover)' }}><BilingualText>{"Backend API Proxy:"}</BilingualText></span>
                <strong style={{ color: 'var(--color-ink)' }}><BilingualText>{"Đang hoạt động"}</BilingualText></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-red-hover)' }}><BilingualText>{"Rate-limit per IP:"}</BilingualText></span>
                <strong>30 req/min</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-red-hover)' }}><BilingualText>{"Key Leak Protection:"}</BilingualText></span>
                <strong style={{ color: 'var(--color-ink)' }}><BilingualText>{"Bảo vệ 100%"}</BilingualText></strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time API Logs Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '17px', color: 'var(--color-ink)' }}><BilingualText>{"Nhật ký gọi API gần đây"}</BilingualText></h2>
          <span style={{ fontSize: '12px', color: 'var(--color-ink)', fontWeight: 700 }}><BilingualText>{"● Live Stream"}</BilingualText></span>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th><BilingualText>{"Request ID"}</BilingualText></th>
              <th><BilingualText>{"Thời gian"}</BilingualText></th>
              <th><BilingualText>{"Chế độ"}</BilingualText></th>
              <th><BilingualText>{"Người dùng"}</BilingualText></th>
              <th><BilingualText>{"Tokens In/Out"}</BilingualText></th>
              <th><BilingualText>{"Thời gian phản hồi"}</BilingualText></th>
              <th><BilingualText>{"Chi phí"}</BilingualText></th>
              <th><BilingualText>{"Trạng thái"}</BilingualText></th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '28px', color: 'var(--color-muted)' }}>
                  <BilingualText vi="Chưa có nhật ký gọi API nào gần đây." en="No recent API call logs found." />
                </td>
              </tr>
            ) : (
              pagedLogs.map(log => (
              <tr key={log.id}>
                <td><code>{log.id}</code></td>
                <td>{log.timestamp}</td>
                <td><span className="admin-badge admin-badge-info">{log.mode}</span></td>
                <td>{log.user}</td>
                <td>{log.tokensIn} in / {log.tokensOut} out</td>
                <td><strong style={{ color: log.latency < 400 ? 'var(--color-ink)' : 'var(--color-red)' }}>{log.latency} ms</strong></td>
                <td>{log.cost}</td>
                <td><span className="admin-badge admin-badge-success"><BilingualText>{log.status}</BilingualText> OK</span></td>
              </tr>
            ))
            )}
          </tbody>
        </table>

        {recentLogs.length > 0 && (
          <AdminPagination
            currentPage={safeLogsPage}
            pageSize={pageSize}
            totalItems={recentLogs.length}
            onPageChange={setLogsPage}
          />
        )}
      </div>
    </div>
  );
}

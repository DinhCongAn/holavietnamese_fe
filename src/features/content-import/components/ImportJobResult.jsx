import { useState } from 'react';
import { Notice } from '@/shared/components/common/Ui';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { useTranslation } from 'react-i18next';
import '@/features/content-import/components/content-import.css';

import { AdminPagination } from '@/shared/components/common/AdminPagination';
export const IMPORT_STATUS_LABELS = {
  READY: 'Chờ xác nhận',
  VALIDATION_FAILED: 'Dữ liệu không hợp lệ',
  IMPORTED: 'Đã nhập thành công',
  FAILED: 'Ghi dữ liệu thất bại',
};

export function ImportJobResult({ job }) {
  const label = useBilingualLabel();
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi') ? 'vi-VN' : 'en-US';
  const [rowPage, setRowPage] = useState(0), [errorPage, setErrorPage] = useState(0);
  const rows = job.rows || [], errors = job.errors || [], columns = Object.keys(rows[0]?.values || {}).filter(column => !column.startsWith('_'));
  const badRows = new Set(errors.map(error => error.row));
  const summary = job.summary || {};
  const wordText = item => `${item.word} · ${item.partOfSpeech}`;
  const variantText = item => `${item.masterWord} · ${item.masterPartOfSpeech} → ${item.region}: ${item.word}`;
  const summaryGroups = [
    { key: job.status === 'IMPORTED' ? 'createdWords' : 'newWords', tone: 'created', title: label(job.status === 'IMPORTED' ? 'Từ vựng đã thêm' : 'Từ vựng sẽ thêm', job.status === 'IMPORTED' ? 'Created vocabulary' : 'Vocabulary to create'), text: wordText },
    { key: 'duplicateWords', tone: 'duplicate', title: label('Từ vựng trùng — sẽ bỏ qua', 'Duplicate vocabulary — skipped'), text: wordText },
    { key: job.status === 'IMPORTED' ? 'createdRegionalVariants' : 'newRegionalVariants', tone: 'created', title: label(job.status === 'IMPORTED' ? 'Biến thể vùng miền đã thêm' : 'Biến thể vùng miền sẽ thêm', job.status === 'IMPORTED' ? 'Created regional variants' : 'Regional variants to create'), text: variantText },
    { key: 'duplicateRegionalVariants', tone: 'duplicate', title: label('Biến thể vùng miền trùng — sẽ bỏ qua', 'Duplicate regional variants — skipped'), text: variantText },
  ].filter(group => Array.isArray(summary[group.key]) && summary[group.key].length > 0);

  return <section className="import-job-result">
    <Notice kind={job.status === 'IMPORTED' ? 'success' : job.canConfirm ? 'info' : 'error'}>
      <strong><BilingualText>{IMPORT_STATUS_LABELS[job.status] || job.status}</BilingualText></strong>{' · '}{job.filename}
      {job.canConfirm && <p><BilingualText>{"Preview chưa ghi từ vựng. Xem lại dữ liệu trước khi xác nhận; hệ thống sẽ kiểm tra lại trước khi nhập."}</BilingualText></p>}
      {job.status === 'FAILED' && <p><BilingualText>{"Toàn bộ dữ liệu của lần import này đã được hoàn tác."}</BilingualText></p>}
    </Notice>
    <dl className="import-statistics">
      <div><dt><BilingualText>{"Tổng dòng"}</BilingualText></dt><dd>{job.totalRows}</dd></div>
      <div><dt><BilingualText>{"Hợp lệ"}</BilingualText></dt><dd>{job.validRows}</dd></div>
      <div><dt><BilingualText>{"Dòng lỗi"}</BilingualText></dt><dd>{job.errorRows}</dd></div>
      <div><dt><BilingualText vi="Mục dữ liệu đã tạo" en="Created records" /></dt><dd>{job.importedRows}</dd></div>
    </dl>

    <p className="muted"><BilingualText>{"Người thực hiện:"}</BilingualText> {job.actorName} · {new Date(job.createdAt).toLocaleString(locale)}{job.completedAt && <> · <BilingualText>{"Hoàn tất:"}</BilingualText> {new Date(job.completedAt).toLocaleString(locale)}</>}</p>
    {summaryGroups.length > 0 && <section className="import-summary-grid" aria-label={label('Kết quả đối chiếu dữ liệu', 'Data reconciliation result')}>
      {summaryGroups.map(group => <ImportSummaryGroup key={group.key} group={group} items={summary[group.key]} />)}
    </section>}
    {errors.length > 0 && <section><h2><BilingualText>{"Lỗi cần xử lý"}</BilingualText></h2><div className="import-table-scroll"><table className="admin-table"><thead><tr><th><BilingualText>{"Sheet"}</BilingualText></th><th><BilingualText>{"Dòng nguồn"}</BilingualText></th><th><BilingualText>{"Cột"}</BilingualText></th><th><BilingualText>{"Lỗi"}</BilingualText></th></tr></thead><tbody>{errors.slice(errorPage * 20, (errorPage + 1) * 20).map((error, index) => <tr key={`${errorPage}-${index}`}><td>{error.sheet || 'File'}</td><td>{error.row || '—'}</td><td>{error.column}</td><td>{error.message}</td></tr>)}</tbody></table></div><AdminPagination currentPage={errorPage + 1} pageSize={20} totalItems={errors.length} onPageChange={(nextPage) => setErrorPage(nextPage - 1)} /></section>}
    {rows.length > 0 && <section><h2><BilingualText>{"Dữ liệu trong file"}</BilingualText></h2><div className="import-table-scroll"><table className="admin-table"><thead><tr><th><BilingualText>{"Dòng nguồn"}</BilingualText></th>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.slice(rowPage * 20, (rowPage + 1) * 20).map(row => <tr key={row.rowNumber} className={badRows.has(row.rowNumber) ? 'import-invalid-row' : ''}><td>{row.rowNumber}</td>{columns.map(column => <td key={column}>{row.values[column] || '—'}</td>)}</tr>)}</tbody></table></div><AdminPagination currentPage={rowPage + 1} pageSize={20} totalItems={rows.length} onPageChange={(nextPage) => setRowPage(nextPage - 1)} /></section>}
  </section>;
}

function ImportSummaryGroup({ group, items }) {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  return <article className={`import-summary-card import-summary-card--${group.tone}`}>
    <h3>{group.title} <span>{items.length}</span></h3>
    <ul>{items.slice(safePage * pageSize, (safePage + 1) * pageSize)
      .map((item, index) => <li key={`${group.key}-${safePage * pageSize + index}`}>{group.text(item)}</li>)}</ul>
    <AdminPagination currentPage={safePage + 1} pageSize={pageSize} totalItems={items.length} onPageChange={(nextPage) => setPage(nextPage - 1)} />
  </article>;
}

import { useState } from 'react';
import { Notice } from '@/shared/components/common/Ui';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { useTranslation } from 'react-i18next';
import '@/features/content-import/components/content-import.css';

import { AdminPagination } from '@/shared/components/common/AdminPagination';
export const IMPORT_STATUS_LABELS = {
  READY: { vi: 'Đã kiểm tra — chờ xác nhận', en: 'Validated — awaiting confirmation' },
  VALIDATION_FAILED: { vi: 'Dữ liệu không hợp lệ', en: 'Invalid data' },
  IMPORTED: { vi: 'Đã nhập toàn bộ dữ liệu mới', en: 'All new data imported' },
  IMPORTED_WITH_SKIPS: { vi: 'Đã nhập dữ liệu mới và bỏ qua mục trùng', en: 'New data imported; duplicates skipped' },
  SKIPPED: { vi: 'Không có dữ liệu mới — đã bỏ qua toàn bộ mục trùng', en: 'No new data — all duplicates skipped' },
  FAILED: { vi: 'Ghi dữ liệu thất bại', en: 'Data write failed' },
};

const COMPLETED_STATUSES = new Set(['IMPORTED', 'IMPORTED_WITH_SKIPS', 'SKIPPED']);
const LONG_TEXT_COLUMNS = new Set(['definition_vi', 'definition_en', 'usage_note', 'labels', 'example_vi', 'example_en',
  'regional_meaning', 'regional_meaning_en', 'regional_example_vi', 'regional_example_en', 'regional_usage_note', 'regional_usage_note_en']);

export function ImportJobResult({ job, editable = false, dirty = false, onCellChange }) {
  const label = useBilingualLabel();
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi') ? 'vi-VN' : 'en-US';
  const [rowPage, setRowPage] = useState(0), [errorPage, setErrorPage] = useState(0);
  const rows = job.rows || [], errors = job.errors || [], columns = Object.keys(rows[0]?.values || {}).filter(column => !column.startsWith('_'));
  const badRows = new Set(errors.map(error => error.row));
  const summary = job.summary || {};
  const completed = COMPLETED_STATUSES.has(job.status);
  const createdWords = summary.createdWords?.length || 0;
  const createdVariants = summary.createdRegionalVariants?.length || 0;
  const newWords = summary.newWords?.length || 0;
  const newVariants = summary.newRegionalVariants?.length || 0;
  const duplicateWords = summary.duplicateWords?.length || 0;
  const duplicateVariants = summary.duplicateRegionalVariants?.length || 0;
  const wordText = item => `${item.word} · ${item.partOfSpeech}`;
  const variantText = item => `${item.masterWord} · ${item.masterPartOfSpeech} → ${item.region}: ${item.word}`;
  const summaryGroups = [
    { key: completed ? 'createdWords' : 'newWords', tone: 'created', title: label(completed ? 'Từ vựng đã thêm' : 'Từ vựng sẽ thêm', completed ? 'Created vocabulary' : 'Vocabulary to create'), text: wordText },
    { key: 'duplicateWords', tone: 'duplicate', title: label('Từ vựng trùng — sẽ bỏ qua', 'Duplicate vocabulary — skipped'), text: wordText },
    { key: completed ? 'createdRegionalVariants' : 'newRegionalVariants', tone: 'created', title: label(completed ? 'Biến thể vùng miền đã thêm' : 'Biến thể vùng miền sẽ thêm', completed ? 'Created regional variants' : 'Regional variants to create'), text: variantText },
    { key: 'duplicateRegionalVariants', tone: 'duplicate', title: label('Biến thể vùng miền trùng — sẽ bỏ qua', 'Duplicate regional variants — skipped'), text: variantText },
  ].filter(group => Array.isArray(summary[group.key]) && summary[group.key].length > 0);

  return <section className="import-job-result">
    <Notice kind={completed && job.status !== 'SKIPPED' ? 'success' : job.canConfirm || job.status === 'SKIPPED' ? 'info' : 'error'}>
      <strong>{label(IMPORT_STATUS_LABELS[job.status] || job.status)}</strong>{' · '}{job.filename}
      {job.canConfirm && !dirty && <p>{label(
        `File hợp lệ: sẽ thêm ${newWords} từ vựng và ${newVariants} biến thể; sẽ bỏ qua ${duplicateWords} từ vựng và ${duplicateVariants} biến thể đã tồn tại. Preview chưa ghi dữ liệu vào hệ thống.`,
        `Valid file: ${newWords} words and ${newVariants} variants will be created; ${duplicateWords} existing words and ${duplicateVariants} existing variants will be skipped. Preview has not written any data.`
      )}</p>}
      {dirty && <p><BilingualText vi="Bạn đã chỉnh sửa dữ liệu xem trước. Hệ thống sẽ kiểm tra lại toàn bộ nội dung trước khi cho phép nhập." en="You edited the preview. The system will revalidate all content before import is allowed." /></p>}
      {job.status === 'VALIDATION_FAILED' && <p><BilingualText vi="Hãy sửa các ô được đánh dấu theo danh sách lỗi bên dưới, sau đó chọn “Kiểm tra lại dữ liệu đã sửa”." en="Fix the marked cells using the errors below, then select “Revalidate edited data”." /></p>}
      {job.status === 'IMPORTED' && <p>{label(`Đã tạo ${createdWords} từ vựng và ${createdVariants} biến thể vùng miền.`, `Created ${createdWords} vocabulary entries and ${createdVariants} regional variants.`)}</p>}
      {job.status === 'IMPORTED_WITH_SKIPS' && <p>{label(`Đã tạo ${createdWords} từ vựng và ${createdVariants} biến thể; bỏ qua ${duplicateWords} từ vựng và ${duplicateVariants} biến thể trùng.`, `Created ${createdWords} words and ${createdVariants} variants; skipped ${duplicateWords} duplicate words and ${duplicateVariants} duplicate variants.`)}</p>}
      {job.status === 'SKIPPED' && <p>{label(`Không chèn dữ liệu: ${duplicateWords} từ vựng và ${duplicateVariants} biến thể đều đã tồn tại.`, `Nothing was inserted: ${duplicateWords} words and ${duplicateVariants} variants already existed.`)}</p>}
      {job.status === 'FAILED' && <p><BilingualText>{"Toàn bộ dữ liệu của lần import này đã được hoàn tác."}</BilingualText></p>}
    </Notice>
    <dl className="import-statistics">
      <div><dt><BilingualText>{"Tổng dòng"}</BilingualText></dt><dd>{job.totalRows}</dd></div>
      <div><dt><BilingualText>{"Hợp lệ"}</BilingualText></dt><dd>{job.validRows}</dd></div>
      <div><dt><BilingualText>{"Dòng lỗi"}</BilingualText></dt><dd>{job.errorRows}</dd></div>
      <div><dt><BilingualText vi="Mục dữ liệu đã tạo" en="Created records" /></dt><dd>{job.importedRows}</dd></div>
    </dl>

    <p className="muted"><BilingualText>{"Người thực hiện:"}</BilingualText> {job.actorName} · {new Date(job.createdAt).toLocaleString(locale)}{job.completedAt && <> · <BilingualText>{"Hoàn tất:"}</BilingualText> {new Date(job.completedAt).toLocaleString(locale)}</>}</p>
    {!dirty && summaryGroups.length > 0 && <section className="import-summary-grid" aria-label={label('Kết quả đối chiếu dữ liệu', 'Data reconciliation result')}>
      {summaryGroups.map(group => <ImportSummaryGroup key={group.key} group={group} items={summary[group.key]} />)}
    </section>}
    {errors.length > 0 && <section><h2><BilingualText>{"Lỗi cần xử lý"}</BilingualText></h2><div className="import-table-scroll"><table className="admin-table"><thead><tr><th><BilingualText>{"Sheet"}</BilingualText></th><th><BilingualText>{"Dòng nguồn"}</BilingualText></th><th><BilingualText>{"Cột"}</BilingualText></th><th><BilingualText>{"Lỗi"}</BilingualText></th></tr></thead><tbody>{errors.slice(errorPage * 20, (errorPage + 1) * 20).map((error, index) => <tr key={`${errorPage}-${index}`}><td>{error.sheet || 'File'}</td><td>{error.row || '—'}</td><td>{error.column}</td><td>{error.message}</td></tr>)}</tbody></table></div><AdminPagination currentPage={errorPage + 1} pageSize={20} totalItems={errors.length} onPageChange={(nextPage) => setErrorPage(nextPage - 1)} /></section>}
    {rows.length > 0 && <section><div className="import-data-heading"><h2><BilingualText>{"Dữ liệu trong file"}</BilingualText></h2>{editable && <small><BilingualText vi="Có thể sửa trực tiếp từng ô trước khi xác nhận nhập." en="You can edit each cell directly before confirming the import." /></small>}</div><div className="import-table-scroll"><table className={`admin-table ${editable ? 'import-editable-table' : ''}`}><thead><tr><th><BilingualText>{"Dòng nguồn"}</BilingualText></th>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.slice(rowPage * 20, (rowPage + 1) * 20).map(row => <tr key={row.rowNumber} className={badRows.has(row.rowNumber) ? 'import-invalid-row' : ''}><td>{row.rowNumber}</td>{columns.map(column => <td key={column}>{editable ? <EditableCell column={column} value={row.values[column] || ''} onChange={value => onCellChange?.(row.rowNumber, column, value)} /> : row.values[column] || '—'}</td>)}</tr>)}</tbody></table></div><AdminPagination currentPage={rowPage + 1} pageSize={20} totalItems={rows.length} onPageChange={(nextPage) => setRowPage(nextPage - 1)} /></section>}
  </section>;
}

function EditableCell({ column, value, onChange }) {
  const common = { value, maxLength: 10000, 'aria-label': `${column}`, onChange: event => onChange(event.target.value) };
  return LONG_TEXT_COLUMNS.has(column) ? <textarea {...common} rows={2} /> : <input {...common} type="text" />;
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

import { useCallback, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, EmptyState, PageHeader, Notice } from '@/shared/components/common/Ui';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { ImportJobResult } from '@/features/content-import/components/ImportJobResult';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { contentImportService } from '@/features/content-import/api/contentImportService';
import { getBackOfficeRoutes } from '@/constants/routes';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import '@/features/content-import/components/content-import.css';

export function AdminImportPage() {
  const location = useLocation();
  const managementRoutes = getBackOfficeRoutes(location.pathname);
  const label = useBilingualLabel();
  const types = useAsyncResource(useCallback(signal => contentImportService.types({ signal }), []));
  return <section className="content-import-page">
    <Breadcrumb items={[{ label: label('Quản lý nội dung', 'Content Management') }, { label: label('Nhập từ vựng', 'Vocabulary Import') }]} />
    <PageHeader
      eyebrow={<BilingualText vi="Quản lý nội dung" en="Content Management" />}
      title={<BilingualText vi="Nhập từ vựng từ Excel" en="Import Vocabulary from Excel" />}
      description={<BilingualText vi="Kiểm tra dữ liệu Excel trước khi nhập vào kho từ vựng." en="Validate Excel data before importing it into the vocabulary library." />}
      actions={<Link className="button secondary" to={managementRoutes.importHistory}><BilingualText vi="Lịch sử import" en="Import History" /></Link>}
    />
    <ResourceState resource={types}>{items => items.length ? <ImportUpload types={items} managementRoutes={managementRoutes} /> : <EmptyState title={<BilingualText vi="Chưa có loại dữ liệu được hỗ trợ" en="No supported data types yet" />} />}</ResourceState>
  </section>;
}

function ImportUpload({ types, managementRoutes }) {
  const label = useBilingualLabel();
  const [module, setModule] = useState(types[0].id), [file, setFile] = useState(null), [job, setJob] = useState(null), [draftRows, setDraftRows] = useState([]), [dirty, setDirty] = useState(false), [error, setError] = useState(null), [pending, setPending] = useState(false), [downloading, setDownloading] = useState(false);
  const writing = useRef(false); const { confirm, confirmationDialog } = useConfirmDialog();
  const type = types.find(item => item.id === module);

  async function preview(event) {
    event.preventDefault(); if (writing.current) return;
    writing.current = true; setPending(true); setError(null); setJob(null);
    try {
      const result = await contentImportService.preview(module, file);
      setJob(result); setDraftRows(result.rows || []); setDirty(false);
    }
    catch (failure) { setError(failure); } finally { writing.current = false; setPending(false); }
  }

  async function validateEdits() {
    if (!job || writing.current) return null;
    writing.current = true; setPending(true); setError(null);
    try {
      const result = await contentImportService.updatePreview(job.id, draftRows);
      setJob(result); setDraftRows(result.rows || []); setDirty(false);
      return result;
    } catch (failure) { setError(failure); return null; }
    finally { writing.current = false; setPending(false); }
  }

  async function importData() {
    let currentJob = job;
    if (dirty) {
      currentJob = await validateEdits();
      if (!currentJob?.canConfirm) return;
    }
    const summary = currentJob?.summary || {};
    const duplicateWords = summary.duplicateWords?.length || 0;
    const duplicateVariants = summary.duplicateRegionalVariants?.length || 0;
    const newWords = summary.newWords?.length || 0;
    const newVariants = summary.newRegionalVariants?.length || 0;
    const description = label(
      `Xác nhận nhập “${currentJob?.filename}”: sẽ tạo ${newWords} từ vựng và ${newVariants} biến thể; bỏ qua ${duplicateWords} từ vựng và ${duplicateVariants} biến thể đã tồn tại. Dữ liệu trùng không được ghi lại hoặc ghi đè.`,
      `Confirm “${currentJob?.filename}”: create ${newWords} vocabulary entries and ${newVariants} variants; skip ${duplicateWords} existing words and ${duplicateVariants} existing variants. Duplicates will not be inserted or overwritten.`
    );
    if (!currentJob?.canConfirm || writing.current || !await confirm({
      title: label('Xác nhận nhập dữ liệu', 'Confirm Data Import'),
      description,
      confirmLabel: label('Nhập dữ liệu', 'Import Data'),
      tone: 'warning'
    })) return;
    writing.current = true; setPending(true); setError(null);
    try {
      const result = await contentImportService.confirm(currentJob.id);
      setJob(result); setDraftRows(result.rows || []); setDirty(false);
    }
    catch (failure) { setError(failure); } finally { writing.current = false; setPending(false); }
  }

  async function template() {
    if (downloading) return; setDownloading(true); setError(null);
    try {
      const blob = await contentImportService.template(module), url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${module.toLowerCase()}-template.xlsx`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) { setError(failure); } finally { setDownloading(false); }
  }

  return <>
    <form className="admin-card import-upload" onSubmit={preview}><fieldset disabled={pending}>
      <label><BilingualText>{"Loại dữ liệu"}</BilingualText><select value={module} onChange={event => { setModule(event.target.value); setFile(null); setJob(null); setDraftRows([]); setDirty(false); setError(null); }}>{types.map(item => <option key={item.id} value={item.id}>{label(item.label)}</option>)}</select></label>
      <div className="import-template-info">
        <p>{label(type.description)}</p>
        <p><BilingualText>{"Sheet:"}</BilingualText> <strong>{type.sheet}</strong>. <BilingualText>{"Cột bắt buộc:"}</BilingualText> {type.requiredColumns.join(', ')}.</p>
        <p><BilingualText>{"Mỗi nghĩa cần definition_vi, translation_en hoặc definition_en. Bản dịch ví dụ là tùy chọn; hệ thống không tự dịch."}</BilingualText></p>
        <p><BilingualText>{"Ghi word và part_of_speech trên mỗi dòng. Các dòng cùng từ/từ loại được gom thành một mục. meaning_order phân biệt nghĩa; example_order sắp xếp ví dụ, bắt đầu từ 0. Nội dung lặp được để trống hoặc phải thống nhất."}</BilingualText></p>
        <p><BilingualText vi="Muốn thêm biến thể vùng miền, điền region (NORTH/CENTRAL/SOUTH), regional_word và regional_meaning; các cột regional_* còn lại là tùy chọn. Từ hoặc biến thể đã tồn tại sẽ được liệt kê và bỏ qua; dữ liệu mới vẫn được nhập." en="To add a regional variant, fill region (NORTH/CENTRAL/SOUTH), regional_word and regional_meaning; the remaining regional_* columns are optional. Existing words or variants are listed and skipped while new data is still imported." /></p>
        <p><BilingualText>{"Trạng thái trống là DRAFT. labels: mỗi nhãn một dòng trong ô Excel."}</BilingualText></p>
        <button type="button" className="secondary" onClick={template} disabled={downloading}><BilingualText>{downloading ? 'Đang tải…' : 'Tải mẫu Excel'}</BilingualText></button>
      </div>
      <label><BilingualText>{"File Excel (tối đa 10 MiB)"}</BilingualText><input key={module} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required onChange={event => { setFile(event.target.files?.[0] || null); setJob(null); setDraftRows([]); setDirty(false); setError(null); }} /></label>
      {file && <p className="muted"><BilingualText>{"File đã chọn:"}</BilingualText> {file.name}</p>}
      <div className="actions"><button disabled={!file || pending}><BilingualText>{pending ? 'Đang xử lý…' : 'Kiểm tra và xem trước'}</BilingualText></button></div>
    </fieldset></form>
    {error && <Notice kind="error"><BilingualText>{error.message}</BilingualText></Notice>}
    {job && <div className="admin-card import-preview-card">
      <ImportJobResult key={`${job.id}-${job.status}`} job={{ ...job, rows: draftRows }} editable={!['IMPORTED', 'IMPORTED_WITH_SKIPS', 'SKIPPED', 'FAILED'].includes(job.status)} dirty={dirty} onCellChange={(rowNumber, column, value) => {
        setDraftRows(current => current.map(row => row.rowNumber === rowNumber ? { ...row, values: { ...row.values, [column]: value } } : row));
        setDirty(true); setError(null);
      }} />
      {!['IMPORTED', 'IMPORTED_WITH_SKIPS', 'SKIPPED', 'FAILED'].includes(job.status) && <div className="actions import-preview-actions">
        <button className="secondary" disabled={pending || !dirty} onClick={validateEdits}><BilingualText>{pending ? 'Đang kiểm tra…' : 'Kiểm tra lại dữ liệu đã sửa'}</BilingualText></button>
        {(job.canConfirm || dirty) && <button className="import-confirm" disabled={pending} onClick={importData}><BilingualText>{pending ? 'Đang xử lý…' : dirty ? 'Kiểm tra và xác nhận nhập' : 'Xác nhận nhập Excel'}</BilingualText></button>}
      </div>}
      <p><Link className="text-link" to={`${managementRoutes.importHistory}?id=${encodeURIComponent(job.id)}`}><BilingualText>{"Xem lại trong lịch sử →"}</BilingualText></Link></p>
    </div>}
    {confirmationDialog}
  </>;
}

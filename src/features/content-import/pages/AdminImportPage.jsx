import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, EmptyState, PageHeader, Notice } from '@/shared/components/common/Ui';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { ImportJobResult } from '@/features/content-import/components/ImportJobResult';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { contentImportService } from '@/features/content-import/api/contentImportService';
import { ROUTES } from '@/constants/routes';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import '@/features/content-import/components/content-import.css';

export function AdminImportPage() {
  const label = useBilingualLabel();
  const types = useAsyncResource(useCallback(signal => contentImportService.types({ signal }), []));
  return <section className="content-import-page">
    <Breadcrumb items={[{ label: label('Quản lý nội dung', 'Content Management') }, { label: label('Nhập từ vựng', 'Vocabulary Import') }]} />
    <PageHeader
      eyebrow={<BilingualText vi="Quản lý nội dung" en="Content Management" />}
      title={<BilingualText vi="Nhập từ vựng từ Excel" en="Import Vocabulary from Excel" />}
      description={<BilingualText vi="Kiểm tra dữ liệu Excel trước khi nhập vào kho từ vựng." en="Validate Excel data before importing it into the vocabulary library." />}
      actions={<Link className="button secondary" to={ROUTES.ADMIN_IMPORT_HISTORY}><BilingualText vi="Lịch sử import" en="Import History" /></Link>}
    />
    <ResourceState resource={types}>{items => items.length ? <ImportUpload types={items} /> : <EmptyState title={<BilingualText vi="Chưa có loại dữ liệu được hỗ trợ" en="No supported data types yet" />} />}</ResourceState>
  </section>;
}

function ImportUpload({ types }) {
  const label = useBilingualLabel();
  const [module, setModule] = useState(types[0].id), [file, setFile] = useState(null), [job, setJob] = useState(null), [error, setError] = useState(null), [pending, setPending] = useState(false), [downloading, setDownloading] = useState(false);
  const writing = useRef(false); const { confirm, confirmationDialog } = useConfirmDialog();
  const type = types.find(item => item.id === module);

  async function preview(event) {
    event.preventDefault(); if (writing.current) return;
    writing.current = true; setPending(true); setError(null); setJob(null);
    try { setJob(await contentImportService.preview(module, file)); }
    catch (failure) { setError(failure); } finally { writing.current = false; setPending(false); }
  }

  async function importData() {
    const description = label(
      `Nhập ${job?.validRows} dòng Excel từ “${job?.filename}”? Các dòng cùng từ được gom theo nghĩa và ví dụ; mục từ đã có không bị ghi đè.`,
      `Import ${job?.validRows} Excel rows from "${job?.filename}"? Rows with the same word are grouped by meaning and examples; existing entries will not be overwritten.`
    );
    if (!job?.canConfirm || writing.current || !await confirm({
      title: label('Xác nhận nhập dữ liệu', 'Confirm Data Import'),
      description,
      confirmLabel: label('Nhập dữ liệu', 'Import Data'),
      tone: 'warning'
    })) return;
    writing.current = true; setPending(true); setError(null);
    try { setJob(await contentImportService.confirm(job.id)); }
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
      <label><BilingualText>{"Loại dữ liệu"}</BilingualText><select value={module} onChange={event => { setModule(event.target.value); setFile(null); setJob(null); setError(null); }}>{types.map(item => <option key={item.id} value={item.id}>{label(item.label)}</option>)}</select></label>
      <div className="import-template-info">
        <p>{label(type.description)}</p>
        <p><BilingualText>{"Sheet:"}</BilingualText> <strong>{type.sheet}</strong>. <BilingualText>{"Cột bắt buộc:"}</BilingualText> {type.requiredColumns.join(', ')}.</p>
        <p><BilingualText>{"Mỗi nghĩa cần definition_vi, translation_en hoặc definition_en. Bản dịch ví dụ là tùy chọn; hệ thống không tự dịch."}</BilingualText></p>
        <p><BilingualText>{"Ghi word và part_of_speech trên mỗi dòng. Các dòng cùng từ/từ loại được gom thành một mục. meaning_order phân biệt nghĩa; example_order sắp xếp ví dụ, bắt đầu từ 0. Nội dung lặp được để trống hoặc phải thống nhất."}</BilingualText></p>
        <p><BilingualText>{"Trạng thái trống là DRAFT. labels: mỗi nhãn một dòng trong ô Excel."}</BilingualText></p>
        <button type="button" className="secondary" onClick={template} disabled={downloading}><BilingualText>{downloading ? 'Đang tải…' : 'Tải mẫu Excel'}</BilingualText></button>
      </div>
      <label><BilingualText>{"File Excel (tối đa 10 MiB)"}</BilingualText><input key={module} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required onChange={event => { setFile(event.target.files?.[0] || null); setJob(null); setError(null); }} /></label>
      {file && <p className="muted"><BilingualText>{"File đã chọn:"}</BilingualText> {file.name}</p>}
      <div className="actions"><button disabled={!file || pending}><BilingualText>{pending ? 'Đang xử lý…' : 'Kiểm tra và xem trước'}</BilingualText></button></div>
    </fieldset></form>
    {error && <Notice kind="error"><BilingualText>{error.message}</BilingualText></Notice>}
    {job && <div className="admin-card"><ImportJobResult key={`${job.id}-${job.status}`} job={job} />{job.canConfirm && <button className="import-confirm" disabled={pending} onClick={importData}><BilingualText>{pending ? 'Đang nhập…' : 'Xác nhận nhập Excel'}</BilingualText></button>}<p><Link className="text-link" to={`${ROUTES.ADMIN_IMPORT_HISTORY}?id=${encodeURIComponent(job.id)}`}><BilingualText>{"Xem lại trong lịch sử →"}</BilingualText></Link></p></div>}
    {confirmationDialog}
  </>;
}

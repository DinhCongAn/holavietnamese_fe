import { useCallback, useId, useState } from 'react';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { Notice } from '@/shared/components/common/Ui';
import { destinationDraft, destinationPayload, DESTINATION_REGIONS } from '@/features/explore/models/Destination';
import { adminDestinationService } from '@/features/explore/api/destinationService';
import { DestinationContentEditor } from '@/features/explore/components/DestinationContentEditor';

export function DestinationForm({ entry, onSaved, onCancel, onBusyChange }) {
  const label = useBilingualLabel();
  const [draft, setDraft] = useState(() => destinationDraft(entry));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [exploreContent, setExploreContent] = useState(null);
  const formId = useId();
  const change = (field, value) => setDraft(current => ({ ...current, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    if (entry && !exploreContent) {
      setError(new Error(label('Nội dung liên kết vẫn đang được tải. Vui lòng chờ rồi lưu lại.', 'Linked content is still loading. Please wait before saving.')));
      return;
    }
    setError(null);
    try {
      const payload = destinationPayload(draft);
      setPending(true);
      onBusyChange?.(true);
      const saved = entry
        ? (await adminDestinationService.updateManagement(entry.id, payload, exploreContent)).destination
        : await adminDestinationService.create(payload);
      onSaved(saved);
    } catch (failure) {
      setError(failure);
    } finally {
      setPending(false);
      onBusyChange?.(false);
    }
  }
  const linkedContentChanged = useCallback(value => setExploreContent(value), []);

  const fields = [
    { key: 'nameVi', vi: 'Tên tiếng Việt', en: 'Vietnamese name', required: true, max: 150, lang: 'vi' },
    { key: 'nameEn', vi: 'Tên tiếng Anh', en: 'English name', required: true, max: 150, lang: 'en' },
    { key: 'slug', vi: 'Slug', en: 'Slug', required: true, max: 180 },
    { key: 'shortDescriptionVi', vi: 'Mô tả ngắn tiếng Việt', en: 'Short description in Vietnamese', max: 500, rows: 3, lang: 'vi' },
    { key: 'shortDescriptionEn', vi: 'Mô tả ngắn tiếng Anh', en: 'Short description in English', max: 500, rows: 3, lang: 'en' },
    { key: 'descriptionVi', vi: 'Mô tả tiếng Việt', en: 'Vietnamese description', rows: 6, lang: 'vi' },
    { key: 'descriptionEn', vi: 'Mô tả tiếng Anh', en: 'English description', rows: 6, lang: 'en' },
    { key: 'imageUrl', vi: 'Đường dẫn ảnh', en: 'Image URL', max: 2048 },
  ];

  return <form className="destination-form" onSubmit={submit}>
    <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      {fields.map(field => <label key={field.key} htmlFor={`${formId}-${field.key}`}>
        <BilingualText vi={`${field.vi}${field.required ? ' *' : ''}`} en={`${field.en}${field.required ? ' *' : ''}`} />
        {field.rows
          ? <textarea id={`${formId}-${field.key}`} value={draft[field.key]} onChange={event => change(field.key, event.target.value)} rows={field.rows} maxLength={field.max} lang={field.lang} />
          : <input id={`${formId}-${field.key}`} value={draft[field.key]} onChange={event => change(field.key, event.target.value)} required={field.required} maxLength={field.max} lang={field.lang} />}
      </label>)}
      <label htmlFor={`${formId}-region`}><BilingualText vi="Vùng miền *" en="Region *" />
        <select id={`${formId}-region`} value={draft.region} onChange={event => change('region', event.target.value)} required>
          <option value="">{label("Chọn vùng miền", "Select region")}</option>
          {DESTINATION_REGIONS.map(region => <option key={region.value} value={region.value}>{label(region)}</option>)}
        </select>
      </label>
      <p><strong><BilingualText>Trạng thái:</BilingualText></strong> <BilingualText>DRAFT</BilingualText></p>
      {draft.imageUrl && <ContentImage src={draft.imageUrl} alt={draft.nameVi || 'Ảnh điểm đến'} className="figma-art" style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 8 }} />}
      {entry && <DestinationContentEditor destinationId={entry.id} editable embedded onChange={linkedContentChanged} />}
    </fieldset>
    {error && <Notice kind="error">{error.status === 409 ? <BilingualText vi="Slug đã tồn tại. Vui lòng nhập slug khác." en="This slug already exists. Please enter another slug." /> : <BilingualText>{error.message}</BilingualText>}</Notice>}
    <div className="actions" style={{ marginTop: 20 }}>
      <button type="button" className="secondary" disabled={pending} onClick={onCancel}><BilingualText>Hủy</BilingualText></button>
      <button type="submit" disabled={pending || (entry && !exploreContent)}><BilingualText vi={pending ? 'Đang lưu…' : entry ? 'Lưu điểm đến và toàn bộ liên kết' : 'Lưu điểm đến'} en={pending ? 'Saving…' : entry ? 'Save destination and all links' : 'Save destination'} /></button>
    </div>
  </form>;
}

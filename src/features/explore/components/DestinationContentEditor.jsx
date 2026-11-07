import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useCallback, useEffect, useState } from 'react';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { Notice } from '@/shared/components/common/Ui';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { destinationExploreService } from '@/features/explore/api/destinationExploreService';
import { exploreCultures, openableExploreScenarios } from '@/features/explore/models/DestinationExplore';

export function DestinationContentEditor({ destinationId, editable = false, embedded = false, onChange }) {
  const resource = useAsyncResource(useCallback(async signal => {
    const [content, cultureItems] = await Promise.all([
      destinationExploreService.management(destinationId, { signal }),
      exploreCultures({ signal }),
    ]);
    const byId = new Map(cultureItems.map(item => [item.id, item]));
    return {
      ...content,
      cultures: (content.cultureIds || []).map(id => byId.get(id) || { id, title: `${id} — ${bilingualLabel('không còn trong thư viện', 'no longer in library')}` }),
    };
  }, [destinationId]));
  return <section className={`${embedded ? '' : 'admin-card '}destination-content-editor${embedded ? ' destination-content-editor--embedded' : ''}`}><h2><BilingualText vi="Nội dung Khám phá và liên kết" en="Explore Content and Links" /></h2>
    <ResourceState resource={resource}>{data => <Editor key={destinationId} destinationId={destinationId} initial={data} editable={editable} embedded={embedded} onChange={onChange} />}</ResourceState>
  </section>;
}
function Editor({ destinationId, initial, editable, embedded, onChange }) {
  useTextLanguage();
  const [words, setWords] = useState(initial.vocabulary);
  const [cultures, setCultures] = useState(initial.cultures || []);
  const [scenarios, setScenarios] = useState(initial.scenarios);
  const [pending, setPending] = useState(false), [error, setError] = useState(null), [message, setMessage] = useState('');
  useEffect(() => {
    onChange?.({ vocabularyIds: words.map(word => word.id), cultureIds: cultures.map(culture => culture.id), scenarioIds: scenarios.map(scenario => scenario.id) });
  }, [words, cultures, scenarios, onChange]);
  async function save(event) {
    event.preventDefault(); if (pending) return;
    setPending(true); setError(null); setMessage('');
    try {
      const result = await destinationExploreService.save(destinationId, { vocabularyIds: words.map(w => w.id), cultureIds: cultures.map(c => c.id), scenarioIds: scenarios.map(s => s.id) });
      setWords(result.vocabulary); setScenarios(result.scenarios); setMessage(bilingualLabel('Đã lưu nội dung Khám phá.', 'Explore content saved.'));
    } catch (failure) { setError(failure); }
    finally { setPending(false); }
  }
  const fields = <fieldset className="destination-content-editor-fields" disabled={pending}>
    <Selector kind="vocabulary" selected={words} onChange={setWords} editable={editable} />
    <Selector kind="culture" selected={cultures} onChange={setCultures} editable={editable} />
    <Selector kind="scenario" selected={scenarios} onChange={setScenarios} editable={editable} />
    <p className="muted"><BilingualText vi="Biến thể ngôn ngữ đã xuất bản hiển thị theo vùng của điểm đến và từ chuẩn được chọn." en="Published regional variations display according to destination region and standard word selected." /></p>
    {editable && !embedded && <button type="submit">{pending ? <BilingualText vi="Đang lưu…" en="Saving…" /> : <BilingualText vi="Lưu nội dung liên kết" en="Save linked content" />}</button>}
  </fieldset>;
  if (embedded) return fields;
  return <form onSubmit={save}>{fields}{error && <Notice kind="error"><BilingualText>{error.message}</BilingualText></Notice>}{message && <Notice kind="success"><BilingualText>{message}</BilingualText></Notice>}</form>;
}
function Selector({ kind, selected, onChange, editable }) {
  useTextLanguage();
  const [search, setSearch] = useState(''), [query, setQuery] = useState('');
  const title = { vocabulary: 'Từ vựng hữu ích', culture: 'Bài văn hóa', scenario: 'Kịch bản thực hành' }[kind];
  const resource = useAsyncResource(useCallback(async signal => {
    if (!editable) return [];
    if (kind === 'vocabulary') return destinationExploreService.vocabulary(query, { signal });
    const items = kind === 'culture' ? await exploreCultures({ signal }) : openableExploreScenarios(await destinationExploreService.scenarios({ signal }));
    return items.filter(item => `${item.title} ${item.destinationName || ''}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  }, [editable, kind, query]));
  const label = item => item.word || item.title;
  return <section className="destination-content-selector"><h3><BilingualText>{title}</BilingualText></h3>
    <ul className="destination-content-selector__selected">{selected.map(item => <li key={item.id}><span>{label(item)}</span>{editable && <button type="button" className="secondary" aria-label={bilingualLabel(`Bỏ liên kết ${label(item)}`)} onClick={() => onChange(selected.filter(s => s.id !== item.id))}>×</button>}</li>)}</ul>
    {editable && <>
    <div className="actions destination-content-selector__search"><input aria-label={bilingualLabel(`Tìm ${title}`)} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setQuery(search.trim()); } }} /><button type="button" className="secondary" onClick={() => setQuery(search.trim())}><BilingualText vi="Tìm kiếm" en="Search" /></button></div>
    <ResourceState resource={resource}>{data => { const items = Array.isArray(data) ? data : data.content || []; const available = items.filter(item => !selected.some(s => s.id === item.id));
      return available.length ? <ul className="destination-content-selector__results">{available.map(item => <li key={item.id}><span>{label(item)}{item.status && item.status !== 'PUBLISHED' && item.status !== 'ACTIVE' && ` · ${item.status}`}</span><button type="button" className="secondary" onClick={() => onChange([...selected,item])}><BilingualText vi="Liên kết" en="Link" /></button></li>)}</ul> : <p className="muted destination-content-selector__empty"><BilingualText vi="Không có nội dung khả dụng để liên kết." en="No available content to link." /></p>;
    }}</ResourceState></>}
  </section>;
}

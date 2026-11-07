import { BilingualText } from '@/shared/components/common/BilingualText';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Modal } from '@/shared/components/common/Modal';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { vocabularyCatalogService } from '@/features/vocabulary/api/vocabularyCatalogService';
import { regionalVocabularyService } from '@/features/explore/regional/api/regionalVocabularyService';
import { useVocabulary } from '@/features/vocabulary/hooks/useVocabulary';
import { SaveVocabularyButton } from '@/features/vocabulary/components/SaveVocabularyButton';
import { DictionaryAttribution, DictionaryAudio, DictionaryExample, DictionaryWordLink } from '@/features/vocabulary/components/DictionaryElements';
import { RegionalComparison } from '@/features/explore/regional/components/RegionalComparison';
import { partOfSpeechLabel, dictionaryMeaning, definitionOf } from '@/features/vocabulary/models/Dictionary';
import { VocabularyCatalogPage } from '@/features/vocabulary/pages/VocabularyCatalogPage';
import '@/features/vocabulary/components/dictionary.css';

export function VocabularyDetailPage() {
  const { id } = useParams(), navigate = useNavigate();
  const location = useLocation();
  const backHref = ROUTES.VOCABULARY + (location.state?.dictionarySearch ? `?${location.state.dictionarySearch}` : '');
  const [revision, setRevision] = useState(0);
  const resource = useAsyncResource(useCallback(async signal => {
    const [entry, links, regional] = await Promise.all([
      vocabularyCatalogService.get(id, { signal }), vocabularyCatalogService.links(id, { signal }),
      regionalVocabularyService.get(id, { signal }).catch(error => { if (error.status === 404) return null; throw error; }),
    ]);
    return { entry, links, regional };
  }, [id]));
  return <><VocabularyCatalogPage key={revision} /><section className="dictionary-detail">
    <Modal title={<BilingualText vi="Tra cứu mục từ · Dictionary entry" en="Dictionary entry" />} onClose={() => navigate(backHref)}>
      <ResourceState resource={resource}>{data => <DictionaryEntry key={data.entry.id} {...data} onNotebookChanged={() => setRevision(value => value + 1)} />}</ResourceState>
      <Link className="dictionary-back" to={backHref}><ArrowLeft size={16} /> <BilingualText vi="Về từ điển" en="Back to dictionary" /></Link>
    </Modal>
  </section></>;
}

export function DictionaryEntry({ entry, links, regional, onNotebookChanged = () => {} }) {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi') ? 'vi' : 'en';
  const notebook = useVocabulary({ search: '', courseId: '', lessonId: '' });
  const [meaningIndex, setMeaningIndex] = useState(0);
  const meaning = entry.meanings?.[meaningIndex];
  const selected = { ...entry, meanings: meaning ? [meaning] : [] };
  const saved = notebook.data?.find(item => item.masterVocabularyId === entry.id) || null;
  function changed() { notebook.reload(); onNotebookChanged(); }
  return <article className="dictionary-entry-detail">
    <header className="dictionary-word-header"><p className="eyebrow"><BookOpen size={15} /> <BilingualText vi="MỤC TỪ TIẾNG VIỆT" en="VIETNAMESE DICTIONARY ENTRY" /></p>
      <div className="dictionary-word-title"><h1 lang="vi">{entry.word}</h1><span className="dictionary-pos">{partOfSpeechLabel(entry.partOfSpeech, language)}</span></div>
      {entry.pronunciation && <p className="dictionary-ipa">{entry.pronunciation}</p>}
      {entry.lexical?.pronunciations?.length > 0 && <details className="dictionary-pronunciations"><summary><BilingualText vi="Phát âm theo dữ liệu nguồn" en="Recorded pronunciations" /></summary><ul>{entry.lexical.pronunciations.map((item, index) => <li key={index}><span>{item.labels?.join(', ') || 'IPA'}</span><span>{item.ipa}</span></li>)}</ul></details>}
      <DictionaryAudio entry={entry} />
    </header>
    <div className="dictionary-save-panel"><div><strong><BilingualText vi="Mang từ này vào sổ tay" en="Save this word to your notebook" /></strong><p><BilingualText vi="Một mục từ được lưu một lần. Bạn có thể chọn nghĩa trước khi lưu." en="Each entry is saved once. Choose a meaning before saving." /></p>
      {!saved && entry.meanings?.length > 1 && <label><BilingualText vi="Nghĩa để ôn" en="Meaning to review" /><select value={meaningIndex} onChange={event => setMeaningIndex(Number(event.target.value))}>{entry.meanings.map((item, index) => <option key={item.id ?? index} value={index}>{index + 1}. {dictionaryMeaning(item).slice(0, 100)}</option>)}</select></label>}
      {saved && <p className="muted"><BilingualText vi="Nghĩa đang lưu:" en="Saved meaning:" /> {saved.meaning}</p>}</div><SaveVocabularyButton entry={selected} initialSavedEntry={saved} checking={notebook.loading} checkError={notebook.error} onSaved={changed} onDeleted={changed} /></div>
    {notebook.error && <p role="alert">{notebook.error.message} <button className="secondary" onClick={notebook.reload}><BilingualText vi="Thử lại" en="Try again" /></button></p>}
    <section className="dictionary-senses"><div className="dictionary-section-heading"><h2><BilingualText vi="Nghĩa & cách dùng" en="Meanings & usage" /></h2><span><BilingualText vi={`${entry.meanings?.length || 0} nghĩa`} en={`${entry.meanings?.length || 0} meanings`} /></span></div>
      {(entry.meanings || []).map((item, index) => <section className="dictionary-sense" key={item.id ?? index}><span className="dictionary-sense-number">{String(index + 1).padStart(2, '0')}</span><div>
        {item.labels?.length > 0 && <p className="dictionary-sense-labels">{item.labels.map(label => <span key={label}>{label}</span>)}</p>}
        <h3 lang={language}>{definitionOf(item, language)}</h3>
        {language === 'vi' && item.definitionVi && item.translationEn && <p className="dictionary-english" lang="en"><span>EN</span> {item.translationEn}</p>}
        {language === 'en' && item.definitionVi && <p className="dictionary-english" lang="vi"><span>VI</span> {item.definitionVi}</p>}
        {language === 'vi' && item.definitionEn && item.definitionEn !== item.translationEn && <p lang="en">{item.definitionEn}</p>}
        {item.usageNote && <p className="dictionary-usage-note">{item.usageNote}</p>}
        {item.examples?.length > 0 && <div className="dictionary-examples"><h4><BilingualText vi="Trong câu" en="In a sentence" /></h4>{item.examples.map((example, exampleIndex) => <DictionaryExample key={example.id ?? exampleIndex} example={example} word={entry.word} />)}</div>}
      </div></section>)}
    </section>
    {links.otherPartsOfSpeech?.length > 0 && <section className="dictionary-related"><h2><BilingualText vi="Cùng cách viết, khác từ loại" en="Same spelling, different parts of speech" /></h2><div>{links.otherPartsOfSpeech.map(item => <DictionaryWordLink key={item.id} item={item} />)}</div></section>}
    {links.relatedWords?.length > 0 && <section className="dictionary-related"><h2><BilingualText vi="Từ liên quan trong nguồn" en="Related words" /></h2>{['synonyms', 'antonyms', 'related', 'derived'].map(kind => {
      const items = links.relatedWords.filter(item => item.kind === kind);
      return items.length ? <div className="dictionary-relation-group" key={kind}><h3><BilingualText>{({ synonyms: 'Đồng nghĩa', antonyms: 'Trái nghĩa', related: 'Liên quan', derived: 'Từ phái sinh' })[kind]}</BilingualText></h3><div>{items.map((item, index) => <div key={index}><DictionaryWordLink item={item} />{item.sense && <small className="dictionary-relation-scope">{item.sense}</small>}</div>)}</div></div> : null;
    })}</section>}
    {regional?.variants?.length > 0 && <section className="dictionary-regional"><div className="dictionary-section-heading"><h2><MapPin size={18} /> <BilingualText vi="Cách nói vùng miền" en="Regional expressions" /></h2><Link to={ROUTES.REGIONAL_VIETNAMESE}><BilingualText vi="Khám phá thêm →" en="Explore more →" /></Link></div><RegionalComparison comparison={regional} /></section>}
    {entry.lexical?.etymologies?.length > 0 && <details className="dictionary-etymology"><summary><BilingualText vi="Nguồn gốc từ theo dữ liệu nguồn" en="Word origins" /></summary>{entry.lexical.etymologies.map((text, index) => <p key={index}>{text}</p>)}</details>}
    {entry.lexical?.notes?.length > 0 && <section className="dictionary-usage-note"><h2><BilingualText vi="Ghi chú từ nguồn" en="Source notes" /></h2>{entry.lexical.notes.map((note, index) => <p key={index}>{note}</p>)}</section>}
    <DictionaryAttribution source={entry.source} />
  </article>;
}

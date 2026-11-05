import { generatePath, Link } from 'react-router-dom';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { SpeakButton } from '@/shared/components/common/Ui';
import { REGIONAL_REGIONS } from '@/features/explore/regional/models/RegionalVocabulary';
import { ROUTES } from '@/constants/routes';
import '@/features/explore/regional/components/regional.css';

export function RegionalVariantCard({ variant }) {
  const region = REGIONAL_REGIONS.find(item => item.value === variant.region);
  return <article className="regional-variant">
    <p className="eyebrow"><BilingualText vi={region?.vi || variant.region} en={region?.en || variant.region} /></p>
    <div className="regional-word"><h3 lang="vi">{variant.word}</h3>{variant.audioUrl && <SpeakButton text={variant.word} audioUrl={variant.audioUrl} />}</div>
    {variant.pronunciation && <p className="muted">{variant.pronunciation}</p>}
    <p className="preserve-lines"><BilingualText vi={variant.meaningVi || variant.meaning} en={variant.meaningEn || variant.meaning} /></p>
    {(variant.exampleSentenceVi || variant.exampleSentence) && <blockquote lang="vi" className="preserve-lines"><BilingualText vi={variant.exampleSentenceVi || variant.exampleSentence} en={variant.exampleSentenceEn || variant.exampleSentence} /></blockquote>}
    {(variant.usageNoteVi || variant.usageNote) && <p className="muted preserve-lines"><BilingualText vi={variant.usageNoteVi || variant.usageNote} en={variant.usageNoteEn || variant.usageNote} /></p>}
  </article>;
}
export function RegionalComparison({ comparison }) {
  return <section className="card regional-comparison">
    <div className="regional-comparison-heading"><div><p className="eyebrow"><BilingualText vi="Từ chuẩn" en="Standard word" /></p><h2>{comparison.word}</h2></div>
      <Link className="text-link" to={generatePath(ROUTES.VOCABULARY_CATALOG_DETAIL, { id: String(comparison.vocabularyId) })}><BilingualText vi="Xem từ vựng chuẩn →" en="View standard vocabulary →" /></Link></div>
    <div className="regional-comparison-grid">{REGIONAL_REGIONS.map(region => {
      const variants = comparison.variants.filter(item => item.region === region.value);
      return <div key={region.value} className="regional-region">{variants.length ? variants.map(variant => <RegionalVariantCard key={variant.id} variant={variant} />) : <div className="regional-variant regional-variant--empty"><p className="eyebrow"><BilingualText vi={region.vi} en={region.en} /></p><p className="muted"><BilingualText vi="Chưa có biến thể được xuất bản." en="No published variant yet." /></p></div>}</div>;
    })}</div>
  </section>;
}

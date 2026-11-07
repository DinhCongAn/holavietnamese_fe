import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { EmptyState, Tabs } from '@/shared/components/common/Ui';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { destinationExploreService } from '@/features/explore/api/destinationExploreService';
import { openableExploreScenarios, resolveExploreCultures } from '@/features/explore/models/DestinationExplore';
import { RegionalVariantCard } from '@/features/explore/regional/components/RegionalComparison';
import { ROUTES } from '@/constants/routes';
import { VocabularyEntryModal } from '@/features/vocabulary/components/VocabularyEntryModal';

const tabs = [
  { id: 'culture', label: <BilingualText vi="Văn hóa" en="Culture" /> },
  { id: 'language', label: <BilingualText vi="Ngôn ngữ vùng miền" en="Regional language" /> },
  { id: 'practice', label: <BilingualText vi="Thực hành" en="Practice" /> },
];
export function DestinationExploreContent({ destinationId }) {
  const { i18n } = useTranslation();
  const isVi = (i18n.resolvedLanguage || i18n.language || 'vi').startsWith('vi');
  const [tab, setTab] = useState('culture');
  const [selectedVocabularyId, setSelectedVocabularyId] = useState(null);
  const resource = useAsyncResource(useCallback(async signal => {
    const data = await destinationExploreService.get(destinationId, { signal });
    const cultures = await resolveExploreCultures(data.cultureIds || [], { signal });
    return { ...data, cultures };
  }, [destinationId]));
  return <><section className="card destination-explore-content">
    <Tabs items={tabs} value={tab} onChange={setTab} label={isVi ? 'Nội dung điểm đến' : 'Destination content'} />
    <ResourceState resource={resource}>{data => {
      const cultures = data.cultures || [], scenarios = openableExploreScenarios(data.scenarios || []);
      return <>
        {tab === 'culture' && (cultures.length ? <div className="explore-related-grid">{cultures.map(article => <article className="card" key={article.id}>
          {article.coverImage && <ContentImage src={article.coverImage} alt={article.title} className="explore-related-image" />}
          <h3><BilingualText vi={article.titleVi || article.title} en={article.titleEn || article.title} /></h3>
          <p><BilingualText vi={article.summaryVi || article.summary} en={article.summaryEn || article.summary} /></p>
          <Link className="text-link" to={generatePath(ROUTES.CULTURE_DETAIL, { id: article.id })}><BilingualText vi="Đọc bài văn hóa" en="Read article →" /></Link>
        </article>)}</div> : <EmptyState title={<BilingualText vi="Chưa có bài văn hóa liên kết" en="No linked culture articles yet" />} />)}
        {tab === 'language' && <>
          {data.regionalVariants?.length > 0 && <><p className="muted"><BilingualText vi="Cách dùng có thể thay đổi theo địa phương và ngữ cảnh. Bạn vẫn có thể sử dụng tiếng Việt phổ thông." en="Usage varies by place and context. Standard Vietnamese remains appropriate." /></p>
            <div className="explore-related-grid">{data.regionalVariants.map(variant => <div key={variant.id}><p><BilingualText vi="Từ tương đương:" en="Equivalent word:" /> <button type="button" className="text-link destination-vocabulary-link" onClick={() => setSelectedVocabularyId(variant.vocabularyId)}>{variant.masterWord}</button></p><RegionalVariantCard variant={variant} /></div>)}</div></>}
          {data.vocabulary?.length > 0 && <section><h3><BilingualText vi="Từ vựng hữu ích" en="Useful vocabulary" /></h3><ul>{data.vocabulary.map(word => <li key={word.id}><button type="button" className="text-link destination-vocabulary-link" onClick={() => setSelectedVocabularyId(word.id)}>{word.word}</button>{word.pronunciation && ` · ${word.pronunciation}`}</li>)}</ul></section>}
          {!data.regionalVariants?.length && !data.vocabulary?.length && <EmptyState title={<BilingualText vi="Chưa có nội dung ngôn ngữ liên kết" en="No linked language content yet" />} />}
          <Link className="text-link" to={ROUTES.REGIONAL_VIETNAMESE}><BilingualText vi="So sánh: Bắc – Trung – Nam" en="Compare regional expressions" /></Link>
        </>}
        {tab === 'practice' && (scenarios.length ? <div className="explore-related-grid">{scenarios.map(scenario => <article className="card" key={scenario.id}>
          <p className="eyebrow"><BilingualText vi="Trình độ gợi ý:" en="Suggested level:" /> {scenario.level}</p>
          <h3><BilingualText vi={scenario.titleVi || scenario.title} en={scenario.titleEn || scenario.title} /></h3>
          <p><BilingualText vi={scenario.overviewVi || scenario.overview} en={scenario.overviewEn || scenario.overview} /></p>
          <Link className="button" to={generatePath(ROUTES.AI_SCENARIO_DETAIL, { id: scenario.id })}><BilingualText vi="Xem tình huống và thực hành" en="View scenario and practise" /></Link>
        </article>)}</div> : <EmptyState title={<BilingualText vi="Chưa có kịch bản thực hành khả dụng" en="No practice scenarios available yet" />} />)}
      </>;
    }}</ResourceState>
  </section>{selectedVocabularyId != null && <VocabularyEntryModal key={selectedVocabularyId} vocabularyId={selectedVocabularyId} onClose={() => setSelectedVocabularyId(null)} />}</>;
}

import { useCallback, useState } from 'react';
import { Modal } from '@/shared/components/common/Modal';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { vocabularyCatalogService } from '@/features/vocabulary/api/vocabularyCatalogService';
import { regionalVocabularyService } from '@/features/explore/regional/api/regionalVocabularyService';
import { DictionaryEntry } from '@/features/vocabulary/pages/VocabularyDetailPage';
import '@/features/vocabulary/components/dictionary.css';

export function VocabularyEntryModal({ vocabularyId, onClose }) {
  const [, setRevision] = useState(0);
  const resource = useAsyncResource(useCallback(async signal => {
    const [entry, links, regional] = await Promise.all([
      vocabularyCatalogService.get(vocabularyId, { signal }),
      vocabularyCatalogService.links(vocabularyId, { signal }),
      regionalVocabularyService.get(vocabularyId, { signal }).catch(error => {
        if (error.status === 404) return null;
        throw error;
      }),
    ]);
    return { entry, links, regional };
  }, [vocabularyId]));

  return <section className="dictionary-detail">
    <Modal className="vocabulary-entry-modal" title={<BilingualText vi="Chi tiết từ vựng" en="Vocabulary Details" />} onClose={onClose}>
      <ResourceState resource={resource}>{data => <DictionaryEntry key={data.entry.id} {...data} onNotebookChanged={() => setRevision(value => value + 1)} />}</ResourceState>
    </Modal>
  </section>;
}

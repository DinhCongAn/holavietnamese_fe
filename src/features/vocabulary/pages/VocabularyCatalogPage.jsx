
import { useCallback, useEffect, useState } from 'react';
import { generatePath, Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowUpRight, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { ROUTES } from '@/constants/routes';
import { Pagination, EmptyState } from '@/shared/components/common/Ui';
import { DictionaryAudio, DictionaryAttribution } from '@/features/vocabulary/components/DictionaryElements';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { vocabularyCatalogService } from '@/features/vocabulary/api/vocabularyCatalogService';
import { dictionaryQuery, definitionOf, partOfSpeechLabel } from '@/features/vocabulary/models/Dictionary';
import '@/features/vocabulary/components/vocabulary.css';
import '@/features/vocabulary/components/dictionary.css';

export function VocabularyCatalogPage() {
  // 1. Quản lý ngôn ngữ và từ khóa tìm kiếm
  const { i18n } = useTranslation();
  const isVi = (i18n.resolvedLanguage || i18n.language).startsWith('vi');
  const [params, setParams] = useSearchParams();
  const query = dictionaryQuery(params);
  const [keyword, setKeyword] = useState(query.keyword);

  useEffect(() => setKeyword(query.keyword), [query.keyword]);

  // 2. Gọi API tìm kiếm từ vựng
  const resource = useAsyncResource(
    useCallback(
      signal => query.keyword.trim()
        ? vocabularyCatalogService.search(query, { signal })
        : Promise.resolve({ content: [], totalElements: 0, number: 0, totalPages: 0 }),
      [query.keyword, query.page]
    )
  );

  // 3. Cập nhật từ khóa và phân trang trên URL
  function filter(key, value) {
    const next = new URLSearchParams();
    if (query.keyword) next.set('keyword', query.keyword);
    next.set(key, String(value));
    setParams(next);
  }

  return (
    <section className="vocabulary-ui dictionary-page">
      {/* 4. Header giới thiệu từ điển */}
      <header className="dictionary-intro dictionary-intro-framed">
        <div>
          <p className="eyebrow">
            <BilingualText vi="TỪ ĐIỂN TIẾNG VIỆT" en="VIETNAMESE DICTIONARY" />
          </p>
          <h1>
            <BilingualText
              vi={<>Mỗi từ, <em>một cách hiểu.</em></>}
              en={<>Every word, <em>a new understanding.</em></>}
            />
          </h1>
          <p>
            <BilingualText
              vi="Tra từ tiếng Việt hoặc nghĩa tiếng Anh để tìm hiểu nghĩa và cách dùng."
              en="Search a Vietnamese word or its English meaning to discover definitions and usage."
            />
          </p>
          <div className="dictionary-intro-actions"></div>
        </div>

        <div className="dictionary-letter-art" aria-hidden="true">
          <span>ă â ê</span>
          <strong>Tiếng<br />Việt.</strong>
          <span>ô ơ ư đ</span>
        </div>
      </header>

      {/* 5. Form tìm kiếm từ vựng */}
      <form
        className="dictionary-lookup"
        onSubmit={event => {
          event.preventDefault();
          filter('keyword', keyword.trim());
        }}
      >
        <label htmlFor="dictionary-search">
          <BilingualText vi="Bạn muốn tra từ nào?" en="Which word would you like to look up?" />
        </label>

        <div className="dictionary-search-box">
          <Search size={22} aria-hidden="true" />
          <input
            id="dictionary-search"
            type="search"
            maxLength={200}
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder={isVi ? 'Nhập từ tiếng Việt hoặc nghĩa tiếng Anh…' : 'Enter a Vietnamese word or English meaning…'}
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              background: 'transparent',
            }}
          />
          <button>
            <BilingualText vi="Tìm từ" en="Look up" /> <ArrowUpRight size={17} />
          </button>
        </div>

        <p>
          <BilingualText
            vi="Tra theo từ tiếng Việt hoặc nghĩa tiếng Anh đã có trong dữ liệu. Kết quả khớp tên từ được ưu tiên."
            en="Search the Vietnamese words and English meanings in the dictionary. Exact word matches appear first."
          />
        </p>
      </form>

      {/* 6. Hiển thị kết quả tìm kiếm */}
      {query.keyword.trim() && (
        <ResourceState resource={resource}>
          {data => data.content.length ? (
            <>
              <div className="dictionary-results-heading">
                <div>
                  <h2>
                    <BilingualText vi={`Kết quả cho “${query.keyword}”`} en={`Results for “${query.keyword}”`} />
                  </h2>
                  <p>
                    <BilingualText
                      vi={`${data.totalElements.toLocaleString('vi-VN')} mục từ · Trang ${data.number + 1}/${data.totalPages}`}
                      en={`${data.totalElements.toLocaleString('en-US')} entries · Page ${data.number + 1}/${data.totalPages}`}
                    />
                  </p>
                </div>
              </div>

              {/* 7. Danh sách từ vựng */}
              <div className="dictionary-entry-grid">
                {data.content.map(item => {
                  const meaning = item.meanings?.[0];
                  const href = generatePath(ROUTES.VOCABULARY_CATALOG_DETAIL, { id: String(item.id) });

                  return (
                    <article className="dictionary-entry" key={item.id}>
                      <div className="dictionary-entry-top">
                        <span className="dictionary-pos">
                          {partOfSpeechLabel(item.partOfSpeech, isVi ? 'vi' : 'en')}
                        </span>
                      </div>

                      <h3 lang="vi">
                        <Link to={href} state={{ dictionarySearch: params.toString() }}>
                          {item.word}
                        </Link>
                      </h3>

                      {item.pronunciation && <p className="dictionary-ipa">{item.pronunciation}</p>}

                      <p className="dictionary-definition-preview" lang={isVi ? 'vi' : 'en'}>
                        {definitionOf(meaning, isVi ? 'vi' : 'en')}
                      </p>

                      {isVi && meaning?.definitionVi && meaning.translationEn && (
                        <p className="dictionary-english" lang="en">{meaning.translationEn}</p>
                      )}
                      {!isVi && meaning?.definitionVi && (
                        <p className="dictionary-english" lang="vi"><span>VI</span> {meaning.definitionVi}</p>
                      )}

                      <DictionaryAudio entry={item} />

                      <div className="dictionary-entry-bottom">
                        <span>
                          <BilingualText
                            vi={`${item.meanings?.length || 0} nghĩa`}
                            en={`${item.meanings?.length || 0} meanings`}
                          />
                        </span>
                        <Link to={href} state={{ dictionarySearch: params.toString() }}>
                          <BilingualText vi="Tra chi tiết" en="View entry" /> <ArrowUpRight size={15} />
                        </Link>
                      </div>

                      <DictionaryAttribution source={item.source} compact />
                    </article>
                  );
                })}
              </div>

              {/* 8. Phân trang */}
              <Pagination page={data.number} totalPages={data.totalPages} onChange={page => filter('page', page)} />
            </>
          ) : (
            /* 9. Không tìm thấy từ vựng */
            <EmptyState
              title={<BilingualText vi="Chưa có mục từ phù hợp" en="No matching entries" />}
              description={<BilingualText vi="Thử từ tiếng Việt hoặc nghĩa tiếng Anh khác." en="Try another Vietnamese word or English meaning." />}
            />
          )}
        </ResourceState>
      )}
    </section>
  );
}

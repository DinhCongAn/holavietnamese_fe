import { useTranslation } from 'react-i18next';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCallback, useState } from 'react';
import { generatePath, Link, useLocation, useParams } from 'react-router-dom';
import { Breadcrumb, EmptyState, Artwork } from '@/shared/components/common/Ui';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { DestinationRegion } from '@/features/explore/components/DestinationMetadata';
import { DestinationExploreContent } from '@/features/explore/components/DestinationExploreContent';
import { VietnamDiscoveryMap } from '@/features/explore/components/VietnamDiscoveryMap';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { DESTINATION_REGIONS } from '@/features/explore/models/Destination';
import { destinationService } from '@/features/explore/api/destinationService';
import { ROUTES } from '@/constants/routes';
import '@/features/explore/components/destinations.css';
import { Search, X, ArrowLeft } from 'lucide-react';

const emptyFilters = { keyword: '', region: '' };

export function ExploreVietnamPage() {
  const { i18n } = useTranslation();
  const isVi = (i18n.resolvedLanguage || i18n.language).startsWith('vi');
  const { isAuthenticated, user } = useAuth();
  const viewerId = user?.id ?? user?.userId;
  const [query, setQuery] = useState(emptyFilters);
  const [keyword, setKeyword] = useState('');
  const [activeDestinationId, setActiveDestinationId] = useState(null);
  const location = useLocation();
  const detailRoute = location.pathname === ROUTES.EXPLORE ? ROUTES.DESTINATION_DETAIL : ROUTES.LEARNER_DESTINATION_DETAIL;
  const resource = useAsyncResource(useCallback(async signal => {
    if (!isAuthenticated) throw Object.assign(new Error(isVi ? 'Đăng nhập để khám phá điểm đến.' : 'Sign in to explore destinations.'), { status: 401 });
    return destinationService.list(query, { signal });
  }, [query, viewerId, isAuthenticated, isVi]));

  const handleRegionClick = (val) => {
    setQuery(current => ({ ...current, region: val }));
  };

  return (
    <section className="explore-page w-full max-w-full px-0 py-6 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF7E8] via-[#F7F0E3] to-[#EEE3D1] border border-[#E8E5DF] p-8 sm:p-12 shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none overflow-hidden hidden md:block">
          <Artwork kind="dong-son" className="w-full h-full object-contain object-right" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#FFF0DC] border border-[#E7B59D] text-[#EA580C] text-xs font-bold uppercase tracking-wider shadow-xs">
            <BilingualText vi="Ngôn ngữ chỉ là điểm bắt đầu" en="Language is only the beginning" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#253044] tracking-tight leading-tight">
            <BilingualText vi="Khám phá Việt Nam" en="Explore Vietnam" />
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-3xl">
            <BilingualText vi="Học ngôn ngữ. Gặp gỡ văn hóa. Cảm thấy gần gũi hơn mỗi ngày qua từng nẻo đường đất nước hình chữ S." en="Learn the language. Discover the culture. Feel closer to Vietnam with every destination." />
          </p>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <form
        className="explore-toolbar bg-white rounded-2xl border border-[#E8E5DF] p-4 sm:p-5 shadow-xs"
        onSubmit={event => {
          event.preventDefault();
          setQuery(current => ({ ...current, keyword: keyword.trim() }));
        }}
      >
        <div className="explore-region-buttons">
          <span className="text-xs font-bold text-[#64748B] mr-1"><BilingualText vi="Vùng miền:" en="Region:" /></span>
          <button
            type="button"
            aria-pressed={!query.region}
            onClick={() => handleRegionClick('')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              !query.region
                ? 'bg-[#EA580C] text-white shadow-xs'
                : 'bg-[#FFF7E8] text-[#253044] border border-[#E8E5DF] hover:bg-[#F7F0E3]'
            }`}
          >
            <BilingualText vi="Tất cả" en="All" />
          </button>
          {DESTINATION_REGIONS.map(reg => (
            <button
              key={reg.value}
              type="button"
              aria-pressed={query.region === reg.value}
              onClick={() => handleRegionClick(reg.value)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                query.region === reg.value
                  ? 'bg-[#EA580C] text-white shadow-xs'
                  : 'bg-[#FFF7E8] text-[#253044] border border-[#E8E5DF] hover:bg-[#F7F0E3]'
              }`}
            >
              <BilingualText vi={reg.vi} en={reg.en} />
            </button>
          ))}
        </div>

          <label className="explore-keyword-filter w-full">
            <span className="sr-only"><BilingualText vi="Tìm kiếm" en="Search" /></span>
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                placeholder={isVi ? 'Tên tiếng Việt hoặc tiếng Anh…' : 'Vietnamese or English name…'}
                className="w-full pl-10 pr-9 py-2.5 bg-[#FFF7E8] border border-[#E8E5DF] focus:border-[#EA580C] rounded-xl text-xs sm:text-sm text-[#253044] outline-hidden"
              />
              {keyword && (
                <button
                  type="button"
                  aria-label={isVi ? "Xóa từ khóa" : "Clear keyword"}
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#253044]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </label>

          <div className="actions flex items-center gap-2 shrink-0">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-md transition-all"
            >
              <BilingualText vi="Tìm kiếm" en="Search" />
            </button>
            <button
              type="button"
              className="secondary px-4 py-2.5 rounded-xl bg-[#FFF7E8] hover:bg-[#F7F0E3] text-[#253044] border border-[#E8E5DF] font-semibold text-xs transition-all"
              onClick={() => { setKeyword(''); setQuery({ ...emptyFilters }); }}
            >
              <BilingualText vi="Đặt lại" en="Reset" />
            </button>
          </div>
      </form>

      {/* Destinations Board */}
      {!isAuthenticated ? <EmptyState title={<BilingualText vi="Đăng nhập để khám phá" en="Sign in to explore" />}><Link className="button" to={ROUTES.LOGIN}><BilingualText vi="Đăng nhập" en="Sign in" /></Link></EmptyState> : <ResourceState resource={resource}>
        {items => {
          const destinations = items.filter(item => item.status === 'PUBLISHED');
          return destinations.length === 0
            ? (
              <EmptyState
                title={<BilingualText vi="Chưa có điểm đến phù hợp" en="No matching destinations" />}
                description={<BilingualText vi="Thử từ khóa hoặc vùng miền khác. Các điểm đến sẽ xuất hiện khi được xuất bản." en="Try another keyword or region. Destinations appear once published." />}
              />
            )
            : (
              <div className="journey-board card bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-sm">
                <aside className="journey-map">
                  <p className="eyebrow text-xs font-bold text-[#EA580C] tracking-widest uppercase mb-2">
                    <BilingualText vi={`VIỆT NAM · ${destinations.length} điểm đến`} en={`VIETNAM · ${destinations.length} destinations`} />
                  </p>
                  <VietnamDiscoveryMap destinations={destinations} activeId={activeDestinationId}
                    onActivate={setActiveDestinationId} detailRoute={detailRoute} />
                </aside>

                <div className="journey-stops space-y-4">
                  {destinations.map(destination => {
                    return <Link
                      className={`journey-stop group relative block p-4 sm:p-5 rounded-2xl bg-[#FFFDF9] hover:bg-white border border-[#E8E5DF] hover:border-[#EA580C] shadow-xs hover:shadow-md transition-all text-decoration-none${activeDestinationId === destination.id ? ' is-map-active' : ''}`}
                      key={destination.id}
                      to={generatePath(detailRoute, { id: String(destination.id) })}
                      onPointerEnter={event => { if (event.pointerType !== 'touch') setActiveDestinationId(destination.id); }}
                      onFocus={() => setActiveDestinationId(destination.id)}
                    >
                      <span className="journey-dot" aria-hidden="true" />
                      <div className="journey-thumbnail rounded-xl overflow-hidden shadow-xs">
                        <ContentImage
                          src={destination.imageUrl}
                          alt={isVi ? destination.nameVi : (destination.nameEn || destination.nameVi)}
                          className="figma-art w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="eyebrow text-[11px] font-bold text-[#EA580C] uppercase tracking-wider mb-1">
                          <DestinationRegion value={destination.region} />
                        </p>
                        <h2 className="text-lg sm:text-xl font-black text-[#253044] group-hover:text-[#EA580C] transition-colors leading-snug">
                          <BilingualText vi={destination.nameVi} en={destination.nameEn} />
                        </h2>
                        {(destination.shortDescriptionVi || destination.shortDescriptionEn) && (
                          <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 mt-1 leading-relaxed">
                            <BilingualText vi={destination.shortDescriptionVi || destination.shortDescriptionEn} en={destination.shortDescriptionEn || destination.shortDescriptionVi} />
                          </p>
                        )}
                        <small className="inline-flex items-center gap-1 text-xs font-bold text-[#EA580C] mt-2 group-hover:underline">
                          <BilingualText vi="Chi tiết" en="Details" /> →
                        </small>
                      </div>
                      <span className="journey-number text-[#64748B] group-hover:text-[#EA580C] group-hover:translate-x-1 transition-all" aria-hidden="true">
                        →
                      </span>
                    </Link>;
                  })}
                </div>
              </div>
            );
        }}
      </ResourceState>}
    </section>
  );
}

export function DestinationDetailPage() {
  const { i18n } = useTranslation();
  const isVi = (i18n.resolvedLanguage || i18n.language).startsWith('vi');
  const { id } = useParams();
  const location = useLocation();
  const backRoute = location.pathname.startsWith(ROUTES.EXPLORE + '/') ? ROUTES.EXPLORE : ROUTES.EXPLORE_VIETNAM;
  const legacySlug = backRoute === ROUTES.EXPLORE && !/^\d+$/.test(id);
  const resource = useAsyncResource(useCallback(signal => legacySlug
    ? destinationService.getBySlug(id, { signal })
    : destinationService.get(id, { signal }), [id, legacySlug]));
  const missing = (
    <EmptyState title={<BilingualText vi="Không tìm thấy điểm đến" en="Destination not found" />}>
      <Link className="button secondary" to={backRoute}>
        <BilingualText vi="Về Khám phá Việt Nam" en="Back to Explore Vietnam" />
      </Link>
    </EmptyState>
  );

  if (resource.error?.status === 404) return missing;
  return (
    <ResourceState resource={resource}>
      {destination => {
        if (!destination || destination.status !== 'PUBLISHED') return missing;
        return (
          <section className="destination-detail-page w-full max-w-full px-0 py-6 space-y-8">
            <Breadcrumb items={[{ label: <BilingualText vi="Khám phá Việt Nam" en="Explore Vietnam" />, to: backRoute }, { label: <BilingualText vi={destination.nameVi} en={destination.nameEn} /> }]} />

            {/* Destination Hero Banner */}
            <div className="destination-hero card rounded-3xl bg-white border border-[#E8E5DF] p-8 sm:p-12 shadow-sm overflow-hidden">
              <div className="space-y-4">
                <p className="eyebrow text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                  <DestinationRegion value={destination.region} />
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#253044] tracking-tight">
                  <BilingualText vi={destination.nameVi} en={destination.nameEn} />
                </h1>
                {(destination.shortDescriptionVi || destination.shortDescriptionEn) && (
                  <p className="lead text-sm sm:text-base text-[#64748B] leading-relaxed" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                    <BilingualText vi={destination.shortDescriptionVi || destination.shortDescriptionEn} en={destination.shortDescriptionEn || destination.shortDescriptionVi} />
                  </p>
                )}
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md mt-4 lg:mt-0">
                <ContentImage
                  src={destination.imageUrl}
                  alt={isVi ? destination.nameVi : (destination.nameEn || destination.nameVi)}
                  className="figma-art w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {(destination.descriptionVi || destination.descriptionEn) && <section className="card bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs space-y-4">
              <h2><BilingualText vi="Khám phá điểm đến" en="Explore the destination" /></h2>
              <div className="rich-text" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                <BilingualText vi={destination.descriptionVi || destination.descriptionEn} en={destination.descriptionEn || destination.descriptionVi} />
              </div>
            </section>}

            <DestinationExploreContent key={destination.id} destinationId={destination.id} />
            <div className="actions pt-4">
              <Link
                className="button secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#FFF7E8] text-[#253044] border border-[#E8E5DF] font-semibold text-xs shadow-xs transition-all"
                to={backRoute}
              >
                <ArrowLeft size={14} />
                <BilingualText vi="Khám phá Việt Nam" en="← Explore Vietnam" />
              </Link>
            </div>
          </section>
        );
      }}
    </ResourceState>
  );
}

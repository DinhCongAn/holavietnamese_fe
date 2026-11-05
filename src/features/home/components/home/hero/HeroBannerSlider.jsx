import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeroSlideContent } from '@/features/home/components/home/hero/HeroSlideContent';
import { HeroStageVisual } from '@/features/home/components/home/hero/HeroStageVisual';
import { audioFeedback } from '@/utils/audioFeedback';
import { localizedSiteField, useSiteContent } from '@/features/admin/context/SiteContentContext';
import { BANNER_PLACEMENTS } from '@/config/siteContentDefaults';

const AUTOPLAY_DURATION = 5600;
const TRANSITION_LOCK = 650;

export function HeroBannerSlider() {
  const { t, i18n } = useTranslation('home');
  const { getBanners } = useSiteContent();
  const banners = getBanners(BANNER_PLACEMENTS.GUEST_HOME);
  const totalSlides = banners.length;
  const language = i18n.resolvedLanguage || i18n.language || 'en';
  const reduceMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const locked = useRef(false);
  const unlockTimer = useRef(null);
  const paused = hovered || focusWithin || reduceMotion;
  const slideTitles = banners.map((banner) => localizedSiteField(banner, 'title', language));

  const goTo = useCallback((nextIndex, manual = true) => {
    if (locked.current || totalSlides < 2) return;
    locked.current = true;
    if (manual) audioFeedback.playTap();
    setCurrentSlide((nextIndex + totalSlides) % totalSlides);
    if (manual) setTimerKey((value) => value + 1);
    window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => { locked.current = false; }, reduceMotion ? 50 : TRANSITION_LOCK);
  }, [reduceMotion, totalSlides]);

  useEffect(() => () => window.clearTimeout(unlockTimer.current), []);

  useEffect(() => {
    if (currentSlide >= totalSlides) setCurrentSlide(0);
  }, [currentSlide, totalSlides]);

  useEffect(() => {
    if (paused || totalSlides < 2) return undefined;
    const timer = window.setTimeout(() => goTo(currentSlide + 1, false), AUTOPLAY_DURATION);
    return () => window.clearTimeout(timer);
  }, [currentSlide, goTo, paused, timerKey, totalSlides]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(currentSlide - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(currentSlide + 1); }
  };

  const handleTouchEnd = () => {
    if (touchStart.current == null || touchEnd.current == null) return;
    const distance = touchStart.current - touchEnd.current;
    touchStart.current = null;
    touchEnd.current = null;
    if (Math.abs(distance) > 45) goTo(currentSlide + (distance > 0 ? 1 : -1));
  };

  if (totalSlides === 0) return null;
  const currentBanner = banners[currentSlide] || banners[0];

  return (
    <section
      className="hero-banner-container guest-cultural-banner"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false); }}
      onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; touchEnd.current = null; }}
      onTouchMove={(event) => { touchEnd.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label={t('carouselLabel')}
    >
      <div className="hero-banner-grid">
        <HeroSlideContent banner={currentBanner} />
        <HeroStageVisual banner={currentBanner} eager={currentSlide === 0} />
      </div>

      {totalSlides > 1 && <div className="guest-cultural-banner__arrows">
        <button type="button" onClick={() => goTo(currentSlide - 1)} aria-label={t('previousSlide')}><ChevronLeft size={22} /></button>
        <button type="button" onClick={() => goTo(currentSlide + 1)} aria-label={t('nextSlide')}><ChevronRight size={22} /></button>
      </div>}

      {totalSlides > 1 && <div className="guest-cultural-banner__pagination" role="group" aria-label={t('carouselLabel')}>
        {banners.map((banner, index) => (
          <button key={banner.id ?? banner.code ?? index} type="button" className={index === currentSlide ? 'is-active' : ''} onClick={() => goTo(index)} title={slideTitles[index]} aria-label={t('goToSlide', { number: index + 1, title: slideTitles[index] })} aria-current={index === currentSlide ? 'true' : undefined}>
            <span>{index === currentSlide && <i key={`${currentSlide}-${timerKey}`} className={paused ? 'is-paused' : ''} />}</span>
          </button>
        ))}
      </div>}
    </section>
  );
}

export default HeroBannerSlider;

import { BilingualText, bilingualLabel, useBilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';
import { useEffect, useId, useRef, useState } from 'react';
import { mediaSource } from '@/shared/components/common/mediaSource';
import { ArrowLeft, ArrowRight, Inbox, Volume2 } from 'lucide-react';
import { getStoredAudioSpeed } from '@/features/account/services/userSettingsService';

export function PageHeader({ eyebrow, title, description, actions }) {
  useTextLanguage();
  return <header className="page-header"><div>{eyebrow && <p className="eyebrow"><BilingualText>{eyebrow}</BilingualText></p>}<h1><BilingualText>{title}</BilingualText></h1>{description && <p className="lead"><BilingualText>{description}</BilingualText></p>}</div>{actions && <div className="actions">{actions}</div>}</header>;
}

export function Tabs({ items, value, onChange, label }) {
  useTextLanguage();
  const resolvedLabel = label ?? bilingualLabel('Chọn nội dung', 'Select content');
  return <div className="ui-tabs" role="tablist" aria-label={resolvedLabel}>{items.map(item => <button key={item.id} type="button" role="tab" aria-selected={value === item.id} className={value === item.id ? 'active' : ''} onClick={() => onChange(item.id)}><BilingualText>{item.label}</BilingualText></button>)}</div>;
}

export function Breadcrumb({ items }) {
  useTextLanguage();
  return <nav className="breadcrumb" aria-label={bilingualLabel("Đường dẫn", "Breadcrumb")}>{items.map((item, index) => <span key={index}>{index > 0 && <span aria-hidden="true"> / </span>}{item.to ? <Link to={item.to}><BilingualText>{item.label}</BilingualText></Link> : <span aria-current="page"><BilingualText>{item.label}</BilingualText></span>}</span>)}</nav>;
}

export function EmptyState({ title, description, children }) {
  useTextLanguage();
  const resolvedTitle = title ?? bilingualLabel('Chưa có nội dung', 'No content available');
  return <div className="state"><span className="state-symbol" aria-hidden="true"><Inbox size={28}/></span><h2><BilingualText>{resolvedTitle}</BilingualText></h2>{description && <p><BilingualText>{description}</BilingualText></p>}{children && <div className="actions">{children}</div>}</div>;
}

export function Notice({ children, kind = 'info' }) {
  return <div className={`ui-notice ui-notice--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>;
}

export function Pagination({ page, totalPages, onChange }) {
  useTextLanguage();
  if (totalPages < 2) return null;
  return <nav className="pagination" aria-label={bilingualLabel("Phân trang", "Pagination")}><button className="secondary" disabled={page <= 0} onClick={() => onChange(page - 1)}><ArrowLeft size={16}/><BilingualText>{"Trước"}</BilingualText></button><span>{page + 1} / {totalPages}</span><button className="secondary" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}><BilingualText>{"Sau"}</BilingualText><ArrowRight size={16}/></button></nav>;
}

export function Artwork({ kind = 'food', className = '', alt = '' }) {
  return <img className={`figma-art ${className}`} src={`${import.meta.env.BASE_URL}design/${kind}.svg`} alt={alt} loading="lazy" decoding="async" />;
}

export function SpeakButton({ text, audioUrl, className = '', fallbackToSpeech = false }) {
  return <SpeechAttempt key={`${audioUrl || ''}-${text || ''}`} text={text} audioUrl={audioUrl} className={className} fallbackToSpeech={fallbackToSpeech} />;
}

function SpeechAttempt({ text, audioUrl, className, fallbackToSpeech }) {
  const label = useBilingualLabel();
  const [error, setError] = useState(''), player = useRef(null), attempt = useRef(0), errorId = useId();
  useEffect(() => () => { attempt.current += 1; if (player.current) { player.current.pause(); player.current.src = ''; } }, []);
  async function speak() {
    const currentAttempt = ++attempt.current;
    setError('');
    if (player.current) player.current.pause();
    if (audioUrl) {
      const source = mediaSource(audioUrl, 'audio');
      // YouTube pages cannot be played by HTMLAudioElement.
      const youtubePage = source && /^(?:https?:)?\/\/(?:[\w-]+\.)*(?:youtube\.com|youtu\.be|youtube-nocookie\.com)(?:[/:?#]|$)/i.test(source);
      if (source && !(fallbackToSpeech && youtubePage)) {
        player.current = new Audio(source);
        player.current.playbackRate = getStoredAudioSpeed();
        try { await player.current.play(); return; } catch (failure) {
          if (failure.name === 'AbortError' || currentAttempt !== attempt.current) return;
          if (!fallbackToSpeech || !text) { setError(label('Không phát được âm thanh. Vui lòng thử lại sau.', 'Could not play audio. Please try again later.')); return; }
        }
      } else if (!fallbackToSpeech || !text) { setError(label('Đường dẫn âm thanh không hợp lệ.', 'Invalid audio URL.')); return; }
    }
    if (currentAttempt !== attempt.current) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'vi-VN'; utterance.rate = getStoredAudioSpeed();
      utterance.onerror = event => { if (currentAttempt === attempt.current && !['canceled', 'interrupted'].includes(event.error)) setError(label('Không phát được giọng đọc trên trình duyệt này.', 'Text-to-speech failed on this browser.')); };
      window.speechSynthesis.speak(utterance);
    } else setError(label('Trình duyệt chưa hỗ trợ giọng đọc.', 'Speech synthesis is not supported on this browser.'));
  }
  return <><button type="button" className={`speak-button ${className}`} disabled={!text && !audioUrl}
    aria-label={label(`Nghe phát âm: ${text || 'Âm thanh'}`, `Listen to pronunciation: ${text || 'Audio'}`)} aria-describedby={error ? errorId : undefined}
    onClick={speak}><Volume2 size={17} aria-hidden="true"/></button>{error && <small className="media-error speak-error" id={errorId} role="status"><BilingualText>{error}</BilingualText></small>}</>;
}

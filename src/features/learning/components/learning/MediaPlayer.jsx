import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState } from 'react';
import { mediaSource } from '@/shared/components/common/mediaSource';
import { Volume2, Video, AlertCircle } from 'lucide-react';

export function MediaPlayer({ videoUrl, audioUrl }) {
  return (
    <div className="media-player-group space-y-3">
      {videoUrl && <MediaAttempt key={`video-${String(videoUrl)}`} value={videoUrl} type="video" />}
      {audioUrl && <MediaAttempt key={`audio-${String(audioUrl)}`} value={audioUrl} type="audio" />}
    </div>
  );
}

function MediaAttempt({ value, type }) {
  useTextLanguage();
  const src = mediaSource(value, type);
  const [failed, setFailed] = useState(false);
  const label = type === 'video' ? 'video' : 'âm thanh';

  if (!src || failed) {
    return (
      <p className="media-error flex items-center gap-1.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 m-0" role="status">
        <AlertCircle size={14} className="shrink-0" />
        <BilingualText
          vi={failed ? `Không tải được ${label}. Vui lòng thử lại sau.` : `Đường dẫn ${label} không hợp lệ.`}
          en={failed ? `Could not load ${type}. Please try again later.` : `Invalid ${type} URL.`}
        />
      </p>
    );
  }

  const Player = type;

  if (type === 'video') {
    return (
      <div className="video-player-frame rounded-2xl overflow-hidden bg-black/90 shadow-sm border border-[#E8E5DF]/60">
        <Player
          src={src}
          controls
          preload="metadata"
          className="w-full aspect-video rounded-2xl"
          aria-label={bilingualLabel("Video bài học", "Lesson video")}
          onError={() => setFailed(true)}
        >
          <BilingualText>{"Trình duyệt không hỗ trợ phát"}</BilingualText>
          <BilingualText>{"video"}</BilingualText>.
        </Player>
      </div>
    );
  }

  return (
    <div className="audio-player-wrapper p-3 rounded-2xl bg-[#FFF7E8] border border-[#E8E5DF] flex flex-col sm:flex-row items-center gap-3 shadow-2xs">
      <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C] shrink-0">
        <span className="w-8 h-8 rounded-xl bg-white border border-[#E8E5DF]/60 flex items-center justify-center text-[#FF7A00] shadow-2xs">
          <Volume2 size={16} />
        </span>
        <span className="hidden sm:inline"><BilingualText vi="Phát âm bài học" en="Lesson audio" /></span>
      </div>

      <Player
        src={src}
        controls
        preload="metadata"
        className="w-full h-10 rounded-xl"
        aria-label={bilingualLabel("Âm thanh bài học", "Lesson audio")}
        onError={() => setFailed(true)}
      >
        <BilingualText>{"Trình duyệt không hỗ trợ phát"}</BilingualText>
        <BilingualText>{"âm thanh"}</BilingualText>.
      </Player>
    </div>
  );
}

export default MediaPlayer;

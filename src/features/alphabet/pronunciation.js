import { useEffect, useRef, useState } from "react";
import { getStoredAudioSpeed } from "@/features/account/services/userSettingsService";

export const VIETSYLLABLES_ASSET_HOST = "https://assets.vietsyllables.com";
export const VIETSYLLABLES_VOICE = "vb_northern_hn_female_nh";

// Keep this in one place so the letter tiles and the syllable chart always use
// the same VietSyllables recording. Their player resolves audio as:
// asset host / voice / initial / final_tone.mp3.
export function getVietSyllablesAudioUrl(initial, final, toneId) {
  const safeInitial = initial || "∅";
  return `${VIETSYLLABLES_ASSET_HOST}/${VIETSYLLABLES_VOICE}/${encodeURIComponent(safeInitial)}/${encodeURIComponent(final)}_${encodeURIComponent(toneId)}.mp3`;
}

const toneMarks = { grave: "\u0300", acute: "\u0301", hook: "\u0309", tilde: "\u0303", dot: "\u0323" };

// Letter names and consonant groups assembled from the same recorded syllables
// used by the chart. A null mapping means the chart has no standalone syllable.
const tileSamples = {
  a: [["∅", "a", "none", "a"]],
  "a-breve": [["∅", "a", "acute", "á"]],
  "a-circumflex": [["∅", "ơ", "acute", "ớ"]],
  b: [["b", "ê", "none", "bê"]],
  c: [["x", "ê", "none", "xê"]],
  d: [["d", "ê", "none", "dê"]],
  "d-stroke": [["đ", "ê", "none", "đê"]],
  e: [["∅", "e", "none", "e"]],
  "e-circumflex": [["∅", "ê", "none", "ê"]],
  g: [["gi", "ê", "none", "giê"]],
  h: [["h", "at", "acute", "hát"]],
  i: [["∅", "i", "none", "i"]],
  k: [["c", "a", "none", "ca"]],
  l: [["∅", "e", "none", "e"], ["l", "ơ", "grave", "lờ"]],
  m: [["∅", "em", "none", "em"], ["m", "ơ", "grave", "mờ"]],
  n: [["∅", "en", "none", "en"], ["n", "ơ", "grave", "nờ"]],
  o: [["∅", "o", "none", "o"]],
  "o-circumflex": [["∅", "ô", "none", "ô"]],
  "o-horn": [["∅", "ơ", "none", "ơ"]],
  p: [["p", "ê", "none", "pê"]],
  q: [["c", "u", "none", "cu"]],
  r: [["∅", "e", "none", "e"], ["r", "ơ", "grave", "rờ"]],
  s: [["∅", "et", "acute", "ét"], ["s", "i", "grave", "sì"]],
  t: [["t", "ê", "none", "tê"]],
  u: [["∅", "u", "none", "u"]],
  "u-horn": [["∅", "ư", "none", "ư"]],
  v: [["v", "ê", "none", "vê"]],
  x: [["∅", "ich", "acute", "ích"], ["x", "i", "grave", "xì"]],
  y: [["∅", "y", "none", "y"]],
  ch: [["ch", "ơ", "grave", "chờ"]],
  gh: [["g", "ơ", "grave", "gờ"]],
  gi: [["gi", "ơ", "grave", "giờ"]],
  kh: [["kh", "ơ", "grave", "khờ"]],
  ng: [["ng", "ơ", "grave", "ngờ"]],
  ngh: [["ng", "ơ", "grave", "ngờ"]],
  nh: [["nh", "ơ", "grave", "nhờ"]],
  ph: [["ph", "ơ", "grave", "phờ"]],
  qu: [["qu", "ơ", "grave", "quờ"]],
  th: [["th", "ơ", "grave", "thờ"]],
  tr: [["tr", "ơ", "grave", "trờ"]],
  "tone-ngang": [["∅", "a", "none", "a"]],
  "tone-sac": [["∅", "a", "acute", "á"]],
  "tone-huyen": [["∅", "a", "grave", "à"]],
  "tone-hoi": [["∅", "a", "hook", "ả"]],
  "tone-nga": [["∅", "a", "tilde", "ã"]],
  "tone-nang": [["∅", "a", "dot", "ạ"]],
};

let activePlayer = null;
const unavailableUrls = new Set();

export function withTone(word, tone) {
  if (tone === "none") return word;
  const chars = Array.from(word);
  const vowels = chars.map((char, index) => /[aăâeêioôơuưy]/u.test(char) ? index : -1).filter((index) => index >= 0);
  if (!vowels.length) return word;
  let index = vowels.find((position) => /[ăâêôơ]/u.test(chars[position]));
  if (index === undefined) index = vowels.find((position) => chars[position] === "ư" && !vowels.some((other) => chars[other] === "ơ"));
  if (index === undefined) index = vowels[0];
  if (vowels.length > 1 && /[oqu]/u.test(chars[vowels[0]]) && /[aeêiy]/u.test(chars[vowels[1]])) index = vowels[1];
  chars[index] = (chars[index] + toneMarks[tone]).normalize("NFC");
  return chars.join("");
}

export function entriesForTile(item, group) {
  const samples = tileSamples[item.id];
  if (!samples) return [{
    ...item, group, key: `${group}-${item.id}`,
    syllable: item.reading, spoken: item.reading, url: null,
  }];
  return samples.map(([initial, final, toneId, spoken], index) => ({
    ...item, group, key: `${group}-${item.id}-${index}`,
    syllable: item.reading, spoken, toneId,
    source: "Giọng Hà Nội",
    url: getVietSyllablesAudioUrl(initial, final, toneId),
  }));
}

export function usePronunciationPlayer() {
  const idRef = useRef(Symbol("pronunciation-player"));
  const audioRef = useRef(null);
  const requestRef = useRef(0);
  const queueRef = useRef([]);
  const [current, setCurrent] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function cancel() {
    requestRef.current += 1;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }

  function stop() {
    cancel();
    if (activePlayer?.id === idRef.current) activePlayer = null;
  }

  useEffect(() => () => {
    const wasActive = activePlayer?.id === idRef.current;
    if (wasActive) activePlayer = null;
    requestRef.current += 1;
    audioRef.current?.pause();
    if (wasActive) window.speechSynthesis?.cancel();
  }, []);

  function playQueue(queue, index = 0, token) {
    if (!queue.length) return;
    if (token === undefined) {
      if (activePlayer?.id !== idRef.current) activePlayer?.cancel();
      activePlayer = { id: idRef.current, cancel };
      queueRef.current = queue;
    }
    const request = token ?? ++requestRef.current;
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    const entry = queue[index];
    const audio = entry.url ? new Audio(entry.url) : null;
    if (audio) {
      audio.playbackRate = getStoredAudioSpeed();
    }
    audioRef.current = audio;
    setCurrent({ ...entry, index: index + 1, total: queue.length });
    setStatus("loading");
    setError("");
    let fallbackStarted = false;
    const next = () => {
      if (request !== requestRef.current) return;
      if (index + 1 < queue.length) playQueue(queue, index + 1, request);
      else {
        setStatus("idle");
        if (activePlayer?.id === idRef.current) activePlayer = null;
      }
    };
    const fail = () => {
      if (request !== requestRef.current || fallbackStarted) return;
      fallbackStarted = true;
      if (entry.url) unavailableUrls.add(entry.url);
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        setStatus("error");
        setError("Không tải được âm mẫu và trình duyệt không hỗ trợ giọng đọc dự phòng.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(entry.spoken || withTone(entry.syllable, entry.toneId));
      utterance.lang = "vi-VN";
      utterance.rate = getStoredAudioSpeed();
      const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("vi"));
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        if (request === requestRef.current) {
          setCurrent({ ...entry, index: index + 1, total: queue.length, fallback: true });
          setStatus("playing");
        }
      };
      utterance.onend = next;
      utterance.onerror = () => {
        if (request === requestRef.current) {
          setStatus("error");
          setError("Không phát được âm thanh. Hãy thử lại hoặc dùng trình duyệt có giọng tiếng Việt.");
        }
      };
      window.speechSynthesis.speak(utterance);
    };
    if (audio) {
      audio.onplaying = () => {
        if (request === requestRef.current) setStatus("playing");
      };
      audio.onerror = fail;
      audio.onended = next;
    }
    if (!audio || unavailableUrls.has(entry.url)) fail();
    else audio.play().catch(fail);
  }

  return { current, status, error, setError, playQueue, stop, queueRef };
}

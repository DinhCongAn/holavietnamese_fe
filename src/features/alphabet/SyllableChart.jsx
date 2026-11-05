import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState } from "react";
import { Headphones, RotateCcw, Square, Volume2 } from "lucide-react";
import { getVietSyllablesAudioUrl, usePronunciationPlayer } from "./pronunciation";

const finals = [
  ["a", "a", "simple"], ["e", "ɛ", "simple"], ["ê", "e", "simple"],
  ["i", "i", "simple"], ["o", "ɔ", "simple"], ["ô", "o", "simple"],
  ["ơ", "ɤ", "simple"], ["u", "u", "simple"], ["ư", "ɯ", "simple"],
  ["y", "i", "simple"], ["ai", "aj", "complex"], ["ao", "aw", "complex"],
  ["au", "ɐw", "complex"], ["ay", "ɐj", "complex"], ["âu", "ʌw", "complex"],
  ["ây", "ʌj", "complex"], ["eo", "ɛw", "complex"], ["êu", "ew", "complex"],
  ["ia", "iə", "complex"], ["iêu", "iəw", "complex"], ["oa", "ʷa", "complex"],
  ["oi", "ɔj", "complex"], ["ôi", "oj", "complex"], ["ơi", "ɤj", "complex"],
  ["am", "am", "nasal"], ["an", "an", "nasal"], ["ang", "aŋ", "nasal"],
  ["anh", "ɐjŋ", "nasal"], ["em", "ɛm", "nasal"], ["ên", "en", "nasal"],
  ["ong", "ɐwŋ", "nasal"], ["ương", "ɯəŋ", "nasal"],
  ["ap", "ap", "stop"], ["at", "at", "stop"], ["ac", "ak", "stop"],
  ["ach", "ɐjk", "stop"], ["ep", "ɛp", "stop"], ["et", "ɛt", "stop"],
  ["oc", "ɐwk", "stop"], ["uc", "uk", "stop"],
];
const initials = ["∅", "b", "c", "ch", "d", "đ", "g", "gh", "gi", "h", "k", "kh", "l", "m", "n", "ng", "ngh", "nh", "p", "ph", "qu", "r", "s", "t", "th", "tr", "v", "x"];
// Availability mirrors the recorded cells on VietSyllables for the selected finals.
// Each hexadecimal digit covers four finals in the order above.
const recorded = {
  "∅": "fffff7ffff", b: "fffffffdff", c: "cfcfe0fdf1",
  ch: "fffffdfdff", d: "fffffdfdff", "đ": "fffffffdff",
  g: "cfcfe0fdf1", gh: "303001000e", gi: "cfcfe9fdff",
  h: "ffffffffff", k: "30300f020e", kh: "fffffffdff",
  l: "ffffffffff", m: "fffffffeff", n: "ffffefffff",
  ng: "cfcff0fdf1", ngh: "30300f000e", nh: "fffffffdff",
  p: "0f0f00004d", ph: "ffffeffcff", qu: "3f1f03fc1b",
  r: "ffffe7fcff", s: "fffff7ffff", t: "fffff7ffff",
  th: "ffffffffff", tr: "ffffeffdff", v: "ffffe7efff",
  x: "fffffdffff",
};
const tones = [
  ["none", "Ngang", "◌", "Flat"], ["grave", "Huyền", "◌̀", "Grave"],
  ["acute", "Sắc", "◌́", "Acute"], ["hook", "Hỏi", "◌̉", "Hook"],
  ["tilde", "Ngã", "◌̃", "Tilde"], ["dot", "Nặng", "◌̣", "Dot"],
];
const categories = [
  ["simple", "Nguyên âm đơn", "Simple vowels"], ["complex", "Vần phức", "Complex rhymes"],
  ["nasal", "+ Âm cuối mũi", "+ Nasal finals"], ["stop", "+ Âm cuối tắc", "+ Stop finals"],
];

function isAvailable(initial, final) {
  const index = finals.findIndex(([value]) => value === final);
  return index >= 0 && Math.floor(Number.parseInt(recorded[initial], 16) / 2 ** index) % 2 === 1;
}

function syllableFor(initial, final) {
  if (initial === "∅") return final;
  if (initial === "gi" && final === "i") return "gi";
  if (initial === "gi" && final === "iêu") return "giêu";
  return initial + final;
}

export function SyllableChart() {
  useTextLanguage();
  const { current, status, error, playQueue, stop, queueRef } = usePronunciationPlayer();
  const [filters, setFilters] = useState(["simple", "complex"]);
  const [enabledTones, setEnabledTones] = useState([]);

  function playSyllable(initial, final, category) {
    const selected = tones.filter(([id]) => enabledTones.includes(id) &&
      (category !== "stop" || ["acute", "dot"].includes(id)));
    if (!selected.length) return;
    const syllable = syllableFor(initial, final);
    playQueue(selected.map(([id, label, , labelEn]) => ({
      key: `${initial}-${final}-${id}`,
      syllable,
      tone: label,
      toneEn: labelEn,
      toneId: id,
      url: getVietSyllablesAudioUrl(initial, final, id),
    })));
  }

  function toggle(value, setter) {
    setter((values) => values.includes(value)
      ? values.filter((item) => item !== value) : [...values, value]);
  }

  function toggleTone(id) {
    stop();
    queueRef.current = [];
    toggle(id, setEnabledTones);
  }

  const visibleFinals = finals.filter(([, , category]) => filters.includes(category));
  return (
    <section className="syllable-chart-section" aria-labelledby="syllable-chart-title">
      <div className="syllable-chart-heading">
        <div><span className="syllable-step"><BilingualText vi="01 / BẢNG ÂM TƯƠNG TÁC" en="01 / INTERACTIVE SYLLABLE CHART" /></span><h2 id="syllable-chart-title"><BilingualText vi="Ghép âm và nghe" en="Combine sounds and listen" /></h2><p><BilingualText vi="Chọn nhóm vần, chọn thanh điệu rồi bấm vào một ô để nghe." en="Select rhyme group and tone, then click any tile to listen." /></p></div>
        <span className="syllable-accent"><Headphones size={17} aria-hidden="true" /> <BilingualText vi="Hà Nội · nữ" en="Hanoi · female" /></span>
      </div>
      <div className="syllable-toolbar">
        <div className="syllable-filters" aria-label={bilingualLabel("Nhóm vần", "Rhyme groups")}>
          {categories.map(([id, label, labelEn]) => <button type="button" key={id}
            className={`syllable-filter syllable-${id}${filters.includes(id) ? " active" : ""}`}
            aria-pressed={filters.includes(id)} onClick={() => toggle(id, setFilters)}>
            <span aria-hidden="true">{filters.includes(id) ? "✓" : ""}</span><BilingualText vi={label} en={labelEn} />
          </button>)}
        </div>
        <div className="syllable-tones" aria-label={bilingualLabel("Thanh điệu phát khi chọn ô", "Tone played when tile selected")}>
          {tones.map(([id, label, mark, labelEn]) => <button type="button" key={id}
            className={`syllable-tone${enabledTones.includes(id) ? " active" : ""}`}
            aria-label={`${label} (${mark})`} aria-pressed={enabledTones.includes(id)}
            onClick={() => toggleTone(id)}><strong>{mark}</strong><small><BilingualText vi={label} en={labelEn} /></small></button>)}
        </div>
      </div>
      <p className="syllable-hint"><BilingualText vi="Kéo ngang để xem thêm vần ↔ · Chọn ít nhất một thanh trước khi nghe; vần kết thúc bằng p, t, c, ch chỉ dùng thanh sắc hoặc thanh nặng." en="Scroll horizontally for more rhymes ↔ · Select at least one tone before listening; syllables ending in p, t, c, ch use only acute or dot tones." /></p>
      {visibleFinals.length ? <div className="syllable-table-scroll" role="region" aria-label={bilingualLabel("Bảng ghép phụ âm và vần", "Consonant and rhyme combination chart")} tabIndex={0}>
        <table className="syllable-table"><thead><tr><th className="syllable-corner" scope="col"><BilingualText vi={<>Vần →<br />Âm đầu ↓</>} en={<>Rhyme →<br />Initial ↓</>} /></th>
          {visibleFinals.map(([value, ipa, category]) => <th key={value} scope="col" className={`syllable-head-${category}`}><strong>{value}</strong><small>/{ipa}/</small></th>)}
        </tr></thead><tbody>{initials.map((initial) => <tr key={initial}><th scope="row"><strong>{initial === "∅" ? "—" : initial}</strong><small>{initial === "∅" ? <BilingualText vi="không âm đầu" en="no initial" /> : ""}</small></th>
          {visibleFinals.map(([value, , category]) => <td key={value} className={`syllable-cell-${category}`}>
            {isAvailable(initial, value) && <button type="button"
              className={`syllable-cell-button${current?.key.startsWith(`${initial}-${value}-`) ? " selected" : ""}`}
              disabled={!enabledTones.some((id) => category !== "stop" || ["acute", "dot"].includes(id))}
              aria-label={bilingualLabel(`Nghe ${syllableFor(initial, value)} với các thanh đã chọn`, `Listen to ${syllableFor(initial, value)} with selected tones`)}
              onClick={() => playSyllable(initial, value, category)}>{syllableFor(initial, value)}</button>}
          </td>)}
        </tr>)}</tbody></table>
      </div> : <div className="syllable-empty"><BilingualText vi="Chọn ít nhất một nhóm vần để xem bảng âm." en="Select at least one rhyme group to view the chart." /></div>}
        <div className="syllable-bottom"><div className="syllable-now"><Volume2 size={20} aria-hidden="true" /><span role="status" aria-live="polite"><strong>{current ? <><BilingualText vi={status === "loading" ? "Đang tải" : status === "playing" ? "Đang phát" : "Đã chọn"} en={status === "loading" ? "Loading" : status === "playing" ? "Playing" : "Selected"} />: {current.syllable}</> : enabledTones.length ? <BilingualText vi="Chọn một ô để bắt đầu nghe" en="Click a cell to start listening" /> : <BilingualText vi="Chọn ít nhất một thanh điệu" en="Select at least one tone" />}</strong><small>{current ? <><BilingualText vi={current.tone} en={current.toneEn} /> · {current.index}/{current.total} · {current.fallback ? <BilingualText vi="Giọng tổng hợp trên thiết bị" en="Device synthesized voice" /> : <BilingualText vi="Giọng Hà Nội" en="Hanoi voice" />}</> : <BilingualText vi="Âm tiết chỉ phát theo các thanh đang được chọn." en="Syllables play only with the selected tones." />}</small></span></div>
        <div className="syllable-actions"><button type="button" disabled={!queueRef.current.length} onClick={() => playQueue(queueRef.current)}><RotateCcw size={16} aria-hidden="true" /> <BilingualText vi="Nghe lại" en="Replay" /></button><button type="button" disabled={status !== "loading" && status !== "playing"} onClick={stop}><Square size={15} aria-hidden="true" /> <BilingualText vi="Dừng" en="Stop" /></button></div></div>
      {error && <p className="syllable-error" role="alert"><BilingualText>{error}</BilingualText></p>}
    </section>
  );
}

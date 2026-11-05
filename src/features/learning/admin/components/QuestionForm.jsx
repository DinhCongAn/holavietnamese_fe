import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState } from 'react';
import { Notice } from '@/shared/components/common/Ui';
import { moveItem } from '@/features/learning/components/learning/answerUtils';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { contentService } from '@/features/learning/api/contentService';

const types = ['MULTIPLE_CHOICE','MULTIPLE_SELECT','TRUE_FALSE','FILL_BLANK','MATCHING','LISTENING','TRANSLATION','REORDER_SENTENCE','IMAGE_SELECTION'];
const isText = type => ['FILL_BLANK','TRANSLATION'].includes(type);
export function QuestionForm({ initial = {}, onSave, onCancel }) {
  useTextLanguage();
  const snapshot = initial.versions?.[0] || initial;
  const [form,setForm] = useState({questionType:'MULTIPLE_CHOICE',prompt:'',explanation:'',difficulty:'EASY',topic:'',status:'DRAFT',imageUrl:'',audioUrl:'',...initial,...snapshot});
  const [options,setOptions] = useState((snapshot.options || [{id:'a',text:''},{id:'b',text:''},{id:'c',text:''},{id:'d',text:''}]).map(option=>({...option,id:String(option.id),...(option.side?{side:String(option.side).toLowerCase()}:{})})));
  const [correct,setCorrect] = useState(snapshot.correctAnswerJson || snapshot.correctAnswer || {optionIds:[]});
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [questionFiles,setQuestionFiles] = useState({});
  const [optionFiles,setOptionFiles] = useState({});
  const choice = ['MULTIPLE_CHOICE','MULTIPLE_SELECT','TRUE_FALSE','IMAGE_SELECTION'].includes(form.questionType) || form.questionType==='LISTENING'&&options.length>0;
  const reorder = ['REORDER','REORDER_SENTENCE'].includes(form.questionType);
  const left = options.filter(option=>option.side==='left'), right = options.filter(option=>option.side==='right');
  function changeType(type) {
    setForm({...form,questionType:type});setCorrect({});
    setOptionFiles({});
    if(isText(type))setOptions([]);
    else if(type==='TRUE_FALSE')setOptions([{id:'true',text:bilingualLabel('Đúng', 'True')},{id:'false',text:bilingualLabel('Sai', 'False')}]);
    else if(type==='MATCHING')setOptions([{id:'l1',text:'',side:'left'},{id:'l2',text:'',side:'left'},{id:'r1',text:'',side:'right'},{id:'r2',text:'',side:'right'}]);
    else if(options.length===0)setOptions([{id:'a',text:''},{id:'b',text:''}]);
  }
  function remove(index) {
    const id=options[index].id;setOptions(options.filter((_,i)=>i!==index));
    setOptionFiles(current=>Object.fromEntries(Object.entries(current).filter(([key])=>key!==id)));
    setCorrect({...correct,optionIds:correct.optionIds?.filter(value=>String(value)!==id),sequence:correct.sequence?.filter(value=>value!==id),pairs:Object.fromEntries(Object.entries(correct.pairs||{}).filter(([key,value])=>key!==id&&value!==id))});
  }
  function chooseFile(event,key,optionId) {
    const file=event.target.files?.[0];
    if(!file)return;
    const image=key==='imageUrl';
    const valid=image ? ['image/jpeg','image/png','image/webp'].includes(file.type)
      : file.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(file.name);
    const maxMb=image?5:20;
    if(!valid || file.size>maxMb*1024*1024){
      setError(image ? bilingualLabel('Chọn ảnh JPG, PNG, WebP (tối đa 5 MB).', 'Select a JPG, PNG, or WebP image (max 5 MB).') : bilingualLabel('Chọn âm thanh MP3, WAV, M4A, AAC, OGG hoặc WebM (tối đa 20 MB).', 'Select MP3, WAV, M4A, AAC, OGG or WebM audio (max 20 MB).'));
      if(optionId)setOptionFiles(current=>({...current,[optionId]:{...current[optionId],[key]:null}}));
      else setQuestionFiles(current=>({...current,[key]:null}));
      event.target.value='';
      return;
    }
    setError('');
    if(optionId)setOptionFiles(current=>({...current,[optionId]:{...current[optionId],[key]:file}}));
    else setQuestionFiles(current=>({...current,[key]:file}));
  }
  async function submit(event) {
    event.preventDefault();setBusy(true);setError('');
    try {
      if (choice && !correct.optionIds?.length) throw new Error(bilingualLabel('Vui lòng chọn ít nhất một đáp án đúng.', 'Please select at least one correct option.'));
      const body=Object.fromEntries(['questionType','prompt','promptVi','explanation','explanationVi','difficulty','topic','status','imageUrl','audioUrl'].map(key=>[key,form[key]||'']));
      for(const key of ['imageUrl','audioUrl']){
        if(questionFiles[key])body[key]=await contentService.uploadQuestionMedia(questionFiles[key],key==='imageUrl'?'image':'audio');
      }
      body.options=await Promise.all(options.map(async option=>{
        const result={...option};
        for(const key of ['imageUrl','audioUrl']){
          const file=optionFiles[option.id]?.[key];
          if(file)result[key]=await contentService.uploadQuestionMedia(file,key==='imageUrl'?'image':'audio');
        }
        return result;
      }));
      body.correctAnswerJson=correct;await onSave(body);
    } catch(err){setError(err.message);}finally{setBusy(false);}
  }
  return <form onSubmit={submit}><div className="form-grid">
    <label><BilingualText>{"Loại câu hỏi"}</BilingualText><select value={form.questionType} onChange={event=>changeType(event.target.value)}>{types.map(type=><option key={type} value={type}>{bilingualLabel(type)}</option>)}</select></label>
    <label><BilingualText>{"Độ khó"}</BilingualText><select value={form.difficulty} onChange={event=>setForm({...form,difficulty:event.target.value})}>{['EASY','MEDIUM','HARD'].map(type=><option key={type} value={type}>{bilingualLabel(type)}</option>)}</select></label>
    <label className="full-width"><BilingualText>{"Nội dung câu hỏi"}</BilingualText><textarea required rows={3} value={form.prompt} onChange={event=>setForm({...form,prompt:event.target.value})}/></label>
    <label className="full-width"><BilingualText>{"Câu hỏi tiếng Việt"}</BilingualText><textarea rows={2} value={form.promptVi||''} onChange={event=>setForm({...form,promptVi:event.target.value})}/></label>
    <label><BilingualText>{"Chủ đề"}</BilingualText><input value={form.topic||''} onChange={event=>setForm({...form,topic:event.target.value})}/></label>
    <label><BilingualText>{"Trạng thái"}</BilingualText><select value={form.status} onChange={event=>setForm({...form,status:event.target.value})}>{['DRAFT','PUBLISHED','ARCHIVED'].map(type=><option key={type} value={type}>{bilingualLabel(type)}</option>)}</select></label>
    <label><BilingualText>Tải âm thanh câu hỏi</BilingualText><input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm" disabled={busy} onChange={event=>chooseFile(event,'audioUrl')}/><small>{questionFiles.audioUrl?.name||bilingualLabel('Tối đa 20 MB · lưu trên Cloudinary khi lưu câu hỏi.')}</small></label>
    <label><BilingualText>Tải hình ảnh câu hỏi</BilingualText><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>chooseFile(event,'imageUrl')}/><small>{questionFiles.imageUrl?.name||bilingualLabel('JPG, PNG, WebP · tối đa 5 MB.')}</small></label>
    <label><BilingualText>Hoặc URL âm thanh</BilingualText><input value={form.audioUrl||''} placeholder={bilingualLabel("/media/… hoặc https://…", "/media/… or https://…")} onChange={event=>setForm({...form,audioUrl:event.target.value})}/></label>
    <label><BilingualText>Hoặc URL hình ảnh</BilingualText><input value={form.imageUrl||''} placeholder={bilingualLabel("/media/… hoặc https://…", "/media/… or https://…")} onChange={event=>setForm({...form,imageUrl:event.target.value})}/></label>
  </div>
  {form.imageUrl && <ContentImage src={form.imageUrl} className="question-media" alt={form.promptVi || form.prompt || bilingualLabel('Ảnh câu hỏi', 'Question image')} />}
  {!isText(form.questionType) && <>
    <h3><BilingualText>{reorder?'Các từ cần sắp xếp':'Các lựa chọn và đáp án đúng'}</BilingualText></h3>
    {choice && <p className="muted"><BilingualText vi="Nhập các lựa chọn, sau đó đánh dấu đáp án đúng. Câu nhiều đáp án cho phép chọn nhiều ô." en="Enter options, then mark correct answers. Multiple select questions allow checking multiple boxes." /></p>}
    {options.map((option,index)=><div className="question-editor-option" key={option.id}><span>{option.id.toUpperCase()}</span><input aria-label={bilingualLabel(`Lựa chọn ${index+1}`)} required value={option.text||''} onChange={event=>setOptions(options.map((item,i)=>i===index?{...item,text:event.target.value}:item))}/>
      {form.questionType==='MATCHING' && <select aria-label={bilingualLabel(`Cột lựa chọn ${index+1}`)} value={option.side||'left'} onChange={event=>setOptions(options.map((item,i)=>i===index?{...item,side:event.target.value}:item))}><option value="left">{bilingualLabel("Trái")}</option><option value="right">{bilingualLabel("Phải")}</option></select>}
      {choice&&<label className="checkbox-row"><input type={form.questionType==='MULTIPLE_SELECT'?'checkbox':'radio'} name="correct-options" aria-label={bilingualLabel(`Đáp án đúng ${index+1}`)} checked={correct.optionIds?.map(String).includes(option.id)||false} onChange={event=>setCorrect({optionIds:form.questionType==='MULTIPLE_SELECT'?event.target.checked?[...(correct.optionIds||[]),option.id]:(correct.optionIds||[]).filter(id=>id!==option.id):[option.id]})}/><BilingualText>{"Đáp án đúng"}</BilingualText></label>}
      <button className="secondary" type="button" aria-label={bilingualLabel(`Xóa lựa chọn ${index+1}`)} onClick={()=>remove(index)}>×</button>
      {!reorder && <details className="option-media-editor"><summary><BilingualText>{"Hình ảnh & âm thanh của lựa chọn"}</BilingualText>{index+1}</summary>
        <label><BilingualText>Tải hình ảnh</BilingualText><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>chooseFile(event,'imageUrl',option.id)}/><small>{optionFiles[option.id]?.imageUrl?.name||bilingualLabel('JPG, PNG, WebP · tối đa 5 MB.')}</small></label>
        <label><BilingualText>Tải âm thanh</BilingualText><input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm" disabled={busy} onChange={event=>chooseFile(event,'audioUrl',option.id)}/><small>{optionFiles[option.id]?.audioUrl?.name||bilingualLabel('Tối đa 20 MB.')}</small></label>
        <label><BilingualText>{"URL hình ảnh"}</BilingualText><input value={option.imageUrl||''} placeholder={bilingualLabel("/media/… hoặc https://…", "/media/… or https://…")} onChange={event=>setOptions(options.map((item,i)=>i===index?{...item,imageUrl:event.target.value}:item))}/></label>
        <label><BilingualText>{"URL âm thanh"}</BilingualText><input value={option.audioUrl||''} placeholder={bilingualLabel("/media/… hoặc https://…", "/media/… or https://…")} onChange={event=>setOptions(options.map((item,i)=>i===index?{...item,audioUrl:event.target.value}:item))}/></label>
        {option.imageUrl && <ContentImage className="option-image" src={option.imageUrl} alt={option.text || bilingualLabel(`Lựa chọn ${index+1}`)}/>}
      </details>}
    </div>)}
    <div className="actions"><button type="button" className="secondary" onClick={()=>setOptions([...options,{id:`option-${Date.now()}`,text:'',...(form.questionType==='MATCHING'?{side:'left'}:{})}])}><BilingualText>{"+ Thêm lựa chọn"}</BilingualText></button>{form.questionType==='LISTENING'&&<button type="button" className="secondary" onClick={()=>{setOptions([]);setCorrect({acceptedAnswers:[]});}}><BilingualText>{"Trả lời bằng văn bản"}</BilingualText></button>}</div>
  </>}
  {(isText(form.questionType)||form.questionType==='LISTENING'&&!options.length) && <label className="builder-status"><BilingualText>{"Các đáp án chấp nhận (mỗi dòng một đáp án)"}</BilingualText><textarea required value={(correct.acceptedAnswers||[]).join('\n')} onChange={event=>setCorrect({...correct,acceptedAnswers:event.target.value.split('\n')})}/><span className="checkbox-row"><input type="checkbox" checked={!!correct.caseSensitive} onChange={event=>setCorrect({...correct,caseSensitive:event.target.checked})}/><BilingualText>{"Phân biệt chữ hoa, chữ thường"}</BilingualText></span></label>}
  {reorder && <div className="builder-status"><h3><BilingualText>{"Thứ tự đúng"}</BilingualText></h3><button type="button" className="secondary" onClick={()=>setCorrect({sequence:options.map(option=>option.id)})}><BilingualText>{"Dùng thứ tự lựa chọn hiện tại"}</BilingualText></button>{(correct.sequence||[]).map((id,index)=><div className="list-row" key={id}><span>{options.find(option=>String(option.id)===String(id))?.text||id}</span><div className="actions"><button type="button" className="secondary" disabled={index===0} aria-label={bilingualLabel(`Đưa từ ${index+1} lên`)} onClick={()=>setCorrect({sequence:moveItem(correct.sequence,index,-1)})}>↑</button><button type="button" className="secondary" disabled={index===correct.sequence.length-1} aria-label={bilingualLabel(`Đưa từ ${index+1} xuống`)} onClick={()=>setCorrect({sequence:moveItem(correct.sequence,index,1)})}>↓</button></div></div>)}</div>}
  {form.questionType==='MATCHING' && <div className="builder-status"><h3><BilingualText>{"Ghép đáp án đúng"}</BilingualText></h3>{left.map(option=><label key={option.id}>{option.text || option.id}<select required value={correct.pairs?.[option.id]||''} onChange={event=>setCorrect({pairs:{...correct.pairs,[option.id]:event.target.value}})}><option value="">{bilingualLabel("Chọn đáp án")}</option>{right.map(item=><option key={item.id} value={item.id}>{bilingualLabel(item.text || item.id)}</option>)}</select></label>)}</div>}
  <label className="builder-status"><BilingualText>{"Giải thích đáp án"}</BilingualText><textarea rows={3} value={form.explanation||''} onChange={event=>setForm({...form,explanation:event.target.value})}/></label>
  <label><BilingualText>{"Giải thích tiếng Việt"}</BilingualText><textarea rows={2} value={form.explanationVi||''} onChange={event=>setForm({...form,explanationVi:event.target.value})}/></label>
  {initial.versions?.length>0&&<Notice><BilingualText>{"Phiên bản hiện tại v"}</BilingualText>{initial.currentVersion}<BilingualText>{". Khi sửa, hệ thống tạo phiên bản mới; các lượt làm bài cũ giữ nguyên nội dung gốc."}</BilingualText></Notice>}
  {error&&<Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
  <div className="form-actions actions"><button className="secondary" type="button" disabled={busy} onClick={onCancel}><BilingualText>{"Hủy"}</BilingualText></button><button disabled={busy}><BilingualText>{busy?'Đang lưu…':'Lưu câu hỏi'}</BilingualText></button></div></form>;
}


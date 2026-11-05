import {profile,progress,badges,notifications,systemSettings,courses,lessons,words} from './fixtures';
import {requestDestination} from './destinationFixtures';
const response=result=>({code:1000,result,message:'Đã lưu trong dữ liệu kiểm thử.'});
const adminWords=words.map(word=>({...word,status:'PUBLISHED',meanings:[{id:1,translationEn:word.meaning,definitionEn:'',usageNote:'',displayOrder:0,examples:[{id:1,exampleVi:word.example,translationEn:'An illustrative Vietnamese phrase.',displayOrder:0}]}]}));
const catalogWords=adminWords.map(word=>({...word,id:word.id+1000}));
catalogWords.push({id:1009,word:'tạm biệt',pronunciation:'/taːm ɓiət/',partOfSpeech:'PHRASE',status:'PUBLISHED',meanings:[{id:10091,translationEn:'goodbye',definitionEn:'A phrase used when leaving.',usageNote:'Dùng khi kết thúc một cuộc trò chuyện.',displayOrder:0,examples:[{id:100911,exampleVi:'Tạm biệt, hẹn gặp lại!',translationEn:'Goodbye, see you again!',displayOrder:0},{id:100912,exampleVi:'Tạm biệt bạn nhé.',translationEn:'Goodbye, my friend.',displayOrder:1}]},{id:10092,translationEn:'farewell',definitionEn:'An expression of parting.',usageNote:'Cũng có thể dùng khi chia tay trong thời gian dài.',displayOrder:1,examples:[{id:100921,exampleVi:'Tôi đến để nói lời tạm biệt.',translationEn:'I came to say farewell.',displayOrder:0}]}]},{id:1010,word:'QA unpublished vocabulary',status:'DRAFT',meanings:[]});
const fixtureMode=new URLSearchParams(globalThis.location?.search ?? '').get('fixture');
const reviewSession={sessionId:'qa-vocabulary-review',notebookCount:words.length,entries:words.slice(0,3),results:[]};
async function request(path,body,options={}){
 options.signal?.throwIfAborted();
 if(fixtureMode==='error')throw new Error('Không thể tải dữ liệu kiểm thử. Vui lòng thử lại.');
 if(path==='/api/me/vocabulary/review')return fixtureMode==='empty'?{...reviewSession,notebookCount:0,entries:[],results:[]}:{...reviewSession,entries:[...reviewSession.entries],results:[...reviewSession.results]};
 if(/^\/api\/me\/vocabulary\/\d+\/review$/.test(path)){
  const entryId=Number(path.split('/').at(-2)),word=words.find(item=>item.id===entryId);
  const result={entryId,word:word?.word,rating:body.rating,nextReviewAt:'2026-10-24T09:00:00Z'};
  reviewSession.results.push(result);reviewSession.entries=reviewSession.entries.filter(item=>item.id!==entryId);return result;
 }
 if(/^\/api\/(?:admin\/)?destinations(?:\/|$)/.test(path))return requestDestination(path,body,options,fixtureMode);
 if(path==='/api/me/courses')return fixtureMode==='empty'?[]:courses.slice(0,2).map(course=>({...course,courseId:course.id,courseTitle:course.title,enrollmentId:course.id,completedLessons:2,totalLessons:course.totalLessons,progressPercentage:45,lastAccessedLessonId:101,enrolledAt:'2026-10-08',status:'ACTIVE'}));
 if(/^\/api\/me\/courses\/\d+\/progress$/.test(path))return {progressPercentage:45,completedLessons:2,totalLessons:6,nextLessonId:101};
 if(/^\/api\/courses\/\d+\/lessons$/.test(path))return path.split('/')[3]==='1'?lessons:[];
 if(path==='/api/me/vocabulary'){
  if(body){
   if(fixtureMode==='save-error')throw new Error('Không thể lưu từ vựng. Vui lòng thử lại.');
   const item={...body,id:Math.max(0,...words.map(word=>word.id))+1,createdAt:new Date().toISOString()};words.push(item);return item;
  }
  const filters=options.params||{},search=filters.search?.toLowerCase();
  return fixtureMode==='empty'?[]:words.filter(word=>(!search||`${word.word} ${word.meaning}`.toLowerCase().includes(search))&&(!filters.courseId||String(word.courseId)===String(filters.courseId))&&(!filters.lessonId||String(word.lessonId)===String(filters.lessonId)));
 }
 if(/^\/api\/me\/vocabulary\/\d+$/.test(path)){
  const item=words.find(word=>String(word.id)===path.split('/').at(-1));
  if(!item){const error=new Error('Không tìm thấy từ trong sổ tay.');error.status=404;throw error;}
  if(options.method==='DELETE'){words.splice(words.indexOf(item),1);return null;}
  if(body)Object.assign(item,body);return item;
 }
 if(path==='/api/vocabulary/search'||path==='/api/admin/vocabulary/search'||path==='/api/vocabulary'){
  const filters=options.params||{}, keyword=String(filters.keyword||'').toLowerCase();
  let rows=(path.includes('/admin/')?adminWords:catalogWords.filter(w=>w.status==='PUBLISHED')).filter(w=>(!keyword||[w.word,...(w.meanings||[]).flatMap(m=>[m.translationEn,m.definitionEn])].join(' ').toLowerCase().includes(keyword))&&(!filters.status||w.status===filters.status)&&(!filters.partOfSpeech||w.partOfSpeech.toLowerCase()===filters.partOfSpeech.toLowerCase()));
  if(fixtureMode==='empty')rows=[];
  if(path==='/api/vocabulary')return response(rows);
  const number=Number(filters.page||0),size=Number(filters.size||20);return response({content:rows.slice(number*size,(number+1)*size),number,size,totalElements:rows.length,totalPages:Math.ceil(rows.length/size)});
 }
 if(/^\/api\/vocabulary\/\d+\/links$/.test(path))return response({otherPartsOfSpeech:[],relatedWords:[]});
 if(path==='/api/admin/imports/types')return response([{id:'VOCABULARY',label:'Từ vựng · Excel',sheet:'VOCABULARY',requiredColumns:['word','part_of_speech'],format:'xlsx',description:'Gom các dòng cùng từ/từ loại thành mục từ nhiều nghĩa và nhiều ví dụ.'}]);
 if(/^\/api\/vocabulary\/\d+$/.test(path)){
  const word=catalogWords.find(item=>item.status==='PUBLISHED'&&String(item.id)===path.split('/').at(-1));
  if(!word){const error=new Error('Không tìm thấy từ vựng.');error.status=404;throw error;}
  return response(word);
 }
 if(path==='/api/admin/vocabulary'){
  if(body){const item={...body,id:adminWords.length+1,};adminWords.push(item);return response(item);}
  const keyword=options.params?.keyword?.toLowerCase();
  return response(fixtureMode==='empty'?[]:adminWords.filter(word=>!keyword||word.word.toLowerCase().includes(keyword)));
 }
 if(/^\/api\/admin\/vocabulary\/\d+$/.test(path)){const item=adminWords.find(word=>String(word.id)===path.split('/').at(-1));if(body)Object.assign(item,body);return response(item);}
 if(path==='/api/users/me'){if(body)Object.assign(profile,body);return response(profile);}
 if(path==='/api/users/progress')return response(progress);
 if(path==='/api/users/achievements')return response({badges});
 if(path==='/api/users/settings')return response({audioSpeed:1,pronunciationHintsEnabled:true,autoTranslateEnabled:false,notificationsEnabled:true,dailyLearningGoalMinutes:15,...body});
 if(path==='/api/users/notifications')return response(notifications);
 if(path.includes('/notifications/')&&path.endsWith('/read'))notifications.find(n=>String(n.id)===path.split('/').at(-2)).read=true;
 if(path.endsWith('/notifications/read-all'))notifications.forEach(n=>n.read=true);
 if(path==='/api/admin/dashboard/stats')return response({totalUsers:24,activeLearners:18,totalCourses:3,totalLessons:6,totalXpGranted:2400,userGrowth:[{month:'T8',users:12},{month:'T9',users:18},{month:'T10',users:24}],recentActivities:[{id:1,user:'Alex Nguyen',action:'Hoàn thành bài học',time:'10 phút trước'}]});
 if(path==='/api/admin/users')return response({content:[profile],totalPages:1,totalElements:1});
 if(/^\/api\/admin\/users\/\d+$/.test(path))return response(profile);
 if(path==='/api/admin/achievements')return response(badges);
 if(path==='/api/admin/roles')return response([{id:1,name:'LEARNER',description:'Người học',permissions:['COURSE_READ','VOCABULARY_SAVE']},{id:2,name:'ADMIN',description:'Quản trị hệ thống',permissions:['CONTENT_WRITE']}]);
 if(path==='/api/admin/xp-rules')return response([{id:1,event:'LESSON_COMPLETED',points:20,limitPerDay:10,antiSpam:'Mỗi bài học một lần'}]);
 if(path==='/api/admin/audit-logs')return response([{id:1,adminUsername:'admin.qa',action:'UPDATE_COURSE',target:'/api/admin/courses/1',details:'PUT /api/admin/courses/1 completed with HTTP 200',status:'SUCCESS',createdAt:'2026-10-08T09:00:00',ipAddress:'127.0.0.1'}]);
 if(path==='/api/admin/settings')return response(body?Object.assign(systemSettings,body):systemSettings);
 return response(body||{});
}
export default {get:(path,options)=>request(path,null,options),post:request,put:request,patch:request,delete:(path,options)=>request(path,null,{...options,method:'DELETE'})};

const YOUTUBE_EPISODES = {"DP-01": "YTaFOGAEm9s", "DP-03": "n8T_WWZ62RI", "DP-04": "xysji_FtVlc", "DP-05": "tCht3mufVmc", "DP-06": "2TrteBzHFs8"};
const $=id=>document.getElementById(id),audio=$('audio');
let state={episode:'DP-01',positions:{},bookmarks:[],speed:1,font:17};
try{state={...state,...JSON.parse(localStorage.getItem('dhamma-reader-v1')||'{}')}}catch{}
let current,pendingResume=0,lastSave=0,loading=true;
const save=()=>{try{localStorage.setItem('dhamma-reader-v1',JSON.stringify(state))}catch{}};
const clock=s=>{s=Math.floor(Number(s)||0);return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`};
const asset=p=>'../'+p.split('/').map(encodeURIComponent).join('/');
function remember(){if(current&&!loading&&Number.isFinite(audio.currentTime)){state.positions[current.id]=audio.currentTime;save()}}
function shelf(){ const query=($('search').value||'').trim().toLocaleLowerCase();const filtered=EPISODES.filter(e=>(!$('favorites').checked||state.bookmarks.includes(e.id))&&[e.title,e.summary,...e.keywords,...e.sections.map(s=>s.heading+' '+s.text)].join(' ').toLocaleLowerCase().includes(query));$('searchStatus').textContent=filtered.length?`พบ ${filtered.length} ตอน`:'ไม่พบตอนที่ตรง ลองเปลี่ยนคำค้นหรือยกเลิกตัวกรอง'; $('episodes').replaceChildren(...filtered.map(e=>{const i=EPISODES.indexOf(e);const b=document.createElement('button');b.className=e.id===state.episode?'active':'';b.setAttribute('aria-current',e.id===state.episode?'true':'false');const small=document.createElement('small');small.textContent=`ตอนที่ ${i+1} · ${clock(e.end-e.start)}${state.bookmarks.includes(e.id)?' · ♥':''}`;b.append(small,document.createTextNode(e.title));b.onclick=()=>select(e.id);return b}));}
function select(id){remember();audio.pause();loading=true;current=EPISODES.find(e=>e.id===id)||EPISODES[0];state.episode=current.id;save();const i=EPISODES.indexOf(current);$('cover').src=asset(current.cover);$('pdf').href=asset(current.pdf);$('youtube').hidden=!YOUTUBE_EPISODES[current.id];$('youtube').href=YOUTUBE_EPISODES[current.id]?'https://youtu.be/'+YOUTUBE_EPISODES[current.id]:'';$('downloadAudio').href=asset(current.audio);$('episodeNo').textContent=`ตอนที่ ${i+1} / ${EPISODES.length} · ธรรมปัญญา`;$('playingTitle').textContent=current.title;const content=$('content');content.replaceChildren();const add=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;content.append(el);return el};add('h1',current.title);add('p',`ช่วงเสียงต้นฉบับ ${current.range} · เสียงตอนนี้เริ่มที่ 00:00`,'range');add('p',current.summary,'intro');current.sections.forEach(s=>{add('h2',s.heading);add('p',s.text)});const tags=add('div','','tags');current.keywords.forEach(k=>{const t=document.createElement('span');t.textContent=k;tags.append(t)});content.style.fontSize=state.font+'px';$('prev').disabled=i===0;$('next').disabled=i===EPISODES.length-1;pendingResume=state.positions[current.id]||0;$('saved').textContent=pendingResume>0?`ฟังต่อจาก ${clock(pendingResume)}`:'จำจุดที่ฟังค้างไว้บนเครื่องนี้';$('elapsed').textContent=clock(pendingResume);$('duration').textContent=clock(current.end-current.start);$('seek').value=0;audio.src=asset(current.audio);audio.playbackRate=Number(state.speed);$('speed').value=state.speed;bookmark();shelf();}
function bookmark(){$('bookmark').textContent=state.bookmarks.includes(current.id)?'♥ เก็บไว้แล้ว':'♡ เก็บตอนนี้'}
audio.addEventListener('loadedmetadata',()=>{audio.currentTime=Math.min(pendingResume,Math.max(0,audio.duration-1));pendingResume=0;loading=false;$('duration').textContent=clock(audio.duration);$('seek').max=audio.duration;audio.playbackRate=Number(state.speed)});
audio.addEventListener('timeupdate',()=>{if(loading)return;$('elapsed').textContent=clock(audio.currentTime);$('seek').value=audio.currentTime;if(Date.now()-lastSave>3000){remember();lastSave=Date.now()}});
audio.addEventListener('play',()=>{$('play').textContent='Ⅱ หยุดพัก'});audio.addEventListener('pause',()=>{$('play').textContent='▶ ฟังธรรม';remember()});audio.addEventListener('ended',()=>{$('saved').textContent='ฟังจบตอนแล้ว';state.positions[current.id]=0;save()});audio.addEventListener('error',()=>{$('saved').textContent='เปิดเสียงไม่ได้ กรุณาเปิดแอปผ่านลิงก์ตัวอย่าง'});
$('play').onclick=async()=>{if(audio.paused){try{await audio.play()}catch{$('saved').textContent='กรุณาลองกดฟังธรรมอีกครั้ง'}}else audio.pause()};
$('back').onclick=()=>{audio.currentTime=Math.max(0,audio.currentTime-15);remember()};$('forward').onclick=()=>{audio.currentTime=Math.min(audio.duration||0,audio.currentTime+15);remember()};$('seek').oninput=e=>{if(Number.isFinite(audio.duration)){audio.currentTime=Number(e.target.value);remember()}};$('speed').onchange=e=>{state.speed=Number(e.target.value);audio.playbackRate=state.speed;save()};$('bookmark').onclick=()=>{const id=current.id;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(v=>v!==id):[...state.bookmarks,id];save();bookmark();shelf()};$('font').onclick=()=>{state.font=state.font>=23?17:state.font+2;$('content').style.fontSize=state.font+'px';save()};$('prev').onclick=()=>select(EPISODES[EPISODES.indexOf(current)-1].id);$('next').onclick=()=>select(EPISODES[EPISODES.indexOf(current)+1].id);window.addEventListener('pagehide',remember);select(state.episode);
// Keep the last lines of the book clear of the player at every screen size.
const playerObserver=new ResizeObserver(entries=>{document.documentElement.style.setProperty('--player-height',Math.ceil(entries[0].target.getBoundingClientRect().height)+'px')});playerObserver.observe(document.querySelector('.player'));

// Aggregate events only; never send account data or listening positions.
function trackDhamma(kind,episode){
 if(['localhost','127.0.0.1',''].includes(location.hostname))return;
 if(window.goatcounter&&typeof window.goatcounter.count==='function'){
  window.goatcounter.count({path:kind+'-'+episode.id,title:episode.title,event:true});
 }
}
const trackedListening=new Set();
audio.addEventListener('play',()=>{
 if(!current||trackedListening.has(current.id))return;
 if(window.goatcounter&&typeof window.goatcounter.count==='function'){
  trackDhamma('listen-start',current);trackedListening.add(current.id);
 }
});
$('pdf').addEventListener('click',()=>{if(current)trackDhamma('pdf-open',current)});

$('search').addEventListener('input',shelf);$('favorites').addEventListener('change',shelf);

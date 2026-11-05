import React,{useEffect,useMemo,useState} from 'react';

const STORE='acl-foundboard-v3';
// Fictional campus locations for this standalone teaching demo.
// A found report can exist before the item has been received by staff.
const seed=[
 {id:'f1',title:'Black backpack',category:'accessories',status:'lost',location:'Library - second floor',description:'Black backpack with a small red keychain. Left near the study desks.',owner:'you',created:'Oct 23',emoji:'🎒'},
 {id:'f2',title:'Dark backpack',category:'accessories',status:'found',location:'Library - main stairwell',description:'Found a dark backpack with a small red keychain near the library stairs.',owner:'other',created:'Oct 24',emoji:'🎒',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f3',title:'Student ID card',category:'documents',status:'found',location:'Near Gate 3',description:'A student card was turned in. No personal details are published.',owner:'other',created:'Oct 24',emoji:'🪪',collectionPoint:'Student Services Office',handoverStatus:'received'},
 {id:'f4',title:'Wireless earbuds',category:'electronics',status:'lost',location:'Main cafeteria',description:'White earbuds in a distinctive blue case. Lost on Monday.',owner:'other',created:'Oct 24',emoji:'🎧'},
 {id:'f5',title:'Earbuds in blue case',category:'electronics',status:'found',location:'Cafeteria entrance',description:'White earbuds in a blue charging case found near the coffee counter.',owner:'other',created:'Oct 25',emoji:'🎧',collectionPoint:'',handoverStatus:'reported'},
 {id:'f6',title:'Blue sports bottle',category:'other',status:'lost',location:'Sports Hall - lockers',description:'Tall blue metal water bottle, possibly left after practice.',owner:'other',created:'Oct 25',emoji:'🥤'},
 {id:'f7',title:'Metal water bottle',category:'other',status:'found',location:'Sports Hall - benches',description:'Blue reusable metal bottle found after a basketball session.',owner:'other',created:'Oct 25',emoji:'🥤',collectionPoint:'Campus Security Desk',handoverStatus:'received'},
 {id:'f8',title:'Engineering lab coat',category:'clothing',status:'claimed',location:'Building C',description:'Owner verified the item and collected it from the reception desk.',owner:'you',created:'Oct 22',emoji:'🥼',collectionPoint:'Library Reception',handoverStatus:'released'},
 {id:'f9',title:'Small notebook',category:'other',status:'lost',location:'C7 lecture room',description:'Brown cover with handwritten engineering notes.',owner:'other',created:'Oct 25',emoji:'📒'},
 {id:'f10',title:'Scientific calculator',category:'electronics',status:'lost',location:'B2 lecture hall',description:'Black scientific calculator with a protective cover.',owner:'other',created:'Oct 26',emoji:'🧮'},
 {id:'f11',title:'Calculator',category:'electronics',status:'found',location:'B2 study area',description:'Scientific calculator with a black cover, found on a desk.',owner:'you',created:'Oct 26',emoji:'🧮',collectionPoint:'Library Reception',handoverStatus:'received'},
 {id:'f12',title:'Canvas tote bag',category:'accessories',status:'lost',location:'Main campus bus stop',description:'Beige tote with green writing on one side.',owner:'other',created:'Oct 26',emoji:'👜'},
 {id:'f13',title:'USB flash drive',category:'electronics',status:'found',location:'Building A computer lab',description:'A small black flash drive was found beside a workstation.',owner:'other',created:'Oct 27',emoji:'💾',collectionPoint:'',handoverStatus:'reported'},
];
const categories=['all','electronics','clothing','documents','accessories','other'];
const statuses=['lost','found','claimed'];
const collectionPoints=['Campus Security Desk','Student Services Office','Library Reception'];
const clean={title:'',category:'',status:'',location:'',description:''};
function getSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));return Array.isArray(s)?s:seed;}catch{return seed;}}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

// CHANGE 1: return one message per field instead of a single generic message,
// so the form can say exactly what is wrong and where (in the same order as the form).
function fieldErrors(f,arr,id){
 const e={};
 if(!statuses.includes(f.status))e.status='Choose whether the item is lost, found or claimed.';
 if(!f.title.trim()||f.title.trim().length<2)e.title='Enter a title of at least 2 characters, e.g. "Black backpack".';
 if(!categories.slice(1).includes(f.category))e.category='Choose a category.';
 const dup=arr.find(r=>r.id!==id&&r.title.toLowerCase()===f.title.trim().toLowerCase()&&(r.location||'').toLowerCase()===(f.location||'').trim().toLowerCase());
 if(!e.title&&dup)e.duplicate={msg:`"${dup.title}" has already been reported at ${dup.location||'an unspecified location'}. Change the title or location, or check the existing notice on the board.`,item:dup};
 return e;
}
// Kept for compatibility: first error as a single string.
function validate(f,arr,id){const e=fieldErrors(f,arr,id);const k=Object.keys(e)[0];return k?(k==='duplicate'?e.duplicate.msg:e[k]):'';}

// CHANGE 3: one clear, consistent explanation of where a found item is.
function handover(item){
 if(item.status==='claimed'||item.handoverStatus==='released')return {tone:'done',icon:'✓',title:'Returned to owner',text:'Ownership was verified and the item was collected.'};
 if(item.handoverStatus==='received'&&item.collectionPoint)return {tone:'ok',icon:'📍',title:`Held at ${item.collectionPoint}`,text:'Bring your student ID and describe the item to staff to verify ownership.'};
 return {tone:'warn',icon:'⏳',title:'Not yet at a collection point',text:'Reported found only. Staff have not confirmed they hold this item.'};
}

export default function App(){
 const [items,setItems]=useState(getSaved);
 const [page,setPage]=useState('board');
 const [q,setQ]=useState('');
 const [cat,setCat]=useState('all');
 const [filterStatus,setFilterStatus]=useState('all');
 const [current,setCurrent]=useState(null);
 const [form,setForm]=useState(clean);
 const [errors,setErrors]=useState({});
 const [submitted,setSubmitted]=useState(false);
 const [message,setMessage]=useState('');
 useEffect(()=>localStorage.setItem(STORE,JSON.stringify(items)),[items]);
 // Re-check while typing once the user has tried to submit, so errors disappear as soon as they are fixed.
 useEffect(()=>{if(submitted)setErrors(fieldErrors(form,items,current));},[form]);
 const filtered=useMemo(()=>items.filter(x=>(cat==='all'||x.category===cat)&&(filterStatus==='all'||x.status===filterStatus)&&`${x.title} ${x.location} ${x.description}`.toLowerCase().includes(q.toLowerCase())),[items,q,cat,filterStatus]);
 const filtersOn=q||cat!=='all'||filterStatus!=='all';
 function clearFilters(){setQ('');setCat('all');setFilterStatus('all');}
 function openForm(){setErrors({});setSubmitted(false);setPage('form');window.scrollTo(0,0);}
 function create(status=''){setCurrent(null);setForm({...clean,status});openForm();}
 function edit(row){if(row.owner!=='you')return;setCurrent(row.id);setForm({title:row.title,category:row.category,status:row.status,location:row.location,description:row.description});openForm();}
 function showBoard(status){if(status)setFilterStatus(status);setPage('board');}
 function submit(e){
  e.preventDefault();
  const errs=fieldErrors(form,items,current);
  setErrors(errs);setSubmitted(true);
  if(Object.keys(errs).length){
   // Move focus to the first field that needs attention.
   const first={title:'f-title',status:'f-status',category:'f-category',duplicate:'f-location'}[Object.keys(errs)[0]];
   setTimeout(()=>document.getElementById(first)?.focus(),0);
   return;
  }
  const d={...form,title:form.title.trim(),location:form.location.trim(),description:form.description.trim(),owner:'you',created:'Today',emoji:current?items.find(x=>x.id===current)?.emoji:'📌',...(current?{}:{collectionPoint:'',handoverStatus:'reported'})};
  if(current){setItems(items.map(x=>x.id===current?{...x,...d}:x));setMessage(`"${d.title}" updated.`);}
  else{setItems([{id:`f-${Date.now()}`,...d},...items]);setMessage(d.status==='found'?`"${d.title}" posted. Please hand the item to a collection point so the owner can recover it.`:`"${d.title}" posted. It now appears on the board marked "Your report".`);}
  clearFilters();setPage('board');setCurrent(null);
 }
 function reset(){setItems(seed);setPage('board');clearFilters();setMessage('Example reports restored.');}
 const set=k=>e=>setForm(s=>({...s,[k]:e.target.value}));
 const err=k=>errors[k]&&<p className="field-error" id={`${k}-err`}>{errors[k]}</p>;
 const navActive=s=>page==='board'&&filterStatus===s&&!q&&cat==='all';
 const columns=[{key:'lost',title:'LOST',sub:'Owners are searching for these',icon:'↗'},{key:'found',title:'FOUND',sub:'Waiting for their owners',icon:'⌁'},{key:'claimed',title:'CLAIMED',sub:'Back where they belong',icon:'✓'}].filter(c=>filterStatus==='all'||c.key===filterStatus);

 // Helpers: the form fields are written as function calls instead of tags.
 const field=props=>React.createElement('input',props);
 const formBox=(props,...children)=>React.createElement('form',props,...children);

 return <div className="notice-app">
  <header className="header">
   <div className="headline"><span className="sun">✺</span><button onClick={()=>{clearFilters();setPage('board')}} className="wordmark">FOUND<span>on campus</span></button></div>
   <nav className="header-links" aria-label="Main">
    <button aria-current={navActive('all')?'page':undefined} onClick={()=>showBoard('all')}>All notices</button>
    <button aria-current={navActive('lost')?'page':undefined} onClick={()=>showBoard('lost')}>Missing items</button>
    <button aria-current={navActive('found')?'page':undefined} onClick={()=>showBoard('found')}>Recently found</button>
   </nav>
   <button className="report-button" onClick={()=>create()}>+ Post a report</button>
  </header>

  {page==='board'?<main className="workspace">
   <aside className="filters">
    <h1>Lost something? Found something?</h1>
    {/* CHANGE 3: two clear starting points that match the two user goals */}
    <div className="start-actions">
     <button className="start lost" onClick={()=>{setFilterStatus('found');document.getElementById('search')?.focus();}}><strong>🔎 I lost something</strong><span>Search items others have found</span></button>
     <button className="start found" onClick={()=>create('found')}><strong>📦 I found something</strong><span>Post a found-item report</span></button>
    </div>
    <div className="filterbox">
     <h3>Search & filter</h3>
     {/* CHANGE 2: filters apply instantly; the misleading "Apply" button is gone */}
     <label>Search{field({id:'search',type:'search',value:q,onChange:e=>setQ(e.target.value),placeholder:'e.g. backpack, cafeteria, blue'})}</label>
     <label>Category<select value={cat} onChange={e=>setCat(e.target.value)}><option value="all">All categories</option>{categories.slice(1).map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label>Status<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s=><option key={s} value={s}>{cap(s)}</option>)}</select></label>
     <p className="live-count" aria-live="polite">{filtered.length} of {items.length} reports match</p>
     <button className="clear" onClick={clearFilters} disabled={!filtersOn}>Clear all filters</button>
    </div>
    <div className="howto">
     <strong>How recovery works</strong>
     <ol><li>Find a notice that matches your item.</li><li>Check where it is held: <em>📍 Held at…</em> means staff have it.</li><li>Go there with your student ID and describe the item to prove it is yours.</li></ol>
     <p>Collection points: {collectionPoints.join(', ')}.</p>
    </div>
    <button className="reset" onClick={reset}>Reset demo data</button>
   </aside>

   <section className="board">
    <div className="board-top"><h2>Notices <span>({filtered.length})</span></h2></div>
    {message&&<div className="message" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss message">✕</button></div>}
    {/* CHANGE 2: show which filters are active, each removable */}
    {filtersOn&&<div className="chips" aria-label="Active filters">
     {q&&<button onClick={()=>setQ('')}>Search: "{q}" ✕</button>}
     {cat!=='all'&&<button onClick={()=>setCat('all')}>Category: {cap(cat)} ✕</button>}
     {filterStatus!=='all'&&<button onClick={()=>setFilterStatus('all')}>Status: {cap(filterStatus)} ✕</button>}
    </div>}
    {filtered.length===0?<div className="empty-all"><strong>No reports match your search.</strong><p>Try fewer words or a different category. If nothing matches, post a report so others can contact a collection point when it turns up.</p><div><button onClick={clearFilters}>Clear filters</button><button className="report-button" onClick={()=>create(filterStatus==='found'?'lost':'')}>Post a report</button></div></div>:
    <div className={`board-grid cols-${columns.length}`}>{columns.map(col=>{const list=filtered.filter(r=>r.status===col.key);return <div className="board-column" key={col.key}>
     <div className="column-head"><span className={'col-icon '+col.key}>{col.icon}</span><div><strong>{col.title}</strong><small>{col.sub}</small></div><span className="col-count">{list.length}</span></div>
     <div className="sticky-list">{list.map(item=>{const h=item.status!=='lost'&&handover(item);const mine=item.owner==='you';return <article className={'sticky'+(mine?' mine':'')} key={item.id}>
      <div className="sticky-top"><span>{item.category}</span>{mine&&<span className="mine-tag">Your report</span>}</div>
      <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div>
      <h3>{item.title}</h3>
      <p>{item.description||'No additional description.'}</p>
      {h&&<div className={'handover '+h.tone}><strong>{h.icon} {h.title}</strong><span>{h.text}</span></div>}
      <div className="sticky-bottom"><span>⌖ {item.location||'Location not provided'}</span><small>{item.created}</small></div>
      {/* CHANGE 4: editing is a visible button on your own reports, not hidden in a "···" menu */}
      {mine&&<button className="edit-btn" onClick={()=>edit(item)} aria-label={`Edit your report: ${item.title}`}>✎ Edit</button>}
     </article>})}{list.length===0&&<div className="empty-column">No {col.key} reports match</div>}</div>
    </div>})}</div>}
   </section>
  </main>:

  <main className="report-page">
   <div className="crumbs"><button onClick={()=>setPage('board')}>← Back to notices</button><span>/</span><span>{current?'Edit your report':'Report an item'}</span></div>
   <div className="report-layout">
    <div className="report-intro">
     <h1>{current?'Update your report':'Tell us what happened.'}</h1>
     <p>Small details like colour, brand or a keychain help someone recognise their belongings.</p>
     <div className="paper-note">Your report will appear on the public campus noticeboard. Do not include personal details such as ID numbers.</div>
    </div>
    <section className="form-paper">
     <header><h2>{current?'Edit report':'Report an item'}</h2><p className="req-note"><b>*</b> Required</p></header>
     {formBox({onSubmit:submit,noValidate:true},<>
      {Object.keys(errors).length>0&&<div className="form-error" role="alert"><strong>Please fix {Object.keys(errors).length===1?'1 problem':`${Object.keys(errors).length} problems`} below.</strong></div>}
      <fieldset className={'status-pick'+(errors.status?' invalid':'')} aria-describedby={errors.status?'status-err':undefined}>
       <legend>What happened? <b>*</b></legend>
       <div className="status-options">{statuses.map((s,i)=><label key={s} className={form.status===s?'on':''}>{field({id:i===0?'f-status':undefined,type:'radio',name:'status',value:s,checked:form.status===s,onChange:set('status')})}<span>{{lost:'I lost it',found:'I found it',claimed:'Already claimed'}[s]}</span></label>)}</div>
       {err('status')}
      </fieldset>
      {form.status==='found'&&!current&&<div className="hint found-hint">📍 After posting, please hand the item to a collection point ({collectionPoints.join(', ')}). Staff will verify the owner before releasing it.</div>}
      <label htmlFor="f-title">Item title <b>*</b></label>
      {field({id:'f-title',className:errors.title||errors.duplicate?'invalid':'','aria-invalid':!!(errors.title||errors.duplicate),'aria-describedby':errors.title?'title-err':undefined,value:form.title,onChange:set('title'),placeholder:'e.g. Black backpack'})}
      {err('title')}
      <label htmlFor="f-category">Category <b>*</b></label>
      <select id="f-category" className={errors.category?'invalid':''} aria-invalid={!!errors.category} aria-describedby={errors.category?'category-err':undefined} value={form.category} onChange={set('category')}><option value="">Select a category</option>{categories.slice(1).map(s=><option key={s} value={s}>{cap(s)}</option>)}</select>
      {err('category')}
      <label htmlFor="f-location">{form.status==='found'?'Where did you find it?':'Last known location'} <span className="opt">(optional)</span></label>
      {field({id:'f-location',className:errors.duplicate?'invalid':'','aria-invalid':!!errors.duplicate,'aria-describedby':errors.duplicate?'duplicate-err':undefined,value:form.location,onChange:set('location'),placeholder:'e.g. Library - second floor'})}
      {errors.duplicate&&<p className="field-error" id="duplicate-err">{errors.duplicate.msg}</p>}
      <label htmlFor="f-desc">Description <span className="opt">(optional)</span></label>
      <textarea id="f-desc" rows="5" value={form.description} onChange={set('description')} placeholder="Colour, brand, distinctive marks, when you lost or found it"/>
      <div className="form-actions"><button type="button" onClick={()=>setPage('board')}>Cancel</button><button className="report-button" type="submit">{current?'Save changes':'Publish notice'}</button></div>
     </>)}
    </section>
   </div>
  </main>}
  <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
 </div>;
}
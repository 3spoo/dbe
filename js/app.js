const $=s=>document.querySelector(s),sv=$("#sv"),ov=$("#ov"),ov2=$("#ov2"),cm=$("#cm");
const CARD=["(0,1)","(1,1)","(0,N)","(1,N)"],TYPES=["INT","BIGINT","SMALLINT","DECIMAL","FLOAT","VARCHAR","CHAR","TEXT","DATE","TIME","DATETIME","BOOLEAN"];
const FONT="'DM Sans','Segoe UI',Arial,sans-serif",ST="#2463a5",TX="#172a46";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let uid=1;const nid=()=>"i"+(uid++)+Math.random().toString(36).slice(2,6);
const demo=()=>({name:"Università",ent:[
{id:"s",name:"Studente",x:220,y:260,at:[{n:"Matricola",pk:true,t:"INT",s:""},{n:"Nome",pk:false,t:"VARCHAR",s:"50"},{n:"Email",pk:false,t:"",s:"",o:true}]},
{id:"c",name:"Corso",x:700,y:260,at:[{n:"Codice",pk:true,t:"CHAR",s:"6"},{n:"Titolo",pk:false,t:"",s:""}]}],
rel:[{id:"r",name:"Iscrizione",a:"s",b:"c",ca:"(0,N)",cb:"(1,N)",x:null,y:null,at:[{n:"Data",pk:false,t:"DATE",s:""}]}]});
let S=demo(),z=1,px=0,py=0,clip=null,drag=null;
const ty=a=>a.t?a.t+(a.s?"("+a.s+")":""):"";
const suf=a=>[ty(a),a.o?"0..1":""].filter(Boolean).join(" ");
const ent=id=>S.ent.find(e=>e.id==id),find=id=>ent(id)||S.rel.find(r=>r.id==id);
function pos(o){if(o.x!=null)return o;const a=ent(o.a),b=ent(o.b);return a&&b?{x:(a.x+b.x)/2,y:(a.y+b.y)/2}:{x:0,y:0}}
const sh=o=>o.a?{d:1,w:Math.max(120,o.name.length*8+50)/2,h:32}:{d:0,w:Math.max(110,o.name.length*9+30)/2,h:22};
const ext=(o,ux,uy)=>{const s=sh(o);return s.d?1/(Math.abs(ux)/s.w+Math.abs(uy)/s.h):Math.min(s.w/(Math.abs(ux)||1e-9),s.h/(Math.abs(uy)||1e-9))};
function apos(o){const p=pos(o),n=o.at.length;let vx=0,vy=0;
const nb=o.a?[ent(o.a),ent(o.b)]:S.rel.filter(r=>r.a==o.id||r.b==o.id);
nb.forEach(q=>{if(!q)return;const c=pos(q),dx=c.x-p.x,dy=c.y-p.y,l=Math.hypot(dx,dy)||1;vx+=dx/l;vy+=dy/l});
const t0=Math.hypot(vx,vy)>.2?Math.atan2(-vy,-vx):-Math.PI/2,arc=n>1?Math.min(5.6,n*.85):0;
return o.at.map((a,i)=>{if(a.ox!=null)return{x:p.x+a.ox,y:p.y+a.oy};const t=t0-arc/2+arc*(i+.5)/n,ux=Math.cos(t),uy=Math.sin(t),d=ext(o,ux,uy)+58+(n>5&&i%2?26:0);return{x:p.x+ux*d,y:p.y+uy*d}})}
function content(){let L="",H="",A="";
for(const r of S.rel){const p=pos(r);[["a",r.ca],["b",r.cb]].forEach(([side,c])=>{const id=r[side],e=ent(id),preview=drag?.endpoint?.r===r&&drag.endpoint.side===side?drag.preview:null;if(!e&&!preview)return;
const target=preview||e,dx=target.x-p.x,dy=target.y-p.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,d=e?ext(e,-ux,-uy):0,qx=e?e.x-ux*d:target.x,qy=e?e.y-uy*d:target.y;
L+=`<line x1="${p.x}" y1="${p.y}" x2="${qx}" y2="${qy}" stroke="${ST}" stroke-width="1.8"/><circle data-endpoint="${r.id}:${side}" cx="${qx}" cy="${qy}" r="9" fill="#fff" stroke="${ST}" stroke-width="2"/><text x="${qx+ux*-30-uy*-13}" y="${qy+uy*-30+ux*-13+4}" text-anchor="middle" font-size="11" font-weight="700" fill="${TX}">${c}</text>`})}
for(const o of [...S.ent,...S.rel]){const p=pos(o),s=sh(o);
apos(o).forEach((q,i)=>{const a=o.at[i],dx=q.x-p.x,dy=q.y-p.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,e=ext(o,ux,uy);
L+=`<line x1="${p.x+ux*e}" y1="${p.y+uy*e}" x2="${q.x}" y2="${q.y}" stroke="${ST}" stroke-width="1.2"/>`;
const an=ux>.35?"start":ux<-.35?"end":"middle",tx=an=="start"?q.x+11:an=="end"?q.x-11:q.x,tY=Math.abs(ux)>.35?q.y+4:(uy>0?q.y+22:q.y-11),sf=suf(a);
A+=`<g data-a="${o.id}:${i}" style="cursor:move"><circle cx="${q.x}" cy="${q.y}" r="6" fill="${a.pk?"#1f3a68":"#fff"}" stroke="${ST}" stroke-width="1.5"/><text x="${tx}" y="${tY}" text-anchor="${an}" font-size="12" fill="${TX}">${esc(a.n)}${sf?`<tspan fill="#7a889c" font-size="9.5" dx="4">${esc(sf)}</tspan>`:""}</text></g>`});
H+=o.a?`<g data-r="${o.id}" style="cursor:move"><polygon points="${p.x},${p.y-s.h} ${p.x+s.w},${p.y} ${p.x},${p.y+s.h} ${p.x-s.w},${p.y}" fill="#f7faff" stroke="${ST}" stroke-width="2"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="13" font-weight="500" fill="${TX}">${esc(o.name)}</text></g>`
:`<g data-e="${o.id}" style="cursor:move"><rect x="${p.x-s.w}" y="${p.y-s.h}" width="${2*s.w}" height="${2*s.h}" fill="#f7faff" stroke="${ST}" stroke-width="2"/><text x="${p.x}" y="${p.y+5}" text-anchor="middle" font-size="14" font-weight="600" fill="${TX}">${esc(o.name)}</text></g>`}
const watermark=`<g opacity=".01" pointer-events="none"><rect x="50%" y="50%" width="150" height="150" rx="32" transform="translate(-75 -75)" fill="${ST}"/><text x="50%" y="50%" dy="16" text-anchor="middle" font-family="${FONT}" font-size="44" font-weight="700" fill="#fff">DBE</text><text x="50%" y="50%" dy="43" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="700" fill="#fff">3SPOO · GITHUB</text><text x="50%" y="50%" dy="103" text-anchor="middle" font-family="${FONT}" font-size="11" fill="${ST}">github.com/3spoo/dbe</text></g>`;
return watermark+L+H+A}
function bbox(){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const f=(x,y,w,h)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+w);y1=Math.max(y1,y+h)};
for(const o of [...S.ent,...S.rel]){const p=pos(o),s=sh(o);f(p.x-s.w,p.y-s.h,2*s.w,2*s.h);apos(o).forEach((q,i)=>{const a=o.at[i],w=a.n.length*7.5+suf(a).length*5.5+16;f(q.x-w,q.y-16,2*w,34)})}
return x0>1e8?null:{x:x0-30,y:y0-30,w:x1-x0+60,h:y1-y0+60}}
function draw(){$("#g").setAttribute("font-family",FONT);$("#g").innerHTML=content();$("#g").setAttribute("transform",`translate(${px},${py}) scale(${z})`);
sv.style.backgroundSize=`${22*z}px ${22*z}px`;sv.style.backgroundPosition=`${px}px ${py}px`;
$("#zl").textContent=Math.round(z*100)+"%";if($("#pn").value!==S.name)$("#pn").value=S.name;$("#hint").hidden=S.ent.length>0;
$("#list").innerHTML=[...S.ent,...S.rel].map(o=>`<div class="it" data-id="${o.id}"><span>${o.a?"◇":"▭"}</span><div><b>${esc(o.name)}</b>${o.a?`<small>${esc(ent(o.a)?.name||"")} – ${esc(ent(o.b)?.name||"")}</small>`:""}</div><button class="x" data-x="${o.id}" title="ELIMINA">✕</button></div>`).join("")||'<div class="em">Nessun elemento</div>'}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function zoomAt(nz,cx,cy){nz=clamp(nz,.15,4);px=cx-(cx-px)*nz/z;py=cy-(cy-py)*nz/z;z=nz;draw()}
function zc(f){const r=sv.getBoundingClientRect();zoomAt(z*f,r.width/2,r.height/2)}
function fit(){const b=bbox(),r=sv.getBoundingClientRect();if(!b){z=1;px=0;py=0}else{z=clamp(Math.min(r.width/b.w,r.height/b.h),.15,1.5);px=(r.width-b.w*z)/2-b.x*z;py=(r.height-b.h*z)/2-b.y*z}draw()}
sv.addEventListener("wheel",ev=>{ev.preventDefault();const r=sv.getBoundingClientRect();zoomAt(z*(ev.deltaY<0?1.1:1/1.1),ev.clientX-r.left,ev.clientY-r.top)},{passive:false});
const w2=ev=>{const r=sv.getBoundingClientRect();return{x:(ev.clientX-r.left-px)/z,y:(ev.clientY-r.top-py)/z}};
const hit=ev=>{const t=ev.target.closest("[data-e],[data-r],[data-a],[data-endpoint]");if(!t)return{};const d=t.dataset;
if(d.endpoint){const[id,side]=d.endpoint.split(":");return{endpoint:{r:find(id),side}}}
if(d.a){const[id,i]=d.a.split(":"),o=find(id);return{o,a:o.at[i]}}return{o:find(d.e||d.r)}};
sv.addEventListener("pointerdown",ev=>{if(ev.button)return;cm.hidden=true;const h=hit(ev),pt=w2(ev);
if(h.endpoint)drag={endpoint:h.endpoint,preview:pt};else if(h.a)drag={a:h.a,o:h.o};else if(h.o){const p=pos(h.o);drag={o:h.o,dx:pt.x-p.x,dy:pt.y-p.y}}else drag={pan:1,sx:ev.clientX-px,sy:ev.clientY-py};
sv.setPointerCapture(ev.pointerId)});
sv.addEventListener("pointermove",ev=>{if(!drag||drag.endpoint)return;const p=w2(ev);
if(drag.pan){px=ev.clientX-drag.sx;py=ev.clientY-drag.sy}else if(drag.a){const c=pos(drag.o);drag.a.ox=p.x-c.x;drag.a.oy=p.y-c.y}else{drag.o.x=p.x-drag.dx;drag.o.y=p.y-drag.dy}draw()});
sv.addEventListener("pointermove",ev=>{if(drag?.endpoint){drag.preview=w2(ev);draw()}});
sv.addEventListener("pointerup",ev=>{if(drag?.endpoint){const p=w2(ev),target=S.ent.reduce((best,e)=>{const d=Math.hypot(e.x-p.x,e.y-p.y);return d<(best?.d??Infinity)?{e,d}:best},null);if(target&&target.d<120){const{r,side}=drag.endpoint;const other=side==="a"?r.b:r.a;if(target.e.id!==other)r[side]=target.e.id;else toast("Le due estremità devono usare entità diverse")}else toast("Trascina il punto blu sopra un'entità");}drag=null;draw()});
sv.addEventListener("dblclick",ev=>{const h=hit(ev);h.o?edit(h.o):edit(null,"e",w2(ev))});
sv.addEventListener("contextmenu",ev=>{ev.preventDefault();const h=hit(ev),p=w2(ev);let it;
if(h.o){it=[["Modifica",()=>edit(h.o)]];if(h.a)it.push(["Posizione automatica",()=>{delete h.a.ox;delete h.a.oy;draw()}]);
else{if(!h.o.a)it.push(["Copia",()=>clip=JSON.parse(JSON.stringify(h.o))],["Incolla",()=>paste(p)]);it.push(["Elimina",()=>del(h.o)])}}
else it=[["Nuova entità qui",()=>edit(null,"e",p)],["Incolla",()=>paste(p)]];
cm.innerHTML="";it.forEach(([l,f])=>{const b=document.createElement("button");b.textContent=l;b.onclick=()=>{cm.hidden=true;f()};cm.appendChild(b)});
cm.style.left=Math.min(ev.clientX,innerWidth-190)+"px";cm.style.top=Math.min(ev.clientY,innerHeight-150)+"px";cm.hidden=false});
function paste(p){if(!clip)return toast("Niente da incollare");const e=JSON.parse(JSON.stringify(clip));e.id=nid();e.name+="_copia";e.x=p.x;e.y=p.y;e.at.forEach(a=>{delete a.ox;delete a.oy});S.ent.push(e);draw()}
function del(o){if(o.a)S.rel=S.rel.filter(x=>x!=o);else{S.ent=S.ent.filter(x=>x!=o);S.rel=S.rel.filter(r=>r.a!=o.id&&r.b!=o.id)}draw()}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)}
$("#list").onclick=ev=>{const x=ev.target.closest("[data-x]");if(x)return del(find(x.dataset.x));const i=ev.target.closest("[data-id]");if(i)edit(find(i.dataset.id))};
/* modali */
const close=()=>{ov.hidden=true;ov.innerHTML=""};
function modal(title,body,ok){ov.innerHTML=`<div class="box"><h3>${title}</h3>${body}<div class="bt"><button class="no" id="mc">Annulla</button><button class="ok" id="mo">Salva</button></div></div>`;ov.hidden=false;$("#mc").onclick=close;$("#mo").onclick=()=>{if(ok()!==false)close()}}
function typeDlg(a,done){ov2.innerHTML=`<div class="box" style="width:min(340px,92vw)"><h3>Tipo</h3><label>Tipo (opzionale)</label><select id="tt"><option value="">(NESSUNO)</option>${TYPES.map(t=>`<option${a.t==t?" selected":""}>${t}</option>`).join("")}</select><label>Dimensione</label><input type="text" id="ts2" value="${esc(a.s)}" ${a.t?"":"disabled"}><label class="ck"><input type="checkbox" id="to" ${a.o?"checked":""}> Attributo opzionale (0..1)</label><div class="bt"><button class="no" id="c2">Annulla</button><button class="ok" id="o2">OK</button></div></div>`;ov2.hidden=false;
$("#tt").onchange=e=>{$("#ts2").disabled=!e.target.value;if(!e.target.value)$("#ts2").value=""};
$("#c2").onclick=()=>ov2.hidden=true;$("#o2").onclick=()=>{a.t=$("#tt").value;a.s=a.t?$("#ts2").value.trim():"";a.o=$("#to").checked;ov2.hidden=true;done()}}
function edit(o,k,p){const isR=o?!!o.a:k=="r";if(isR&&S.ent.length<2)return toast("Servono almeno due entità");
const d=o?JSON.parse(JSON.stringify(o)):{name:"",a:S.ent[0]?.id,b:S.ent[1]?.id,ca:"(0,N)",cb:"(1,1)",at:[0,1,2].map(()=>({n:"",pk:false,t:"",s:""}))};
if(!o&&!p){const r=sv.getBoundingClientRect(),m=S.ent.length%6*28;p={x:(r.width/2-px)/z+m,y:(r.height/2-py)/z+m}}
const es=v=>S.ent.map(e=>`<option value="${e.id}"${e.id==v?" selected":""}>${esc(e.name)}</option>`).join(""),cs=v=>CARD.map(c=>`<option${c==v?" selected":""}>${c}</option>`).join("");
const rows=()=>$("#tb").innerHTML=d.at.map((a,i)=>`<tr><td><input type="text" data-i="${i}" value="${esc(a.n)}"></td><td class="c"><input type="checkbox" data-i="${i}" ${a.pk?"checked":""}></td><td class="c"><button data-t="${i}" title="TIPO">✎</button> <small>${esc(suf(a))}</small></td></tr>`).join("");
modal((o?"Modifica ":"Crea ")+(isR?"relazione":"entità"),`<input type="text" id="en" class="nm" placeholder="Nome" value="${esc(d.name)}">`+(isR?`<label>Entità collegate e cardinalità</label><div class="g2"><select id="ra">${es(d.a)}</select><select id="rca">${cs(d.ca)}</select><select id="rb">${es(d.b)}</select><select id="rcb">${cs(d.cb)}</select></div><div class="workspace-note mt-2"><i class="bi bi-arrows-move"></i><span>Dopo il salvataggio, trascina i punti alle estremità della linea sopra le entità.</span></div>`:"")+`<table><thead><tr><th>Nome<th>Chiave primaria<th>Tipo</thead><tbody id="tb"></tbody></table><button id="ad" class="lk">＋ Aggiungi</button>`,()=>{
const n=$("#en").value.trim();if(!n)return toast("Inserisci il nome"),false;
if((isR?S.rel:S.ent).some(x=>x!=o&&x.name.toLowerCase()==n.toLowerCase()))return toast("Nome già utilizzato"),false;
let v={name:n,at:d.at.filter(a=>a.n.trim()).map(a=>({...a,n:a.n.trim()}))};
if(isR){v.a=$("#ra").value;v.b=$("#rb").value;v.ca=$("#rca").value;v.cb=$("#rcb").value;if(v.a==v.b)return toast("Scegli due entità diverse"),false}
if(o)Object.assign(o,v);else(isR?S.rel:S.ent).push({id:nid(),...(isR?{x:null,y:null}:{x:p.x,y:p.y}),...v});draw()});
rows();const tb=$("#tb");
tb.oninput=e=>{if(e.target.type=="text")d.at[e.target.dataset.i].n=e.target.value};
tb.onchange=e=>{if(e.target.type=="checkbox")d.at[e.target.dataset.i].pk=e.target.checked};
tb.onclick=e=>{const b=e.target.closest("[data-t]");if(b)typeDlg(d.at[b.dataset.t],rows)};
$("#ad").onclick=()=>{d.at.push({n:"",pk:false,t:"",s:""});rows();tb.querySelector("tr:last-child input").focus()};$("#en").focus()}
/* esportazione */
function snap(){const b=bbox();if(!b)return null;b.y-=26;b.h+=26;
return{w:b.w,h:b.h,s:`<svg xmlns="http://www.w3.org/2000/svg" width="${b.w}" height="${b.h}" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" font-family="${FONT}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#fff"/><text x="${b.x+16}" y="${b.y+26}" font-size="15" font-weight="600" fill="${TX}">${esc(S.name)}</text>${content()}</svg>`}}
function raster(sc){return new Promise((res,rej)=>{const o=snap();if(!o)return rej();const im=new Image();
im.onload=()=>{let k=sc;while(o.w*k>8000||o.h*k>8000)k*=.8;const c=document.createElement("canvas");c.width=Math.ceil(o.w*k);c.height=Math.ceil(o.h*k);const x=c.getContext("2d");x.scale(k,k);x.drawImage(im,0,0,o.w,o.h);c.toBlob(b=>res({b,w:o.w,h:o.h,url:c.toDataURL("image/png")}),"image/png")};
im.onerror=rej;im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(o.s)})}
const slug=()=>(S.name||"diagramma").trim().replace(/[^\w\-]+/g,"_")||"diagramma";
async function save(name,blob){let d=null;try{d=window.claude&&await claude.use("downloads")}catch(e){}
if(d){try{await d.save({filename:name,data:blob})}catch(e){if(!e||e.code!="declined")toast("Salvataggio non riuscito")}}
else{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}}
async function exp(kind){if(!S.ent.length)return toast("Il diagramma è vuoto");
try{if(kind=="png"){const r=await raster(3);save(slug()+".png",r.b)}
else if(kind=="pdf"){if(!window.jspdf)return toast("Libreria PDF non caricata");const r=await raster(3),{jsPDF}=jspdf;
const doc=new jsPDF({orientation:r.w>r.h?"l":"p",unit:"mm",format:"a4"}),pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight(),m=10;
const k=Math.min((pw-2*m)/r.w,(ph-2*m)/r.h,.3),iw=r.w*k,ih=r.h*k;doc.addImage(r.url,"PNG",(pw-iw)/2,(ph-ih)/2,iw,ih);save(slug()+".pdf",doc.output("blob"))}
else save(slug()+".json",new Blob([JSON.stringify({app:"er-modeler",version:2,name:S.name,ent:S.ent,rel:S.rel},null,1)],{type:"application/json"}))}
catch(e){toast("Esportazione non riuscita")}}
$("#pn").oninput=e=>S.name=e.target.value;
$("#be").onclick=()=>edit(null,"e");$("#br").onclick=()=>edit(null,"r");
$("#bn").onclick=()=>{if(!S.ent.length||confirm("Creare un nuovo diagramma? Le modifiche non salvate andranno perse.")){S={name:"Nuovo database",ent:[],rel:[]};fit()}};
$("#zi").onclick=()=>zc(1.2);$("#zo").onclick=()=>zc(1/1.2);$("#zf").onclick=fit;
$("#bp").onclick=()=>exp("png");$("#bf").onclick=()=>exp("pdf");$("#bj").onclick=()=>exp("json");$("#bl").onclick=()=>$("#fi").click();
$("#fi").onchange=ev=>{const f=ev.target.files[0];if(!f)return;const rd=new FileReader();
rd.onload=()=>{try{const j=JSON.parse(rd.result);if(j.app!="er-modeler"||j.version!=2||!Array.isArray(j.ent)||!Array.isArray(j.rel))throw 0;
j.rel.forEach(r=>r.at=r.at||[]);S={name:j.name||"Database",ent:j.ent,rel:j.rel};fit();toast("Progetto caricato")}catch(e){toast("File JSON non valido per questo programma")}};rd.readAsText(f);ev.target.value=""};
addEventListener("keydown",e=>{if(e.key=="Escape"){if(!ov2.hidden)ov2.hidden=true;else close();cm.hidden=true}});
addEventListener("resize",draw);fit();

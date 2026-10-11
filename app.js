(function(){
const CRIT=[
  {k:"exp",l:"Experience",h:"Budgets, governance, committee work, relevant career"},
  {k:"spec",l:"Specific plan",h:"Concrete commitments vs. general statements"},
  {k:"fit",l:"My priorities",h:"Names the issues you care most about"},
  {k:"rec",l:"Track record",h:"What they delivered, how they voted, conduct"},
  {k:"ind",l:"Independent",h:"Likely to think for themselves, not just vote the slate line"}
];
const {CB,TB,COUNCIL,TRUSTEE}=window;
const RACES={
  council:{rows:COUNCIL,base:CB,seats:8,label:"council"},
  trustee:{rows:TRUSTEE,base:TB,seats:6,label:"trustee"}
};
const SLATE_COLORS=["#3b6fb6","#c4572e","#2f8f6b","#8a5cc2","#b58a1b","#c23d6e","#4f8fa8","#7a7f8c"];
const KEY="surreyScorecard2026";
let state={race:"council",weights:{exp:1,spec:1,fit:1,rec:1,ind:1},scores:{council:{},trustee:{}},skip:{council:{},trustee:{}},count:{council:8,trustee:6},hideScr:false,sort:"score",slate:"",q:""};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s)state=Object.assign(state,s,{q:""});}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function maxTotal(){return CRIT.reduce((a,c)=>a+5*state.weights[c.k],0);}
function total(race,slug){const sc=state.scores[race][slug]||{};let t=0,n=0;CRIT.forEach(c=>{if(sc[c.k]){t+=sc[c.k]*state.weights[c.k];n++;}});return {t,n};}
function slates(race){return [...new Set(RACES[race].rows.map(r=>r[2]))];}
function slateColor(race,s){return SLATE_COLORS[slates(race).indexOf(s)%SLATE_COLORS.length];}

function renderWeights(){
  $("weights").innerHTML='<span class="lbl">How much each criterion counts</span>'+CRIT.map(c=>
    `<label title="${esc(c.h)}">${c.l}<select id="w-${c.k}" data-k="${c.k}">${[0,1,2,3].map(v=>`<option value="${v}"${state.weights[c.k]==v?" selected":""}>×${v}</option>`).join("")}</select></label>`).join("");
  $("weights").querySelectorAll("select").forEach(s=>s.onchange=()=>{state.weights[s.dataset.k]=+s.value;save();render();});
}

function ballotPicks(race){
  const R=RACES[race];
  return R.rows.map(r=>({r,...total(race,r[1])}))
    .filter(x=>x.t>0&&!state.skip[race][x.r[1]])
    .sort((a,b)=>b.t-a.t||a.r[0].localeCompare(b.r[0]))
    .slice(0,state.count[race]);
}

function renderList(){
  const race=state.race,R=RACES[race],mx=maxTotal();
  const picks=new Set(ballotPicks(race).map(x=>x.r[1]));
  const q=state.q.trim().toLowerCase();
  let rows=R.rows.filter(r=>(!state.hideScr||!r[6])&&(!state.slate||r[2]===state.slate)&&(!q||(r.slice(0,6).join(" ").toLowerCase().includes(q))));
  if(state.sort==="name")rows.sort((a,b)=>a[0].split(" ").pop().localeCompare(b[0].split(" ").pop()));
  else if(state.sort==="score")rows.sort((a,b)=>total(race,b[1]).t-total(race,a[1]).t||a[0].localeCompare(b[0]));
  const sc=state.scores[race];
  $("list").innerHTML=rows.length?rows.map(r=>{
    const [n,slug,sl,inc,bg,pr,flag]=r,{t,n:cnt}=total(race,slug),skipped=!!state.skip[race][slug];
    return `<article class="cand${flag?" screened":""}${picks.has(slug)?" inballot":""}" data-slug="${slug}">
      <div class="who">
        <div class="name"><a href="${R.base}${slug}" target="_blank" rel="noopener">${esc(n)}</a></div>
        <div class="chips"><span class="chip" style="color:${slateColor(race,sl)};background:color-mix(in srgb, ${slateColor(race,sl)} 14%, transparent)">${esc(sl)}</span>${inc?`<span class="chip inc">${esc(inc)}</span>`:""}${flag?'<span class="chip scr">Flagged: little or no profile</span>':""}</div>
        <div class="facts"><span><b>Background:</b> ${esc(bg)}</span><span><b>Priorities:</b> ${esc(pr)}</span></div>
      </div>
      <div class="total"><div class="num">${t}</div><div class="of">of ${mx}${cnt?` · ${cnt}/5`:""}</div></div>
      <div class="scores">${CRIT.map(c=>`<div class="crit"><span class="cl" title="${esc(c.h)}">${c.l}${state.weights[c.k]===0?" (off)":""}</span><div class="boxes">${[1,2,3,4,5].map(v=>`<button class="box" data-k="${c.k}" data-v="${v}" aria-label="${esc(n)} ${c.l} ${v}" aria-pressed="${(sc[slug]||{})[c.k]===v}">${v}</button>`).join("")}</div></div>`).join("")}
        <div class="rowact"><button class="ghost skip" aria-pressed="${skipped}" title="Keep this candidate off your ballot even if they score high">${skipped?"Left off ballot":"Leave off ballot"}</button></div>
      </div>
    </article>`;}).join(""):'<p class="empty-msg">No candidates match these filters.</p>';
}

function renderBallot(){
  const race=state.race,R=RACES[race],picks=ballotPicks(race);
  const scored=R.rows.filter(r=>total(race,r[1]).n>0).length;
  const mix={};picks.forEach(p=>mix[p.r[2]]=(mix[p.r[2]]||0)+1);
  const opts=[];for(let i=1;i<=R.seats;i++)opts.push(`<option value="${i}"${state.count[race]==i?" selected":""}>${i}</option>`);
  $("ballot").innerHTML=`<h2>My ${race==="council"?"council":"trustee"} picks</h2>
    <div class="ctrl"><label for="cnt">Vote for</label><select id="cnt">${opts.join("")}</select><span>of up to ${R.seats}</span></div>
    ${picks.length?`<ol>${picks.map(p=>`<li><b>${esc(p.r[0])}</b><span>${p.t} · ${esc(p.r[2])}</span></li>`).join("")}</ol>
      <div><div class="mixbar" aria-hidden="true">${Object.entries(mix).map(([s,c])=>`<i style="width:${c/picks.length*100}%;background:${slateColor(race,s)}"></i>`).join("")}</div>
      <div class="legend">${Object.entries(mix).map(([s,c])=>`<span><i style="background:${slateColor(race,s)}"></i>${esc(s)} ${c}</span>`).join("")}</div></div>`
      :'<p class="empty">Score a few candidates and your top picks appear here.</p>'}
    <p class="meta">${scored} of ${R.rows.length} candidates scored. Ties are broken alphabetically, so check any close calls yourself.</p>
    <div class="ctrl"><button class="btn" id="copy"${picks.length?"":" disabled"}>Copy my list</button><span class="toast" id="toast"></span></div>
    <textarea id="copytxt" readonly hidden style="width:100%;font:13px var(--mono);background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:4px" rows="6"></textarea>
    <div class="confirm" id="resetbox"><button class="ghost" id="reset">Clear ${race} scores</button></div>`;
  $("cnt").onchange=e=>{state.count[race]=+e.target.value;save();render();};
  $("copy").onclick=()=>{
    const txt=`My Surrey ${race==="council"?"City Council":"School Trustee"} picks (Oct 17, 2026):\n`+picks.map((p,i)=>`${i+1}. ${p.r[0]}`).join("\n");
    const done=()=>{$("toast").textContent="Copied";setTimeout(()=>{const t=$("toast");if(t)t.textContent="";},2000);};
    const fall=()=>{const ta=$("copytxt");ta.hidden=false;ta.value=txt;ta.select();$("toast").textContent="Select and copy the text below";};
    try{navigator.clipboard.writeText(txt).then(done,fall);}catch(e){fall();}
  };
  $("reset").onclick=()=>{$("resetbox").innerHTML=`<span>Clear all your ${race} scores?</span><button class="ghost" id="yes">Yes, clear</button><button class="ghost" id="no">Cancel</button>`;
    $("yes").onclick=()=>{state.scores[race]={};state.skip[race]={};save();render();};
    $("no").onclick=()=>renderBallot();};
}

function renderPicksbar(){
  const race=state.race,n=ballotPicks(race).length,max=state.count[race];
  $("picksbar-txt").textContent=n?`${n} of ${max} ${race==="council"?"council":"trustee"} picks chosen`:`No ${race==="council"?"council":"trustee"} picks yet`;
}
function renderToolbar(){
  $("slate").innerHTML='<option value="">All slates</option>'+slates(state.race).map(s=>`<option${state.slate===s?" selected":""}>${esc(s)}</option>`).join("");
  $("sort").value=state.sort;$("hideScr").checked=state.hideScr;
  $("tab-council").setAttribute("aria-selected",state.race==="council");
  $("tab-trustee").setAttribute("aria-selected",state.race==="trustee");
}
function render(){renderToolbar();renderList();renderBallot();renderPicksbar();}

$("list").addEventListener("click",e=>{
  const card=e.target.closest(".cand");if(!card)return;const slug=card.dataset.slug,race=state.race;
  const b=e.target.closest(".box");
  if(b){const k=b.dataset.k,v=+b.dataset.v;const sc=state.scores[race][slug]=state.scores[race][slug]||{};
    if(sc[k]===v)delete sc[k];else sc[k]=v;save();renderList();renderBallot();renderPicksbar();
    const again=document.querySelector(`.cand[data-slug="${slug}"] .box[data-k="${k}"][data-v="${v}"]`);if(again)again.focus();return;}
  if(e.target.closest(".skip")){state.skip[race][slug]=!state.skip[race][slug];save();renderList();renderBallot();renderPicksbar();}
});
$("tab-council").onclick=()=>{state.race="council";state.slate="";save();render();};
$("tab-trustee").onclick=()=>{state.race="trustee";state.slate="";save();render();};
$("q").oninput=e=>{state.q=e.target.value;renderList();};
$("slate").onchange=e=>{state.slate=e.target.value;save();renderList();};
$("sort").onchange=e=>{state.sort=e.target.value;save();renderList();};
$("hideScr").onchange=e=>{state.hideScr=e.target.checked;save();renderList();};
$("picksbar-btn").onclick=()=>{$("ballot").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});};
renderWeights();render();
})();

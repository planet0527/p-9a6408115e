const LEVELS = [{"map": ["#######", "#@  # #", "# $ $ #", "#   # #", "#  #  #", "# .  .#", "#######"], "opt": 20}, {"map": ["########", "#@   . #", "#      #", "#$$    #", "#  $ # #", "#. # #.#", "########"], "opt": 40}, {"map": ["#######", "# #   #", "#  .$ #", "#    ##", "##$$#@#", "#.   .#", "#######"], "opt": 52}, {"map": ["########", "# ##@. #", "#   # .#", "#   $  #", "# $#$  #", "#  #  .#", "########"], "opt": 54}, {"map": ["########", "### #.##", "#@#  . #", "# $$#  #", "# $   ##", "###   ##", "###   .#", "########"], "opt": 59}, {"map": ["#########", "# #   #@#", "#  . ## #", "#     $ #", "#  #  $ #", "# . ##$ #", "# .    ##", "#########"], "opt": 60}, {"map": ["#########", "###  #..#", "##  .   #", "##$     #", "#@ #    #", "##$   # #", "#  $$ . #", "#       #", "#########"], "opt": 61}, {"map": ["#########", "#.#  $+##", "# #  $$ #", "#   # # #", "#   . # #", "#   #   #", "#########"], "opt": 68}, {"map": ["#########", "##      #", "#@##$$  #", "#.   $  #", "##  # $##", "#  #.   #", "#  #    #", "#. .    #", "#########"], "opt": 68}, {"map": ["########", "#@## # #", "#  #  .#", "# $#$  #", "#.*    #", "# $#  ##", "#  #  .#", "########"], "opt": 79}, {"map": ["#########", "#@ ..   #", "## # #  #", "# #  .  #", "# $ #   #", "#  $$   #", "#    * ##", "#########"], "opt": 90}, {"map": ["#########", "#+     .#", "# $$#   #", "# #. # ##", "### $ # #", "#   $ ..#", "#   $# ##", "# #     #", "#########"], "opt": 90}, {"map": ["##########", "#        #", "#  $# ####", "#    $#@ #", "#  #   $ #", "#.#  *.# #", "# # # .# #", "##########"], "opt": 115}];
function solvePush(W,H,wall,goal,boxes0,p0,limit){
  const N=W*H, live=new Uint8Array(N), st=[];
  for(let k=0;k<N;k++) if(goal[k]){ live[k]=1; st.push(k); }
  const D=[1,-1,W,-W];
  while(st.length){ const c=st.pop(); for(const d of D){ const n=c+d,pp=n+d; if(n<0||pp<0||n>=N||pp>=N) continue; if(!wall[n]&&!wall[pp]&&!live[n]){ live[n]=1; st.push(n);} } }
  const occ=new Uint8Array(N), seen=new Uint32Array(N); let stamp=0; const fq=new Int32Array(N);
  function reach(p){ stamp++; let h=0,t=0,mn=p; fq[t++]=p; seen[p]=stamp;
    while(h<t){ const c=fq[h++]; if(c<mn) mn=c; for(const d of D){ const n=c+d; if(!wall[n]&&!occ[n]&&seen[n]!==stamp){ seen[n]=stamp; fq[t++]=n; } } } return mn; }
  const solid=k=>wall[k]||occ[k];
  function frozen(b){ for(const [a,c] of [[-1,-W],[1,-W],[-1,W],[1,W]]){ if(solid(b+a)&&solid(b+c)&&solid(b+a+c)){
      for(const q of [b,b+a,b+c,b+a+c]) if(occ[q]&&!goal[q]) return true; } } return false; }
  const set=bs=>{ occ.fill(0); for(const b of bs) occ[b]=1; };
  const isDone=bs=>bs.every(b=>goal[b]);
  const B0=[...boxes0].sort((a,b)=>a-b);
  set(B0); if(isDone(B0)) return [];
  const key0=B0.join(',')+'|'+reach(p0);
  const nodes=[{bs:B0,p:p0,par:-1,mv:null}], seenK=new Map([[key0,0]]);
  for(let qi=0;qi<nodes.length;qi++){
    if(nodes.length>limit) return 'limit';
    const nd=nodes[qi]; set(nd.bs); reach(nd.p);
    const cur=stamp; const can=new Uint8Array(N); for(let k=0;k<N;k++) if(seen[k]===cur) can[k]=1;
    for(let bi=0;bi<nd.bs.length;bi++){ const b=nd.bs[bi];
      for(const d of D){ const from=b-d, to=b+d;
        if(!can[from]||wall[to]||occ[to]||!live[to]) continue;
        occ[b]=0; occ[to]=1;
        if(!goal[to]&&frozen(to)){ occ[to]=0; occ[b]=1; continue; }
        const nb=nd.bs.slice(); nb[bi]=to; nb.sort((a,c)=>a-c);
        const mn=reach(b); const key=nb.join(',')+'|'+mn;
        occ[to]=0; occ[b]=1;
        if(!seenK.has(key)){ seenK.set(key,nodes.length); nodes.push({bs:nb,p:b,par:qi,mv:[b,d]});
          if(isDone(nb)){ const out=[]; let k=nodes.length-1; while(nodes[k].par>=0){ out.unshift(nodes[k].mv); k=nodes[k].par; } return out; } }
      } }
  }
  return null;
}

for(let i=0;i<LEVELS.length;i++){const rows=LEVELS[i].map,H=rows.length,W=Math.max(...rows.map(r=>r.length));let wall=[],goal=[],boxes=[],p=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=rows[y][x]||'#',k=y*W+x;wall[k]=c==='#'?1:0;goal[k]='.*+'.includes(c)?1:0;if('$*'.includes(c))boxes.push(k);if('@+'.includes(c))p=k;}let r=solvePush(W,H,wall,goal,boxes,p,250000);console.log(i+1,boxes.length,goal.filter(Boolean).length,Array.isArray(r)?'SOLVED '+r.length:r);}

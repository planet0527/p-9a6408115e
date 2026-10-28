const LEVELS = [{"map": ["#######", "#@  # #", "# $ $ #", "#   # #", "#  #  #", "# .  .#", "#######"], "opt": 20}, {"map": ["########", "#@   . #", "#      #", "#$$    #", "#  $ # #", "#. # #.#", "########"], "opt": 40}, {"map": ["#######", "# #   #", "#  .$ #", "#    ##", "##$$#@#", "#.   .#", "#######"], "opt": 52}, {"map": ["########", "# ##@. #", "#   # .#", "#   $  #", "# $#$  #", "#  #  .#", "########"], "opt": 54}, {"map": ["########", "### #.##", "#@#  . #", "# $$#  #", "# $   ##", "###   ##", "###   .#", "########"], "opt": 59}, {"map": ["#########", "# #   #@#", "#  . ## #", "#     $ #", "#  #  $ #", "# . ##$ #", "# .    ##", "#########"], "opt": 60}, {"map": ["#########", "###  #..#", "##  .   #", "##$     #", "#@ #    #", "##$   # #", "#  $$ . #", "#       #", "#########"], "opt": 61}, {"map": ["#########", "#.#  $+##", "# #  $$ #", "#   # # #", "#   . # #", "#   #   #", "#########"], "opt": 68}, {"map": ["#########", "##      #", "#@##$$  #", "#.   $  #", "##  # $##", "#  #.   #", "#  #    #", "#. .    #", "#########"], "opt": 68}, {"map": ["########", "#@## # #", "#  #  .#", "# $#$  #", "#.*    #", "# $#  ##", "#  #  .#", "########"], "opt": 79}, {"map": ["#########", "#@ ..   #", "## # #  #", "# #  .  #", "# $ #   #", "#  $$   #", "#    * ##", "#########"], "opt": 90}, {"map": ["#########", "#+     .#", "# $$#   #", "# #. # ##", "### $ # #", "#   $ ..#", "#   $# ##", "# #     #", "#########"], "opt": 90}, {"map": ["##########", "#        #", "#  $# ####", "#    $#@ #", "#  #   $ #", "#.#  *.# #", "# # # .# #", "##########"], "opt": 115}];
const DIRS={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
function draftDigest(o){const x=JSON.stringify(o);let h=2166136261;for(let i=0;i<x.length;i++){h=Math.imul(h^x.charCodeAt(i),16777619);}return (h>>>0).toString(36);}
function safeHistory(d){
 if(!Array.isArray(d.hist)||d.hist.length>50000||d.hist.length!==d.moves)return false;
 const W=LEVELS[d.level].map.reduce((m,r)=>Math.max(m,r.length),0), H=LEVELS[d.level].map.length;
 const walls=new Set(); LEVELS[d.level].map.forEach((r,y)=>{for(let x=0;x<W;x++)if((r[x]||'#')==='#')walls.add(y*W+x)});
 const occupied=(x,y,bs)=>bs.some(b=>b.x===x&&b.y===y);
 let px=d.player.x,py=d.player.y,bs=d.boxes.map(b=>({...b})), pushes=0;
 for(let j=d.hist.length-1;j>=0;j--){const h=d.hist[j];if(!h||!DIRS[h.d]||!(h.pushed===null||Number.isInteger(h.pushed)&&h.pushed>=0&&h.pushed<bs.length))return false;
 const [dx,dy]=DIRS[h.d], oldX=px-dx,oldY=py-dy;
 if(oldX<0||oldY<0||oldX>=W||oldY>=H||walls.has(oldY*W+oldX))return false;
 if(h.pushed!==null){pushes++;const b=bs[h.pushed];if(b.x!==px+dx||b.y!==py+dy)return false;if(occupied(px,py,bs))return false;b.x=px;b.y=py;}
 else if(occupied(px,py,bs))return false;
 px=oldX;py=oldY;
 }
 const rows=LEVELS[d.level].map;let originalPlayer=null,originalBoxes=[];
 rows.forEach((r,y)=>{for(let x=0;x<W;x++){const c=r[x]||'#';if('@+'.includes(c))originalPlayer={x,y};if('$*'.includes(c))originalBoxes.push(x+W*y);}});
 return !!originalPlayer&&px===originalPlayer.x&&py===originalPlayer.y&&pushes===d.pushes&&bs.map(b=>b.x+b.y*W).sort((a,b)=>a-b).join(',')===originalBoxes.sort((a,b)=>a-b).join(',');
}

function readDraft(){try{const d=JSON.parse(localStorage.getItem(DRAFT_KEY));if(!d||d.v!==2||typeof d.digest!=='string')return null;const {digest,...body}=d;return draftDigest(body)===digest?d:null;}catch(e){return null;}}

const row=LEVELS[0].map,W=Math.max(...row.map(r=>r.length));let pl=null,boxes=[];
row.forEach((r,y)=>{for(let x=0;x<W;x++){if('@+'.includes(r[x]||'#'))pl={x,y};if('$*'.includes(r[x]||'#'))boxes.push({x,y});}});
const d={level:0,player:pl,boxes,hist:[],moves:0,pushes:0};
if(!safeHistory(d))throw Error('valid initial board rejected');
if(safeHistory({...d,moves:1}))throw Error('invalid history accepted');
if(draftDigest(d)!==draftDigest(JSON.parse(JSON.stringify(d))))throw Error('digest unstable');
console.log('SAVE_INTEGRITY_PASS');

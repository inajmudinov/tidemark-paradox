import {env} from 'cloudflare:workers';
import {initial,resolve,view,type Game} from '../../../lib/game';
export const dynamic='force-dynamic';
const reply=(x:unknown,s=200)=>Response.json(x,{status:s,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){const u=new URL(req.url),code=(u.searchParams.get('code')||'').toUpperCase(),token=req.headers.get('x-player-token');const row=await env.DB!.prepare('SELECT state,updated FROM rooms WHERE code=?').bind(code).first<{state:string,updated:number}>();if(!row||Date.now()-row.updated>172800000)return reply({error:'Room not found or expired. Create a new crossing.'},404);const g:Game=JSON.parse(row.state),seat=g.players.findIndex(p=>p.token===token);return seat<0?reply({error:'This device has no seat in that room. Join using the room code.'},403):reply(view(g,seat));}
export async function POST(req:Request){
 try{
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return reply({error:'Invalid origin'},403);
 if(Number(req.headers.get('content-length')||0)>4096)return reply({error:'Request too large'},413);
 const body=await req.json() as any;const action=body.action,name=String(body.name||'Voyager').trim().slice(0,24)||'Voyager';
 if(action==='create'){
  const token=crypto.randomUUID();const g=initial([{name,token,score:0}]);
  for(let i=0;i<4;i++){const code=crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();const r=await env.DB!.prepare('INSERT OR IGNORE INTO rooms(code,state,revision,updated) VALUES(?,?,0,?)').bind(code,JSON.stringify(g),Date.now()).run();if(r.meta.changes)return reply({code,token,state:view(g,0)});}
  return reply({error:'Could not allocate a room. Try again.'},503);
 }
 const code=String(body.code||'').toUpperCase();if(!/^[A-F0-9]{8}$/.test(code))return reply({error:'Enter the eight-character room code.'},400);
 for(let attempt=0;attempt<8;attempt++){
  const row=await env.DB!.prepare('SELECT state,revision,updated FROM rooms WHERE code=?').bind(code).first<{state:string,revision:number,updated:number}>();if(!row||Date.now()-row.updated>172800000)return reply({error:'Room not found or expired.'},404);
  let g:Game=JSON.parse(row.state);let seat=g.players.findIndex(p=>p.token===body.token);let token=body.token;
  if(action==='join'&&seat<0){if(g.players.length===2)return reply({error:'This room already has two players.'},409);token=crypto.randomUUID();g.players.push({name,token,score:0});seat=1;}
  else {
   if(seat<0)return reply({error:'Join this room first.'},403);
   if(action==='move'){
    if(g.players.length!==2||g.done)return reply({error:'The crossing is not accepting moves.'},409);
    if(body.round!==g.round)return reply({error:'The round changed. Your board is refreshing.'},409);
    if(g.moves[seat])return reply({error:'Your move is already sealed.'},409);
    if(!Number.isInteger(body.cell)||body.cell<0||body.cell>15||!Number.isInteger(body.dir)||body.dir<0||body.dir>3)return reply({error:'Choose a valid cell and direction.'},400);
    g.moves[seat]={cell:body.cell,dir:body.dir};if(g.moves.every(Boolean))g=resolve(g);
   }else if(action==='rematch'){if(!g.done)return reply({error:'Finish this crossing first.'},409);g.votes[seat]=true;if(g.votes.every(Boolean))g=initial(g.players);}
   else if(action!=='join')return reply({error:'Unknown action'},400);
  }
  const r=await env.DB!.prepare('UPDATE rooms SET state=?,revision=revision+1,updated=? WHERE code=? AND revision=?').bind(JSON.stringify(g),Date.now(),code,row.revision).run();if(r.meta.changes)return reply({code,token,state:view(g,seat)});
 }
 return reply({error:'The room is busy. Please try again.'},409);
 }catch{return reply({error:'Could not reach the crossing. Please retry.'},500);}
}

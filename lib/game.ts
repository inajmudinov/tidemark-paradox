export type Move={cell:number,dir:number};
export type Player={name:string,token:string,score:number};
export type Game={players:Player[],round:number,moves:(Move|null)[],echoes:(number|null)[],history:{round:number,moves:(Move|null)[],events:string[],scores:number[]}[],done:boolean,votes:boolean[]};
export const coord=(n:number)=>'ABCD'[n%4]+(Math.floor(n/4)+1);
export function target(m:Move){const x=m.cell%4,y=Math.floor(m.cell/4);const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][m.dir];return ((y+dy+4)%4)*4+(x+dx+4)%4;}
export function initial(players:Player[]):Game{return {players:players.map(p=>({...p,score:0})),round:1,moves:[null,null],echoes:[null,null],history:[],done:false,votes:[false,false]};}
export function resolve(g:Game){
 const a=g.moves[0]!,b=g.moves[1]!,events:string[]=[];
 const collision=a.cell===b.cell;
 if(collision)events.push('Both anchors collided at '+coord(a.cell)+'. No anchor points or new echoes.');
 else g.players.forEach((p,i)=>{p.score++;events.push(p.name+' anchored at '+coord(g.moves[i]!.cell)+' (+1).');});
 g.echoes.forEach((e,i)=>{if(e===null)return;const j=1-i;if(!collision&&g.moves[j]!.cell===e){g.players[j].score+=3;events.push(g.players[j].name+' intercepted an echo at '+coord(e)+' (+3).');}else{g.players[i].score+=2;events.push(g.players[i].name+' delivered an echo at '+coord(e)+' (+2).');}});
 // The sixth round creates no new echoes, so every echo can be defended.
 g.echoes=collision||g.round===6?[null,null]:[target(a),target(b)];
 g.history.push({round:g.round,moves:[a,b],events,scores:g.players.map(p=>p.score)});
 g.moves=[null,null];if(g.round===6)g.done=true;else g.round++;
 return g;
}
export function view(g:Game,seat:number){return {...g,players:g.players.map(({name,score})=>({name,score})),moves:g.moves.map((m,i)=>i===seat?m:m?{locked:true}:null),seat};}

"use client";
import { guessPoints } from "@/lib/guess-scoring";
import { useEffect, useState } from 'react';
import type { RoomView } from '@/lib/game';
import Drawing from './Drawing';
function LivePoints({ deadline, serverOffset }: { deadline: number; serverOffset: number }) {
  const calculate = () => guessPoints(deadline - Date.now() - serverOffset);
  const [points, setPoints] = useState(calculate);
  useEffect(() => {
    const update = () => setPoints(guessPoints(deadline - Date.now() - serverOffset));
    update();
    // A point elapses every 90 ms; refresh independently of the seconds timer.
    const timer = setInterval(update, 20);
    return () => clearInterval(timer);
  }, [deadline, serverOffset]);
  return <span className="live-guess-points">{points}</span>;
}
function LiveDrawing({initial, remaining, word, live}:{initial:string;remaining:number;word:string|null;live:(value:string)=>Promise<boolean>}) {
  const [initialImage] = useState(initial);
  return <Drawing initialImage={initialImage || undefined} busy={remaining<=0} timeLeft={remaining} reference={`Desenhe: ${word}`} onLive={live} onSubmit={live}/>;
}
export default function PhoneGuess({room,remaining,serverOffset,busy,action,live}:{room:RoomView;remaining:number;serverOffset:number;busy:boolean;action:(name:string,data?:Record<string,unknown>)=>Promise<boolean>;live:(value:string)=>Promise<boolean>}) {
  const [guess,setGuess]=useState('');
  const g=room.guess!;
  const drawer=room.players.find(p=>p.id===g.drawerId)!;
  const mine=room.me===drawer.id, solved=g.solved.includes(room.me), finished=room.status==='finished';
  const ranking=[...room.players].sort((a,b)=>(g.scores[b.id]??0)-(g.scores[a.id]??0));
  if(finished) return <section className="panel"><h2>Placar final · PhoneAdivinha</h2><p>Cada segundo contou!</p><ol className="guess-ranking">{ranking.map(p=><li key={p.id}><strong>{p.name}</strong><b>{g.scores[p.id]??0} pontos</b></li>)}</ol>{room.me===room.hostId ? <button onClick={()=>action('reset')}>Jogar novamente</button>:<p>Aguarde o anfitrião para jogar novamente.</p>}</section>;
  return <section className="phone-guess"><div className="round-bar"><span>PhoneAdivinha · {room.round+1}/{room.totalRounds}</span><b role="timer">{remaining}s</b><span>{g.solved.length}/{room.players.length-1} acertaram</span></div><div className="panel guess-word"><h2>{g.intermission ? `A palavra era: ${g.word}` : mine ? `Desenhe: ${g.word}` : solved ? `Você acertou: ${g.word}` : g.hint}</h2><p>{g.intermission ? 'Próxima rodada em instantes…' : <>{drawer.name} está desenhando · até <LivePoints deadline={room.deadline} serverOffset={serverOffset}/> pontos por acerto</>}</p></div><div className="guess-layout"><div>{mine && !g.intermission ? <LiveDrawing key={`${room.gameId}-${room.round}`} initial={g.drawing} remaining={remaining} word={g.word} live={live}/> : <div className="guess-canvas">{g.drawing ? <img src={g.drawing} alt="Desenho da rodada"/>:<p>Aguardando o primeiro traço…</p>}</div>}</div><section className="panel guess-chat" aria-label="Tentativas"><h3>Tentativas</h3><div className="guess-messages" role="log" aria-live="polite">{[...g.messages].reverse().map(m=><p key={m.id} className={m.correct?'guess-correct':''}><strong>{room.players.find(p=>p.id===m.playerId)?.name}: </strong>{m.text}{m.correct && ` +${m.points}`}</p>)}</div><form onSubmit={async e=>{e.preventDefault();if(await action('guess',{round:room.round,value:guess}))setGuess('');}}><label htmlFor="live-guess">{mine?'Você é o desenhista':solved?'Você já acertou!':'Qual é a palavra?'}</label><input id="live-guess" value={guess} onChange={e=>setGuess(Array.from(e.target.value).slice(0,50).join(''))} disabled={mine||solved||g.intermission||busy} autoComplete="off" placeholder="Digite sua tentativa"/><small>{Array.from(guess).length}/50</small><button disabled={mine||solved||g.intermission||busy||!guess.trim()}>Tentar acertar</button></form><p>Acentos e maiúsculas não fazem diferença. Sem acerto até o fim: 0 pontos.</p></section></div></section>;
}

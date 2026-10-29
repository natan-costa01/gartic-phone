"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Flame, Lightbulb, LoaderCircle, Paintbrush, Share2, } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { enigmaDate, enigmaStreak, ENIGMA_LIMIT, normalizeEnigma, type EnigmaResult } from '@/lib/enigma';
type SavedGame = { id:number; guesses:string[]; day:string };
type Stats = { wins:string[]; played:string[] };
const STATS_KEY = 'phoneart-enigma-stats';
const keyOf = (_mode:string, day:string) => `phoneart-enigma-${day}`;
function readSaved(key:string):SavedGame | null {
  try { const s=JSON.parse(localStorage.getItem(key) || 'null'); return s && Number.isInteger(s.id) && Array.isArray(s.guesses) && s.guesses.length<=6 && s.guesses.every((g:unknown)=>typeof g==='string') ? s : null; } catch { return null; }
}
function readStats():Stats { try { const s=JSON.parse(localStorage.getItem(STATS_KEY)||'{}');return {wins:Array.isArray(s.wins)?s.wins.filter((d:unknown)=>typeof d==='string'):[],played:Array.isArray(s.played)?s.played.filter((d:unknown)=>typeof d==='string'):[]}; } catch {return {wins:[],played:[]};} }
// Reveal only 6% initially, with smaller fragments and a slower progression.
const REVEAL_ORDER = Array.from({length:64}, (_, i) => (i * 37 + 10) % 64);
const REVEAL_COUNTS = [4, 8, 14, 22, 34, 48];
export default function EnigmaGame() {
  const mode = 'daily' as const;
  const [game,setGame]=useState<EnigmaResult|null>(null), [input,setInput]=useState('');
  const [busy,setBusy]=useState(true), [error,setError]=useState(''), [notice,setNotice]=useState('');
  const [stats,setStats]=useState<Stats>({wins:[],played:[]});
  const requestId=useRef(0), inputRef=useRef<HTMLInputElement>(null);
  async function fetchGame(body:Record<string,unknown>) {
    const res=await fetch('/api/enigma',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const result=await res.json();if(!res.ok)throw Error(result.error);return result as EnigmaResult;
  }
  function persist(result:EnigmaResult) {
    try {
      localStorage.setItem(keyOf(result.mode,result.day),JSON.stringify({id:result.id,day:result.day,guesses:result.attempts.map(a=>a.value)}));
      if(result.mode==='daily' && result.finished) {
        const next=readStats();if(!next.played.includes(result.day))next.played.push(result.day);
        if(result.won && !next.wins.includes(result.day))next.wins.push(result.day);
        localStorage.setItem(STATS_KEY,JSON.stringify(next));setStats(next);
      }
    } catch { /* Gameplay remains available when browser storage is disabled. */ }
  }
  async function load(nextMode:'daily', fresh=false) {
    const request=++requestId.current;setBusy(true);setError('');setNotice('');setInput('');
    try {
      let result=await fetchGame({mode:nextMode});
      const saved=!fresh && readSaved(keyOf(nextMode,result.day));
      if(saved)result=await fetchGame({mode:nextMode,id:saved.id,guesses:saved.guesses,day:nextMode==='daily'?result.day:undefined});
      if(request!==requestId.current)return;
      setGame(result);persist(result);setStats(readStats());
    }catch(e){if(request===requestId.current)setError(e instanceof Error?e.message:'Não foi possível carregar.');}
    finally {if(request===requestId.current)setBusy(false);}
  }
  useEffect(()=>{void load('daily');return()=>{requestId.current++;};},[]);
  useEffect(() => {
    if (!game || mode !== 'daily' || busy) return;
    const checkDay = () => { if (enigmaDate() !== game.day) void load('daily'); };
    const timer = setInterval(checkDay, 30_000);
    window.addEventListener('focus', checkDay);
    return () => { clearInterval(timer); window.removeEventListener('focus', checkDay); };
  }, [game?.day, mode, busy]);
  async function submit(e:React.FormEvent) {
    e.preventDefault();if(!game||game.finished||busy||!input.trim())return;
    if(game.attempts.some(a=>normalizeEnigma(a.value)===normalizeEnigma(input))){setError('Você já tentou essa palavra. Tente outra!');return;}
    setBusy(true);setError('');setNotice('');
    try {const result=await fetchGame({mode,id:game.id,day:mode==='daily'?game.day:undefined,guesses:[...game.attempts.map(a=>a.value),input.trim()]});setGame(result);persist(result);setInput('');setTimeout(()=>inputRef.current?.focus(),0);}
    catch(e){setError(e instanceof Error?e.message:'Tente novamente.');}finally{setBusy(false);}
  }
  async function share() {
    if(!game)return;
    const squares=game.attempts.map(a=>a.correct?'🟩':'⬜').join('');
    const text=`PhoneEnigma ${game.day} · ${game.won?game.attempts.length:'X'}/6\n${squares}\n${game.score} pontos\n${location.origin}/enigma`;
    try {await navigator.clipboard.writeText(text);setNotice('Resultado copiado! Cole para compartilhar.');}
    catch {try {if(navigator.share)await navigator.share({text});else setNotice(text);}catch{setNotice(text);}}
  }
  const revealed=game?.finished?64:REVEAL_COUNTS[game?.attempts.length??0];
  const visible=new Set(REVEAL_ORDER.slice(0,revealed));
  return <><header className="site-header"><Link className="brand enigma-brand" href="/"><span className="brand-icon"><Paintbrush size={23}/></span>Phone<span>Art</span></Link><div className="header-right"><ThemeToggle/><Link className="enigma-back" href="/"><ArrowLeft size={16}/> Multiplayer</Link></div></header><main className="enigma-main"><div className="enigma-intro"><span className="eyebrow">Seu intervalo criativo</span><h1>Phone<span>Enigma</span></h1><p>Um desenho escondido. Seis chances de descobrir.</p></div><div className="enigma-topbar"><span className="enigma-daily-label"><CalendarDays size={16}/> Apenas um desafio por dia</span><span className="enigma-streak"><Flame size={18}/>{game?enigmaStreak(stats.wins,game.day):0} {game && enigmaStreak(stats.wins,game.day)===1?'dia seguido':'dias seguidos'}</span></div>{!game ? <section className="panel enigma-loading">{busy?<><LoaderCircle className="spin"/>Preparando seu desenho…</>:<button onClick={()=>load(mode,true)}>Tentar novamente</button>}</section>:<div className="enigma-layout"><section className="panel enigma-board"><div className="enigma-board-heading"><span><Lightbulb size={16}/>{game.finished || game.attempts.length>=3 ? game.category : "Categoria na 4ª pista"}</span><span>{game.finished?'Desenho revelado':`Pista ${game.attempts.length+1} de 6`}</span></div><div className="enigma-picture" role="img" aria-label={game.finished?`Desenho de ${game.answer}`:'Desenho parcialmente revelado; descubra o objeto'}><div className="enigma-sprite" style={{backgroundPosition:`${(game.id%4)*100/3}% ${Math.floor(game.id/4)*50}%`}}/><div className="enigma-mask" aria-hidden="true">{Array.from({length:64},(_,i)=><span key={i} className={visible.has(i)?'revealed':''}/>)}</div></div><p className="enigma-caption">{game.finished?'Agora você pode ver a imagem completa.':'Cada tentativa errada revela mais um pedaço.'}</p></section><section className="panel enigma-play"><div className="enigma-mode-label">{`Desafio de ${game.day.split('-').reverse().join('/')}`}</div><h2>{game.finished?game.won?'Você descobriu!':'Faltou um pouquinho.':'O que está no desenho?'}</h2>{game.finished?<div className="enigma-result" role="status"><p>A resposta é <strong>{game.answer}</strong>.</p><div className="enigma-score">{game.score}<span>pontos</span></div><p>{game.won?`Acertou em ${game.attempts.length} ${game.attempts.length===1?'tentativa':'tentativas'}.`:'Seis tentativas, uma nova ideia para a próxima.'}</p><button className="primary wide" onClick={share}><Share2 size={17}/>Compartilhar resultado</button><small>Por hoje é só! Um novo desafio chega à meia-noite, no horário de Brasília.</small></div>:<form onSubmit={submit}><label htmlFor="enigma-answer">Sua resposta</label><div className="enigma-input"><input ref={inputRef} id="enigma-answer" placeholder="Ex.: chave de fenda" autoComplete="off" maxLength={50} value={input} disabled={busy} onChange={e=>setInput(e.target.value)}/><button className="primary" disabled={busy||!normalizeEnigma(input)} aria-label="Enviar tentativa">{busy?<LoaderCircle className="spin" size={18}/>:<ArrowRight size={20}/>}</button></div><small>Acentos e maiúsculas não fazem diferença.</small><p className="enigma-chances">{6-game.attempts.length} {game.attempts.length===5?'chance restante':'chances restantes'} · até {(6-game.attempts.length)*100} pontos</p></form>}<ol className="enigma-attempts" aria-label="Suas tentativas">{Array.from({length:ENIGMA_LIMIT},(_,i)=>{const a=game.attempts[i];return <li key={i} className={a?.correct?'correct':a?'incorrect':''}><span className="enigma-attempt-number">{i+1}</span><span>{a?.value??'—'}</span>{a&&(a.correct?<Check size={17}/>:<span className="enigma-attempt-label">Mais uma pista</span>)}</li>;})}</ol></section></div>}{error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="enigma-notice" role="status">{notice}</p>}<section className="enigma-rules"><h2>Como funciona</h2><div><p><b>01</b> Observe os traços. A categoria aparece na quarta pista.</p><p><b>02</b> Tente uma palavra. Errou? Mais desenho aparece.</p><p><b>03</b> Acerte em até seis chances. Menos pistas, mais pontos.</p></div><small>O desafio diário é igual para todo mundo. Progresso e sequência ficam salvos neste navegador, sem cadastro.</small></section></main></>;
}

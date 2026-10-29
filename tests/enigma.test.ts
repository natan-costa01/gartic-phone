import {test} from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEnigma, dailyEnigmaId } from '../lib/enigma-server';
import { enigmaDate, enigmaStreak } from '../lib/enigma';
const now=new Date('2026-10-29T15:00:00Z');
test('daily challenge is identical for everyone and uses the Brasilia calendar',()=>{
 const a=evaluateEnigma({mode:'daily'},now), b=evaluateEnigma({mode:'daily'},now);
 assert.deepEqual(a,b);assert.equal(a.answer,null);
 assert.equal(enigmaDate(new Date('2026-10-30T02:59:59Z')),'2026-10-29');
 assert.equal(enigmaDate(new Date('2026-10-30T03:00:00Z')),'2026-10-30');
 assert.equal(new Set(Array.from({length:12},(_,i)=>dailyEnigmaId(`2026-10-${String(i+1).padStart(2,'0')}`))).size,12);
 assert.throws(()=>evaluateEnigma({mode:'daily',day:'2000-01-01'},now));
});
function puzzle(id:number, guesses:string[]) {
 for(let day=1;day<=12;day++) {
  const date=new Date(`2026-10-${String(day).padStart(2,'0')}T15:00:00Z`);
  if(dailyEnigmaId(enigmaDate(date))===id)return evaluateEnigma({mode:'daily',guesses},date);
 }
 throw Error('Puzzle not found');
}
test('six guesses reveal the answer only at win or loss, and award fewer points with more clues',()=>{
 assert.equal(puzzle(0,['gato']).score,600);
 const result=puzzle(1,['banana','MACA']);
 assert.equal(result.answer,'maçã');assert.equal(result.score,500);assert.equal(result.won,true);
 const incomplete=puzzle(2,['martelo']);assert.equal(incomplete.answer,null);assert.equal(incomplete.finished,false);
 const loss=puzzle(2,Array(6).fill('martelo'));assert.equal(loss.answer,'chave de fenda');assert.equal(loss.score,0);assert.equal(loss.finished,true);
 assert.equal(puzzle(3,['PC','wrong']).attempts.length,1);
});
test('free mode is rejected and clients cannot choose future daily drawings',()=>{
 assert.throws(()=>evaluateEnigma({mode:'free',id:0},now));
 assert.throws(()=>evaluateEnigma({mode:'daily',day:'2026-10-30'},now));
 assert.equal(evaluateEnigma({mode:'daily',id:999},now).id,dailyEnigmaId(enigmaDate(now)));
 for(const value of [{mode:'bad'},{mode:'daily',guesses:['']},{mode:'daily',guesses:['x'.repeat(51)]},{mode:'daily',guesses:Array(7).fill('x')}])assert.throws(()=>evaluateEnigma(value,now));
});
test('daily streak continues across midnight and resets when a day is missed',()=>{
 assert.equal(enigmaStreak(['2026-10-27','2026-10-28'],'2026-10-29'),2);
 assert.equal(enigmaStreak(['2026-10-27','2026-10-28','2026-10-29'],'2026-10-29'),3);
 assert.equal(enigmaStreak(['2026-10-27'],'2026-10-29'),0);
 assert.equal(enigmaStreak(['2026-12-31','2027-01-01'],'2027-01-02'),2);
});

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
test('six guesses reveal the answer only at win or loss, and award fewer points with more clues',()=>{
 assert.equal(evaluateEnigma({mode:'free',id:0,guesses:['gato']},now).score,600);
 const result=evaluateEnigma({mode:'free',id:1,guesses:['banana','MACA']},now);
 assert.equal(result.answer,'maçã');assert.equal(result.score,500);assert.equal(result.won,true);
 const incomplete=evaluateEnigma({mode:'free',id:2,guesses:['martelo']},now);assert.equal(incomplete.answer,null);assert.equal(incomplete.finished,false);
 const loss=evaluateEnigma({mode:'free',id:2,guesses:Array(6).fill('martelo')},now);assert.equal(loss.answer,'chave de fenda');assert.equal(loss.score,0);assert.equal(loss.finished,true);
 assert.equal(evaluateEnigma({mode:'free',id:3,guesses:['PC','wrong']},now).attempts.length,1);
});
test('invalid guesses and ids are rejected, and free mode skips the previous drawing',()=>{
 for(const value of [{mode:'bad'},{mode:'free',id:-1},{mode:'free',id:99},{mode:'free',id:0,guesses:['']},{mode:'free',id:0,guesses:['x'.repeat(51)]},{mode:'free',id:0,guesses:Array(7).fill('x')}])assert.throws(()=>evaluateEnigma(value,now));
 for(let i=0;i<30;i++)assert.notEqual(evaluateEnigma({mode:'free',exclude:5},now).id,5);
});
test('daily streak continues across midnight and resets when a day is missed',()=>{
 assert.equal(enigmaStreak(['2026-10-27','2026-10-28'],'2026-10-29'),2);
 assert.equal(enigmaStreak(['2026-10-27','2026-10-28','2026-10-29'],'2026-10-29'),3);
 assert.equal(enigmaStreak(['2026-10-27'],'2026-10-29'),0);
 assert.equal(enigmaStreak(['2026-12-31','2027-01-01'],'2027-01-02'),2);
});

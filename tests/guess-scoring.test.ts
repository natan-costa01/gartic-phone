import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guessPoints} from '../lib/guess-scoring';
import {DRAWING_IDEAS} from '../lib/drawing-ideas';
import {createRoom,join,act,tick,view} from '../lib/game';
test('1,000 point scale decreases with time and is zero when time runs out',()=>{
 assert.equal(guessPoints(90000),1000);
 assert.equal(guessPoints(45000),500);
 assert.equal(guessPoints(9000),100);
 assert.equal(guessPoints(1),1);
 assert.equal(guessPoints(0),0);
 assert.equal(guessPoints(-1000),0);
 assert.equal(guessPoints(100000),1000);
});
test('automatic drawing ideas contain requested examples and names, fit limits and do not repeat in a game',()=>{
 for(const idea of ['gato','maçã','chave de fenda','computador','Evandro','Oswaldo','Allan','Feriani','Hellen Cearense']) assert.ok(DRAWING_IDEAS.some(w=>w===idea));
 assert.equal(new Set(DRAWING_IDEAS).size,DRAWING_IDEAS.length);
 assert.ok(DRAWING_IDEAS.every(w=>Array.from(w).length<=50));
 const {room,token}=createRoom('A');for(let i=1;i<20;i++)join(room,`P${i}`);
 act(room,token,'start',{mode:'phoneguess',seconds:90,ending:'auto'});
 const words=new Set<string>();
 for(let i=0;i<20;i++) {assert.ok(!words.has(room.guess!.word));words.add(room.guess!.word);tick(room,room.deadline);tick(room,room.deadline);}
 assert.equal(words.size,20);
 assert.equal(room.status,'finished');
 assert.equal('usedWords' in view(room,token).guess!,false);
});

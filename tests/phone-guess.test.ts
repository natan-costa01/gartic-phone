import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRoom,join,act,view,tick} from '../lib/game';
const image='data:image/webp;base64,AAAA';
function setup(){const {room,token}=createRoom('Ana',100000);const guest=join(room,'Bia'), third=join(room,'Caio');act(room,token,'start',{mode:'phoneguess',seconds:90,ending:'auto'},100000);return {room,token,guest,third};}
test('PhoneAdivinha keeps answers private and only the current drawer can publish a shared canvas',()=>{
 const {room,token,guest}=setup();assert.equal(room.totalRounds,3);assert.equal(room.deadline,190000);
 assert.equal(view(room,guest).guess!.word,null);assert.equal(view(room,token).guess!.word,room.guess!.word);
 assert.throws(()=>act(room,guest,'liveDrawing',{round:0,value:image},101000));
 act(room,token,'liveDrawing',{round:0,value:image},101000);assert.equal(view(room,guest).guess!.drawing,image);
 assert.throws(()=>act(room,token,'guess',{round:0,value:room.guess!.word},102000));
 assert.throws(()=>act(room,guest,'submit',{round:0,value:image},102000));
});
test('correct guesses score by server time, ignore accents, prevent duplicate points and end early when everyone solves',()=>{
 const {room,token,guest,third}=setup();room.guess!.word='Violão';
 act(room,guest,'guess',{round:0,value:'VIOLAO'},110000);assert.equal(room.guess!.scores[room.players[1].id],889);
 assert.throws(()=>act(room,guest,'guess',{round:0,value:'violão'},111000));
 assert.equal(view(room,third).guess!.word,null);assert.equal(view(room,third).guess!.messages[0].text,'Acertou!');
 act(room,third,'guess',{round:0,value:'violão'},150000);assert.equal(room.guess!.scores[room.players[2].id],445);
 assert.equal(room.guess!.intermission,true);assert.equal(view(room,third).guess!.word,'Violão');
 tick(room,158000);assert.equal(room.round,1);assert.equal(view(room,guest).guess!.drawerId,room.players[1].id);assert.equal(view(room,token).guess!.word,null);
 assert.equal(room.guess!.scores[room.players[1].id],889);
 assert.throws(()=>act(room,token,'liveDrawing',{round:0,value:image},159000));
});
test('timeouts reveal the word, rotate all drawers, finish with scores and reset cleanly',()=>{
 const {room,token}=setup();
 for(let n=0;n<3;n++){tick(room,room.deadline);assert.equal(room.guess!.intermission,true);tick(room,room.deadline);}
 assert.equal(room.status,'finished');act(room,token,'reset',{});assert.equal(room.guess,undefined);assert.equal(room.status,'lobby');
});
test('guesses validate length and throttle attempts; PhoneAdivinha always lasts 90 seconds',()=>{
 const {room,guest}=setup();assert.throws(()=>act(room,guest,'guess',{round:0,value:'a'.repeat(51)},101000));
 act(room,guest,'guess',{round:0,value:'wrong'},101000);assert.throws(()=>act(room,guest,'guess',{round:0,value:'wrong'},101001));
 const other=createRoom('D');join(other.room,'E');assert.throws(()=>act(other.room,other.token,'start',{mode:'phoneguess',seconds:30,ending:'auto'}));
});

test('unanswered or incorrect guesses receive zero, including at the deadline',()=>{
 const {room,guest,third}=setup();
 act(room,guest,'guess',{round:0,value:'not the answer'},110000);
 assert.equal(room.guess!.scores[room.players[1].id],0);
 assert.equal(room.guess!.messages[0].points,0);
 const answer=room.guess!.word;
 tick(room,190000);
 assert.throws(()=>act(room,third,'guess',{round:0,value:answer},190000));
 assert.equal(room.guess!.scores[room.players[2].id],0);
});

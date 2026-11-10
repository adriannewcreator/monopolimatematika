'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const G=require('./game-engine.js');
// Pengujian integrasi event dan markup dengan DOM tiruan, bukan uji visual browser.
function boot(raw=null,random=0){
  const elements=new Map(),handlers={},timers=[];
  let clock=Date.now();
  class Clock extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
  const el=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',hidden:true,style:{},dataset:{},classList:{toggle(){}},open:false,showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);};
  const storage=new Map(raw===null?[]:[[G.KEY,raw]]);
  const document={getElementById:el,addEventListener:(type,fn)=>handlers[type]=fn,createElement:()=>({click(){}}),documentElement:{requestFullscreen:()=>Promise.resolve()}};
  const math=Object.create(Math);math.random=()=>random;
  const context={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},setInterval:fn=>timers.push(fn),setTimeout:()=>{},Date:Clock,Math:math,console,Blob,URL,confirm:()=>true,alert:()=>{},addEventListener(){}};
  context.window=context;context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('game-engine.js','utf8'),context);
  vm.runInContext(fs.readFileSync('game-ui.js','utf8'),context);
  return {el,storage,handlers,timers,advance:ms=>{clock+=ms;timers.forEach(fn=>fn());},state:()=>JSON.parse(storage.get(G.KEY)),click:(action,extra={})=>handlers.click({target:{closest:()=>({dataset:{action,...extra},disabled:false})}})};
}
test('antarmuka awal: 30 petak, 5 tim, siap lempar, simpan otomatis',()=>{
  const ui=boot();assert.equal((ui.el('board').innerHTML.match(/class="tile /g)||[]).length,30);assert.equal((ui.el('teams').innerHTML.match(/class="team /g)||[]).length,5);assert.match(ui.el('action').innerHTML,/LEMPAR DADU/);assert.equal(ui.state().phase,'roll');
});
test('klik, soal tersembunyi, input tersimpan, submit dan lanjut terhubung',()=>{
  const ui=boot();ui.click('roll');assert.equal(ui.state().phase,'choice');assert.doesNotMatch(ui.el('action').innerHTML,/class="equations"/);
  ui.advance(5000);
  ui.click('challenge');assert.equal(ui.state().phase,'question');assert.match(ui.el('action').innerHTML,/class="equations"/);
  const q=G.bank[ui.state().pending.question-1];q.values.forEach((value,i)=>ui.handlers.input({target:{dataset:{answer:String(i)},value:String(value)}}));
  assert.deepEqual(ui.state().pending.answers,q.values.map(String));
  ui.handlers.submit({preventDefault(){},target:{id:'answerForm',querySelectorAll:()=>q.values.map(v=>({value:String(v)}))}});
  assert.equal(ui.state().phase,'result');assert.equal(ui.state().teams[0].correct,1);assert.match(ui.el('action').innerHTML,/Transaksi sudah diselesaikan/);
  ui.click('acknowledge');assert.equal(ui.state().turn,0);ui.click('next');assert.equal(ui.state().turn,1);
});
test('UI jeda dan refresh mempertahankan input dan fase soal',()=>{
  const ui=boot();ui.click('roll');ui.advance(5000);ui.click('challenge');ui.handlers.input({target:{dataset:{answer:'0'},value:'7'}});ui.click('pause');
  const second=boot(ui.storage.get(G.KEY));assert.equal(second.state().paused,true);assert.match(second.el('action').innerHTML,/TIME OUT/);second.click('pause');assert.match(second.el('action').innerHTML,/value="7"/);assert(second.state().pending.deadline>Date.now());
});
test('dialog guru, panduan, kartu, bank dan rekap dapat dirender',()=>{
  const ui=boot();for(const action of ['teacher','rules','cards','bank','report']){ui.click(action);assert.equal(ui.el('dialog').open,true);assert(ui.el('dialogContent').innerHTML.length>100);ui.click('close-dialog');assert.equal(ui.el('dialog').open,false);}assert.equal(ui.state().phase,'roll');
});
test('daftar kartu menampilkan 25 judul, kategori dan nominal; kartu terakhir dapat diterapkan',()=>{
  const ui=boot();ui.click('cards');const html=ui.el('dialogContent').innerHTML;
  assert.match(html,/25 kartu Kesempatan/);assert.equal((html.match(/class="card-entry"/g)||[]).length,25);assert.match(html,/25\. TERTIPU INVESTASI BODONG DI CARINGIN/);assert.match(html,/−Rp200\.000/);assert.match(html,/\+Rp250\.000/);
  const s=G.initial();s.phase='event';s.pending={card:24};const last=boot(JSON.stringify(s));assert.match(last.el('action').innerHTML,/KARTU 25\/25/);assert.match(last.el('action').innerHTML,/TERTIPU INVESTASI BODONG DI CARINGIN/);last.click('event');assert.equal(last.state().teams[0].cash,1300);
});
test('simpanan rusak tidak ditimpa diam-diam',()=>{
  const ui=boot('{rusak');assert.equal(ui.storage.get(G.KEY),'{rusak');assert.equal(ui.el('storageWarning').hidden,false);ui.click('reset');assert.equal(ui.state().phase,'roll');
});
test('UI pulih setelah soal kedaluwarsa saat halaman tertutup',()=>{
  const ui=boot();ui.click('roll');ui.advance(5000);ui.click('challenge');const s=ui.state();s.pending.deadline=Date.now()-5000;
  const second=boot(JSON.stringify(s));assert.equal(second.state().phase,'result');assert.equal(second.state().records[0].timeout,true);assert.match(second.el('action').innerHTML,/Waktu habis/);
});
test('dadu berputar dahulu, hasil muncul, bidak melompat enam langkah, aksi baru terbuka',()=>{
  const ui=boot(null,.99);ui.click('roll');const stored=ui.state();
  assert.equal(stored.lastRoll,6);assert.match(ui.el('action').innerHTML,/is-rolling/);assert.match(ui.el('board').innerHTML,/data-team="0"/);assert.match(ui.el('board').innerHTML,/<svg viewBox="0 0 24 34"/);
  ui.click('roll');ui.click('challenge');ui.click('skip');assert.equal(ui.state().teams[0].skips,10);assert.equal(ui.state().teams[0].history.length,0);assert.equal(ui.state().lastRoll,6);
  ui.advance(1150);assert.doesNotMatch(ui.el('action').innerHTML,/is-rolling/);assert.match(ui.el('action').innerHTML,/Dapat 6 langkah/);
  ui.advance(400);assert.match(ui.el('action').innerHTML,/Langkah 1 dari 6/);assert.match(ui.el('board').innerHTML,/pawn-hop/);
  for(let i=2;i<=6;i++){ui.advance(480);assert.match(ui.el('action').innerHTML,new RegExp('Langkah '+i+' dari 6'));}
  ui.advance(480);assert.doesNotMatch(ui.el('action').innerHTML,/ANIMASI BERJALAN/);assert.match(ui.el('action').innerHTML,/Kerjakan soal/);assert.equal(ui.state().teams[0].pos,6);assert.equal(ui.state().logs.length,1);
});
test('animasi dapat dijeda dan dilanjutkan tanpa kehilangan langkah',()=>{
  const ui=boot(null,.99);ui.click('roll');ui.advance(1550);ui.click('pause');ui.advance(20000);assert.match(ui.el('action').innerHTML,/Animasi dijeda/);
  ui.click('pause');assert.match(ui.el('action').innerHTML,/Langkah 1 dari 6/);ui.advance(480);assert.match(ui.el('action').innerHTML,/Langkah 2 dari 6/);
});
test('refresh saat animasi memulihkan hasil yang sama tanpa mengundi atau memberi bonus ulang',()=>{
  const s=G.initial();s.teams[0].pos=29;const ui=boot(JSON.stringify(s),0);ui.click('roll');assert.equal(ui.state().teams[0].cash,1600);assert.equal(ui.state().teams[0].pos,0);
  const refreshed=boot(ui.storage.get(G.KEY));assert.equal(refreshed.state().lastRoll,1);assert.equal(refreshed.state().teams[0].cash,1600);assert.equal(refreshed.state().teams[0].pos,0);assert.equal(refreshed.state().phase,'end');assert.doesNotMatch(refreshed.el('action').innerHTML,/is-rolling/);
});
test('bundel HTML mandiri memuat kode valid tanpa sumber jaringan',()=>{
  const html=fs.readFileSync('Monopoli_Matematika_Bogor_30_Petak_V6.html','utf8');
  assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=|@import|https?:\/\//i);
  const script=html.match(/<script>([\s\S]*?)<\/script>/);assert(script);assert.doesNotThrow(()=>new vm.Script(script[1]));assert.match(html,/<style>/);
});
test('properti kosong memisahkan beli normal dan skip tidak membeli',()=>{
  const s=G.initial();s.phase='choice';s.pending={kind:'buy',district:0};
  const ui=boot(JSON.stringify(s));assert.match(ui.el('action').innerHTML,/Beli normal \(5\/5\)/);assert.match(ui.el('action').innerHTML,/Skip · tidak membeli/);
  ui.click('skip');assert.equal(ui.state().teams[0].cash,1500);assert.equal(ui.state().teams[0].skips,9);assert.equal(ui.state().owners[0],undefined);
  const normal=boot(JSON.stringify(s));normal.click('pay-normal');assert.equal(normal.state().teams[0].cash,1320);assert.equal(normal.state().teams[0].skips,10);assert.equal(normal.state().owners[0],0);
});
test('properti lawan hanya menawarkan soal dan sewa normal',()=>{
  const s=G.initial();s.phase='choice';s.pending={kind:'rent',district:0,owner:1};s.owners[0]=1;s.teams[1].owned=[0];
  const ui=boot(JSON.stringify(s));assert.match(ui.el('action').innerHTML,/Sewa normal · 1 skip/);assert.doesNotMatch(ui.el('action').innerHTML,/data-action="skip"/);assert.doesNotMatch(ui.el('action').innerHTML,/150%/);
  ui.click('pay-normal');assert.equal(ui.state().teams[0].cash,1446);assert.equal(ui.state().teams[1].cash,1554);assert.equal(ui.state().teams[0].skips,9);
});
test('UI skip habis tetap mengizinkan beli normal dari jatah tersendiri',()=>{
  const s=G.initial();s.phase='choice';s.pending={kind:'buy',district:0};s.teams[0].skips=0;
  const ui=boot(JSON.stringify(s));assert.match(ui.el('action').innerHTML,/Wajib membeli/);assert.doesNotMatch(ui.el('action').innerHTML,/data-action="pay-normal" disabled/);
  ui.click('pay-normal');assert.equal(ui.state().teams[0].normalBuys,4);assert.equal(ui.state().teams[0].skips,0);assert.equal(ui.state().owners[0],0);assert.match(ui.el('teams').innerHTML,/Beli normal 4\/5/);
});
test('UI sewa normal memakai skip dan rekap menampilkan kedua jatah',()=>{
  const s=G.initial();s.phase='choice';s.pending={kind:'rent',district:0,owner:1};s.owners[0]=1;s.teams[1].owned=[0];s.teams[0].skips=0;
  const ui=boot(JSON.stringify(s));assert.match(ui.el('action').innerHTML,/data-action="pay-normal" disabled/);assert.match(ui.el('action').innerHTML,/125% sewa/);ui.click('pay-normal');assert.equal(ui.state().phase,'choice');
  ui.click('report');assert.match(ui.el('dialogContent').innerHTML,/Beli normal tersisa/);
});

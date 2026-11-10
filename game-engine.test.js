'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const G=require('./game-engine.js');
const choice=(kind='buy',district=0)=>{const s=G.initial();s.phase='choice';s.pending={kind,district,owner:kind==='rent'?1:undefined};if(kind==='rent'){s.owners[district]=1;s.teams[1].owned=[district];}return s;};
const det=m=>m.length===2?m[0][0]*m[1][1]-m[0][1]*m[1][0]:m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
test('papan, modal, harga dan kartu sesuai aturan',()=>{
  const s=G.initial();assert.equal(s.teams.length,5);assert(s.teams.every(t=>t.cash===1500&&t.skips===10&&t.normalBuys===5));
  assert.equal(G.tiles.length,30);assert.equal(G.tiles.filter(t=>t.type==='district').length,25);assert.equal(G.tiles.filter(t=>t.type==='chance').length,4);assert.equal(G.cards.length,25);
  for(let i=0;i<25;i++){assert.equal(G.price(i),180+Math.floor(i/5)*40+(i%5)*20);assert.equal(G.rent(i),Math.round(G.price(i)*.3));}
});
test('80 soal unik, 40:40, solusi benar dan tunggal',()=>{
  assert.equal(G.bank.length,80);assert.equal(G.bank.filter(q=>q.type==='SPLDV').length,40);
  assert.equal(new Set(G.bank.map(q=>q.equations.join('|'))).size,80);
  G.bank.forEach(q=>{assert.notEqual(det(q.matrix),0);q.matrix.forEach((row,i)=>assert.equal(row.reduce((v,c,j)=>v+c*q.values[j],0),q.rhs[i]));});
});
test('lempar dadu, bonus START, giliran hanya berganti lewat Lanjut',()=>{
  const s=G.initial();s.teams[0].pos=29;G.roll(s,()=>0);assert.equal(s.teams[0].cash,1600);assert.equal(s.teams[0].pos,0);assert.equal(s.turn,0);assert.equal(s.phase,'end');
  assert.equal(G.roll(s),false);G.next(s);assert.equal(s.turn,1);assert.equal(s.phase,'roll');
});
test('skip tidak membeli, tidak membayar, dan memakai satu jatah',()=>{
  const s=choice();G.skip(s);assert.equal(s.teams[0].cash,1500);assert.equal(s.teams[0].skips,9);assert.equal(s.owners[0],undefined);assert.deepEqual(s.teams[0].owned,[]);assert.equal(s.phase,'end');assert.equal(G.skip(s),false);
});
test('sewa tidak dapat dilewati; bayar normal memakai satu skip',()=>{
  const s=choice('rent');assert.equal(G.skip(s),false);G.payNormal(s);assert.equal(s.teams[0].skips,9);assert.equal(s.teams[0].normalBuys,5);assert.equal(s.teams[0].cash,1446);assert.equal(s.teams[1].cash,1554);assert.equal(G.payNormal(s),false);
});
test('beli normal tidak mengurangi skip atau menambah jumlah soal',()=>{
  const s=choice();G.payNormal(s);assert.equal(s.teams[0].cash,1320);assert.equal(s.owners[0],0);assert.equal(s.teams[0].skips,10);assert.equal(s.teams[0].normalBuys,4);assert.equal(s.records.length,0);
});
test('kedua jatah habis wajib memilih soal; soal tersembunyi sebelum memilih',()=>{
  const s=choice();s.teams[0].skips=0;s.teams[0].normalBuys=0;assert.equal(G.skip(s),false);assert.equal(G.payNormal(s),false);assert.equal(s.pending.question,undefined);assert.equal(s.teams[0].history.length,0);G.challenge(s,1000,()=>0);assert.equal(s.phase,'question');assert.equal(s.pending.deadline,181000);
});
for(const kind of ['buy','rent'])for(const correct of [true,false])test(`${kind}: pengali ${correct?'benar':'salah'}, sekali kirim, transaksi otomatis`,()=>{
  const s=choice(kind);G.challenge(s,1000,()=>0);const q=G.bank[s.pending.question-1];
  const answers=correct?q.values:q.values.map(x=>x+100);G.grade(s,answers,1100);
  const base=kind==='buy'?180:54,amount=Math.round(base*(correct?.5:1.25));
  assert.equal(s.teams[0].cash,1500-amount);assert.equal(s.teams[0].correct,correct?1:0);assert.equal(s.teams[0].wrong,correct?0:1);assert.equal(s.records.length,1);assert.equal(s.phase,'result');
  assert.equal(G.grade(s,q.values,1200),false);assert.equal(G.skip(s),false);assert.equal(G.next(s),false);G.acknowledge(s);assert.equal(s.phase,'end');
});
test('jawaban kosong ditolak, waktu habis dihitung salah termasuk kirim terlambat',()=>{
  const s=choice();G.challenge(s,1000,()=>0);assert.equal(G.grade(s,['',''],1100),false);assert.equal(s.records.length,0);
  G.grade(s,G.bank[s.pending.question-1].values,181000);assert.equal(s.records[0].timeout,true);assert.equal(s.teams[0].wrong,1);assert.equal(s.teams[0].cash,1275);
});
test('sewa waktu habis membayar 125% dan tidak memakai skip',()=>{
  const s=choice('rent');G.challenge(s,1000,()=>0);G.tick(s,181000);assert.equal(s.teams[0].cash,1432);assert.equal(s.teams[1].cash,1568);assert.equal(s.teams[0].skips,10);assert.equal(s.records[0].timeout,true);
});
test('refresh memulihkan soal, input dan waktu; expiry diselesaikan sekali',()=>{
  const s=choice();const now=Date.now();G.challenge(s,now-60000,()=>0);s.pending.answers=['3','4'];
  const restored=G.restore(JSON.stringify(s));assert.equal(restored.pending.question,s.pending.question);assert.deepEqual(restored.pending.answers,['3','4']);assert(G.remaining(restored)<=120000);assert(G.remaining(restored)>119000);
  restored.pending.deadline=Date.now()-1;const expired=G.restore(JSON.stringify(restored));assert.equal(expired.phase,'result');assert.equal(expired.records[0].timeout,true);assert.equal(G.tick(expired),false);
});
test('jeda dan refresh saat jeda mempertahankan sisa waktu',()=>{
  const s=choice();G.challenge(s,1000,()=>0);G.pause(s,31000);assert.equal(s.paused,true);assert.equal(G.remaining(s,999999),150000);
  const restored=G.restore(JSON.stringify(s));assert.equal(restored.paused,true);assert.equal(G.remaining(restored),150000);assert.equal(G.grade(restored,[1,1]),false);
  G.pause(restored,1000000);assert.equal(restored.pending.deadline,1150000);assert.equal(G.tick(restored,1149999),false);assert.equal(G.tick(restored,1150000),true);
});
test('160 soal per tim: unik per siklus, 50:50, minimal 7 soal pemisah',()=>{
  for(const teamIndex of [0,1]){
    const s=G.initial();s.turn=teamIndex;
    for(let i=0;i<160;i++){
      s.phase='choice';s.pending={kind:'buy',district:0};G.challenge(s,1000,()=>.371);
      const id=s.pending.question,history=s.teams[teamIndex].history,prior=history.slice(0,-1).lastIndexOf(id);
      if(prior>=0)assert(history.length-2-prior>=7);
    }
    const h=s.teams[teamIndex].history;assert.equal(new Set(h.slice(0,80)).size,80);assert.equal(new Set(h.slice(80)).size,80);assert.equal(h.slice(0,80).filter(id=>id<=40).length,40);
  }
});
test('tim berbeda boleh mendapat soal sama',()=>{
  const a=choice(),b=choice();b.turn=1;G.challenge(a,1000,()=>0);G.challenge(b,1000,()=>0);assert.equal(a.pending.question,b.pending.question);
});
for(const cash of [54,20])test(`sewa saldo ${cash}K: langsung kalah, sisa ke pemilik, properti dilepas`,()=>{
  const s=choice('rent');s.teams[0].cash=cash;s.teams[0].owned=[2];s.owners[2]=0;G.payNormal(s);
  assert.equal(s.teams[0].cash,0);assert.equal(s.teams[0].out,true);assert.equal(s.teams[1].cash,1500+cash);assert.equal(s.owners[2],undefined);assert.equal(s.phase,'end');G.next(s);assert.equal(s.turn,1);
});
test('pembelian yang menghabiskan saldo tidak memberi properti kepada tim kalah',()=>{
  const s=choice();s.teams[0].cash=180;G.payNormal(s);assert.equal(s.teams[0].out,true);assert.equal(s.owners[0],undefined);
});
test('kartu minus dan plus diterapkan sekali',()=>{
  const s=G.initial();s.phase='event';s.pending={card:0};G.applyEvent(s);assert.equal(s.teams[0].cash,1700);assert.equal(G.applyEvent(s),false);
  s.phase='event';s.pending={card:1};s.teams[0].cash=50;G.applyEvent(s);assert(s.teams[0].out);
});
test('25 kecamatan mengikuti daftar dan urutan pengguna tanpa duplikasi',()=>{
  const expected=['Cileungsi','Cibinong','Jonggol','Cariu','Gunung Putri','Cisarua','Citeureup','Sukaraja','Babakan Madang','Sukamakmur','Klapanunggal','Tanjungsari','Ciawi','Megamendung','Caringin','Cibungbulang','Ciampea','Dramaga','Ciomas','Parung','Gunung Sindur','Bojonggede','Kemang','Rumpin','Parung Panjang'];
  assert.deepEqual(G.districts,expected);assert.deepEqual(G.tiles.filter(t=>t.type==='district').map(t=>t.name),expected);assert.equal(new Set(G.districts).size,25);
});
test('25 kartu: nominal, nomor, kategori, undian, pemulihan, dan transaksi benar',()=>{
  const values=[200,-150,-200,-100,-100,-100,-150,-100,50,100,-100,-150,-50,200,50,150,-100,-50,-50,200,200,150,-100,250,-200];
  assert.deepEqual(G.cards.map(c=>c.value),values);assert.equal(new Set(G.cards.map(c=>c.title)).size,25);
  G.cards.forEach((card,i)=>{
    assert.equal(card.id,i+1);assert.equal(card.category,i<10?'Bencana dan lingkungan':i<17?'Sosial dan kehidupan sehari-hari':'Ekonomi, transportasi dan pemerintahan');assert(card.text.length>20);
    let s=G.initial(),calls=0;s.teams[0].pos=4;G.roll(s,()=>calls++===0?0:(i+.5)/25);assert.equal(s.phase,'event');assert.equal(s.pending.card,i);
    s=G.restore(JSON.stringify(s));assert.equal(s.pending.card,i);G.applyEvent(s);assert.equal(s.teams[0].cash,1500+values[i]);assert.equal(G.applyEvent(s),false);
  });
});
test('simpanan papan lama ditolak sehingga indeks tidak ditafsirkan ulang',()=>{
  const s=G.initial();s.version=7;assert.throws(()=>G.restore(JSON.stringify(s)),/papan dan kartu lama/);assert.equal(G.KEY,'bogor-monopoly-ready-v8');
});
test('guru ubah saldo, kalah, tidak bisa hidupkan tim kalah, tersisa satu mengakhiri sesi',()=>{
  const s=G.initial();G.editCash(s,0,200);assert.equal(s.teams[0].cash,200);G.editCash(s,0,0);assert.equal(s.phase,'end');assert.equal(G.editCash(s,0,1000),false);
  for(let i=1;i<4;i++)G.editCash(s,i,0);assert.equal(s.phase,'finished');assert.equal(G.alive(s)[0].name,'Tim 5');assert.equal(G.next(s),false);assert.equal(G.roll(s),false);
});
test('guru menghentikan sesi saat soal aktif tanpa menilai jawaban yang belum dikirim',()=>{
  const s=choice();G.challenge(s,Date.now(),()=>0);G.stop(s);assert.equal(s.phase,'finished');assert.equal(s.records.length,0);assert.equal(G.tick(s,Date.now()+999999),false);
});
test('peringkat saldo lalu benar, seri; nilai tidak memasukkan skip',()=>{
  const s=G.initial();s.teams[0].correct=3;s.teams[0].wrong=1;s.teams[1].correct=3;s.teams[2].correct=2;s.teams[3].cash=1600;
  const rows=G.rankings(s);assert.equal(rows[0].index,3);assert.equal(rows.find(r=>r.index===0).rank,2);assert.equal(rows.find(r=>r.index===1).rank,2);assert.equal(rows.find(r=>r.index===2).rank,4);assert.equal(rows.find(r=>r.index===0).score,75);
});
test('putaran melewati tim kalah tanpa menambah putaran berkali-kali',()=>{
  const s=G.initial();s.turn=4;s.phase='end';s.teams[0].out=true;s.teams[1].out=true;G.next(s);assert.equal(s.turn,2);assert.equal(s.round,2);
});
test('simpanan salah ditolak',()=>{assert.throws(()=>G.restore('{bad'));assert.throws(()=>G.restore(JSON.stringify({version:6})));});
test('kenaikan skip ke 10 mempertahankan pemakaian dan hanya dimigrasikan sekali',()=>{
  const s=G.initial();s.rulesRevision=2;s.teams.forEach(t=>t.skips=5);s.teams[0].skips=2;s.teams[0].normalBuys=3;
  const updated=G.restore(JSON.stringify(s));assert.equal(updated.teams[0].skips,7);assert.equal(updated.teams[1].skips,10);assert.equal(updated.teams[0].normalBuys,3);
  assert.equal(G.restore(JSON.stringify(updated)).teams[0].skips,7);updated.teams[0].skips=11;assert.throws(()=>G.restore(JSON.stringify(updated)));
});
test('beli normal memiliki batas 5 tersendiri, tetap bisa membeli saat skip habis',()=>{
  const s=choice();s.teams[0].skips=0;s.teams[0].cash=10000;
  for(let i=0;i<5;i++){s.phase='choice';s.pending={kind:'buy',district:i};assert.equal(G.payNormal(s),true);assert.equal(s.teams[0].normalBuys,4-i);assert.equal(s.teams[0].skips,0);}
  s.phase='choice';s.pending={kind:'buy',district:5};assert.equal(G.payNormal(s),false);assert.equal(G.skip(s),false);assert.equal(G.challenge(s),true);
});
test('jatah beli normal habis masih dapat skip, tidak dapat beli normal',()=>{
  const s=choice();s.teams[0].normalBuys=0;assert.equal(G.payNormal(s),false);assert.equal(G.skip(s),true);assert.equal(s.teams[0].skips,9);assert.equal(s.teams[0].normalBuys,0);
});
test('sewa normal memakai skip bersama; skip habis memaksa soal walau beli normal masih 5',()=>{
  const s=choice('rent');s.teams[0].skips=1;G.payNormal(s);assert.equal(s.teams[0].skips,0);assert.equal(s.teams[0].normalBuys,5);
  s.phase='choice';s.pending={kind:'rent',district:0,owner:1};assert.equal(G.payNormal(s),false);assert.equal(G.challenge(s,Date.now()),true);
  G.grade(s,G.bank[s.pending.question-1].values);assert.equal(s.teams[0].skips,0);assert.equal(s.teams[0].normalBuys,5);
});
test('simpanan v8 sebelum revisi mendapat jatah baru sekali tanpa reset saldo atau skip',()=>{
  const s=G.initial();delete s.rulesRevision;s.teams.forEach(t=>{delete t.normalBuys;t.skips=5;});s.teams[0].cash=1200;s.teams[0].skips=2;
  const restored=G.restore(JSON.stringify(s));assert.equal(restored.teams[0].normalBuys,5);assert.equal(restored.teams[0].cash,1200);assert.equal(restored.teams[0].skips,7);
  restored.teams[0].normalBuys=3;assert.equal(G.restore(JSON.stringify(restored)).teams[0].normalBuys,3);
  restored.teams[0].normalBuys=-1;assert.throws(()=>G.restore(JSON.stringify(restored)),/Jatah beli normal/);
});
test('hasil soal yang menyebabkan kalah dapat dipulihkan',()=>{
  const s=choice();s.teams[0].cash=20;G.challenge(s,Date.now(),()=>0);G.grade(s,G.bank[s.pending.question-1].values);assert(s.teams[0].out);assert.equal(G.restore(JSON.stringify(s)).phase,'result');
});
test('simulasi sesi: semua fase dapat disimpan dan dipulihkan tanpa merusak kepemilikan',()=>{
  let seed=73;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let game=0;game<4;game++){
    let s=G.initial();
    for(let n=0;n<900&&s.phase!=='finished';n++){
      switch(s.phase){
        case 'roll':G.roll(s,random);break;
        case 'choice':{const t=G.active(s);if(s.pending.kind==='buy'&&t.skips&&random()<.2)G.skip(s);else if((s.pending.kind==='buy'?t.normalBuys:t.skips)&&random()<.4)G.payNormal(s);else G.challenge(s,Date.now(),random);break;}
        case 'question':{const q=G.bank[s.pending.question-1];G.grade(s,random()<.6?q.values:q.values.map(v=>v+10));break;}
        case 'result':G.acknowledge(s);break;
        case 'event':G.applyEvent(s);break;
        case 'end':G.next(s);break;
      }
      s=G.restore(JSON.stringify(s));
      s.teams.forEach(t=>{assert(t.skips>=0&&t.skips<=10);assert(t.cash>=0);assert.equal(t.correct+t.wrong,s.records.filter(r=>s.teams[r.team]===t).length);});
    }
  }
});

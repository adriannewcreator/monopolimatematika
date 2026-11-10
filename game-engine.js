/* Mesin permainan offline. Semua uang disimpan dalam ribuan rupiah. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.BogorGame=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Papan dan kartu baru memakai namespace sendiri agar indeks simpanan lama
  // tidak berubah arti menjadi kecamatan atau kartu yang berbeda.
  const VERSION=8,KEY='bogor-monopoly-ready-v8';
  const districts=['Cileungsi','Cibinong','Jonggol','Cariu','Gunung Putri','Cisarua','Citeureup','Sukaraja','Babakan Madang','Sukamakmur','Klapanunggal','Tanjungsari','Ciawi','Megamendung','Caringin','Cibungbulang','Ciampea','Dramaga','Ciomas','Parung','Gunung Sindur','Bojonggede','Kemang','Rumpin','Parung Panjang'];
  const colors=['#a3ff71','#71d5ff','#ffb76b','#c5a1ff','#ff8cbd'];
  const cards=[
    {title:'KEBUN SAWIT DI CARIU',text:'Lahan kosong milikmu disewakan untuk perkebunan sawit. Kamu mendapat keuntungan dari uang sewa.',value:200},
    {title:'CILEUNGSI DILANDA BANJIR',text:'Hujan deras menyebabkan banjir dan merusak perabotan rumahmu. Bayar biaya perbaikan.',value:-150},
    {title:'KEBAKARAN LAHAN DI SUKAMAKMUR',text:'Musim kemarau memicu kebakaran lahan. Kamu ikut membayar biaya pemulihan lingkungan.',value:-200},
    {title:'SAMPAH MENUMPUK DI PARUNG PANJANG',text:'Sampah menumpuk di sekitar permukiman. Kamu harus membayar iuran kebersihan tambahan.',value:-100},
    {title:'LONGSOR DI CISARUA',text:'Longsor menutup akses jalan. Kamu harus mengeluarkan biaya tambahan untuk perjalanan.',value:-100},
    {title:'POLUSI PABRIK DI GUNUNG PUTRI',text:'Asap dan debu industri mengganggu kesehatan lingkungan. Kamu membeli masker dan alat penyaring udara.',value:-100},
    {title:'GALIAN TAMBANG DI KLAPANUNGGAL',text:'Aktivitas tambang menyebabkan jalan rusak dan kendaraanmu mengalami kerusakan.',value:-150},
    {title:'ANGIN KENCANG DI CISARUA',text:'Atap rumah rusak diterjang angin kencang. Bayar biaya renovasi.',value:-100},
    {title:'GOTONG ROYONG DI DRAMAGA',text:'Kamu ikut membersihkan lingkungan dan mendapat penghargaan dari warga.',value:50},
    {title:'NORMALISASI SALURAN AIR DI KEMANG',text:'Saluran air diperbaiki sehingga usaha milikmu terhindar dari banjir. Usaha kembali ramai.',value:100},
    {title:'KENA BEGAL DI JONGGOL',text:'Dalam perjalanan pulang, kamu menjadi korban begal. Uangmu hilang.',value:-100},
    {title:'KERACUNAN MAKANAN DI CIBINONG',text:'Setelah menyantap makanan yang terkontaminasi, kamu harus berobat ke rumah sakit.',value:-150},
    {title:'DEMO PEMERINTAH DI CIBINONG',text:'Aksi demonstrasi menuntut perubahan kebijakan membuat jalan ditutup. Kamu terlambat bekerja.',value:-50},
    {title:'MENANG ARISAN DI BOJONGGEDE',text:'Nomor arisanmu keluar! Kamu membawa pulang uang arisan.',value:200},
    {title:'KONDISI DARURAT TETANGGA DI RUMPIN',text:'Kamu membantu tetangga yang terkena musibah. Warga memberikan uang apresiasi.',value:50},
    {title:'KONTRAKAN DI GUNUNG PUTRI PENUH',text:'Semua kamar kontrakanmu terisi pekerja pabrik. Kamu menerima uang sewa.',value:150},
    {title:'KONDISI MUDIK LEBARAN',text:'Kamu pulang kampung dan mengeluarkan banyak uang untuk perjalanan serta oleh-oleh.',value:-100},
    {title:'MACET PARAH DI CIBINONG',text:'Kamu terjebak macet saat jam pulang kerja. Kehilangan waktu dan menghabiskan bensin lebih banyak.',value:-50},
    {title:'JALAN RUSAK DI PARUNG PANJANG',text:'Kendaraanmu terkena lubang jalan hingga ban bocor. Bayar biaya tambal ban.',value:-50},
    {title:'USAHA KULINER DI CILEUNGSI VIRAL',text:'Warung makanmu viral di media sosial dan pelanggan meningkat drastis.',value:200},
    {title:'BANTUAN MODAL UMKM',text:'Usaha kecilmu lolos program bantuan pemerintah. Kamu menerima bantuan modal.',value:200},
    {title:'PANEN RAYA DI JONGGOL',text:'Hasil panen melimpah dan harga jual sedang bagus. Kamu mendapat keuntungan.',value:150},
    {title:'HARGA SEMBAKO NAIK DI PARUNG',text:'Harga beras, cabai, dan minyak goreng melonjak. Pengeluaran rumah tanggamu bertambah.',value:-100},
    {title:'TANAH DI GUNUNG SINDUR NAIK HARGA',text:'Kawasan sekitar tanahmu berkembang. Nilai investasimu meningkat.',value:250},
    {title:'TERTIPU INVESTASI BODONG DI CARINGIN',text:'Kamu tergiur keuntungan besar dari investasi palsu. Uangmu tidak bisa dikembalikan.',value:-200}
  ].map((card,i)=>({...card,id:i+1,category:i<10?'Bencana dan lingkungan':i<17?'Sosial dan kehidupan sehari-hari':'Ekonomi, transportasi dan pemerintahan'}));
  let d=0;
  const tiles=Array.from({length:30},(_,i)=>i===0?{type:'start',name:'START'}:[5,12,20,27].includes(i)?{type:'chance',name:'KESEMPATAN'}:{type:'district',name:districts[d],district:d++});
  const price=i=>180+Math.floor(i/5)*40+(i%5)*20;
  const rent=i=>Math.round(price(i)*.3);
  const matrices2=[[[1,1],[1,-1]],[[2,1],[1,-1]],[[1,2],[2,-1]],[[3,1],[1,-2]]];
  const matrices3=[[[1,1,1],[1,1,0],[0,1,1]],[[1,1,1],[2,-1,1],[1,2,-1]],[[2,1,-1],[1,-1,2],[1,2,1]],[[1,2,1],[2,-1,2],[3,1,-1]]];
  function expression(row){
    let out='';
    row.forEach((n,i)=>{if(!n)return;out+=(out?(n<0?' − ':' + '):(n<0?'−':''))+(Math.abs(n)===1?'':Math.abs(n))+['x','y','z'][i]});
    return out;
  }
  const bank=Array.from({length:80},(_,id)=>{
    const is3=id>=40,i=id%40,matrix=(is3?matrices3:matrices2)[i%4];
    const values=[1+(Math.floor(i/4)%5),1+Math.floor(i/20)+(i%4),1+(Math.floor(i/8)%5)].slice(0,is3?3:2);
    const rhs=matrix.map(row=>row.reduce((sum,c,j)=>sum+c*values[j],0));
    return {id:id+1,type:is3?'SPLTV':'SPLDV',level:i%4===0?'Mudah':'Menengah',matrix,values,rhs,equations:matrix.map((row,j)=>expression(row)+' = '+rhs[j])};
  });
  function initial(){return {version:VERSION,rulesRevision:3,teams:colors.map((color,i)=>({name:'Tim '+(i+1),color,cash:1500,pos:0,owned:[],skips:10,normalBuys:5,correct:0,wrong:0,history:[],cycle:[],out:false})),owners:{},turn:0,round:1,phase:'roll',paused:false,pending:null,records:[],logs:[],lastRoll:null,reason:null};}
  function log(s,text,now=Date.now()){s.logs.unshift({text,at:now});s.logs=s.logs.slice(0,150);}
  const active=s=>s.teams[s.turn];
  const alive=s=>s.teams.filter(t=>!t.out);
  function finish(s,reason){s.phase='finished';s.reason=reason;s.paused=false;if(s.pending?.deadline)delete s.pending.deadline;log(s,reason);}
  function eliminate(s,index){
    const t=s.teams[index];if(t.out)return;
    t.cash=0;t.out=true;t.owned.forEach(i=>delete s.owners[i]);t.owned=[];
    log(s,t.name+' kalah. Seluruh propertinya kembali tersedia.');
    if(alive(s).length<=1)finish(s,alive(s).length?'Tersisa satu tim: '+alive(s)[0].name:'Semua tim telah kalah.');
    else if(index===s.turn){s.pending=null;s.phase='end';}
  }
  function charge(s,amount,receiver){
    const t=active(s),actual=Math.min(t.cash,amount);
    t.cash=Math.max(0,t.cash-amount);
    if(receiver!==undefined)s.teams[receiver].cash+=actual;
    if(t.cash===0)eliminate(s,s.turn);
    return actual;
  }
  function allowed(s,phase){return s.phase===phase&&!s.paused;}
  function roll(s,random=Math.random){
    if(!allowed(s,'roll'))return false;
    const value=1+Math.floor(random()*6),t=active(s),destination=t.pos+value;
    s.lastRoll=value;t.pos=destination%30;
    if(destination>=30){t.cash+=100;log(s,t.name+' melewati START: +Rp100.000.');}
    const tile=tiles[t.pos];s.pending=null;
    log(s,t.name+' melempar '+value+' → '+tile.name+'.');
    if(tile.type==='chance'){s.phase='event';s.pending={card:Math.floor(random()*cards.length)};}
    else if(tile.type==='start'||s.owners[tile.district]===s.turn){s.phase='end';}
    else {const owner=s.owners[tile.district];s.phase='choice';s.pending={kind:owner===undefined?'buy':'rent',district:tile.district,owner};}
    return true;
  }
  function settle(s,p,amount){
    const buyer=s.turn,t=active(s);
    const actual=charge(s,amount,p.kind==='rent'?p.owner:undefined);
    if(p.kind==='buy'&&!t.out){s.owners[p.district]=buyer;t.owned.push(p.district);}
    log(s,t.name+(p.kind==='buy'?' • pembelian ':' • sewa ')+districts[p.district]+': Rp'+(actual*1000).toLocaleString('id-ID')+(actual<amount?' (saldo tidak cukup; tim kalah)':'')+'.');
    return actual;
  }
  function skip(s){
    if(!allowed(s,'choice')||s.pending.kind!=='buy'||active(s).skips<=0)return false;
    const p={...s.pending};active(s).skips--;
    log(s,active(s).name+' tidak membeli '+districts[p.district]+' (skip). Sisa: '+active(s).skips+'.');
    s.phase='end';s.pending=null;return true;
  }
  function payNormal(s){
    if(!allowed(s,'choice'))return false;
    const p={...s.pending},t=active(s);
    if(p.kind==='buy'){
      if(t.normalBuys<=0)return false;
      t.normalBuys--;
      log(s,t.name+' membeli normal. Sisa jatah beli normal: '+t.normalBuys+'.');
    }else{
      if(t.skips<=0)return false;
      t.skips--;
      log(s,t.name+' membayar sewa normal menggunakan 1 skip. Sisa skip: '+t.skips+'.');
    }
    settle(s,p,p.kind==='buy'?price(p.district):rent(p.district));
    if(s.phase!=='finished'){s.phase='end';s.pending=null;}return true;
  }
  function challenge(s,now=Date.now(),random=Math.random){
    if(!allowed(s,'choice'))return false;
    const t=active(s);if(t.cycle.length===80)t.cycle=[];
    const type=t.history.length%2===0?'SPLDV':'SPLTV';
    const recent=t.history.slice(-7);
    const pool=bank.filter(q=>q.type===type&&!t.cycle.includes(q.id)&&!recent.includes(q.id));
    if(!pool.length)throw new Error('Tidak ada soal yang memenuhi aturan pengulangan.');
    const q=pool[Math.floor(random()*pool.length)];t.cycle.push(q.id);t.history.push(q.id);
    s.pending={...s.pending,question:q.id,deadline:now+180000,answers:q.values.map(()=>''),startedAt:now};
    s.phase='question';return true;
  }
  function remaining(s,now=Date.now()){return s.phase==='question'?(s.paused?s.pending.remaining:Math.max(0,s.pending.deadline-now)):0;}
  function grade(s,answers,now=Date.now(),timeout=false){
    if(!allowed(s,'question'))return false;
    timeout=timeout||remaining(s,now)<=0;
    const p={...s.pending},q=bank[p.question-1],t=active(s);
    if(!timeout&&(!Array.isArray(answers)||answers.length!==q.values.length||answers.some(v=>String(v).trim()===''||!Number.isFinite(Number(v)))))return false;
    const correct=!timeout&&answers.every((v,i)=>Number(v)===q.values[i]);
    correct?t.correct++:t.wrong++;
    const base=p.kind==='buy'?price(p.district):rent(p.district);
    const amount=Math.round(base*(correct?.5:1.25));
    const record={team:s.turn,question:q.id,answers:timeout?p.answers.slice():answers.map(Number),correct,timeout,at:now,amount,kind:p.kind,district:p.district};
    s.records.push(record);
    log(s,t.name+' • '+q.type+' #'+q.id+': '+(correct?'benar':timeout?'waktu habis':'salah')+'.');
    settle(s,p,amount);
    if(s.phase!=='finished'){s.phase='result';s.pending={...p,deadline:null,result:record};}
    return true;
  }
  function tick(s,now=Date.now()){if(allowed(s,'question')&&remaining(s,now)<=0)return grade(s,[],now,true);return false;}
  function pause(s,now=Date.now()){
    if(s.phase==='finished')return false;
    if(!s.paused&&tick(s,now)&&s.phase==='finished')return false;
    if(s.phase==='question'){
      if(s.paused){s.pending.deadline=now+s.pending.remaining;delete s.pending.remaining;}
      else{s.pending.remaining=remaining(s,now);delete s.pending.deadline;}
    }
    s.paused=!s.paused;return true;
  }
  function applyEvent(s){
    if(!allowed(s,'event'))return false;
    const card=cards[s.pending.card];
    if(card.value<0)charge(s,-card.value);else active(s).cash+=card.value;
    log(s,active(s).name+' • '+card.title+' ('+(card.value>0?'+':'')+card.value+'K).');
    if(s.phase!=='finished'){s.phase='end';s.pending=null;}return true;
  }
  function acknowledge(s){if(!allowed(s,'result'))return false;s.phase='end';s.pending=null;return true;}
  function next(s){
    if(!allowed(s,'end'))return false;
    do{s.turn=(s.turn+1)%5;if(s.turn===0)s.round++;}while(active(s).out);
    s.phase='roll';s.pending=null;return true;
  }
  function editCash(s,index,value){
    if(s.phase==='finished'||!Number.isInteger(index)||index<0||index>=5||s.teams[index].out||!Number.isSafeInteger(value)||value<0)return false;
    tick(s);if(s.phase==='finished')return false;
    const t=s.teams[index],before=t.cash;t.cash=value;
    log(s,'Guru mengubah saldo '+t.name+': '+before+'K → '+value+'K.');
    if(value===0)eliminate(s,index);return true;
  }
  function stop(s,now=Date.now()){if(s.phase==='finished')return false;tick(s,now);if(s.phase!=='finished')finish(s,'Permainan dihentikan oleh guru.');return true;}
  function rankings(s){
    const rows=s.teams.map((t,index)=>({...t,index,score:t.correct+t.wrong?Math.round(t.correct/(t.correct+t.wrong)*10000)/100:0})).sort((a,b)=>b.cash-a.cash||b.correct-a.correct);
    let rank=1;rows.forEach((t,i)=>{if(i&&(t.cash!==rows[i-1].cash||t.correct!==rows[i-1].correct))rank=i+1;t.rank=rank;});return rows;
  }
  function restore(raw){
    const s=JSON.parse(raw);
    if(s?.version===7)throw new Error('Cadangan memakai papan dan kartu lama. Mulai sesi baru untuk daftar 25 kecamatan dan 25 kartu terbaru.');
    if(!s||s.version!==VERSION||s.teams?.length!==5||!['roll','choice','question','result','event','end','finished'].includes(s.phase)||!Number.isInteger(s.turn)||s.turn<0||s.turn>4)throw new Error('Data simpanan tidak cocok.');
    const migrateQuota=s.rulesRevision===undefined;
    const migrateSkips=migrateQuota||s.rulesRevision===2;
    if(migrateQuota)s.teams.forEach(t=>{if(t&&t.normalBuys===undefined)t.normalBuys=5;});
    const integer=(v,min,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
    if(!integer(s.round,1)||typeof s.paused!=='boolean'||!s.owners||typeof s.owners!=='object'||Array.isArray(s.owners)||!Array.isArray(s.records)||!Array.isArray(s.logs))throw new Error('Struktur simpanan tidak valid.');
    if(s.teams.some(t=>!t||typeof t.name!=='string'||!integer(t.cash,0)||!integer(t.correct,0)||!integer(t.wrong,0)||typeof t.out!=='boolean'||!Array.isArray(t.history)||!Array.isArray(t.cycle)||!Array.isArray(t.owned)||!integer(t.pos,0,29)||!integer(t.skips,0,migrateSkips?5:10)||t.history.some(id=>!integer(id,1,80))||t.cycle.some(id=>!integer(id,1,80))||t.owned.some(id=>!integer(id,0,24))||new Set(t.cycle).size!==t.cycle.length||t.cycle.length>80||(t.out&&(t.cash!==0||t.owned.length))||(!t.out&&t.cash===0)))throw new Error('Data tim tidak valid.');
    if(s.teams.some(t=>!integer(t.normalBuys,0,5))||(!migrateSkips&&s.rulesRevision!==3))throw new Error('Jatah beli normal tidak valid.');
    for(const [id,owner] of Object.entries(s.owners))if(!/^(0|[1-9]\d*)$/.test(id)||!integer(Number(id),0,24)||!integer(owner,0,4)||s.teams[owner].out||!s.teams[owner].owned.includes(Number(id)))throw new Error('Pemilik properti tidak valid.');
    s.teams.forEach((t,i)=>{if(t.owned.some(id=>s.owners[id]!==i)||new Set(t.owned).size!==t.owned.length)throw new Error('Daftar properti tidak cocok.');t.color=colors[i];});
    if(s.records.some(r=>!r||!integer(r.team,0,4)||!integer(r.question,1,80)||!Array.isArray(r.answers)||r.answers.length!==bank[r.question-1].values.length||typeof r.correct!=='boolean'||typeof r.timeout!=='boolean'||!Number.isFinite(r.at)||!integer(r.amount,0)||!['buy','rent'].includes(r.kind)||!integer(r.district,0,24)))throw new Error('Riwayat jawaban tidak valid.');
    if(s.logs.some(l=>!l||typeof l.text!=='string'||!Number.isFinite(l.at)))throw new Error('Riwayat permainan tidak valid.');
    if(s.phase!=='finished'&&alive(s).length<=1)throw new Error('Status akhir tidak cocok.');
    if(!['result','end','finished'].includes(s.phase)&&active(s).out)throw new Error('Giliran tim kalah tidak valid.');
    if(['choice','question','result','event'].includes(s.phase)&&!s.pending)throw new Error('Aksi tersimpan tidak lengkap.');
    if(['choice','question','result'].includes(s.phase)){
      const p=s.pending;
      if(!['buy','rent'].includes(p.kind)||!integer(p.district,0,24)||(p.kind==='rent'&&!integer(p.owner,0,4)))throw new Error('Transaksi tersimpan tidak valid.');
    }
    if(s.phase==='event'&&!integer(s.pending.card,0,cards.length-1))throw new Error('Kartu tersimpan tidak valid.');
    if(s.phase==='result'&&(!bank[s.pending.question-1]||!s.pending.result||typeof s.pending.result.correct!=='boolean'))throw new Error('Hasil tersimpan tidak valid.');
    if(s.phase==='question'&&(!bank[s.pending.question-1]||!Array.isArray(s.pending.answers)||s.pending.answers.length!==bank[s.pending.question-1].values.length||!Number.isFinite(s.paused?s.pending.remaining:s.pending.deadline)||(s.paused&&(s.pending.remaining<0||s.pending.remaining>180000))))throw new Error('Timer tersimpan tidak valid.');
    if(migrateQuota)log(s,'Revisi aturan: setiap tim mendapat jatah beli normal 5 kali, terpisah dari sisa skip. Transaksi lama tidak diubah.');
    if(migrateSkips){s.teams.forEach(t=>t.skips+=5);s.rulesRevision=3;log(s,'Jatah skip naik dari 5 menjadi 10. Sisa skip tiap tim ditambah 5 sekali; pemakaian sebelumnya tetap dihitung.');}
    tick(s);return s;
  }
  return {VERSION,KEY,districts,colors,cards,tiles,price,rent,bank,initial,active,alive,roll,skip,payNormal,challenge,remaining,grade,tick,pause,applyEvent,acknowledge,next,editCash,stop,rankings,restore,log};
});

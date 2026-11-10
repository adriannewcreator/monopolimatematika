/* Antarmuka lokal, tanpa CDN, font unduhan, atau koneksi jaringan. */
(()=>{
  'use strict';
  const G=window.BogorGame,$=id=>document.getElementById(id);
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>'Rp'+(v*1000).toLocaleString('id-ID');
  const btn=(text,action,cls='',disabled=false,extra='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+(disabled||animation&&['roll','skip','pay-normal','challenge','event','acknowledge','next'].includes(action)?'disabled ':'')+extra+'>'+text+'</button>';
  let animation=null;
  const pips=[[],[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]];
  const diceMarkup=(value,rolling=false)=>'<div class="dice-stage" role="img" aria-label="'+(rolling?'Dadu sedang berputar':'Hasil dadu '+value)+'"><div class="die face-result-'+value+(rolling?' is-rolling':'')+'">'+[1,2,3,4,5,6].map(face=>'<span class="die-face die-face-'+face+'">'+pips[face].map(cell=>'<i style="grid-row:'+(Math.floor(cell/3)+1)+';grid-column:'+(cell%3+1)+'"></i>').join('')+'</span>').join('')+'</div></div>';
  const pawn=(t,k,hopping=false)=>'<span class="token'+(hopping?' pawn-hop':'')+'" data-team="'+k+'" style="--team:'+t.color+'" role="img" aria-label="Bidak '+esc(t.name)+'" title="'+esc(t.name)+'"><svg viewBox="0 0 24 34" aria-hidden="true"><circle cx="12" cy="5.5" r="4.2"/><path d="M7 12 Q12 9 17 12 L21 20 Q22 23 19 23 L16 18 L16 31 Q16 34 13 32 L12 24 L11 32 Q8 34 8 31 L8 18 L5 23 Q2 23 3 20 Z"/><text x="12" y="19.5" text-anchor="middle">'+(k+1)+'</text></svg></span>';
  let state=G.initial(),blocked=false,rawSaved=null;
  try{rawSaved=localStorage.getItem(G.KEY);if(rawSaved)state=G.restore(rawSaved);}catch(e){blocked=true;warn('Simpanan tidak dapat dibaca atau penyimpanan browser tidak tersedia. Data lama tidak ditimpa. Ekspor cadangan melalui Kontrol guru, lalu mulai game baru untuk mencoba penyimpanan kembali.');}
  function warn(text){$('storageWarning').hidden=false;$('storageWarning').textContent=text;}
  function save(){
    if(blocked){$('saveStatus').textContent='Penyimpanan belum aktif — periksa peringatan';return;}
    try{localStorage.setItem(G.KEY,JSON.stringify(state));$('saveStatus').textContent='● Progres tersimpan di browser ini';}
    catch(e){$('saveStatus').textContent='Penyimpanan gagal';warn('Progres belum tersimpan. Jangan tutup halaman sebelum mengunduh cadangan melalui Kontrol guru.');}
  }
  const qActive=()=>state.pending?.question?G.bank[state.pending.question-1]:null;
  function open(title,html){$('dialogLabel').textContent=title;$('dialogContent').innerHTML=html;if(!$('dialog').open)$('dialog').showModal();}
  function close(){if($('dialog').open)$('dialog').close();}
  function render(){
    const team=G.active(state),ended=state.phase==='finished';
    $('status').innerHTML='<div><span class="badge">'+(ended?'SESI SELESAI':state.paused?'PERMAINAN DIJEDA':'PUTARAN '+state.round)+'</span> &nbsp; / &nbsp; <strong>'+esc(ended?state.reason:team.name)+'</strong></div>'+(!ended?btn(state.paused?'▶ Lanjutkan permainan':'Ⅱ Jeda','pause'):btn('Lihat hasil','report','primary'));
    renderBoard();renderTeams();renderAction();
    $('logs').innerHTML=state.logs.slice(0,12).map(l=>'<div class="log"><time>'+new Date(l.at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+'</time>'+esc(l.text)+'</div>').join('')||'<div class="log">Arena siap. Mulai dari Tim 1 dan lempar dadu!</div>';
    save();updateClock();
  }
  function renderBoard(){
    const team=G.active(state);
    const board=$('board');
    const oldPawn=animation&&board.querySelector?.('.token[data-team="'+animation.team+'"]');
    const oldRect=oldPawn?.getBoundingClientRect();
    const visualPosition=(t,k)=>animation&&animation.team===k?(animation.start+animation.step)%30:t.pos;
    $('board').innerHTML=G.tiles.map((tile,i)=>{
      let x,y;if(i<=8){x=9-i;y=8;}else if(i<=15){x=1;y=16-i;}else if(i<=23){x=i-14;y=1;}else{x=9;y=i-22;}
      const owner=state.owners[tile.district];
      const color=['#ffb76b','#71d5ff','#c5a1ff','#ff8cbd','#a3ff71'][Math.floor((tile.district||0)/5)];
      const hopping=animation?.stage==='moving'&&!state.paused&&visualPosition(team,state.turn)===i;
      return '<button type="button" class="tile '+tile.type+(visualPosition(team,state.turn)===i?' current':'')+(hopping?' hopping':'')+'" data-action="tile" data-index="'+i+'" style="grid-column:'+x+';grid-row:'+y+';--district:'+color+';--owner:'+(owner===undefined?'transparent':state.teams[owner].color)+'" aria-label="'+esc(tile.name+(owner===undefined?'':', milik '+state.teams[owner].name))+'">'+(tile.type==='district'?'<span class="stripe"></span>':'')+'<strong>'+(tile.type==='start'?'↗ ':'')+esc(tile.name)+'</strong><small>'+(tile.type==='district'?money(G.price(tile.district)):tile.type==='start'?'+Rp100.000':'AMBIL KARTU')+'</small><span class="owner"></span><span class="tokens">'+state.teams.map((t,k)=>!t.out&&visualPosition(t,k)===i?pawn(t,k,hopping&&k===state.turn):'').join('')+'</span></button>';
    }).join('')+'<div class="board-center"><div class="center-kicker">WELCOME TO YOUR NEXT EMPIRE</div><div class="center-title">SPLDV SPLTV<br><span>Monopoly</span></div><div class="center-caption">Pikir cepat. Hitung tepat. Ambil alih kotanya.</div><div class="center-tags"><span>5 TIM</span><span>80 SOAL</span><span>3 MENIT / SOAL</span></div><div class="center-turn" style="--team:'+team.color+'">'+(state.phase==='finished'?'SESI SELESAI':'GILIRAN SEKARANG')+'<b>'+esc(state.phase==='finished'?'GG, EVERYONE!':team.name)+'</b></div></div>';
    const newPawn=animation&&board.querySelector?.('.pawn-hop');
    if(newPawn&&oldRect&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      const rect=newPawn.getBoundingClientRect(),dx=oldRect.left-rect.left,dy=oldRect.top-rect.top;
      if(dx||dy)newPawn.animate?.([
        {transform:'translate('+dx+'px,'+dy+'px) scale(1)'},
        {transform:'translate('+(dx*.5)+'px,'+(dy*.5-Math.min(38,rect.height))+'px) scale(1.15)',offset:.5},
        {transform:'translate(0,0) scale(.92,1.06)',offset:.88},
        {transform:'translate(0,0) scale(1)'}
      ],{duration:440,easing:'ease-in-out'});
    }
  }
  function renderTeams(){
    $('teams').innerHTML=state.teams.map((t,i)=>'<div class="team '+(i===state.turn?'current ':'')+(t.out?'out':'')+'" style="--team:'+t.color+'"><span class="dot"></span><div><b>'+esc(t.name)+(t.out?' · KALAH':'')+'</b><small>'+t.owned.length+' properti · '+t.correct+'/'+(t.correct+t.wrong)+' benar</small><small>Skip '+t.skips+'/10 · Beli normal '+t.normalBuys+'/5</small></div><div class="cash">'+money(t.cash)+'</div></div>').join('');
  }
  function renderAction(){
    const t=G.active(state),p=state.pending;
    $('action').dataset.phase=state.phase;
    let html='<div class="kicker">YOUR MOVE / '+esc(t.name)+'</div>';
    if(animation){
      const rolling=animation.stage==='dice',moving=animation.stage==='moving';
      html+='<h2>'+(state.paused?'Ⅱ Animasi dijeda':rolling?'Dadu sedang berputar…':moving?'Hop! Hop! Hop!':'Dapat '+animation.steps+' langkah!')+'</h2>'+diceMarkup(rolling?1:animation.steps,rolling&&!state.paused)+'<p class="roll-message" aria-live="polite">'+(state.paused?'Tekan Lanjutkan permainan untuk meneruskan animasi.':rolling?'Mengacak dadu. Tunggu hasilnya…':moving?'Langkah '+animation.step+' dari '+animation.steps+' · '+esc(G.tiles[(animation.start+animation.step)%30].name):'Bidak akan bergerak petak demi petak.')+'</p>'+btn('ANIMASI BERJALAN…','roll','primary wide',true);
    }else if(state.phase==='finished'){
      const rows=G.rankings(state),top=rows.filter(r=>r.rank===1);
      html='<div class="kicker">THAT’S A WRAP ✦</div><h2>'+esc(state.reason)+'</h2><p>Peringkat 1: <b>'+top.map(r=>esc(r.name)).join(' & ')+'</b></p><p>Urutan berdasarkan saldo, lalu jumlah jawaban benar. Hasil identik mendapat peringkat sama.</p>'+btn('🏆 Buka rekap akhir','report','primary wide');
    }else if(state.paused){html+='<div class="paused"><strong>Ⅱ TIME OUT</strong><p>Permainan dan timer dijeda oleh guru.</p>'+btn('▶ Lanjutkan permainan','pause','primary')+'</div>';
    }else if(state.phase==='roll'){
      html+='<h2>Siap ambil alih?</h2><p>Lempar dadu untuk menjelajahi Bogor. Skip: <b>'+t.skips+'/10</b> · Beli normal: <b>'+t.normalBuys+'/5</b>.</p>'+diceMarkup(state.lastRoll||1)+btn('🎲 LEMPAR DADU','roll','primary wide');
    }else if(state.phase==='choice'){
      const base=p.kind==='buy'?G.price(p.district):G.rent(p.district);
      html+='<h2>'+esc(G.districts[p.district])+'</h2><p>'+(p.kind==='buy'?'Properti tersedia untuk dibeli.':'Properti milik <b>'+esc(state.teams[p.owner].name)+'</b>. Selesaikan pembayaran sewa.')+'</p><div class="price-box"><div><small>'+(p.kind==='buy'?'HARGA NORMAL':'SEWA NORMAL')+'</small><b>'+money(base)+'</b></div><div><small>JIKA JAWABAN BENAR</small><b class="check">'+money(Math.round(base*.5))+'</b></div></div><p class="hint">Soal masih dirahasiakan. Pilih mengerjakan soal untuk diskon 50%. Salah atau waktu habis: '+(p.kind==='buy'?'125% harga beli':'125% sewa')+'. Pembelian tidak dapat dibatalkan setelah menjawab.</p><div class="buttons">'+btn('Kerjakan soal →','challenge','primary')+btn(p.kind==='buy'?'Beli normal ('+t.normalBuys+'/5)':'Sewa normal · 1 skip ('+t.skips+'/10)','pay-normal','',p.kind==='buy'?t.normalBuys===0:t.skips===0)+(p.kind==='buy'?btn('Skip · tidak membeli ('+t.skips+')','skip','',t.skips===0):'')+'</div>'+'<p class="hint">'+(p.kind==='rent'?(t.skips===0?'Skip habis. Wajib menjawab soal sewa.':'Sewa normal memakai 1 skip; menjawab soal tidak memakai skip.'):(t.skips===0?(t.normalBuys===0?'Kedua jatah habis. Wajib membeli dengan menjawab soal.':'Skip habis. Wajib membeli: gunakan jatah beli normal atau jawab soal.'):(t.normalBuys===0?'Jatah beli normal habis. Jawab soal untuk membeli atau gunakan skip.':'Beli normal memakai jatah tersendiri; skip berarti tidak membeli.')))+'</p>';
    }else if(state.phase==='question'){
      const q=qActive();
      html+='<h2>Let’s solve this.</h2><div class="kicker">'+q.type+' #'+q.id+' / '+q.level+'</div><div class="equations">'+q.equations.map(esc).join('<br>')+'</div><form id="answerForm"><div class="answer-fields">'+q.values.map((_,i)=>'<label>'+['X','Y','Z'][i]+'<input aria-label="Jawaban '+['x','y','z'][i]+'" type="number" step="any" name="answer'+i+'" data-answer="'+i+'" value="'+esc(p.answers[i])+'" autocomplete="off" required></label>').join('')+'</div><div class="timer-line" id="timerLine"><span>SISA WAKTU</span><strong id="clock">3:00</strong></div><div class="timer-track"><div id="timerBar"></div></div><div id="answerError" class="error" role="alert"></div><button class="primary wide" type="submit">KIRIM JAWABAN ✓</button></form><p class="hint">Satu kesempatan. Jawaban yang dikirim langsung dinilai dan transaksi diselesaikan.</p>';
    }else if(state.phase==='result'){
      const q=qActive(),r=p.result;
      html+='<h2>'+(r.correct?'✓ Nailed it!':r.timeout?'⏱ Waktu habis':'Keep learning!')+'</h2><p>'+q.type+' #'+q.id+' · '+(r.correct?'Jawaban benar. Diskon 50% berhasil didapat.':'Jawaban belum tepat. Tagihan mengikuti aturan pembelian atau sewa.')+'</p><p class="solution">'+q.values.map((v,i)=>['x','y','z'][i]+' = '+v).join(' · ')+'</p><div class="price-box"><div><small>TAGIHAN</small><b>'+money(r.amount)+'</b></div><div><small>SALDO TERSISA</small><b>'+money(t.cash)+'</b></div></div><p class="hint">Transaksi sudah diselesaikan.'+(t.out?' Tim ini kalah.':'')+'</p>'+btn('Selesai →','acknowledge','primary wide');
    }else if(state.phase==='event'){
      const c=G.cards[p.card];html+='<div class="kicker" style="margin-top:15px">KARTU '+c.id+'/'+G.cards.length+' · '+esc(c.category)+'</div><h2>'+esc(c.title)+'</h2><p>'+esc(c.text)+'</p><div class="card-value">'+(c.value>0?'+':'−')+money(Math.abs(c.value))+'</div>'+btn('Terapkan kartu →','event','primary wide');
    }else if(state.phase==='end'){
      html+='<h2>'+(t.out?'Tim ini telah kalah.':'Giliran selesai ✓')+'</h2><p>'+(t.out?'Properti tim kembali tersedia. Lanjutkan ke tim yang masih bertahan.':'Semua aksi terselesaikan. Tekan Lanjut untuk tim berikutnya.')+'</p>'+btn('LANJUT KE TIM BERIKUTNYA →','next','primary wide');
    }
    $('action').innerHTML=html;
  }
  function updateClock(){
    if(state.phase!=='question'||state.paused)return;
    const ms=G.remaining(state),sec=Math.ceil(ms/1000);
    if($('clock'))$('clock').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
    if($('timerBar'))$('timerBar').style.width=Math.min(100,ms/1800)+'%';
    if($('timerLine'))$('timerLine').classList.toggle('urgent',sec<=30);
  }
  // Hasil logis disimpan sekali sebelum presentasi. Refresh saat animasi
  // langsung memulihkan petak tujuan; bonus dan kartu tidak diundi ulang.
  function rollAnimated(){
    if(animation||state.paused||state.phase!=='roll')return;
    const start=G.active(state).pos,team=state.turn;
    if(!G.roll(state))return;
    animation={team,start,steps:state.lastRoll,step:0,stage:'dice',elapsed:0,lastAt:Date.now()};
    save();
  }
  function animateTick(now=Date.now()){
    if(!animation)return;
    const a=animation,delta=Math.max(0,now-a.lastAt);a.lastAt=now;
    if(state.paused)return;
    a.elapsed+=delta;
    const stage=a.elapsed<1150?'dice':a.elapsed<1550?'reveal':'moving';
    const step=stage==='moving'?Math.min(a.steps,Math.floor((a.elapsed-1550)/480)+1):0;
    if(a.elapsed>=1550+a.steps*480){animation=null;render();return;}
    if(stage!==a.stage||step!==a.step){a.stage=stage;a.step=step;render();}
  }
  function report(){
    open('REKAP & NILAI','<h2>Scoreboard akhir? Setiap saat.</h2><p>Peringkat: saldo terbesar, kemudian jawaban benar terbanyak. Nilai akademik = benar ÷ soal dikerjakan × 100. Skip tidak dihitung sebagai soal. Belum mengerjakan soal dicatat sebagai 0% (0 soal).</p><div class="table-wrap"><table><thead><tr><th>Peringkat</th><th>Tim</th><th>Saldo</th><th>Benar / soal</th><th>Nilai</th><th>Skip tersisa</th><th>Beli normal tersisa</th><th>Status</th></tr></thead><tbody>'+G.rankings(state).map(t=>'<tr><td>#'+t.rank+'</td><td>'+esc(t.name)+'</td><td>'+money(t.cash)+'</td><td>'+t.correct+' / '+(t.correct+t.wrong)+'</td><td>'+t.score+'%</td><td>'+t.skips+'</td><td>'+t.normalBuys+'</td><td>'+(t.out?'Kalah':'Bertahan')+'</td></tr>').join('')+'</tbody></table></div><div class="buttons">'+btn('Unduh nilai CSV','export-report','primary')+btn('Unduh soal & jawaban CSV','export-history')+'</div><h3>Soal terakhir</h3>'+historyTable());
  }
  function historyTable(){return '<div class="table-wrap"><table><thead><tr><th>Tim</th><th>Soal</th><th>Jawaban tim</th><th>Hasil</th></tr></thead><tbody>'+state.records.slice(-30).reverse().map(r=>'<tr><td>'+esc(state.teams[r.team].name)+'</td><td>'+G.bank[r.question-1].type+' #'+r.question+'</td><td>'+esc(r.answers.map((v,i)=>['x','y','z'][i]+'='+(v===''?'—':v)).join(', '))+'</td><td>'+(r.timeout?'Waktu habis':r.correct?'Benar':'Salah')+'</td></tr>').join('')+'</tbody></table></div>';}
  function teacher(){
    open('KONTROL GURU','<h2>Your classroom. Your controls.</h2><p>Panel guru terlihat pada layar yang dibagikan. Tutup atau hentikan berbagi layar sebelum menampilkan kunci. Membuka panel tidak otomatis menjeda timer.</p><div class="teacher-grid"><section><h3>Kelola sesi</h3><div class="buttons">'+btn(state.paused?'Lanjutkan sesi':'Jeda sesi','pause','secondary',state.phase==='finished')+btn('Kunci soal aktif','reveal','',!qActive()||!['question','result'].includes(state.phase))+btn('Bank soal & kunci','bank')+btn('Daftar kartu','cards')+'</div><div class="buttons">'+btn('Hentikan permainan','stop','danger',state.phase==='finished')+btn('Game baru','reset','danger')+'</div></section><section><h3>Ubah saldo</h3><form id="cashForm"><label class="field">Tim<select id="cashTeam">'+state.teams.map((t,i)=>'<option value="'+i+'" '+(t.out?'disabled':'')+'>'+esc(t.name)+(t.out?' (kalah)':'')+'</option>').join('')+'</select></label><label class="field">Saldo baru (rupiah, kelipatan 1.000)<input id="cashValue" type="number" min="0" step="1000" required placeholder="Contoh: 1500000"></label><p class="hint">Saldo 0 langsung menyebabkan kekalahan. Tim yang sudah kalah tidak dapat dihidupkan kembali.</p><button class="primary wide" '+(state.phase==='finished'?'disabled':'')+'>Simpan saldo</button></form></section><section><h3>Nama tim</h3><form id="namesForm">'+state.teams.map((t,i)=>'<label class="field">Tim '+(i+1)+'<input name="team'+i+'" maxlength="22" value="'+esc(t.name)+'" required></label>').join('')+'<button class="primary wide">Simpan nama</button></form></section><section><h3>Cadangan permainan</h3><p>Simpanan otomatis terikat browser dan alamat file ini. Cadangkan untuk pindah perangkat atau menghindari kehilangan data saat browser dibersihkan.</p>'+btn('Unduh cadangan JSON','backup','primary wide')+'<label class="field">Pulihkan cadangan JSON<input type="file" id="restoreFile" accept=".json,application/json"></label><p class="hint">Pemulihan mengganti sesi saat ini. Timer berjalan pada cadangan tetap mengikuti waktu sebenarnya.</p></section></div>');
  }
  function rules(){open('PANDUAN PERMAINAN','<h2>How to take over Bogor.</h2><ol><li>5 tim memulai dengan <b>Rp1.500.000</b>. Lempar dadu, jalankan aksi, lalu tekan <b>Lanjut</b>. Lewati START mendapat Rp100.000.</li><li>30 petak: 25 kecamatan, 4 Kesempatan, 1 START. Sewa normal 30% harga properti.</li><li>Setiap tim memiliki <b>5 jatah beli normal</b> dan <b>10 skip</b> yang terpisah. Properti kosong: beli normal (memakai 1 jatah beli normal), kerjakan soal, atau skip tidak membeli (memakai 1 skip). Skip habis berarti wajib membeli; beli normal masih boleh jika jatahnya tersedia. Jika kedua jatah habis, wajib menjawab soal. Properti lawan: bayar sewa normal memakai 1 skip, atau kerjakan soal. Skip habis berarti wajib mengerjakan soal sewa.</li><li>Soal baru muncul setelah memilih. Waktu <b>180 detik</b>, satu kesempatan. Benar: bayar 50%. Salah/waktu habis: beli maupun sewa 125%. Menjawab soal tidak mengurangi kedua jatah. Transaksi otomatis, pembelian tidak bisa dibatalkan setelah menjawab.</li><li>80 soal berbeda: 40 SPLDV dan 40 SPLTV, muncul bergantian per tim. Tidak ada pengulangan sebelum seluruh bank dikerjakan tim itu; pengulangan dipisahkan minimal 7 soal lain. Tim berbeda boleh mendapat soal sama.</li><li>Saldo 0 atau tagihan melebihi saldo: langsung kalah. Sisa uang untuk tagihan sewa diberikan kepada pemilik. Seluruh properti tim kalah kembali tersedia.</li><li>Permainan berhenti atas perintah guru atau tersisa satu tim. Peringkat berdasarkan saldo lalu jumlah benar; jika keduanya sama, peringkat sama.</li><li>Guru dapat menjeda timer, melihat kunci, mengubah saldo, dan menghentikan permainan. Refresh melanjutkan sesi; waktu tetap berkurang kecuali sedang dijeda.</li><li>Semua fitur dapat dimainkan tanpa internet. Gunakan browser dan alamat file yang sama untuk melanjutkan simpanan. Unduh cadangan dan rekap sebelum memulai game baru.</li></ol>');}
  function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function csv(name,rows){const cell=v=>{let text=String(v??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};download(name,'\ufeff'+rows.map(row=>row.map(cell).join(';')).join('\r\n'),'text/csv;charset=utf-8');}
  function exportReport(){csv('rekap-nilai-bogor.csv',[['Peringkat','Tim','Saldo (Rp)','Benar','Salah','Jumlah soal','Nilai (%)','Skip tersisa','Beli normal tersisa','Properti','Status'],...G.rankings(state).map(t=>[t.rank,t.name,t.cash*1000,t.correct,t.wrong,t.correct+t.wrong,t.score,t.skips,t.normalBuys,t.owned.length,t.out?'Kalah':'Bertahan'])]);}
  function exportHistory(){csv('riwayat-soal-bogor.csv',[['Waktu','Tim','ID soal','Jenis','Persamaan','Jawaban tim','Kunci','Hasil','Aksi','Kecamatan','Tagihan (Rp)'],...state.records.map(r=>{const q=G.bank[r.question-1];return [new Date(r.at).toISOString(),state.teams[r.team].name,q.id,q.type,q.equations.join(' | '),r.answers.map((v,i)=>['x','y','z'][i]+'='+v).join(', '),q.values.map((v,i)=>['x','y','z'][i]+'='+v).join(', '),r.timeout?'Waktu habis':r.correct?'Benar':'Salah',r.kind==='buy'?'Beli':'Sewa',G.districts[r.district],r.amount*1000];})]);}
  function bank(){open('BANK SOAL / KHUSUS GURU','<h2>80 soal · 40 SPLDV + 40 SPLTV</h2><p>Kunci ditampilkan di panel ini. Rentang mudah–menengah; soal yang sama tidak diulang untuk satu tim sebelum satu siklus selesai.</p>'+btn('Unduh bank soal & kunci CSV','export-bank','primary')+'<div class="table-wrap"><table><thead><tr><th>No.</th><th>Jenis</th><th>Level</th><th>Persamaan</th><th>Kunci</th></tr></thead><tbody>'+G.bank.map(q=>'<tr><td>'+q.id+'</td><td>'+q.type+'</td><td>'+q.level+'</td><td class="bank-equations">'+q.equations.map(esc).join('<br>')+'</td><td>'+q.values.map((v,i)=>['x','y','z'][i]+'='+v).join(', ')+'</td></tr>').join('')+'</tbody></table></div>');}
  const actions={
    roll:rollAnimated,skip:()=>G.skip(state),'pay-normal':()=>G.payNormal(state),challenge:()=>G.challenge(state),event:()=>G.applyEvent(state),acknowledge:()=>G.acknowledge(state),next:()=>G.next(state),
    pause:()=>{if(animation){animateTick();if(animation)animation.lastAt=Date.now();}G.pause(state);if($('dialog').open)teacher();},
    rules,report,teacher,bank,'close-dialog':close,
    history:()=>open('RIWAYAT PERMAINAN','<h2>Live feed</h2><div class="history-list">'+(state.logs.map(l=>'<div class="log"><time>'+new Date(l.at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+'</time>'+esc(l.text)+'</div>').join('')||'<p>Permainan siap dimulai.</p>')+'</div>'),
    fullscreen:()=>{const p=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();p?.catch(()=>warn('Layar penuh tidak tersedia. Gunakan F11 pada browser.'));},
    stop:()=>{if(confirm('Hentikan permainan sekarang? Soal yang belum dikirim tidak dinilai. Hasil yang sudah tercatat tetap tersimpan.')){animation=null;G.stop(state);close();}},
    reset:()=>{if(confirm('Mulai game baru? Progres dan nilai sesi ini akan dihapus. Unduh cadangan atau rekap terlebih dahulu.')){animation=null;state=G.initial();blocked=false;rawSaved=null;$('storageWarning').hidden=true;close();}},
    reveal:()=>{const q=qActive();if(q)open('KUNCI SOAL AKTIF','<h2>'+q.type+' #'+q.id+'</h2><div class="equations">'+q.equations.map(esc).join('<br>')+'</div><p class="solution">'+q.values.map((v,i)=>['x','y','z'][i]+' = '+v).join(' · ')+'</p><p>Menampilkan kunci tidak menghentikan timer. Gunakan Jeda jika diperlukan.</p>');},
    cards:()=>open('DAFTAR KARTU','<h2>'+G.cards.length+' kartu Kesempatan</h2><p>Satu kartu dipilih acak saat tim tiba di petak Kesempatan.</p>'+G.cards.map(c=>'<div class="card-entry"><div class="kicker">'+esc(c.category)+'</div><h3>'+c.id+'. '+esc(c.title)+'</h3><p class="card-amount '+(c.value<0?'negative':'positive')+'">'+(c.value>0?'+':'−')+money(Math.abs(c.value))+'</p><p>'+esc(c.text)+'</p></div>').join('')),
    tile:el=>{const tile=G.tiles[Number(el.dataset.index)];if(tile.type!=='district'){open('INFO PETAK','<h2>'+esc(tile.name)+'</h2><p>'+(tile.type==='start'?'Bonus melewati START: Rp100.000.':'Berhenti di sini untuk mengambil satu kartu acak.')+'</p>');return;}const owner=state.owners[tile.district];open('INFO PROPERTI','<h2>'+esc(tile.name)+'</h2><p>Harga normal: <b>'+money(G.price(tile.district))+'</b><br>Sewa normal: <b>'+money(G.rent(tile.district))+'</b><br>Pemilik: <b>'+esc(owner===undefined?'Belum dimiliki':state.teams[owner].name)+'</b></p>');},
    'export-report':exportReport,'export-history':exportHistory,
    'export-bank':()=>csv('bank-soal-bogor.csv',[['ID','Jenis','Level','Persamaan 1','Persamaan 2','Persamaan 3','x','y','z'],...G.bank.map(q=>[q.id,q.type,q.level,q.equations[0],q.equations[1],q.equations[2]||'',...q.values])]),
    backup:()=>download('cadangan-bogor-'+Date.now()+'.json',blocked&&rawSaved?rawSaved:JSON.stringify(state,null,2),'application/json')
  };
  document.addEventListener('click',event=>{
    const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
    const action=el.dataset.action;if(!actions[action])return;
    if(animation&&['roll','skip','pay-normal','challenge','event','acknowledge','next','tile'].includes(action))return;
    if(G.tick(state)){render();if(['roll','skip','pay-normal','challenge','event','acknowledge','next'].includes(action))return;}
    actions[action](el);render();
  });
  document.addEventListener('input',event=>{
    const input=event.target;if(input.dataset.answer===undefined||state.phase!=='question'||state.paused)return;
    state.pending.answers[Number(input.dataset.answer)]=input.value;save();
  });
  document.addEventListener('submit',event=>{
    event.preventDefault();
    if(event.target.id==='answerForm'){
      const answers=Array.from(event.target.querySelectorAll('input')).map(el=>el.value);
      if(!G.grade(state,answers)){if($('answerError'))$('answerError').textContent='Isi seluruh variabel dengan angka yang valid.';return;}
      render();
    }else if(event.target.id==='cashForm'){
      const rupiah=Number($('cashValue').value),index=Number($('cashTeam').value);
      if(!Number.isSafeInteger(rupiah)||rupiah<0||rupiah%1000!==0){alert('Gunakan saldo rupiah dalam kelipatan 1.000.');return;}
      if(!confirm('Ubah saldo '+state.teams[index].name+' menjadi '+money(rupiah/1000)+'?'+(rupiah===0?' Tim ini langsung kalah.':'')))return;
      animation=null;if(!G.editCash(state,index,rupiah/1000))alert('Saldo tidak dapat diubah pada kondisi ini.');
      close();render();
    }else if(event.target.id==='namesForm'){
      state.teams.forEach((t,i)=>t.name=event.target.elements['team'+i].value.trim().slice(0,22)||'Tim '+(i+1));close();render();
    }
  });
  document.addEventListener('change',async event=>{
    if(event.target.id!=='restoreFile'||!event.target.files[0])return;
    try{
      const file=event.target.files[0];if(file.size>5000000)throw new Error('Ukuran cadangan terlalu besar.');
      const restored=G.restore(await file.text());
      if(!confirm('Ganti sesi saat ini dengan cadangan? Cadangkan sesi sekarang dahulu bila diperlukan.'))return;
      animation=null;state=restored;blocked=false;rawSaved=null;$('storageWarning').hidden=true;close();render();
    }catch(e){alert('Cadangan gagal dipulihkan: '+e.message);}
  });
  setInterval(()=>{if(G.tick(state)){render();}else updateClock();},250);
  setInterval(()=>animateTick(),50);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&G.tick(state))render();});
  window.addEventListener('beforeunload',save);
  render();
})();

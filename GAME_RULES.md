# Aturan Minigame Monopoli Matematika

Status: diterapkan pada kode atas instruksi pengguna untuk membuat game siap dimainkan. Berdasarkan 13 jawaban awal dan 8 persetujuan lanjutan. Sumber pertanyaan dan jawaban: [GAME_QUESTIONS.md](GAME_QUESTIONS.md). Cara menjalankan, keputusan teknis, dan hasil pengujian: [README.md](README.md).

1. Waktu pengerjaan setiap soal adalah **180 detik (3 menit)**.
2. Permainan berisi **5 tim**.
3. Tim dinyatakan kalah jika **uang tim tersebut habis**.
4. Permainan berhenti jika **pengguna menghentikan permainan secara manual** atau **hanya tersisa 1 tim** setelah tim lain kalah sesuai aturan nomor 3.
5. Setiap tim memiliki **5 jatah beli normal** yang terpisah dari **10 skip**. Pada properti kosong, beli normal memakai jatah beli normal; skip berarti tidak membeli dan memakai skip. Pada properti lawan, membayar sewa normal memakai skip. Soal baru muncul setelah tim memilih mengerjakannya.
6. Soal yang sama hanya boleh diulang untuk tim yang sama setelah seluruh bank soal pernah dikerjakan tim tersebut, dengan **minimal 7 soal lain di antara dua kemunculan soal yang sama**. Soal yang sama boleh diberikan kepada tim berbeda.
7. Skip habis: pada properti kosong **wajib membeli**, menggunakan jatah beli normal jika tersedia atau menjawab soal; pada properti lawan **wajib menjawab soal sewa**. Jika jatah beli normal dan skip sama-sama habis, pembelian wajib melalui soal.

## Detail berdasarkan jawaban pengguna

### Giliran dan skip

- Setelah aksi selesai, guru harus menekan tombol **Lanjut** untuk berpindah giliran.
- Setiap tim memiliki dua jatah untuk seluruh sesi: **5 beli normal** dan **10 skip**, dihitung terpisah.
- Pada properti kosong, tersedia tiga pilihan: **beli harga normal** (mengurangi jatah beli normal), **kerjakan soal**, atau **skip/tidak membeli** (tanpa pembayaran, mengurangi skip).
- Jatah beli normal habis: pembelian harus melalui soal, tetapi tim masih boleh tidak membeli jika skip tersedia.
- Skip habis: tim wajib membeli. Beli normal tetap boleh jika jatah beli normal tersedia; jika kedua jatah habis, tim wajib membeli melalui soal.
- Pada properti lawan, tersedia dua pilihan: **bayar sewa normal** (mengurangi skip) atau **kerjakan soal**. Sewa tidak dapat dilewati. Skip habis berarti wajib menjawab soal sewa, meskipun jatah beli normal masih tersedia.
- Menjawab soal tidak mengurangi jatah beli normal maupun skip. Kedua jatah tidak diisi ulang saat melewati START atau berganti putaran.
- Setelah menjawab soal pembelian, tim **tidak boleh membatalkan pembelian**.
- Soal disembunyikan sampai tim memilih mengerjakan soal. Tidak ada kesempatan memperbaiki jawaban.
- Jawaban benar: harga pembelian atau sewa menjadi **50% dari harga normal**. Jawaban salah: pembelian maupun sewa menjadi **125% dari harga normal**.
- Waktu habis tetap diperlakukan sebagai jawaban salah: beli maupun sewa 125%, melanjutkan ketentuan waktu habis yang sudah disetujui.
- Ketentuan ini menggantikan revisi sebelumnya tentang transaksi normal tanpa jatah tersendiri, sewa salah 100%, dan kewajiban menjawab soal pembelian hanya karena skip habis.

### Keuangan dan kekalahan

- Pengguna menyerahkan penentuan modal dan bonus kepada pengembang, dengan permintaan agar keduanya tidak terlalu besar.
- Keputusan pengembang: modal awal **Rp1.500.000 per tim**, bonus melewati START **Rp100.000**. Dalam satuan kode lama: 1500K dan 100K.
- Tim langsung kalah jika saldo menjadi **Rp0** atau tagihan melebihi saldo.
- Jika tim kalah karena sewa, sisa saldonya dibayarkan kepada pemilik properti. Seluruh properti tim yang kalah kembali tersedia untuk dibeli.
- Rumus harga properti dan sewa dasar **30% harga properti** tetap dipakai. Nama kecamatan mengikuti daftar terbaru; harga mengikuti urutan properti pada papan. Kartu diganti dengan 25 kartu dari pengguna; lihat [GAME_CONTENT.md](GAME_CONTENT.md).

### Soal dan waktu

- Materi tetap **SPLDV dan SPLTV**, tingkat kesulitan **mudah–menengah**, proporsi **50:50**.
- Bank berisi **80 soal berbeda: 40 SPLDV dan 40 SPLTV**.
- Riwayat soal harus dicatat per tim. Pengulangan hanya boleh setelah seluruh soal sudah pernah dikerjakan oleh tim tersebut.
- Pengulangan harus dipisahkan oleh **minimal 7 soal lain** untuk tim yang sama. Soal yang sama boleh muncul pada tim berbeda.
- Timer **180 detik** dimulai ketika soal muncul.
- Guru memerlukan tombol jeda yang menghentikan timer.
- Saat halaman dimuat ulang ketika timer berjalan, waktu tetap berkurang dan permainan harus dapat dilanjutkan dari kondisi tersimpan, termasuk soal aktif. Jika dimuat ulang saat jeda, permainan tetap dijeda.

### Papan, hasil, dan kontrol guru

- Papan tetap **30 petak: 25 kecamatan, 4 Kesempatan, dan START**. Urutan 25 kecamatan persis mengikuti daftar terbaru pengguna, dimulai dari Cileungsi dan diakhiri Parung Panjang. Daftar lengkap tersimpan di [GAME_CONTENT.md](GAME_CONTENT.md#urutan-25-kecamatan).
- Revisi terbaru menggantikan 10 kartu lama dengan **25 kartu Kesempatan**: nomor 1–10 Bencana dan lingkungan, 11–17 Sosial dan kehidupan sehari-hari, 18–25 Ekonomi, transportasi dan pemerintahan. Judul, deskripsi, dan nominal mengikuti pengguna. Lihat [GAME_CONTENT.md](GAME_CONTENT.md#25-kartu-kesempatan).
- Undian memilih satu dari 25 kartu dengan peluang sama; pengulangan kartu diperbolehkan. Pembatasan pengulangan soal matematika tidak berlaku untuk kartu Kesempatan.
- Permainan berhenti saat guru menghentikannya atau tersisa satu tim aktif.
- Peringkat diurutkan berdasarkan **saldo terbesar**, lalu jika saldo sama berdasarkan **jumlah jawaban benar terbanyak**. Jika keduanya sama, tim memperoleh **peringkat yang sama**.
- Nilai akhir akademik adalah **persentase jawaban benar dari seluruh soal yang dikerjakan**: jumlah benar / jumlah soal dikerjakan × 100%. Waktu habis dihitung salah. Skip tidak dihitung sebagai soal yang dikerjakan.
- Guru mengoperasikan permainan dan memerlukan kontrol untuk melihat kunci jika diperlukan, menjeda, mengubah saldo, dan menghentikan permainan.

### Perangkat, data, dan tampilan

- Permainan dijalankan pada **1 PC**, dengan layar dibagikan melalui proyektor.
- Game harus sepenuhnya dapat dimainkan **tanpa koneksi internet**, termasuk aset yang dibutuhkan untuk menjalankannya.
- Data yang wajib dicatat: **soal dan jawaban, sisa skip, sisa jatah beli normal, saldo, serta nilai akhir**. Dua jatah ditampilkan di klasemen, rekap, dan ekspor CSV; pemulihannya tercakup dalam cadangan JSON.
- Tampilan dibuat lebih menarik dan mencolok untuk **Gen Z**, dengan keterbacaan pada proyektor sebagai pertimbangan perangkat.
- Perubahan lanjutan: judul permainan **SPLDV SPLTV Monopoly**. Tampilan utama PC menggunakan kanvas **16:9** yang mengikuti lebar dan tinggi ruang browser agar tidak memerlukan scroll halaman. Riwayat tersedia lewat dialog; panel lima tim berjajar di bawah papan dan aksi. Lihat [README.md](README.md) untuk detail penggunaan.
- Penyempurnaan berdasarkan tangkapan layar pengguna: tulisan petak diperkecil agar nama tidak terpotong per huruf, bidak berupa ikon orang berwarna dengan nomor tim dan ukuran lebih besar, serta urutan animasi **dadu berputar → hasil dadu muncul → bidak melompat petak demi petak**. Aksi giliran dikunci selama animasi; guru dapat menjedanya. Refresh saat animasi melanjutkan pada petak tujuan tersimpan tanpa mengundi ulang.

## Status klarifikasi

Delapan klarifikasi lanjutan telah disetujui pengguna dan dimasukkan ke aturan di atas. Catatan persetujuan tersedia di [GAME_QUESTIONS.md](GAME_QUESTIONS.md#klarifikasi-lanjutan-dan-persetujuan).

Pengguna telah memberikan instruksi lanjutan untuk membuat dan memodifikasi program. Implementasi tersedia dalam HTML mandiri; lihat [README.md](README.md) untuk penggunaan dan batas verifikasi.

# SPLDV SPLTV Monopoly

## Mulai bermain

1. Buka **[Monopoli_Matematika_Bogor_30_Petak_V6.html](Monopoli_Matematika_Bogor_30_Petak_V6.html)** dengan Chrome atau Edge. Nama file lama dipertahankan; isinya sudah versi baru.
2. File HTML ini sudah mandiri: CSS, JavaScript, dan 80 soal tertanam di dalamnya. Tidak memerlukan internet, instalasi, atau server.
3. Gunakan **Kontrol guru** untuk mengganti nama 5 tim. Modal awal setiap tim Rp1.500.000.
4. Gunakan tombol layar penuh atau F11, lalu bagikan layar ke proyektor.
5. Tekan **Lempar dadu**, selesaikan aksi, kemudian tekan **Lanjut ke tim berikutnya**.

Pada layar PC dengan lebar ruang browser minimal 900 piksel, game menggunakan kanvas **16:9** yang menyesuaikan lebar dan tinggi ruang browser. Papan dan aksi berada berdampingan, lima tim berjajar di bawah, dan riwayat dibuka melalui tombol **Riwayat**. Halaman utama tidak perlu digulir. Dialog panjang seperti bank soal dan kontrol guru tetap dapat digulir di dalam dialog. Layar yang lebih sempit menggunakan tata letak responsif vertikal.

## Kontrol penting

- **Kerjakan soal** membuka soal dan memulai timer 180 detik. Jawaban dinilai sekali dan transaksi langsung dijalankan.
- **Lempar dadu** menampilkan kubus dadu 3D yang berputar, memperlihatkan hasil, lalu menggerakkan bidak orang petak demi petak dengan lompatan. Setiap bidak memakai warna dan nomor tim. Tombol aksi dikunci sampai animasi selesai; Jeda juga menghentikan urutan animasi.
- Setiap tim memiliki **5 jatah beli normal** dan **10 skip**, terpisah dan berlaku untuk seluruh sesi.
- Properti kosong: **beli normal** memakai 1 jatah beli normal; **skip (tidak membeli)** memakai 1 skip tanpa pembayaran; atau **kerjakan soal** tanpa memakai jatah mana pun. Skip habis berarti wajib membeli: boleh normal jika jatahnya tersedia, atau melalui soal. Jika beli normal habis tetapi skip tersedia, tim masih boleh tidak membeli.
- Properti lawan: **bayar sewa normal** memakai 1 skip, atau **kerjakan soal** tanpa memakai skip. Skip habis berarti wajib menjawab soal sewa. Sewa tidak dapat dilewati.
- Pembelian maupun sewa melalui soal: **50% jika benar**, **125% jika salah atau waktu habis**. Jika kedua jatah habis, pembelian juga wajib melalui soal.
- **Jeda** menghentikan permainan dan timer. Menutup dialog atau membuka panel guru tidak menjeda timer.
- **Kontrol guru** menyediakan kunci, bank soal, daftar kartu, ubah saldo, hentikan permainan, game baru, serta cadangan JSON.
- **Rekap & nilai** menyediakan tabel peringkat, nilai, serta ekspor CSV nilai dan riwayat soal/jawaban.
- Panel guru dan kunci tetap terlihat pada layar yang dibagikan. Hentikan berbagi layar jika kunci perlu dirahasiakan dari siswa.

## Menyimpan dan melanjutkan

Jatah skip terbaru adalah **10 per tim**, sedangkan jatah beli normal tetap **5**. Saat memuat simpanan versi 8 yang masih memakai batas 5 skip, sisa skip ditambah 5 **sekali saja**, sehingga pemakaian sebelumnya tetap dihitung. Contoh: sisa 2 dari 5 menjadi 7 dari 10; refresh berikutnya tidak menambah lagi. Lihat [GAME_RULES.md](GAME_RULES.md#giliran-dan-skip).

Progres otomatis disimpan pada browser yang sama, termasuk soal aktif, isian jawaban, timer, pemilik properti, dan jatah skip. Jika halaman dimuat ulang saat timer berjalan, waktu tetap berkurang; jika waktu telah habis, jawaban dihitung salah dan transaksi diselesaikan. Jika sedang dijeda, sesi tetap dijeda setelah dimuat ulang.

Hasil lempar dadu dan petak tujuan disimpan sebelum animasi dimulai. Jika halaman dimuat ulang saat dadu berputar atau bidak melompat, sesi langsung dilanjutkan pada petak tujuan yang sama tanpa mengundi ulang, menggandakan bonus START, atau mengulangi transaksi.

Gunakan **satu tab**, browser yang sama, dan lokasi file yang sama untuk melanjutkan. Penyimpanan lokal file HTML bergantung pada browser. Jika browser menolak penyimpanan, game menampilkan peringatan; gunakan cadangan JSON. Mode privat atau penghapusan data browser dapat menghapus progres. Unduh cadangan sebelum memindahkan file, mengganti perangkat, atau memulai game baru.

Cadangan JSON bisa dipulihkan melalui Kontrol guru. Timer yang berjalan di cadangan mengikuti waktu sebenarnya; jeda dahulu jika ingin menyimpan sesi tanpa mengurangi waktu. Simpanan versi lama tidak dimigrasikan; kunci penyimpanan lama tetap dipertahankan. File asli sebelum perubahan tersedia di [cadangan HTML V6](Monopoli_Matematika_Bogor_30_Petak_V6.backup.html).

**Revisi papan dan kartu:** daftar terbaru memakai 25 kecamatan baru/diurutkan ulang serta 25 kartu. Sesi baru memakai penyimpanan versi 8. Simpanan versi 7 tetap tersimpan di browser, tetapi tidak otomatis dimuat dan cadangan versi 7 ditolak dengan penjelasan karena indeks propertinya merujuk ke daftar yang berbeda. Sesi versi 8 tetap bisa dilanjutkan setelah refresh seperti biasa.

**Revisi dua jatah:** simpanan versi 8 sebelum penambahan jatah beli normal tetap dapat dilanjutkan. Setiap tim mendapat 5 jatah beli normal saat pertama kali simpanan itu dimuat pada revisi ini. Saldo, sisa skip, kepemilikan, dan hasil transaksi lama dipertahankan. Jatah baru tidak diisi ulang pada refresh berikutnya. Transaksi yang sudah selesai tidak dihitung ulang; soal yang belum selesai mengikuti aturan baru.

## Aturan dan keputusan

- [GAME_RULES.md](GAME_RULES.md): aturan terkini yang diterapkan.
- [GAME_QUESTIONS.md](GAME_QUESTIONS.md): pertanyaan, jawaban, dan persetujuan pengguna.
- [GAME_CONTENT.md](GAME_CONTENT.md): urutan lengkap 25 kecamatan serta judul, deskripsi, kategori, dan nominal 25 kartu Kesempatan.
- Proporsi soal diterapkan bergantian SPLDV/SPLTV per tim, sehingga satu siklus 80 soal berisi 40 soal tiap jenis.
- Tim yang belum menjawab soal ditampilkan bernilai 0% dengan jumlah soal 0. Skip tidak masuk penyebut nilai.
- Soal yang belum dikirim saat guru menghentikan sesi tidak diberi nilai. Kondisi soal dan inputnya tetap berada dalam cadangan sesi; CSV riwayat berisi soal yang sudah dinilai.
- Tim yang kalah tidak dapat dihidupkan kembali dengan edit saldo. Peringkat mengikuti saldo lalu jumlah benar, dengan pola seri 1, 1, 3 bila dua tim berbagi peringkat pertama.

## Untuk pengembangan

Sumber yang mudah diedit:

- `index.html`: struktur halaman pengembangan.
- `game.css`: tampilan responsif tanpa aset jaringan.
- `game-screen.css`: tata letak PC 16:9 yang mengikuti ukuran ruang browser.
- `game-engine.js`: aturan, transaksi, bank soal, timer, dan validasi simpanan.
- `game-ui.js`: interaksi, kontrol guru, dan ekspor.

Setelah mengedit sumber, buat ulang HTML mandiri:

```powershell
node build-game.js
```

Jalankan pengujian:

```powershell
node --test game-engine.test.js game-ui.test.js
```

Hasil verifikasi pada 3 November 2026: **51 pengujian lulus**, mencakup keunikan dan solusi tunggal 80 soal, perhitungan transaksi, kekalahan, skip, pengulangan, pemulihan timer, jeda, seri, simulasi sesi, integrasi event/markup dengan DOM tiruan, urutan dadu–hasil–langkah, penguncian klik saat animasi, jeda animasi, refresh saat animasi, revisi skip tidak membeli, dua jatah independen, sewa normal memakai skip, sewa salah/waktu habis 125%, migrasi jatah simpanan, ketepatan urutan 25 kecamatan, nominal/undian/pemulihan seluruh 25 kartu, penolakan simpanan papan lama, dan bundel tanpa sumber jaringan.

Pengujian integrasi menggunakan DOM tiruan, bukan browser nyata. Pemeriksaan visual langsung belum dilakukan karena kebijakan browser pengujian menolak membuka file lokal. Tata letak dan alur interaksi pada proyektor perlu dicoba langsung saat file dibuka.

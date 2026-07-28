# Product Requirement Document (PRD) & Documentation: Yastar SaaS
**Platform Kalkulator Finansial & Simulasi Kelayakan Bisnis Jasa (Barbershop, Salon, Spa, Klinik Kecantikan)**

---

## 1. Ringkasan Eksekutif & Visi Produk

**Yastar** adalah platform Micro-SaaS berbasis web yang dirancang khusus untuk pemilik usaha bisnis jasa berbasis waktu dan tenaga kerja (seperti *Barbershop*, *Salon Kecantikan*, *Spa & Wellness*, serta *Klinik Estetika*). 

Banyak pemilik usaha jasa kesulitan menghitung target finansial secara efisien: mereka sering menetapkan target omset tanpa memperhitungkan batas kapasitas fisik karyawan, komisi, biaya tetap, dan utilisasi harian. **Yastar** menyelesaikan masalah ini dengan menyediakan suite kalkulator finansial interaktif yang dapat secara instan menghitung target laba, kelayakan promo bundling, komisi berjenjang, hingga benchmark industri lokal.

---

## 2. Struktur Role & Akses Pengguna (*Current Architecture*)

Sistem Yastar menerapkan kontrol akses berbasis role (**Role-Based Access Control / RBAC**) yang terbagi menjadi 3 tingkat pengguna utama:

```
+-----------------------------------------------------------------------------------+
|                                  ROLES SISTEM YASTAR                               |
+--------------------------+--------------------------+-----------------------------+
| 1. userFree (Gratis)     | 2. userPremium (Berbayar)| 3. admin (Sistem SaaS)      |
+--------------------------+--------------------------+-----------------------------+
| - Akses Kalkulator dasar | - Akses Paket Starter &  | - Portal Pengelola Admin    |
| - Maksimal 2 Skenario    |   Professional           | - Manajemen User & Paket    |
| - Tanpa Fitur Ekspor     | - Limit Skenario Lebih   | - Approval Pembayaran       |
| - Fitur Dasar            |   Tinggi / Unlimited     |   Manual                    |
|                          | - Fitur Ekspor Laporan   | - Atur Durasi & Kuota Paket |
|                          | - Akses Benchmark        | - Monitoring Statistik      |
+--------------------------+--------------------------+-----------------------------+
```

### A. Role 1: `userFree` (Pengguna Gratis)
* **Tujuan**: *Lead magnet* dan uji coba langsung fitur utama bagi calon pengguna.
* **Fitur & Batasan**:
  * Akses penuh ke Kalkulator Target Mundur & HPP Dasar.
  * Maksimal penyimpanan **2 Skenario**.
  * Tidak dapat mengekspor laporan (PDF/Excel).
  * Menampilkan *badge* paket "Free" di portal.
  * Terdapat ajakan upgrade (*CTA Upgrade*) saat kuota skenario penuh atau saat mencoba fitur premium.

### B. Role 2: `userPremium` (Pengguna Berbayar — Tier Starter & Professional)
* **Tujuan**: Untuk pemilik bisnis aktif yang membutuhkan penyimpanan skenario tak terbatas dan dokumentasi laporan untuk tim / investor.
* **Tipe Paket**:
  1. **Tier Starter**: Limit hingga 15 skenario, akses ekspor PDF/Excel, akses modul Bundling, Komisi Staf, & BEP Usaha.
  2. **Tier Professional**: Skenario *unlimited*, akses ekspor laporan lengkap, akses indikator Benchmark Industri, Kelayakan Cabang Baru, & Simulasi Pinjaman Modal.
* **Fitur & Batasan**:
  * Bebas membuat, menyunting, dan menduplikasi skenario finansial.
  * Fitur Ekspor Laporan Skenario (PDF & Spreadsheet Excel).
  * Manajemen Profil Bisnis & Riwayat Paket.
  * Pemberitahuan masa aktif paket (*expiration date*).

### C. Role 3: `admin` (Administrator Sistem SaaS)
* **Tujuan**: Pengelola utama operasional micro-SaaS Yastar.
* **Fitur & Hak Akses**:
  * Portal terpisah di `/admin/login` & `/admin/dashboard`.
  * **Manajemen Akun Pengguna**: Melihat daftar user, mengubah tier paket (`free`, `starter`, `professional`), mengatur tanggal mulai & kadaluarsa paket secara manual.
  * **Proses Pembayaran Manual**: Meninjau dan menyetujui (*approve/reject*) permohonan upgrade/perpanjangan paket dari pengguna yang melakukan pembayaran manual via Transfer Bank / WhatsApp.
  * **Atur Batas Skenario & Fitur**: Mengatur kuota khusus per akun secara kustom (*override scenario limits*).
  * **Monitoring & Analisis**: Ringkasan total pendaftaran, jumlah skenario aktif, dan pendapatan estimasi.

---

## 3. Fitur Utama & Suite Simulasi (*Implemented As-Is Features*)

### A. Collapsible Navigation Sidebar (`/user-portal/*`)
* **Perilaku Default**: **Tertutup (*Collapsed*)** secara otomatis saat pertama kali dibuka di browser desktop untuk memberikan area kerja kalkulator yang maksimal dan bersih.
* **Fitur Antarmuka**:
  * **Tombol Toggle**: Tombol buka/tutup sidebar berada di header atas dan header sidebar (`PanelLeftClose` / `PanelLeftOpen`).
  * **No-Scrollbar**: Menggunakan utilitas CSS kustom `.no-scrollbar` sehingga daftar menu dapat di-scroll dengan lancar tanpa menampilkan batang *scroll* visual yang mengganggu.
  * **Tooltip Interaktif**: Saat sidebar dalam keadaan tertutup, mengarahkan kursor (*hover*) ke ikon menu akan memunculkan *tooltip* penjelasan nama menu.
  * **Preservasi State**: Pilihan kondisi tertutup/terbuka disimpan di `localStorage` (`yastar_sidebar_collapsed`).

### B. Dashboard Overview Pengguna (`/user-portal/beranda`)
* Ringkasan status paket aktif (`Free`, `Starter`, atau `Professional`).
* Indikator statistik kuota skenario yang telah digunakan.
* Kartu navigasi interaktif ke seluruh modul simulasi finansial.

### C. Engine Kalkulator Target Mundur (`/user-portal/target-mundur`)
* **Input Parameter**: Jenis Bisnis, Jumlah Karyawan, Jam Kerja, Target Laba Bersih, Biaya Tetap, Model Komisi, Daftar Layanan.
* **Hasil Kalkulasi**: Total Klien per Hari/Bulan per Karyawan, Persentase Utilisasi, Margin Laba, dan Alert Kelayakan (🟢 Realistic, 🟡 Warning, 🔴 High Risk).

### D. Kalkulator HPP & COGS Jasa (`/user-portal/hpp`) [Implemented]
* Perhitungan HPP bahan baku/consumables per layanan.
* Estimasi biaya tenaga kerja langsung & overhead operasional.

### E. Simulasi Bundling & Diskon Promo (`/user-portal/bundling`) [Implemented]
* Pengujian skema paket combo (misal: "Potong + Creambath").
* Analisis margin laba sebelum vs sesudah diskon.
* Perhitungan rasio volume penjuakan promo yang dibutuhkan.

### F. Simulasi Komisi Staf Berjenjang (`/user-portal/komisi`) [Implemented]
* Perancangan skema insentif bertingkat (*tiered commission*) berdasarkan pencapaian target jumlah klien.
* Menghitung total *Take Home Pay* staf vs kontribusi bersih bagi pemilik usaha.

### G. Benchmark Industri Jasa Lokal (`/user-portal/benchmark`) [Implemented]
* Pembanding rasio keuangan usaha (Barbershop, Salon, Spa, Klinik Estetika) terhadap standar industri Indonesia.
* Analisis perbandingan Margin Laba Bersih & Rasio Beban Gaji vs Omset.

### I. AI Business Advisor (Gemini AI) (`/user-portal/ai-advisor`) [Implemented]
* **Fitur Utama**: Konsultan bisnis virtual cerdas berbasis Gemini AI untuk menganalisis data simulasi target laba, HPP, bundling promo, dan komisi staf.
* **Fitur Marketing Generator**: Pembuat otomatis draf teks promosi ramah untuk WhatsApp blast pelanggan, caption Instagram lengkap dengan hashtag, dan headline poster promo.
* **Integrasi Panel**: Dapat diakses langsung melalui modul khusus `/user-portal/ai-advisor` maupun widget *side-panel* di kalkulator finansial.

### J. Pengingat Masa Aktif Paket & Template WhatsApp 1-Klik (`/user-portal/beranda`) [Implemented]
* **Fitur Banner Notifikasi**: Menampilkan *Renewal Banner* otomatis di dashboard saat paket tersisa <= 7 hari atau saat akun gratis.
* **WhatsApp 1-Klik**: Tombol konfirmasi perpanjangan/upgrade paket langsung terhubung ke WhatsApp Admin dengan draf pesan siap kirim (Detail Usaha, Email, & Paket).

### K. Simulasi Pendukung Lainnya
* **Titik Impas Usaha (`/user-portal/bep-usaha`)**: BEP unit & rupiah.
* **Uji Harga Jual (`/user-portal/harga-jual`)**: Penentuan harga dari target margin/markup.
* **Estimasi Pajak UMKM (`/user-portal/pajak`)**: PPh Final 0,5% UMKM.
* **Kelayakan Cabang Baru (`/user-portal/ekspansi`)**: Proyeksi ROI & Payback Period.
* **Simulasi Pinjaman Modal (`/user-portal/pinjaman`)**: Cicilan & total beban bunga.

---

## 4. Alur Kerja Sistem Pembayaran Manual (Manual Payment Workflow)

```
[User Portal]                                             [Admin Portal]
  |                                                             |
  +---> 1. Klik Upgrade Paket (Starter/Professional)            |
  |                                                             |
  +---> 2. Tampil Rincian Rekening Bank / QRIS                  |
  |                                                             |
  +---> 3. User melakukan Transfer & Kirim Konfirmasi WhatsApp  |
  |     / Submit Formulir Konfirmasi                            |
  |                                                             |
  |                                 4. Admin Terima Permintaan -+
  |                                    di Dashboard Admin       |
  |                                                             |
  |                                 5. Admin Verifikasi Mutasi -+
  |                                    & Klik "Aktifkan Paket"  |
  |                                                             |
  +<--- 6. Status Akun User Otomatis Berubah ke Premium <-------+
```

---

## 5. Status Implementation & Roadmap Pengembangan SaaS

Semua modul finansial, AI Business Advisor, dan sistem notifikasi perpanjangan telah **diimplementasikan sepenuhnya dan teruji tanpa error**.

### ✅ Status Modul & Fitur yang Sudah Aktif (As-Is):
1. **Fitur Collapsible Sidebar** (Auto-close default + no-scrollbar)
2. **Kalkulator Target Mundur Profit → Klien**
3. **Kalkulator HPP & COGS Jasa**
4. **Simulasi Bundling & Diskon Promo**
5. **Simulasi Komisi Staf Berjenjang**
6. **Benchmark Industri Jasa Lokal**
7. **Gemini AI Business Advisor & Announcement Generator**
8. **Pengingat Masa Aktif Paket & Renewal WhatsApp 1-Klik**
9. **Role Access Control (`userFree`, `userPremium`, `admin`)**
10. **Alur Pembayaran Manual & Portal Approval Admin**

### 🚀 Roadmap Fitur SaaS Tahap Berikutnya (Next Milestones):
1. **Integrasi Ekspor Multi-Skenario Perbandingan**: Memungkinkan perbandingan side-by-side 3 skenario berbeda sekaligus dalam 1 lembar PDF.
2. **Multi-Cabang & Konsolidasi Keuangan**: Agregasi proyeksi laba dari 2 atau lebih cabang usaha jasa bagi pengguna paket Professional.

---

## 6. Spesifikasi Teknis & Lingkungan (*Technical Stack*)

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons, Shadcn UI components.
* **Backend**: Node.js, Express.js.
* **Database Layer**: PostgreSQL dengan Drizzle ORM + In-Memory Fallback Engine.
* **Sistem Autentikasi**: Custom Token/Session Auth (Owner & Admin Role Separation).
* **Ekspor Engine**: `jsPDF` / `html2canvas` & `xlsx` spreadsheet generator.

---

## 7. Kesimpulan

Dokumen PRD ini telah diperbarui untuk mencerminkan status aplikasi **Yastar SaaS saat ini**, termasuk implementasi modul baru (Bundling & Promo, Komisi Staf Berjenjang, dan Benchmark Industri Lokal), sidebar tertutup default tanpa scrollbar visual, serta sistem kontrol 3-role (`userFree`, `userPremium`, `admin`) dengan alur pembayaran manual yang handal.

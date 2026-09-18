# Prototype Library — PRD

**Status:** Draft
**Date:** 18 September 2026

## Problem
Tim internal sering membuat prototype HTML untuk UI/UX testing, tapi saat ini tidak ada tempat terpusat untuk menyimpan, mengelola, dan mengirim link testing ke user/tester. Akibatnya link testing sering hilang, tercecer di berbagai chat/email, dan riwayat revisi (versi mana yang sudah diuji, apa hasilnya, apa yang berubah) tidak terdokumentasi dengan rapi. Ini menyulitkan tracking improvement dari waktu ke waktu.

## Goals
- Menyediakan satu portal terpusat untuk menyimpan semua prototype UI/UX testing
- Mempermudah tim internal membuat, mengelola, dan mempublikasikan project testing baru
- Memberikan link testing yang stabil dan konsisten ke tester, tanpa perlu ganti link tiap ada revisi
- Mendokumentasikan riwayat revisi dan hasil testing per versi secara rapi

## Users
- **Internal team (primary)**: tim yang membuat prototype HTML, membuat project baru, upload versi, mengelola status publish, dan mencatat hasil testing
- **Tester (secondary)**: user internal yang mengakses link testing untuk mencoba prototype yang sedang aktif/published — tidak memiliki akses ke fitur manajemen

## User Stories
- Sebagai tim internal, saya ingin membuat folder project baru dengan slug unik, supaya tiap project testing punya tempat dan link yang konsisten.
- Sebagai tim internal, saya ingin memilih jenis test (misal Usability Test, A/B Test) saat membuat project, supaya portal bisa dikategorikan dan difilter.
- Sebagai tim internal, saya ingin upload HTML prototype ke suatu project, supaya tester bisa langsung mencobanya via portal.
- Sebagai tim internal, saya ingin menambahkan revisi baru (versi berikutnya) lengkap dengan changelog, supaya riwayat perubahan tercatat.
- Sebagai tim internal, saya ingin memilih versi mana yang "published" (aktif untuk tester), supaya saya bisa menyiapkan revisi tanpa langsung terlihat tester.
- Sebagai tim internal, saya ingin mencatat hasil/insight testing per versi, supaya progres improvement bisa ditelusuri dari waktu ke waktu.
- Sebagai tester, saya ingin membuka satu link tetap (slug project), dan otomatis melihat versi prototype yang sedang aktif, tanpa perlu tahu detail versi.

## Scope

### In Scope
- Create project baru: nama, deskripsi, jenis test, slug otomatis/unik
- Upload HTML (+ assets) sebagai versi baru dalam project (v1, v2, dst)
- Toggle "publish" — menentukan versi mana yang aktif dilihat tester (hanya 1 versi aktif per project)
- Changelog per versi (catatan perubahan dari versi sebelumnya)
- Catatan hasil testing per versi (test notes/insight)
- Halaman listing seluruh project (untuk tim internal), dengan info status & jenis test
- Halaman detail project: timeline seluruh versi + changelog + test notes
- Halaman akses tester: render HTML versi published via iframe, berdasarkan slug
- Struktur folder per project di filesystem, direferensikan lewat metadata di database

### Out of Scope (v2 / nanti)
- Sistem autentikasi/login berlapis (role-based access) — v1 asumsi seluruh akses masih dalam lingkungan internal tepercaya
- Notifikasi otomatis ke tester saat ada versi baru di-publish
- Analytics/heatmap interaksi tester di dalam prototype
- Kolaborasi multi-editor real-time pada satu project
- Integrasi langsung ke tools eksternal (Figma, survey tool, dsb) — untuk sekarang cukup field link manual

## Requirements

**Project & Versioning**
- R1: Sistem dapat membuat project baru dengan slug unik yang di-generate otomatis dari nama project
- R2: Sistem dapat menyimpan multiple versi HTML dalam satu project tanpa menimpa versi sebelumnya
- R3: Sistem hanya mengizinkan satu versi berstatus "published" per project pada satu waktu
- R4: Mengubah status publish ke versi lain otomatis meng-unpublish versi yang sebelumnya aktif

**Konten & Dokumentasi**
- R5: Tiap versi dapat memiliki catatan changelog (teks bebas)
- R6: Tiap versi dapat memiliki catatan hasil testing (teks bebas)
- R7: Halaman detail project menampilkan seluruh riwayat versi secara kronologis (timeline)

**Akses**
- R8: Tester mengakses prototype melalui URL berbasis slug project, dan otomatis diarahkan ke versi published
- R9: HTML prototype dirender melalui iframe (sandboxed) di dalam portal, bukan redirect keluar
- R10: Halaman manajemen (create/upload/publish/timeline) hanya untuk tim internal; tidak diekspos ke tester

**Non-fungsional**
- R11: Struktur folder & metadata harus cukup ringan untuk tim kecil (tidak butuh infrastruktur database kompleks di v1)
- R12: Sistem harus tetap dapat diakses/dipakai tim tanpa training khusus (UI sederhana, sesuai alur create → upload → publish)

## Success Metrics
- **Primary**: Semua project testing terdokumentasi rapi di portal — target 0 link testing yang hilang atau tercecer di luar sistem (dibandingkan kondisi sebelumnya yang tersebar di chat/email)
- **Sekunder (opsional, untuk dipantau)**: Jumlah project aktif yang dibuat tim per bulan, sebagai indikator adopsi

## Risks & Open Questions
- Wewenang membuat project baru: seluruh user internal dapat membuat project baru tanpa pembedaan role (tidak ada role-based access di v1)
- Retensi data: project lama (archived) disimpan permanen, tidak dihapus otomatis
- Format upload: menggunakan konsep single HTML (satu file HTML self-contained per versi, tanpa folder assets terpisah), sehingga tidak perlu menentukan batas ukuran folder assets
- *Asumsi: v1 berjalan di infrastruktur internal (filesystem + SQLite), tanpa kebutuhan scaling besar, sesuai diskusi sebelumnya*

## Timeline
- **Target MVP**: 1–2 minggu
- Milestone disarankan:
  - Minggu 1: struktur data (project, versi), alur create project + upload HTML, render iframe via slug
  - Minggu 2: fitur publish/unpublish per versi, changelog & test notes, halaman timeline/listing untuk tim internal
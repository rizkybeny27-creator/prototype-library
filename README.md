# Prototype Library

Portal internal untuk menyimpan, mengelola, dan menguji prototype HTML (UI/UX testing). Dibangun dengan Next.js 16 (App Router) + TypeScript + Supabase (Postgres + Storage).

## Menjalankan

1. Buat project gratis di [supabase.com](https://supabase.com).
2. Di Supabase SQL editor, jalankan isi `supabase/schema.sql` (tabel `projects`/`versions`/`feedback`, view `project_overview`, dan fungsi `publish_version`).
3. Salin `.env.example` ke `.env.local` dan isi:
   - `SUPABASE_URL` — URL project (mis. `https://abc123.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` — *service role* key (Settings → API). Hanya dipakai server-side (amankan; jangan diekspos ke client).
   - `SUPABASE_STORAGE_BUCKET` — opsional, default `prototype-html`. Bucket dibuat otomatis saat upload pertama.
   - `ADMIN_ACCESS_TOKEN` — rahasia bersama (generate dengan `openssl rand -hex 32`) untuk login admin.
4. Jalankan app:

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

> Data awal aplikasi berasal dari Supabase (bersih). Data lama yang tersimpan di `storage/` (era SQLite lokal) tidak lagi dibaca oleh aplikasi.

## Alur inti

1. Tim internal membuat project (nama → slug unik otomatis + jenis test).
2. Upload satu file HTML self-contained sebagai versi baru (`v1`, `v2`, ...) dengan changelog.
3. Sematkan versi mana yang aktif untuk tester (hanya 1 published per project).
4. Bagikan link stabil `/t/<slug>` ke tester — menampilkan versi published via iframe sandboxed + tombol feedback (modal).
5. Feedback tester (nama, divisi, skor 1–5 bintang, teks) tercatat per versi dan tampil di halaman detail versi (tab Project Preview / Feedback List), lengkap dengan ringkasan & distribusi skor.

## Struktur

```
src/
  app/            pages + API route handlers (thin)
  components/     UI (client components dengan idle/loading/success/error state)
  lib/            supabase client, api helpers, formatters, row mappers
  services/       business logic: projects, versions, feedback, files (Supabase Storage), slug/rules
  types/          interface & enum bersama
supabase/
  schema.sql      skema Postgres untuk dijalankan di Supabase SQL editor
```

## Catatan keamanan

- Aplikasi memakai `SUPABASE_SERVICE_ROLE_KEY` di sisi server (server components & API routes) sehingga RLS tidak dibutuhkan untuk saat ini. Jangan pernah membocorkan key ini ke client/browser.
- HTML prototype disimpan di Supabase Storage (bucket private) dan disajikan lewat `/r/<slug>/<label>` dengan header `nosniff` + `no-store`.
- Akses admin (halaman & API manajemen) dibatasi oleh `src/proxy.ts` (Next.js Proxy) yang membutuhkan cookie login `/login` (httpOnly + SameSite=Strict). Halaman tester (`/t/*`, `/r/*`) dan submit feedback tester tetap publik.
- Rate limit in-memory (30/menit untuk upload, 20/menit untuk feedback per IP) via `src/proxy.ts`.
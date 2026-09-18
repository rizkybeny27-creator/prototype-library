# Prototype Library

Portal internal untuk menyimpan, mengelola, dan menguji prototype HTML (UI/UX testing). Dibangun dengan Next.js 16 (App Router) + TypeScript + Supabase (Postgres + Storage).

## Menjalankan

1. Buat project gratis di [supabase.com](https://supabase.com).
2. Di Supabase SQL editor, jalankan isi `supabase/schema.sql` (tabel `projects`/`versions`/`feedback`/`profiles`, view `project_overview`, dan fungsi `publish_version`).
3. Salin `.env.example` ke `.env.local` dan isi:
   - `SUPABASE_URL` — URL project (mis. `https://abc123.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` — *service role* key (Settings → API). Hanya dipakai server-side (amankan; jangan diekspos ke client).
   - `SUPABASE_ANON_KEY` — *anon* key (Settings → API). Publik; dipakai untuk sesi login (Supabase Auth).
   - `SUPABASE_STORAGE_BUCKET` — opsional, default `prototype-html`. Bucket dibuat otomatis saat upload pertama.
4. Siapkan akun staf:
   - Buat user di Supabase Dashboard: **Authentication → Users → Add user** (email + password).
   - Tambahkan baris `profiles` agar login memakai username (bukan email), contoh:
     ```sql
     insert into profiles (id, username, email)
     values ('<user-id-dari-supabase>', 'rina', '<email-user>');
     ```
     (`username` disimpan lowercase; unik secara case-insensitive.)
5. Jalankan app:

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

## Deployment ke Vercel

1. Import repositori `rizkybeny27-creator/prototype-library` di vercel.com. Deteksi framework otomatis = **Next.js** (`framework: "nextjs"` sudah dikunci lewat `vercel.json`).
2. Tambahkan **environment variables** (nilai dari `.env.local`) di **Settings → Environment Variables**, dan centang ketiga scope: **Production, Preview, Development**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (rahasia — gunakan "Encrypted")
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_STORAGE_BUCKET` (opsional, default `prototype-html`)
3. **Clear build cache, lalu Redeploy.** Tanpa variabel tersebut aplikasi menampilkan halaman 503 "Server belum dikonfigurasi" (bukan 500) agar jelas apa yang kurang.
4. Verifikasi: buka URL deployment → harus redirect ke `/login`; isi kredensial akun staf hasil seeding.

> Catatan: jika akun Vercel mengaktifkan SSO/SAML, URL deployment hanya bisa diakses setelah masuk ke akun Vercel — ini bisa terlihat seperti "mengunduh/redirect ke vercel.com" bagi pengunjung yang belum login.

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
- Autentikasi admin memakai **Supabase Auth** (username + password). Sesi disimpan di cookie `httpOnly` + `SameSite=Strict` (`@supabase/ssr`), diperiksa oleh `src/proxy.ts` dan di-refresh otomatis. Username dipetakan ke email via tabel `profiles`.
- Halaman tester (`/t/*`, `/r/*`) dan submit feedback tester tetap publik.
- Rate limit in-memory (30/menit upload, 20/menit feedback, 10/menit login per IP) via `src/proxy.ts`.
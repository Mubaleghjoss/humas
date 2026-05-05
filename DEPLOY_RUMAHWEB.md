# Deploy HumasHub ke Rumahweb

Target:
- Domain: `humas.smaafbs.sch.id`
- Shared IP: `202.10.43.37`
- Home directory: `/home/sman5479`
- Document root domain: `/home/sman5479/public_html/web/humas`
- GitHub repo: `https://github.com/Mubaleghjoss/humas.git`

## Syarat Server

Aplikasi ini adalah Next.js SSR + Prisma + MySQL. Server harus punya fitur Node.js App/cPanel Node.js Selector.

Jika hosting hanya menyediakan PHP/static hosting tanpa Node.js App, aplikasi tidak bisa jalan hanya dengan upload file ke `public_html`.

## Environment Production

Buat file `.env` di server, jangan commit ke GitHub:

```env
DATABASE_URL="mysql://USER_DB:PASSWORD_DB@localhost:3306/NAMA_DB"
AUTH_SECRET="ISI_RANDOM_MINIMAL_32_KARAKTER"
NEXTAUTH_URL="https://humas.smaafbs.sch.id"
NODE_ENV="production"
```

## Urutan Deploy yang Benar

Di Rumahweb/cPanel, `npm` dan `npx` biasanya tidak tersedia langsung di Terminal global.
Buat Node.js App dulu, lalu aktifkan environment Node.js dari Terminal.

Jika muncul error ini:

```text
bash: npm: command not found
bash: npx: command not found
```

Artinya environment Node.js belum aktif, atau fitur Node.js App belum tersedia di paket hosting.

## Setup Node.js App di cPanel

Buka cPanel -> `Setup Node.js App`, lalu buat aplikasi:

```text
Node.js version: 20+ atau yang paling baru tersedia
Application mode: Production
Application root: public_html/web/humas
Application URL: humas.smaafbs.sch.id
Application startup file: server.js
```

Tambahkan environment variables di panel Node.js App:

```text
DATABASE_URL=mysql://USER_DB:PASSWORD_DB@localhost:3306/NAMA_DB
AUTH_SECRET=ISI_RANDOM_MINIMAL_32_KARAKTER
NEXTAUTH_URL=https://humas.smaafbs.sch.id
NODE_ENV=production
```

Contoh jika database cPanel bernama `sman5479_humas`:

```text
DATABASE_URL=mysql://sman5479_USERDB:PASSWORD_DB@localhost:3306/sman5479_humas
```

Catatan:
- `DATABASE_URL` tidak boleh hanya `sman5479_humas`; harus format lengkap `mysql://user:password@host:port/database`.
- `AUTH_SECRET` jangan memakai placeholder `ISI_RANDOM_MINIMAL_32_KARAKTER`; isi string random panjang.
- Jika password database mengandung karakter khusus seperti `@`, `#`, `%`, `/`, encode dulu di URL.

Setelah app dibuat, cPanel biasanya menampilkan perintah untuk masuk ke virtual environment Node.js, bentuknya mirip:

```bash
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate
cd /home/sman5479/public_html/web/humas
```

Angka `20` bisa berbeda sesuai versi Node.js yang dipilih. Pakai perintah yang ditampilkan oleh cPanel.

Jika tidak terlihat, coba cari manual:

```bash
find /home/sman5479/nodevenv -path "*/public_html/web/humas/*/bin/activate" -print
```

Lalu aktifkan file `activate` yang ditemukan:

```bash
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate
```

Cek setelah aktif:

```bash
node -v
npm -v
npx -v
```

Kalau ketiganya muncul versi, baru lanjut ke install dan build.

## Deploy Pertama via cPanel Terminal

Masuk ke Terminal cPanel/SSH:

```bash
cd /home/sman5479/public_html/web

# Jika folder humas belum ada
git clone https://github.com/Mubaleghjoss/humas.git humas
cd humas
```

Jika folder `humas` sudah ada dan berisi file lama, backup dulu sebelum clone/pull.

Aktifkan Node.js environment dari cPanel:

```bash
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate
```

Install dependency dan build:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
```

Klik `Restart` pada Node.js App.

## Update Deploy Berikutnya

```bash
cd /home/sman5479/public_html/web/humas
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate
git pull
npm ci
npx prisma generate
npx prisma db push
npm run build
```

Lalu restart Node.js App dari cPanel.

## Seed User Awal

Jalankan hanya jika database masih kosong:

```bash
npm run seed
```

Setelah login pertama, langsung ganti password admin.

## Cek Setelah Deploy

```bash
curl -I https://humas.smaafbs.sch.id/login
```

Checklist:
- `/login` tampil.
- Login admin berhasil.
- Dashboard terbuka.
- Modul tasks, notes, contacts, events, content, analytics terbuka.

## Troubleshooting

- `502 Bad Gateway`: cek Node.js App sudah restart, startup file `server.js`, dan build sudah sukses.
- `npm: command not found`: buat Node.js App dulu lalu jalankan `source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate`.
- `Database error`: cek `DATABASE_URL`, database MySQL, user, dan privilege.
- `Module not found`: jalankan `npm ci` dan `npx prisma generate`.
- Build gagal karena env: pastikan `NEXTAUTH_URL=https://humas.smaafbs.sch.id` tanpa spasi.

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

## Deploy Pertama via cPanel Terminal

Masuk ke Terminal cPanel/SSH:

```bash
cd /home/sman5479/public_html/web

# Jika folder humas belum ada
git clone https://github.com/Mubaleghjoss/humas.git humas
cd humas
```

Jika folder `humas` sudah ada dan berisi file lama, backup dulu sebelum clone/pull.

Install dependency dan build:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
```

## Setup Node.js App di cPanel

Isi konfigurasi Node.js App:

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

Klik `Restart` pada Node.js App.

## Update Deploy Berikutnya

```bash
cd /home/sman5479/public_html/web/humas
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
- `Database error`: cek `DATABASE_URL`, database MySQL, user, dan privilege.
- `Module not found`: jalankan `npm ci` dan `npx prisma generate`.
- Build gagal karena env: pastikan `NEXTAUTH_URL=https://humas.smaafbs.sch.id` tanpa spasi.

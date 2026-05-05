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

Jika `npm ci` berhenti dengan:

```text
Killed
```

Itu biasanya limit RAM/CPU shared hosting. Jangan dipaksa berulang. Pakai metode `standalone` di bawah: build di komputer lokal, upload ZIP ke server.

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

Jika `npx prisma ...` meminta konfirmasi install seperti ini, jangan lanjut dulu:

```text
Need to install the following packages:
prisma@...
Ok to proceed? (y)
```

Itu berarti dependency lokal belum terinstall. Jalankan `npm ci` dulu sampai selesai.

## Metode Disarankan untuk Shared Hosting: Upload Standalone

Jalankan di komputer lokal:

```powershell
git pull origin main
npm ci
npx prisma generate
npm run build
npm run pack:rumahweb
```

Hasil ZIP:

```text
.deploy/humas-rumahweb-standalone.zip
```

Upload ZIP itu ke:

```text
/home/sman5479/public_html/web/humas
```

Bersihkan hasil deploy/extract lama sebelum extract ulang. Jangan hapus `.env` jika sudah dibuat:

```bash
cd /home/sman5479/public_html/web/humas
chmod -R u+w .next node_modules public prisma database 2>/dev/null || true
rm -rf .next node_modules public prisma database server.js package.json package-lock.json DEPLOY_RUMAHWEB.md
```

Ekstrak ZIP dari Terminal agar permission lebih konsisten:

```bash
unzip -o humas-rumahweb-standalone.zip -d /home/sman5479/public_html/web/humas
```

Jika `unzip` tidak tersedia, baru gunakan tombol `Extract` File Manager setelah folder lama dibersihkan.

Setelah extract, di folder `humas` harus ada:

```text
server.js
package.json
node_modules/
.next/
public/
database/
```

Di cPanel Node.js App:

```text
Application root: public_html/web/humas
Application startup file: server.js
```

Setelah upload, buat file `.env` di folder `/home/sman5479/public_html/web/humas` atau isi environment variables dari panel Node.js App.

Jangan jalankan `npm ci`, `npm install`, atau `npm run build` di server untuk metode ini. Dependency dan build sudah dibawa dari lokal.

Karena CloudLinux mengharuskan `node_modules` berupa symlink ke virtual environment, pindahkan folder `node_modules` hasil extract:

```bash
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate
cd /home/sman5479/public_html/web/humas

rm -rf /home/sman5479/nodevenv/public_html/web/humas/20/lib/node_modules
mv node_modules /home/sman5479/nodevenv/public_html/web/humas/20/lib/node_modules
ln -s /home/sman5479/nodevenv/public_html/web/humas/20/lib/node_modules node_modules

ls -ld node_modules
node -e "require('next/package.json'); require('@prisma/client') ; console.log('runtime ok')"
```

Untuk database baru, import file ini melalui phpMyAdmin:

```text
/home/sman5479/public_html/web/humas/database/init.sql
```

File SQL ini membuat tabel dan user awal:

```text
admin / admin123!
humas / humas123!
viewer / viewer123!
```

Setelah login pertama, langsung ganti password admin.

Klik `Restart` pada Node.js App.

Jika aplikasi tetap gagal start setelah metode standalone, cek log Node.js App di cPanel. Pada paket shared hosting tertentu, resource runtime Node.js juga bisa terlalu kecil; solusinya naik paket atau deploy ke VPS.

### Fix CloudLinux `node_modules`

Jika muncul error:

```text
CloudLinux NodeJS Selector demands to store node modules for application in separate folder (virtual environment) pointed by symlink called "node_modules".
```

Berarti di application root ada folder/file `node_modules` biasa. CloudLinux mengharuskan `node_modules` berupa symlink ke virtual environment.

Jalankan:

```bash
cd /home/sman5479/public_html/web/humas
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate

if [ -L node_modules ]; then
  rm node_modules
elif [ -d node_modules ]; then
  mv node_modules node_modules_broken_$(date +%s)
fi

mkdir -p /home/sman5479/nodevenv/public_html/web/humas/20/lib/node_modules
ln -s /home/sman5479/nodevenv/public_html/web/humas/20/lib/node_modules node_modules

ls -ld node_modules
```

Untuk metode Git/runtime install, setelah `node_modules` sudah menjadi symlink, install runtime dependency:

```bash
npm install --omit=dev --no-audit --no-fund --cache /home/sman5479/tmp/npm-cache
```

Lalu jalankan Prisma dari binary lokal, bukan auto-install via `npx`:

```bash
./node_modules/.bin/prisma generate
```

Jika `./node_modules/.bin/prisma` belum ada, berarti install belum berhasil.

## Metode Git di Server jika npm ci Tidak Killed

Pakai metode ini hanya jika `npm ci` bisa selesai di server.

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
npx --no-install prisma generate
npx --no-install prisma db push
npm run build
```

Klik `Restart` pada Node.js App.

## Update Deploy Berikutnya

```bash
cd /home/sman5479/public_html/web/humas
source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate
git pull
npm ci
npx --no-install prisma generate
npx --no-install prisma db push
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
- `Extract Permission denied` pada `.next/node_modules/@prisma`: hapus folder `.next` lama dulu dengan `chmod -R u+w .next && rm -rf .next`, lalu extract ulang via Terminal `unzip`.
- `npm: command not found`: buat Node.js App dulu lalu jalankan `source /home/sman5479/nodevenv/public_html/web/humas/20/bin/activate`.
- `next: command not found`: dependency belum terinstall; jalankan `npm ci`, lalu cek `ls node_modules/.bin/next`.
- `npx` meminta install `prisma@...`: dependency lokal belum ada; jalankan `npm ci`, lalu pakai `npx --no-install prisma generate`.
- `Database error`: cek `DATABASE_URL`, database MySQL, user, dan privilege.
- `Module not found`: jalankan `npm ci` dan `npx prisma generate`.
- Build gagal karena env: pastikan `NEXTAUTH_URL=https://humas.smaafbs.sch.id` tanpa spasi.

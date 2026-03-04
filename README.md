# HumasHub PRO — SMA AFBS

Sistem informasi internal untuk Tim Humas SMA AFBS. Dibangun dengan Next.js 14+, TypeScript, TailwindCSS, Prisma ORM, dan MySQL.

## 📦 Fitur

- **Dashboard** — Ringkasan tasks, content, events, pinned items, activity log
- **Tasks** — Manajemen tugas dengan filter, prioritas, deadline, bulk actions
- **Notes** — Catatan dengan editor Markdown + preview
- **Links** — Simpan link penting dengan pin & kategori
- **Contacts** — Database kontak dengan tombol WA, email, export CSV
- **Events** — Manajemen event dengan checklist persiapan & link terkait
- **Content** — Perencanaan konten media sosial dengan calendar view & hashtag bank
- **Templates** — Template teks dengan Fill & Copy (variabel otomatis)
- **Analytics** — Grafik Recharts: tasks, content, events, top tags
- **User Management** — Admin: CRUD user, role assignment, reset password

## 🔐 Role

| Role | Akses |
|------|-------|
| ADMIN | Full access + kelola user |
| HUMAS | CRUD semua data (kecuali user management) |
| VIEWER | Read-only semua modul |

## 🚀 Quick Start (Local Development)

### 1. Prasyarat
- Node.js 18+ 
- MySQL Server (bisa pakai XAMPP)
- npm 

### 2. Clone & Install
```bash
git clone <repo-url> humashub
cd humashub
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/humashub"
AUTH_SECRET="your-random-secret-key-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

> Untuk generate `AUTH_SECRET`: jalankan `openssl rand -base64 32` atau isi string acak 32+ karakter.

### 4. Setup Database
```bash
# Buat database MySQL dulu (bisa via phpMyAdmin):
# CREATE DATABASE humashub;

# Generate Prisma client
npm run prisma:generate

# Push schema ke database
npm run prisma:push

# Isi data contoh
npm run seed
```

### 5. Run Development
```bash
npm run dev
```

Buka http://localhost:3000

### 6. Login
| Username | Password | Role |
|----------|----------|------|
| admin | admin123! | ADMIN |
| humas | humas123! | HUMAS |
| viewer | viewer123! | VIEWER |

> ⚠️ **Ganti password admin di produksi!**

---

## 🌐 Deploy ke cPanel (Node.js Application)

### Langkah 1: Persiapan File
1. Build project lokal dulu:
   ```bash
   npm run build
   ```
2. Upload **semua file** ke folder application root di cPanel (misal `/home/user/humashub/`)
   - Pastikan folder `.next/`, `prisma/`, `public/`, `src/`, `node_modules/` ter-upload
   - Atau upload tanpa `node_modules/` lalu jalankan `npm install` di server

### Langkah 2: Setup Database MySQL
1. Buka **MySQL Databases** di cPanel
2. Create database: `humashub`
3. Create user & grant privileges
4. Catat:
   - Database name 
   - Username
   - Password
   - Host (biasanya `localhost`)

### Langkah 3: Setup Node.js Application
1. Login cPanel → **Setup Node.js App**
2. Klik **CREATE APPLICATION**
3. Isi:
   - **Node.js version**: 18+ (pilih yang tersedia)
   - **Application mode**: Production
   - **Application root**: `humashub` (folder project)
   - **Application URL**: domain/subdomain
   - **Application startup file**: `server.js`
4. Klik **CREATE**

### Langkah 4: Set Environment Variables
Di halaman Node.js App, tambahkan environment variables:

| Variable | Value |
|----------|-------|
| DATABASE_URL | `mysql://user:password@localhost:3306/humashub` |
| AUTH_SECRET | `random-secret-32-chars` |
| NEXTAUTH_URL | `https://yourdomain.com` |
| NODE_ENV | `production` |

### Langkah 5: Install & Build
Masuk ke terminal cPanel (atau SSH):
```bash
# Masuk ke folder project
cd ~/humashub

# Aktifkan Node.js environment (jika perlu)
source /home/user/nodevenv/humashub/18/bin/activate

# Install dependencies
npm install

# Generate Prisma
npx prisma generate

# Push database schema
npx prisma db push

# Seed data
npx tsx prisma/seed.ts

# Build Next.js
npm run build
```

### Langkah 6: Start Application
1. Kembali ke cPanel → **Setup Node.js App**
2. Klik **RESTART** pada aplikasi
3. Buka domain/subdomain — aplikasi siap dipakai!

### Troubleshooting
- **Error "Module not found"**: Jalankan `npm install` ulang
- **Database error**: Periksa `DATABASE_URL` dan pastikan database sudah dibuat
- **Blank page**: Periksa apakah build berhasil (`npm run build`)
- **502 Bad Gateway**: Periksa startup file (`server.js`) dan Node.js version

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14+ (App Router) | Framework |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| shadcn/ui + Radix UI | UI Components |
| Prisma ORM | Database ORM |
| MySQL | Database |
| NextAuth.js | Authentication |
| bcryptjs | Password hashing |
| Zod | Validation |
| Recharts | Charts & analytics |
| lucide-react | Icons |
| sonner | Toast notifications |
| marked | Markdown rendering |

## 📁 Struktur Folder

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── login/page.tsx     # Login page
│   │   └── (dashboard)/
│   │       ├── layout.tsx     # Dashboard layout (sidebar+topbar)
│   │       ├── page.tsx       # Dashboard
│   │       ├── tasks/         # Tasks module
│   │       ├── notes/         # Notes module
│   │       ├── links/         # Links module
│   │       ├── contacts/      # Contacts module
│   │       ├── events/        # Events module
│   │       ├── content/       # Content/Media module
│   │       ├── templates/     # Templates module
│   │       ├── analytics/     # Analytics module
│   │       └── settings/users/# User management
│   ├── components/
│   │   ├── layout/            # Sidebar, Topbar
│   │   ├── ui/                # UI primitives
│   │   ├── providers.tsx      # Theme + Session providers
│   │   └── empty-state.tsx    # Empty state component
│   └── lib/
│       ├── auth.ts            # NextAuth config
│       ├── prisma.ts          # Prisma client
│       ├── utils.ts           # Utilities
│       ├── audit.ts           # Audit logging
│       ├── validations.ts     # Zod schemas
│       └── actions/           # Server actions per module
├── .env.example
├── server.js                  # cPanel startup
├── package.json
└── README.md
```

---

**Made with ❤️ for Tim Humas SMA AFBS**

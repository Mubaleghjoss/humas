import { PrismaClient, Role, TaskStatus, Priority, EventStatus, ContentStatus, ContentPlatform, TemplateCategory } from '@prisma/client'
import { hashSync } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create Tags
    const tags = await Promise.all([
        prisma.tag.create({ data: { name: 'Penting', color: '#ef4444' } }),
        prisma.tag.create({ data: { name: 'PPDB', color: '#f59e0b' } }),
        prisma.tag.create({ data: { name: 'Sosmed', color: '#8b5cf6' } }),
        prisma.tag.create({ data: { name: 'Event', color: '#10b981' } }),
        prisma.tag.create({ data: { name: 'Media', color: '#3b82f6' } }),
        prisma.tag.create({ data: { name: 'Internal', color: '#6366f1' } }),
        prisma.tag.create({ data: { name: 'Sponsor', color: '#ec4899' } }),
        prisma.tag.create({ data: { name: 'Dokumentasi', color: '#14b8a6' } }),
    ])

    // Create admin user
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            name: 'Administrator',
            email: 'admin@smaafbs.sch.id',
            password: hashSync('admin123!', 12),
            role: Role.ADMIN,
        },
    })

    // Create humas user
    const humas = await prisma.user.create({
        data: {
            username: 'humas',
            name: 'Staff Humas',
            email: 'humas@smaafbs.sch.id',
            password: hashSync('humas123!', 12),
            role: Role.HUMAS,
        },
    })

    // Create viewer user
    const viewer = await prisma.user.create({
        data: {
            username: 'viewer',
            name: 'Viewer',
            email: 'viewer@smaafbs.sch.id',
            password: hashSync('viewer123!', 12),
            role: Role.VIEWER,
        },
    })

    // Create Tasks
    const today = new Date()
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

    const task1 = await prisma.task.create({
        data: {
            title: 'Buat konten Instagram Milad Sekolah',
            description: 'Desain feed 1-slide dan carousel 5-slide untuk peringatan milad SMA AFBS',
            status: TaskStatus.PROGRESS,
            priority: Priority.HIGH,
            dueDate: tomorrow,
            creatorId: admin.id,
            assigneeId: humas.id,
            tags: { connect: [{ id: tags[2].id }, { id: tags[7].id }] },
            checklist: {
                create: [
                    { text: 'Riset referensi desain', completed: true },
                    { text: 'Buat draft desain di Canva', completed: false },
                    { text: 'Review dengan koordinator', completed: false },
                ],
            },
        },
    })

    await prisma.task.create({
        data: {
            title: 'Update website sekolah - halaman PPDB',
            description: 'Perbarui informasi PPDB di website resmi sekolah dengan jadwal terbaru',
            status: TaskStatus.TODO,
            priority: Priority.URGENT,
            dueDate: today,
            creatorId: admin.id,
            assigneeId: humas.id,
            tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
        },
    })

    await prisma.task.create({
        data: {
            title: 'Kirim press release ke media lokal',
            description: 'Press release kegiatan bakti sosial SMA AFBS',
            status: TaskStatus.TODO,
            priority: Priority.MEDIUM,
            dueDate: nextWeek,
            creatorId: humas.id,
            tags: { connect: [{ id: tags[4].id }] },
        },
    })

    await prisma.task.create({
        data: {
            title: 'Follow up sponsor event tahunan',
            description: 'Hubungi 5 sponsor potensial untuk event tahunan sekolah',
            status: TaskStatus.DONE,
            priority: Priority.HIGH,
            dueDate: yesterday,
            creatorId: admin.id,
            assigneeId: humas.id,
            tags: { connect: [{ id: tags[6].id }, { id: tags[3].id }] },
        },
    })

    await prisma.task.create({
        data: {
            title: 'Dokumentasi kegiatan upacara',
            description: 'Foto dan video upacara bendera hari Senin',
            status: TaskStatus.TODO,
            priority: Priority.LOW,
            dueDate: nextWeek,
            creatorId: humas.id,
            tags: { connect: [{ id: tags[7].id }] },
        },
    })

    // Create Notes
    await prisma.note.create({
        data: {
            title: 'Panduan Posting Instagram',
            content: '## Panduan Posting IG SMA AFBS\n\n### Format:\n- **Feed**: 1080x1080px\n- **Story**: 1080x1920px\n- **Reels**: 1080x1920px\n\n### Tone:\n- Formal tapi friendly\n- Gunakan bahasa Indonesia baku\n- Hashtag wajib: #SMAAFBS #PendidikanBerkualitas\n\n### Jadwal:\n- Senin: Motivasi\n- Rabu: Info Akademik\n- Jumat: Kegiatan/Event',
            pinned: true,
            userId: admin.id,
            tags: { connect: [{ id: tags[2].id }] },
        },
    })

    await prisma.note.create({
        data: {
            title: 'Kontak Media Lokal',
            content: '## Daftar Media\n\n1. **Radar Bogor** - Pak Ahmad (0812xxxx)\n2. **Pikiran Rakyat** - Bu Siti (0813xxxx)\n3. **Kompas Jabar** - Pak Budi (0857xxxx)\n\n> Kirim press release H-3 sebelum event',
            pinned: false,
            userId: humas.id,
            tags: { connect: [{ id: tags[4].id }] },
        },
    })

    await prisma.note.create({
        data: {
            title: 'Checklist Event Besar',
            content: '## Checklist Pre-Event\n\n- [ ] Surat izin kepolisian\n- [ ] Koordinasi sound system\n- [ ] Undangan VIP\n- [ ] Backdrop & spanduk\n- [ ] Dokumentasi (foto+video)\n- [ ] MC & rundown\n- [ ] Konsumsi\n- [ ] Parkir & keamanan',
            pinned: true,
            userId: admin.id,
            tags: { connect: [{ id: tags[3].id }, { id: tags[0].id }] },
        },
    })

    // Create Links
    await prisma.link.create({
        data: {
            title: 'Google Drive Humas',
            url: 'https://drive.google.com/drive/folders/example',
            category: 'Drive',
            description: 'Folder utama arsip Humas SMA AFBS',
            pinned: true,
            userId: admin.id,
            tags: { connect: [{ id: tags[5].id }] },
        },
    })

    await prisma.link.create({
        data: {
            title: 'Canva Tim Humas',
            url: 'https://www.canva.com/brand/example',
            category: 'Design',
            description: 'Workspace Canva untuk desain konten',
            pinned: true,
            userId: humas.id,
            tags: { connect: [{ id: tags[2].id }] },
        },
    })

    await prisma.link.create({
        data: {
            title: 'Website SMA AFBS',
            url: 'https://smaafbs.sch.id',
            category: 'Website',
            description: 'Website resmi sekolah',
            pinned: false,
            userId: admin.id,
        },
    })

    await prisma.link.create({
        data: {
            title: 'Instagram SMA AFBS',
            url: 'https://instagram.com/smaafbs',
            category: 'Sosmed',
            description: 'Akun Instagram resmi',
            pinned: true,
            userId: humas.id,
            tags: { connect: [{ id: tags[2].id }] },
        },
    })

    // Create Contacts
    await prisma.contact.create({
        data: {
            name: 'Ahmad Fauzi',
            roleTitle: 'Wartawan',
            organization: 'Radar Bogor',
            phone: '081234567890',
            whatsapp: '081234567890',
            email: 'ahmad@radarbogor.co.id',
            notes: 'Kontak utama untuk press release',
            userId: admin.id,
            tags: { connect: [{ id: tags[4].id }] },
        },
    })

    await prisma.contact.create({
        data: {
            name: 'Siti Nurhaliza',
            roleTitle: 'Account Executive',
            organization: 'Percetakan Mandiri',
            phone: '081345678901',
            whatsapp: '081345678901',
            email: 'siti@percetakanmandiri.com',
            notes: 'Vendor cetak spanduk dan brosur',
            userId: humas.id,
            tags: { connect: [{ id: tags[6].id }] },
        },
    })

    await prisma.contact.create({
        data: {
            name: 'Budi Santoso',
            roleTitle: 'Fotografer',
            organization: 'Freelance',
            phone: '085678901234',
            whatsapp: '085678901234',
            email: 'budi.foto@gmail.com',
            notes: 'Fotografer langganan untuk event besar',
            userId: admin.id,
            tags: { connect: [{ id: tags[7].id }, { id: tags[3].id }] },
        },
    })

    // Create Events
    const eventDate1 = new Date(today); eventDate1.setDate(today.getDate() + 14)
    const eventDate2 = new Date(today); eventDate2.setDate(today.getDate() + 30)

    await prisma.event.create({
        data: {
            title: 'Milad SMA AFBS ke-15',
            description: 'Peringatan hari jadi SMA AFBS dengan rangkaian acara lomba, pentas seni, dan doa bersama',
            startDate: eventDate1,
            endDate: new Date(eventDate1.getTime() + 2 * 24 * 60 * 60 * 1000),
            location: 'Aula SMA AFBS',
            status: EventStatus.PLANNING,
            picUserId: admin.id,
            tags: { connect: [{ id: tags[3].id }, { id: tags[0].id }] },
            checklist: {
                create: [
                    { text: 'Booking aula', completed: true },
                    { text: 'Undangan tamu VIP', completed: false },
                    { text: 'Koordinasi sound system', completed: false },
                    { text: 'Siapkan backdrop', completed: false },
                ],
            },
            links: {
                create: [
                    { title: 'Rundown Acara', url: 'https://docs.google.com/document/d/example1' },
                    { title: 'Budget Plan', url: 'https://docs.google.com/spreadsheets/d/example2' },
                ],
            },
        },
    })

    await prisma.event.create({
        data: {
            title: 'Open House PPDB 2026',
            description: 'Kegiatan open house untuk calon siswa baru dan orang tua',
            startDate: eventDate2,
            location: 'Gedung Utama SMA AFBS',
            status: EventStatus.PLANNING,
            picUserId: humas.id,
            tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] },
            checklist: {
                create: [
                    { text: 'Siapkan materi presentasi', completed: false },
                    { text: 'Buat brosur digital', completed: false },
                    { text: 'Koordinasi tour guide siswa', completed: false },
                ],
            },
        },
    })

    // Create Content Items
    await prisma.contentItem.create({
        data: {
            title: 'Carousel Milad SMA AFBS',
            platform: ContentPlatform.INSTAGRAM,
            plannedDate: tomorrow,
            status: ContentStatus.DRAFT,
            caption: '🎉 Selamat Hari Jadi SMA AFBS ke-15! 🎉\n\nDari masa ke masa, kami terus berkomitmen mencetak generasi unggul yang berilmu dan berakhlak mulia.\n\n#SMAAFBS #Milad15 #PendidikanBerkualitas',
            hashtags: '#SMAAFBS #Milad15 #PendidikanBerkualitas #SMAUnggulan',
            assetLinks: 'https://canva.com/design/example1',
            userId: humas.id,
            tags: { connect: [{ id: tags[2].id }, { id: tags[3].id }] },
        },
    })

    await prisma.contentItem.create({
        data: {
            title: 'Info PPDB 2026/2027',
            platform: ContentPlatform.INSTAGRAM,
            plannedDate: nextWeek,
            status: ContentStatus.REVIEW,
            caption: '📚 PPDB SMA AFBS 2026/2027 Sudah Dibuka!\n\nDaftarkan putra-putri Anda sekarang.\n🔗 Link pendaftaran di bio\n\n#PPDB2026 #SMAAFBS #PendaftaranSiswa',
            hashtags: '#PPDB2026 #SMAAFBS #PendaftaranSiswa #SMABogor',
            userId: admin.id,
            tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] },
        },
    })

    await prisma.contentItem.create({
        data: {
            title: 'Video Profil Sekolah',
            platform: ContentPlatform.YOUTUBE,
            plannedDate: eventDate1,
            status: ContentStatus.DRAFT,
            caption: 'Video profil terbaru SMA AFBS - menampilkan fasilitas, kegiatan, dan prestasi siswa',
            userId: humas.id,
            tags: { connect: [{ id: tags[7].id }] },
        },
    })

    // Create Hashtags
    await Promise.all([
        prisma.hashtag.create({ data: { name: '#SMAAFBS', category: 'Brand' } }),
        prisma.hashtag.create({ data: { name: '#PendidikanBerkualitas', category: 'Brand' } }),
        prisma.hashtag.create({ data: { name: '#PPDB2026', category: 'PPDB' } }),
        prisma.hashtag.create({ data: { name: '#SMAUnggulan', category: 'Brand' } }),
        prisma.hashtag.create({ data: { name: '#KegiatanSekolah', category: 'Event' } }),
        prisma.hashtag.create({ data: { name: '#PrestasiSiswa', category: 'Akademik' } }),
        prisma.hashtag.create({ data: { name: '#EkstrakurikulerSMA', category: 'Kegiatan' } }),
        prisma.hashtag.create({ data: { name: '#PendidikanIslam', category: 'Brand' } }),
    ])

    // Create Templates
    await prisma.template.create({
        data: {
            title: 'Caption Instagram - Event',
            category: TemplateCategory.CAPTION,
            content: '🎉 {JUDUL_EVENT} 🎉\n\n📅 {TANGGAL}\n📍 {TEMPAT}\n⏰ {WAKTU}\n\n{DESKRIPSI}\n\nAyo ramaikan! 💪\n\n#SMAAFBS #KegiatanSekolah #{HASHTAG_EVENT}',
            variables: 'JUDUL_EVENT,TANGGAL,TEMPAT,WAKTU,DESKRIPSI,HASHTAG_EVENT',
            userId: admin.id,
        },
    })

    await prisma.template.create({
        data: {
            title: 'Press Release Kegiatan',
            category: TemplateCategory.PRESS_RELEASE,
            content: 'PRESS RELEASE\n\n{JUDUL}\n\n{KOTA}, {TANGGAL} — {PARAGRAF_PEMBUKA}\n\n{ISI_BERITA}\n\n"{KUTIPAN}" ujar {NAMA_NARASUMBER}, {JABATAN_NARASUMBER}.\n\n{PARAGRAF_PENUTUP}\n\nNarahubung:\n{NAMA_HUMAS}\n{NOMOR_HUMAS}\n{EMAIL_HUMAS}',
            variables: 'JUDUL,KOTA,TANGGAL,PARAGRAF_PEMBUKA,ISI_BERITA,KUTIPAN,NAMA_NARASUMBER,JABATAN_NARASUMBER,PARAGRAF_PENUTUP,NAMA_HUMAS,NOMOR_HUMAS,EMAIL_HUMAS',
            userId: admin.id,
        },
    })

    await prisma.template.create({
        data: {
            title: 'Undangan Kegiatan Sekolah',
            category: TemplateCategory.INVITATION,
            content: 'Bismillahirrahmanirrahim\n\nAssalamu\'alaikum Wr. Wb.\n\nYth. {NAMA_TAMU}\ndi {TEMPAT_TAMU}\n\nDengan hormat,\n\nKami mengundang Bapak/Ibu untuk menghadiri:\n\nAcara: {NAMA_ACARA}\nHari/Tanggal: {TANGGAL}\nWaktu: {WAKTU}\nTempat: {TEMPAT}\n\n{CATATAN_TAMBAHAN}\n\nAtas kehadiran Bapak/Ibu, kami ucapkan terima kasih.\n\nWassalamu\'alaikum Wr. Wb.\n\nHormat kami,\n{NAMA_PENGIRIM}\n{JABATAN_PENGIRIM}',
            variables: 'NAMA_TAMU,TEMPAT_TAMU,NAMA_ACARA,TANGGAL,WAKTU,TEMPAT,CATATAN_TAMBAHAN,NAMA_PENGIRIM,JABATAN_PENGIRIM',
            userId: admin.id,
        },
    })

    // Create Audit Logs
    await prisma.auditLog.create({
        data: {
            action: 'CREATE',
            entity: 'Task',
            entityId: task1.id,
            details: 'Membuat task: Buat konten Instagram Milad Sekolah',
            userId: admin.id,
        },
    })

    console.log('✅ Seed completed!')
    console.log('📌 Login credentials:')
    console.log('   Admin: admin / admin123!')
    console.log('   Humas: humas / humas123!')
    console.log('   Viewer: viewer / viewer123!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

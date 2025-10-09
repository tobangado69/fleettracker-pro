# SDD Commands - Panduan Lengkap Spec-Driven Development

## 🚀 Tentang SDD Commands

SDD Commands adalah sistem perintah berbasis AI yang dirancang untuk membantu developer dalam melakukan **Spec-Driven Development** - pendekatan pengembangan software yang menekankan perencanaan dan spesifikasi yang matang sebelum mulai coding.

### 🎯 Filosofi SDD
SDD mengutamakan pendekatan "Think First, Code Later" yang memastikan:
- Requirements yang jelas sebelum implementasi
- Perencanaan teknis yang matang dan terdokumentasi
- Task breakdown yang terstruktur dan dapat dikelola
- Kolaborasi tim yang lebih baik melalui pemahaman bersama

---

## 📋 Daftar Perintah SDD

### ⚡ Perintah Utama (Core Commands)

#### 1. `/brief` - Perencanaan Singkat (30 Menit)
**Waktu**: 30 menit total perencanaan sebelum coding  
**Output**: File `feature-brief.md` dengan konteks penting  
**Filosofi**: "Perencanaan yang cukup" untuk mulai coding dengan percaya diri

**Kapan Menggunakan:**
- Feature sederhana hingga menengah
- 80% dari feature development
- Proyek dengan tim kecil
- MVP atau prototype

**Contoh Penggunaan:**
```
/brief user authentication system
/brief payment integration
/brief dashboard redesign
```

#### 2. `/evolve` - Dokumentasi yang Hidup
**Tujuan**: Menjaga spesifikasi tetap selaras dengan kenyataan selama development  
**Output**: Update file `feature-brief.md` dengan changelog  
**Filosofi**: Spesifikasi sebagai dokumen hidup yang berkembang bersama kode

**Kapan Menggunakan:**
- Selama proses development
- Ketika requirements berubah
- Setelah discovery baru
- Untuk update progress

#### 3. `/implement` - Implementasi Terstruktur
**Tujuan**: Mengubah rencana menjadi kode yang berfungsi  
**Output**: Kode yang sudah ditest dan terdokumentasi  
**Filosofi**: Implementasi bertahap dengan quality assurance

#### 4. `/plan` - Rencana Teknis Mendalam
**Tujuan**: Membuat rencana implementasi teknis yang komprehensif  
**Output**: File `plan.md` dengan arsitektur dan strategi implementasi  
**Filosofi**: Perencanaan teknis yang matang sebelum coding

**Kapan Menggunakan:**
- Feature kompleks dengan multiple stakeholders
- Perubahan arsitektur yang signifikan
- High business risk atau compliance needs
- Timeline development 3+ minggu

#### 5. `/research` - Penelitian Mendalam
**Tujuan**: Melakukan penelitian komprehensif sebelum spesifikasi  
**Output**: File `research.md` dengan analisis mendalam  
**Filosofi**: Evidence-based decision making

**Kapan Menggunakan:**
- Teknologi baru atau belum familiar
- Market research diperlukan
- Competitive analysis
- Technical feasibility study

#### 6. `/specify` - Spesifikasi Detail
**Tujuan**: Membuat spesifikasi feature yang komprehensif  
**Output**: File `spec.md` dengan requirements lengkap  
**Filosofi**: Requirements yang jelas dan dapat ditest

#### 7. `/tasks` - Breakdown Task
**Tujuan**: Memecah rencana menjadi task yang dapat dikelola  
**Output**: File `tasks.md` dengan breakdown detail  
**Filosofi**: Task yang actionable dan terstruktur

#### 8. `/upgrade` - Upgrade ke SDD Penuh
**Tujuan**: Upgrade dari brief ke full SDD workflow  
**Output**: Dokumentasi lengkap (research, spec, plan, tasks)  
**Filosofi**: Scaling up perencanaan sesuai kompleksitas

#### 9. `Reset Context` - Reset Konteks
**Tujuan**: Mengatur ulang konteks development  
**Output**: Clean slate untuk memulai workflow baru  
**Filosofi**: Fresh start untuk feature baru

---

## 🗂️ Struktur File SDD

### Organisasi File
```
specs/
├── active/                    # Task yang sedang dalam development
│   └── [task-id]/           # ID task yang meaningful
│       ├── feature-brief.md # Brief untuk SDD 2.5
│       ├── research.md      # Research untuk SDD 2.0
│       ├── spec.md          # Spesifikasi lengkap
│       ├── plan.md          # Rencana teknis
│       ├── tasks.md         # Breakdown task
│       └── progress.md      # Tracking progress
├── completed/               # Task yang sudah selesai
├── templates/              # Template yang dapat digunakan ulang
└── index.md               # Index semua features
```

### Konvensi Task ID
- **Gunakan semantic slugs**: `user-auth-system`, `payment-integration`, `dashboard-redesign`
- **Hindari generic numbering**: `feat-001` (pendekatan lama)
- **Fokus pada identifier yang meaningful dan searchable**

---

## 🎯 Framework Keputusan

### Mulai dengan `/brief` KECUALI feature memenuhi KRITERIA berikut:
- [ ] Multiple teams terlibat
- [ ] Perubahan arsitektur diperlukan
- [ ] High business risk/compliance needs
- [ ] Pendekatan teknis tidak pasti
- [ ] Timeline development 3+ minggu

### Upgrade dari brief ke full SDD jika:
- Kompleksitas ditemukan selama implementasi
- Requirements berubah signifikan
- Stakeholder meminta dokumentasi lengkap

---

## 💡 Contoh Penggunaan Praktis

### Contoh 1: Feature Sederhana - User Login
```
/brief user login system with email and password authentication
```
**Hasil**: `feature-brief.md` dengan:
- Problem statement
- User stories
- Basic requirements
- Next actions

### Contoh 2: Feature Kompleks - Payment Integration
```
/research payment systems for Indonesian market
/specify QRIS payment integration with multiple banks
/plan technical implementation with security considerations
/tasks breakdown implementation into manageable tasks
```

### Contoh 3: Evolution Selama Development
```
/evolve update payment integration requirements based on bank API limitations
```

---

## 🔄 Workflow SDD 2.5 (Lightweight - Default)

### Workflow Singkat (30 Menit Planning)
```
1. /brief → feature-brief.md (30 menit)
2. /implement → langsung coding
3. /evolve → update dokumentasi selama development
```

### Workflow Penuh (4-6 Jam Planning)
```
1. /research → research.md (1-2 jam)
2. /specify → spec.md (1-2 jam)
3. /plan → plan.md (1-2 jam)
4. /tasks → tasks.md (30-60 menit)
5. /implement → coding dengan roadmap jelas
```

---

## 📊 Quality Assurance

### Checklist Review
Setiap fase memiliki checklist review yang komprehensif:

#### Brief Review
- [ ] Problem statement jelas
- [ ] User stories terdefinisi
- [ ] Requirements dapat ditest
- [ ] Next actions actionable

#### Spec Review
- [ ] Requirements komprehensif
- [ ] Acceptance criteria measurable
- [ ] Edge cases teridentifikasi
- [ ] Dependencies terdokumentasi

#### Plan Review
- [ ] Arsitektur teknis sound
- [ ] Technology stack appropriate
- [ ] Security considerations included
- [ ] Performance requirements defined

#### Tasks Review
- [ ] Tasks actionable
- [ ] Dependencies jelas
- [ ] Effort estimation reasonable
- [ ] Success criteria defined

---

## 🤝 Kolaborasi Tim

### Multi-Developer Workflows
- **Assignee tracking**: Setiap feature dan task memiliki assignee
- **Progress monitoring**: Status update melalui progress.md
- **Review workflows**: Feedback integration dalam dokumentasi
- **Audit trails**: Change management untuk semua perubahan

### Template System
- **Customizable templates**: Template dapat disesuaikan per project
- **Variable processing**: Support untuk conditional content
- **Consistent formatting**: Struktur yang konsisten across project
- **Extension support**: Template dapat diperluas sesuai kebutuhan

---

## 🛠️ Setup dan Konfigurasi

### Prerequisites
- Cursor IDE terinstall dan dikonfigurasi
- Project mengikuti struktur direktori standar
- Developer familiar dengan markdown format
- Git version control digunakan

### Konfigurasi
```json
// .sdd/config.json
{
  "projectName": "Ticketku",
  "defaultLanguage": "indonesian",
  "templateEngine": "handlebars",
  "autoIndex": true,
  "progressTracking": true
}
```

---

## 📈 Metrics dan Success Criteria

### Technical Metrics
- **Code Coverage**: Maintain high test coverage
- **Performance**: Meet atau exceed performance requirements
- **Security**: Pass security audits dan scans
- **Maintainability**: Code mudah dipahami dan dimodifikasi

### Process Metrics
- **Delivery Time**: Konsisten deliver on time
- **Bug Rate**: Low defect rate di production
- **Code Quality**: High code quality scores
- **Team Productivity**: Kontribusi pada team efficiency

---

## 🎖️ Best Practices

### DO's ✅
- **Start Simple**: Mulai dengan `/brief` untuk kebanyakan feature
- **Document Decisions**: Catat semua keputusan teknis dan bisnis
- **Keep Updated**: Gunakan `/evolve` untuk update dokumentasi
- **Review Regularly**: Lakukan review berkala pada dokumentasi
- **Collaborate**: Gunakan sistem untuk kolaborasi tim

### DON'Ts ❌
- **Over-Engineer**: Jangan gunakan full SDD untuk feature sederhana
- **Skip Planning**: Jangan langsung coding tanpa perencanaan
- **Ignore Updates**: Jangan lupa update dokumentasi saat requirements berubah
- **Solo Work**: Jangan bekerja tanpa melibatkan stakeholder
- **Rush Process**: Jangan terburu-buru dalam fase planning

---

## 🔗 Resources dan Referensi

### Dokumentasi Internal
- [Project Overview](specs/00-overview.md)
- [Technical Implementation Guide](docs/technical-implementation-guide.md)
- [Active Features](specs/active/)

### External Resources
- [Spec-Driven Development Methodology](https://example.com/sdd-methodology)
- [Cursor IDE Documentation](https://cursor.sh/docs)
- [Markdown Best Practices](https://www.markdownguide.org/)

---

## 📞 Support dan Kontribusi

### Getting Help
- **Documentation**: Baca dokumentasi lengkap di folder `docs/`
- **Examples**: Lihat contoh di folder `specs/active/`
- **Templates**: Gunakan template di folder `.sdd/templates/`

### Contributing
- **Bug Reports**: Laporkan bug melalui issue tracker
- **Feature Requests**: Suggest new features via discussion
- **Documentation**: Help improve dokumentasi
- **Templates**: Contribute new templates

---

## 📝 Changelog

### Version 1.0.0 (October 2025)
- Initial release SDD Commands
- Support untuk 9 core commands
- Template system implementation
- Progress tracking system
- Multi-language support (Indonesian/English)

---

**Dibuat dengan ❤️ untuk developer Indonesia**

*SDD Commands - Think First, Code Later*

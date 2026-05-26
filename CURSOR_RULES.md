# 🤖 CURSOR RULES — Kelime Dijital Kütüphane

## Proje Hakkında
Türkçe dijital kütüphane uygulaması. React + Vite ile geliştirilmiş SPA.
Kullanıcılar kitap okuyabilir, dinleyebilir, favorileyebilir ve yorum yapabilir.
Admin panelinden kitap ekleme/düzenleme/silme ve üye onaylama yapılabilir.

## Stack
- **Frontend:** React 18 + Vite 5
- **Storage:** localStorage (backend yok, tümü client-side)
- **PDF:** pdf.js (CDN üzerinden dinamik yükleme)
- **TTS:** ResponsiveVoice + Web Speech API fallback
- **AI:** Anthropic Claude API (PDF analizi için)
- **Styling:** Vanilla CSS (src/index.css) — Tailwind kullanılmıyor

## Proje Yapısı
```
src/
  App.jsx              # Ana bileşen, routing, nav
  main.jsx             # Entry point
  index.css            # Tüm stiller buradadır
  hooks/
    useAppState.js     # Tüm uygulama state'i (books, users, likes...)
  utils/
    storage.js         # localStorage helpers, sabitler (CATEGORIES, DEMO_BOOKS...)
  components/
    BookCard.jsx       # Kitap kartı
    BookForm.jsx       # Kitap ekleme/düzenleme formu (PDF upload dahil)
    PdfUpload.jsx      # PDF yükleme + AI analiz bileşeni
    AuthModal.jsx      # Giriş / kayıt / admin modal
  pages/
    HomePage.jsx       # Ana sayfa (arama, kategori, grid)
    ReadPage.jsx       # Okuma + TTS + beğeni + yorumlar
    AdminPage.jsx      # Admin paneli
    MemberAddPage.jsx  # Üye kitap önerme
    ProfilePage.jsx    # Kullanıcı profili
    FavPage.jsx        # Favoriler
```

## Önemli Kurallar
1. **CSS değişkenleri** — renk/radius/shadow için her zaman `var(--accent)` gibi CSS değişkeni kullan
2. **State yönetimi** — tüm state `useAppState.js`'de, component'lar sadece prop alır
3. **localStorage** — `sp()` (get) ve `ss()` (set) helper'larını kullan
4. **Kategori listesi** — `CATEGORIES` sabitini `utils/storage.js`'den import et
5. **Font sınıfları** — başlıklar `Playfair Display`, mono `Space Mono`, body `Crimson Pro`
6. **Admin şifresi** — `admin123` (useAppState.js içinde değiştirilebilir)

## Yeni Özellik Eklemek
- Yeni sayfa → `src/pages/` altına ekle → `App.jsx`'e route ekle
- Yeni state → `useAppState.js`'e ekle
- Yeni stil → `index.css`'e ekle (CSS değişkenlerini kullan)

## Deployment
```bash
npm run build   # dist/ klasörü oluşur
# dist/ klasörünü Netlify'a sürükle-bırak
```

## Geliştirme
```bash
npm install
npm run dev     # http://localhost:3000
```

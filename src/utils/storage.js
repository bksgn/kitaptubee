// src/utils/storage.js
export function sp(k, fallback) {
  try {
    const r = localStorage.getItem(k)
    if (r === null) return fallback
    const p = JSON.parse(r)
    return p !== null ? p : fallback
  } catch { return fallback }
}

export function ss(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
}

export function escH(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function fmt(ts) {
  const d = new Date(ts)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

export function initials(n) {
  return (n || '?').substring(0, 1).toUpperCase()
}

export function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöç\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const CAT_COLORS = {
  Roman: '#2a1f3d', Şiir: '#1f2d3d', Tarih: '#2d1f1a', Bilim: '#1a2d2a',
  Felsefe: '#1f1f2d', Çocuk: '#2d2a1a', Biyografi: '#2d1f28',
  Fantastik: '#1a1f2d', Polisiye: '#1a2d20', 'Kişisel Gelişim': '#2d2a1f'
}

export const CAT_ICONS = {
  Roman: '📖', Şiir: '✍', Tarih: '🏛', Bilim: '🔬', Felsefe: '🧠',
  Çocuk: '🌟', Biyografi: '👤', Fantastik: '🐉', Polisiye: '🔍',
  'Kişisel Gelişim': '🚀'
}

export const CATEGORIES = [
  'Roman', 'Şiir', 'Tarih', 'Bilim', 'Felsefe',
  'Çocuk', 'Biyografi', 'Fantastik', 'Polisiye', 'Kişisel Gelişim'
]

export function ensureSlugs(books) {
  return books.map(b => b.slug ? b : { ...b, slug: slugify(b.title) })
}

export const DEMO_BOOKS = [
  { id: 'd1', title: 'Saatleri Ayarlama Enstitüsü', author: 'Ahmet Hamdi Tanpınar', category: 'Roman', cover: '', addedBy: 'admin', text: 'Hayri İrdal\'ın hatıraları, Türkiye\'nin modernleşme sürecini hicivli bir gözle aktarır.\n\nBu roman, Doğu ile Batı arasında sıkışmış bir toplumun panoramasını çizer.', chapters: [{ title: 'I. Çocukluğum', text: 'Hayri İrdal doğduğunda mahalle saati tam on ikiyi vuruyordu...' }, { title: 'II. Enstitü', text: 'Saatleri Ayarlama Enstitüsü zamanla ilgilenen garip bir kuruluştu...' }] },
  { id: 'd2', title: 'Tutunamayanlar', author: 'Oğuz Atay', category: 'Roman', cover: '', addedBy: 'admin', text: 'Selim Işık, hayata tutunamayan bir mühendistir. Türk edebiyatının en özgün romanlarından biridir.', chapters: [] },
  { id: 'd3', title: 'İnce Memed', author: 'Yaşar Kemal', category: 'Roman', cover: '', addedBy: 'admin', text: 'Çukurova\'nın ovaları, Memed\'in üzerine çöken ağır bir yazgının sahnesidir.', chapters: [] },
  { id: 'd4', title: 'Şiirler', author: 'Nazım Hikmet', category: 'Şiir', cover: '', addedBy: 'admin', text: 'En güzel deniz: henüz gidilmemiş olanıdır.\nEn güzel çocuk: henüz büyümedi.\nEn güzel günlerimiz: henüz yaşamadıklarımız.', chapters: [] },
  { id: 'd5', title: 'Nutuk', author: 'Mustafa Kemal Atatürk', category: 'Tarih', cover: '', addedBy: 'admin', text: 'Samsun\'a çıktığım zaman umumi vaziyet şuydu: Osmanlı Devleti mağlup olmuş, ordusu zedelenmiş, ağır mütareke imzalanmıştı.', chapters: [] }
]

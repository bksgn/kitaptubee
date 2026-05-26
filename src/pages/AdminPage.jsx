// src/pages/AdminPage.jsx
import { useState } from 'react'
import BookForm from '../components/BookForm'
import { CAT_ICONS } from '../utils/storage'

export default function AdminPage({ books, pending, users, likeCount, commentCount, onLogout, onPublish, onUpdate, onDelete, onApprove, onReject, onAutoAdd, showToast, onOpenBook }) {
  const [showForm, setShowForm] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [gbOpen, setGbOpen]    = useState(false)
  const [gbQ, setGbQ]          = useState('')
  const [gbResults, setGbResults] = useState(null)
  const [gbLoading, setGbLoading] = useState(false)

  function openNew() { setEditBook(null); setShowForm(true); setTimeout(() => document.getElementById('admin-form')?.scrollIntoView({ behavior: 'smooth' }), 50) }
  function openEdit(b) { setEditBook(b); setShowForm(true); setTimeout(() => document.getElementById('admin-form')?.scrollIntoView({ behavior: 'smooth' }), 50) }
  function hideForm() { setShowForm(false); setEditBook(null) }

  function handleSubmit(data) {
    if (editBook) onUpdate(editBook.id, data)
    else onPublish(data)
    hideForm()
  }

  async function gbSearch() {
    if (!gbQ.trim()) return
    setGbLoading(true); setGbResults(null)
    try {
      const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(gbQ)}`)
      const d = await res.json()
      setGbResults(d.results?.slice(0, 8) || [])
    } catch { showToast('⚠ Bağlantı hatası') }
    setGbLoading(false)
  }

  async function gbAdd(book) {
    const fmts = book.formats || {}
    const txtUrl = fmts['text/plain; charset=utf-8'] || fmts['text/plain; charset=us-ascii'] || fmts['text/plain']
    const title = book.title || '?'
    const author = (book.authors || []).map(a => a.name).join(', ') || '?'
    const cover = fmts['image/jpeg'] || ''
    const subs = (book.subjects || []).join(' ').toLowerCase()
    let cat = 'Roman'
    if (subs.includes('poetry') || subs.includes('poem')) cat = 'Şiir'
    else if (subs.includes('history')) cat = 'Tarih'
    else if (subs.includes('science')) cat = 'Bilim'
    else if (subs.includes('philosophy')) cat = 'Felsefe'

    let text = ''
    if (txtUrl) {
      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(txtUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(txtUrl)}`
      ]
      for (const p of proxies) {
        try {
          const r = await fetch(p)
          if (!r.ok) continue
          let raw = await r.text()
          const si = raw.search(/\*\*\* START OF/i), ei = raw.search(/\*\*\* END OF/i)
          if (si > -1) raw = raw.substring(si)
          if (ei > -1) raw = raw.substring(0, ei)
          raw = raw.replace(/\*\*\* START OF[^\n]*\n/i, '').trim()
          text = raw.substring(0, 15000); break
        } catch {}
      }
    }

    onAutoAdd({ id: 'gb_' + book.id + '_' + Date.now(), title, author, category: cat, cover, text: text || 'Metin bulunamadı.', chapters: [], addedBy: 'admin' })
    showToast(`✅ "${title}" eklendi!`)
  }

  const ci = id => CAT_ICONS[id] || '📚'

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '1.5rem' }}>
      <div className="adm-hdr">
        <h1 className="adm-title">⚙ <em>Admin</em> Paneli</h1>
        <div className="adm-acts">
          <button className="btn-primary" onClick={openNew}>+ Manuel Ekle</button>
          <button className="btn-sec" onClick={() => setGbOpen(true)}>🤖 Otomatik Ekle</button>
          <button className="btn-sec" onClick={onLogout}>Çıkış</button>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-stats">
        {[['📚', books.length, 'Yayınlanan'], ['⏳', pending.length, 'Bekleyen'], ['👥', Object.keys(users).length, 'Üye']].map(([ic, v, l]) => (
          <div key={l} className="stat-c"><div className="stat-v">{v}</div><div className="stat-l">{ic} {l}</div></div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="pending-section">
          <div className="pending-title">⏳ Onay Bekleyen <span className="badge">{pending.length}</span></div>
          {pending.map(p => (
            <div key={p.id} className="pending-row">
              <div className="pending-info">
                <div className="pending-name">{p.title}</div>
                <div className="pending-meta">{p.author} · {p.category}</div>
                <div className="pending-sub">Öneren: {p.addedBy}</div>
              </div>
              <div className="pending-acts">
                <button className="btn-approve" onClick={() => onApprove(p.id)}>✓ Onayla</button>
                <button className="btn-reject" onClick={() => onReject(p.id)}>✕ Reddet</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div id="admin-form">
          <BookForm editBook={editBook} onSubmit={handleSubmit} onCancel={hideForm} showToast={showToast} submitLabel={editBook ? '✅ Kaydet' : '🚀 Yayınla'} />
        </div>
      )}

      {/* Book list */}
      <h3 style={{ fontFamily: "'Playfair Display',serif", marginBottom: '.85rem' }}>📚 Kitap Listesi ({books.length})</h3>
      <div>
        {books.length === 0
          ? <p style={{ color: 'var(--text3)', padding: '1rem 0' }}>Henüz kitap yok.</p>
          : books.map(b => (
              <div key={b.id} className="adm-row">
                <div className="adm-thumb">
                  {b.cover ? <img src={b.cover} alt="" onError={e => e.target.style.display = 'none'} /> : ci(b.category)}
                </div>
                <div className="adm-info">
                  <div className="adm-name">{b.title}</div>
                  <div className="adm-meta">{b.author} · {b.category} · ❤ {likeCount(b.id)} · 💬 {commentCount(b.id)}</div>
                  {b.addedBy && b.addedBy !== 'admin' && <div className="adm-adder">{b.addedBy} tarafından</div>}
                </div>
                <div className="adm-row-acts">
                  <button className="btn-edit" onClick={() => openEdit(b)}>Düzenle</button>
                  <button className="btn-del" onClick={() => { if (window.confirm('Silmek istiyor musunuz?')) onDelete(b.id) }}>Sil</button>
                </div>
              </div>
            ))
        }
      </div>

      {/* Gutenberg Modal */}
      {gbOpen && (
        <div className="overlay on" onClick={e => e.target === e.currentTarget && setGbOpen(false)}>
          <div className="modal modal-wide">
            <h2 className="modal-ttl">🤖 <em>Otomatik</em> Ekle</h2>
            <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: '.88rem', marginBottom: '1.1rem' }}>Project Gutenberg'den ücretsiz kitap ara</p>
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
              <input className="form-in" style={{ flex: 1 }} value={gbQ} onChange={e => setGbQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && gbSearch()} placeholder="Kitap adı veya yazar..." />
              <button className="btn-primary" onClick={gbSearch}>Ara</button>
            </div>
            <div className="gb-results">
              {gbLoading && <p className="gb-msg">🔍 Aranıyor...</p>}
              {gbResults && gbResults.length === 0 && <p className="gb-msg">Sonuç bulunamadı.</p>}
              {gbResults && gbResults.map(b => (
                <div key={b.id} className="gb-item">
                  <div className="gb-thumb">
                    {b.formats?.['image/jpeg'] ? <img src={b.formats['image/jpeg']} alt="" /> : '📖'}
                  </div>
                  <div className="gb-info">
                    <div className="gb-title">{b.title}</div>
                    <div className="gb-author">{(b.authors || []).map(a => a.name).join(', ')}</div>
                  </div>
                  <button className="btn-gb" onClick={() => gbAdd(b)}>+ Ekle</button>
                </div>
              ))}
              {!gbResults && !gbLoading && <p className="gb-msg">Aramak için yukarıya yazın.</p>}
            </div>
            <button className="btn-sec" style={{ width: '100%', marginTop: '.9rem' }} onClick={() => setGbOpen(false)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  )
}

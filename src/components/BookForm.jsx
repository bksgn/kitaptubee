// src/components/BookForm.jsx
import { useState, useEffect } from 'react'
import PdfUpload from './PdfUpload'
import { CATEGORIES } from '../utils/storage'

export default function BookForm({ editBook, onSubmit, onCancel, showToast, submitLabel = '🚀 Yayınla' }) {
  const [title, setTitle]   = useState('')
  const [author, setAuthor] = useState('')
  const [cat, setCat]       = useState('')
  const [cover, setCover]   = useState('')
  const [text, setText]     = useState('')
  const [chapters, setChapters] = useState([])
  const [showCover, setShowCover] = useState(false)

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title || '')
      setAuthor(editBook.author || '')
      setCat(editBook.category || '')
      setCover(editBook.cover || '')
      setText(editBook.text || '')
      setChapters((editBook.chapters || []).map((c, i) => ({ id: i, ...c })))
      setShowCover(!!editBook.cover)
    } else {
      setTitle(''); setAuthor(''); setCat(''); setCover('')
      setText(''); setChapters([]); setShowCover(false)
    }
  }, [editBook])

  function handlePdfApply(data) {
    if (data.title) setTitle(data.title)
    if (data.author) setAuthor(data.author)
    if (data.category) setCat(data.category)
    if (data.text) setText(data.text.substring(0, 30000))
  }

  function addChapter() {
    setChapters(prev => [...prev, { id: Date.now(), title: '', text: '' }])
  }

  function updateChapter(id, field, val) {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c))
  }

  function removeChapter(id) {
    setChapters(prev => prev.filter(c => c.id !== id))
  }

  function submit() {
    if (!title.trim() || !author.trim() || !cat) {
      showToast('⚠ Ad, yazar ve kategori zorunludur'); return
    }
    const chs = chapters.filter(c => c.title || c.text).map(c => ({ title: c.title || 'Bölüm', text: c.text }))
    onSubmit({ title: title.trim(), author: author.trim(), category: cat, cover: cover.trim(), text: text.trim(), chapters: chs })
  }

  return (
    <div className="form-box">
      <h2 className="form-ttl">{editBook ? '✏ Kitabı Düzenle' : '📖 Yeni Kitap Ekle'}</h2>

      <PdfUpload onApply={handlePdfApply} showToast={showToast} />

      <div className="form-grid">
        <div className="form-g">
          <label className="form-lbl">Kitap Adı *</label>
          <input className="form-in" value={title} onChange={e => setTitle(e.target.value)} placeholder="Kitabın adı" />
        </div>
        <div className="form-g">
          <label className="form-lbl">Yazar *</label>
          <input className="form-in" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Yazar adı" />
        </div>
        <div className="form-g">
          <label className="form-lbl">Kategori *</label>
          <select className="form-sel" value={cat} onChange={e => setCat(e.target.value)}>
            <option value="">Seçiniz</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-g">
          <label className="form-lbl">Kapak URL</label>
          <input className="form-in" value={cover} onChange={e => { setCover(e.target.value); setShowCover(!!e.target.value) }} placeholder="https://..." />
          {showCover && <img className="img-prev" src={cover} alt="" onError={() => setShowCover(false)} />}
        </div>
        <div className="form-g full">
          <label className="form-lbl">Kitap Metni *</label>
          <textarea className="form-ta" value={text} onChange={e => setText(e.target.value)} placeholder="Metin..." />
        </div>
      </div>

      {/* Chapters — admin only feature */}
      {onCancel && (
        <>
          <div className="ch-editor">
            {chapters.map(c => (
              <div key={c.id} className="ch-row">
                <input placeholder="Bölüm adı" value={c.title} onChange={e => updateChapter(c.id, 'title', e.target.value)} />
                <textarea placeholder="Bölüm metni..." value={c.text} onChange={e => updateChapter(c.id, 'text', e.target.value)} />
                <button className="btn-rm" onClick={() => removeChapter(c.id)}>✕</button>
              </div>
            ))}
          </div>
          <button className="btn-sec" style={{ marginBottom: '.85rem', fontSize: '.62rem' }} onClick={addChapter}>+ Bölüm Ekle</button>
        </>
      )}

      <div className="form-acts">
        <button className="btn-sec" onClick={onCancel}>İptal</button>
        <button className="btn-primary" onClick={submit}>{submitLabel}</button>
      </div>
    </div>
  )
}

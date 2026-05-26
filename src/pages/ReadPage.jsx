// src/pages/ReadPage.jsx
import { useState, useRef, useEffect } from 'react'
import { fmt, initials } from '../utils/storage'

export default function ReadPage({ book, curUser, adminIn, likes, comments, onBack, onLike, onComment, onDeleteComment, setAuthOpen }) {
  const [chIdx, setChIdx]     = useState(0)
  const [ttsOn, setTtsOn]     = useState(false)
  const [ttsPaused, setPaused] = useState(false)
  const [ttsLbl, setTtsLbl]   = useState('Dinlemek için ▶ butonuna basın')
  const [barW, setBarW]       = useState(0)
  const [speed, setSpeed]     = useState('1')
  const [comment, setComment] = useState('')
  const ttsRef = useRef({})
  const barRef = useRef(null)

  useEffect(() => { setChIdx(0); setTtsOn(false); setPaused(false); setBarW(0); setTtsLbl('Dinlemek için ▶ butonuna basın') }, [book])

  if (!book) return null

  const hasChapters = book.chapters?.length > 0
  const chText = hasChapters ? (book.chapters[chIdx]?.text || book.text) : book.text
  const paragraphs = (chText || '').split(/\n+/).filter(p => p.trim())

  const id = book.id
  const lc = (likes[id] || []).length
  const liked = (() => { const u = adminIn ? 'admin' : (curUser?.username || ''); return !!(u && (likes[id] || []).includes(u)) })()
  const comList = comments[id] || []

  function stopTTS() {
    setTtsOn(false); setPaused(false)
    if (typeof window.responsiveVoice !== 'undefined') { try { window.responsiveVoice.cancel() } catch {} }
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    clearInterval(barRef.current)
    setBarW(0); setTtsLbl('Dinlemek için ▶ butonuna basın')
  }

  function startTTS() {
    stopTTS()
    const text = chText || ''
    const rate = parseFloat(speed) || 1
    setTtsOn(true); setTtsLbl('Okunuyor...')
    const ms = (text.length / 15) * 1000 / rate
    let w = 0; const step = 100 / (ms / 250)
    barRef.current = setInterval(() => { w = Math.min(w + step, 97); setBarW(w) }, 250)

    if (typeof window.responsiveVoice !== 'undefined' && window.responsiveVoice.voiceSupport?.()) {
      window.responsiveVoice.speak(text, 'Turkish Male', {
        rate, pitch: .9, volume: 1,
        onend: () => { setTtsOn(false); setTtsLbl('Okuma tamamlandı ✓'); setBarW(100); clearInterval(barRef.current) },
        onerror: () => wsFallback(text, rate)
      }); return
    }
    wsFallback(text, rate)
  }

  function wsFallback(text, rate) {
    if (!window.speechSynthesis) { setTtsLbl('⚠ Ses desteklenmiyor'); setTtsOn(false); return }
    const chunks = text.match(/[^.!?\n]{1,200}[.!?\n]*/g) || [text]
    let idx = 0
    function next() {
      if (idx >= chunks.length) { setTtsOn(false); setTtsLbl('Okuma tamamlandı ✓'); setBarW(100); clearInterval(barRef.current); return }
      const u = new SpeechSynthesisUtterance(chunks[idx])
      u.lang = 'tr-TR'; u.rate = rate || 1; u.pitch = .9
      const vv = window.speechSynthesis.getVoices()
      const tv = vv.find(v => v.lang === 'tr-TR') || vv.find(v => v.lang.startsWith('tr'))
      if (tv) u.voice = tv
      u.onend = () => { idx++; next() }
      u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled') return; idx++; setTimeout(next, 200) }
      window.speechSynthesis.cancel(); setTimeout(() => { if (ttsRef.current.on) window.speechSynthesis.speak(u) }, 60)
    }
    ttsRef.current.on = true; next()
  }

  function handleTTS() {
    if (!ttsOn && !ttsPaused) { startTTS(); return }
    if (ttsOn) {
      if (window.responsiveVoice) try { window.responsiveVoice.pause() } catch {}
      if (window.speechSynthesis) window.speechSynthesis.pause()
      setTtsOn(false); setPaused(true); setTtsLbl('Duraklatıldı')
    } else if (ttsPaused) {
      if (window.responsiveVoice) try { window.responsiveVoice.resume() } catch {}
      if (window.speechSynthesis) window.speechSynthesis.resume()
      setTtsOn(true); setPaused(false); setTtsLbl('Okunuyor...')
    }
  }

  function submitComment() {
    if (!comment.trim()) return
    onComment(id, comment.trim()); setComment('')
  }

  const u = adminIn ? 'admin' : (curUser?.username || '')

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '1.5rem' }}>
      <button className="back-btn" onClick={onBack}>← Geri</button>

      <div className="read-hdr">
        <p className="read-cat">{book.category}</p>
        <h1 className="read-title">{book.title}</h1>
        <p className="read-author">{book.author}</p>
        {book.addedBy && book.addedBy !== 'admin' && (
          <>
            <p className="read-adder">Ekleyen: <span>{book.addedBy}</span></p>
            <p className="read-link">
              <span style={{ fontFamily: 'Space Mono', fontSize: '.58rem', color: 'var(--text3)' }}>Bağlantı</span>
              <br />
              <code style={{ fontSize: '.82rem', color: 'var(--accent)', background: 'var(--accent3)', padding: '.15rem .4rem', borderRadius: '4px' }}>
                {window.location.href}
              </code>
            </p>
          </>
        )}
      </div>

      <div className="tts-box">
        <button className="tts-play" onClick={handleTTS}>{ttsOn ? '⏸' : '▶'}</button>
        <div className="tts-info">
          <p className="tts-lbl">🎙 Sesli Okuma</p>
          <p className="tts-stat">{ttsLbl}</p>
          <div className="tts-prog"><div className="tts-bar" style={{ width: barW + '%' }} /></div>
        </div>
        <button className="tts-stop" onClick={stopTTS}>⏹</button>
        <select className="tts-spd" value={speed} onChange={e => { setSpeed(e.target.value); if (ttsOn || ttsPaused) { stopTTS(); setTimeout(startTTS, 100) } }}>
          <option value="0.7">0.7×</option><option value="1">1×</option>
          <option value="1.3">1.3×</option><option value="1.6">1.6×</option><option value="2">2×</option>
        </select>
      </div>

      {hasChapters && (
        <div className="ch-nav">
          <h4>📑 Bölümler</h4>
          {book.chapters.map((c, i) => (
            <div key={i} className={`ch-item${i === chIdx ? ' on' : ''}`} onClick={() => { setChIdx(i); stopTTS() }}>
              <span className="ch-num">{i + 1}</span>{c.title}
            </div>
          ))}
        </div>
      )}

      <div className="read-body">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="book-actions-bar">
        <button className={`like-btn${liked ? ' liked' : ''}`} onClick={() => onLike(id)}>
          ❤ {liked ? 'Beğenildi' : 'Beğen'} ({lc})
        </button>
        <span className="comment-count-label">💬 {comList.length} yorum</span>
      </div>

      <div className="comments-section">
        <h3>Yorumlar</h3>
        {u ? (
          <div className="comment-form">
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Yorum yaz..." />
            <div className="comment-form-footer">
              <button className="btn-primary" onClick={submitComment}>Gönder</button>
            </div>
          </div>
        ) : (
          <div className="comment-login-notice">
            Yorum yapmak için <span onClick={() => setAuthOpen(true)}>giriş yapın</span>
          </div>
        )}
        {comList.length === 0
          ? <p className="no-comments">Henüz yorum yok.</p>
          : comList.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-avatar">{initials(c.user)}</div>
                  <span className="comment-user">{c.user}</span>
                  <span className="comment-date">{fmt(c.ts)}</span>
                  {(u === c.user || adminIn) && (
                    <button className="comment-del" onClick={() => onDeleteComment(id, c.id)}>🗑</button>
                  )}
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            ))
        }
      </div>
    </div>
  )
}


































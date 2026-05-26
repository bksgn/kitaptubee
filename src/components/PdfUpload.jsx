// src/components/PdfUpload.jsx
import { useState, useRef } from 'react'

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib
  return new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = PDFJS_CDN
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN; res(window.pdfjsLib) }
    s.onerror = rej
    document.head.appendChild(s)
  })
}

async function extractPdfText(file, onProgress) {
  const lib = await loadPdfJs()
  const buf = await file.arrayBuffer()
  onProgress(20)
  const doc = await lib.getDocument({ data: buf }).promise
  const total = Math.min(doc.numPages, 15)
  const pages = []
  for (let i = 1; i <= total; i++) {
    const page = await doc.getPage(i)
    const tc = await page.getTextContent()
    pages.push(tc.items.map(it => it.str).join(' '))
    onProgress(20 + Math.round((i / total) * 45))
  }
  return pages.join('\n').trim()
}

async function analyzeWithAI(text, filename) {
  const sample = text.substring(0, 4000)
  const prompt = `Aşağıdaki kitap metnini analiz et ve JSON formatında yanıt ver.
Sadece JSON döndür, başka hiçbir şey yazma.
JSON şeması: {"title":"...","author":"...","category":"Roman|Şiir|Tarih|Bilim|Felsefe|Çocuk|Biyografi|Fantastik|Polisiye|Kişisel Gelişim","summary":"2-3 cümle özet"}

Dosya adı: ${filename}

Metin:
${sample}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  const data = await res.json()
  const txt = data.content?.[0]?.text || ''
  const clean = txt.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export default function PdfUpload({ onApply, showToast }) {
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState(null) // null | 0-100
  const [result, setResult] = useState(null)
  const inputRef = useRef()
  const extractedText = useRef('')

  async function process(file) {
    if (!file || file.type !== 'application/pdf') {
      showToast('⚠ Sadece PDF dosyası yükleyin'); return
    }
    setResult(null)
    setProgress(5)
    try {
      const text = await extractPdfText(file, p => setProgress(p))
      extractedText.current = text
      setProgress(70)
      try {
        const parsed = await analyzeWithAI(text, file.name)
        setProgress(100)
        setTimeout(() => {
          setProgress(null)
          setResult({ ...parsed, text })
          showToast('✅ PDF analiz edildi!')
        }, 400)
      } catch {
        setProgress(100)
        setTimeout(() => {
          setProgress(null)
          setResult({ title: file.name.replace('.pdf', ''), author: '', category: 'Roman', summary: 'Manuel doldurun', text })
          showToast('📄 PDF metni çıkarıldı — bilgileri kontrol edin')
        }, 400)
      }
    } catch {
      setProgress(null)
      showToast('⚠ PDF okunamadı')
    }
  }

  function apply() {
    if (!result) return
    onApply(result)
    showToast('✅ Form dolduruldu!')
  }

  function clear() {
    setResult(null); setProgress(null)
    if (inputRef.current) inputRef.current.value = ''
    showToast('Temizlendi')
  }

  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div className="form-lbl" style={{ marginBottom: '.5rem' }}>📄 PDF ile Hızlı Ekle (Opsiyonel)</div>

      {!result && progress === null && (
        <div
          className={`pdf-upload-zone${drag ? ' drag' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); process(e.dataTransfer.files[0]) }}
        >
          <input ref={inputRef} type="file" accept=".pdf" onChange={e => process(e.target.files[0])} />
          <span className="pdf-icon">📄</span>
          <div className="pdf-zone-txt">
            <strong>PDF Yükle</strong>
            Sürükle &amp; bırak veya tıkla · Otomatik veri çekme
          </div>
        </div>
      )}

      {progress !== null && (
        <div className="pdf-progress">
          <div className="pdf-prog-lbl">
            İşleniyor… <span>{progress}%</span>
          </div>
          <div className="pdf-prog-bar-wrap">
            <div className="pdf-prog-bar" style={{ width: progress + '%' }} />
          </div>
        </div>
      )}

      {result && (
        <div className="pdf-result-box">
          <div className="pdf-result-ttl">🤖 AI Tespiti — Formu doldurmak için Uygula butonuna basın</div>
          <div className="pdf-field"><span className="pdf-field-lbl">Başlık</span><span className="pdf-field-val">{result.title || '—'}</span></div>
          <div className="pdf-field"><span className="pdf-field-lbl">Yazar</span><span className="pdf-field-val">{result.author || '—'}</span></div>
          <div className="pdf-field"><span className="pdf-field-lbl">Kategori</span><span className="pdf-field-val">{result.category || '—'}</span></div>
          <div className="pdf-field"><span className="pdf-field-lbl">Özet</span><span className="pdf-field-val" style={{ fontSize: '.78rem', color: 'var(--text2)' }}>{result.summary || '—'}</span></div>
          <div style={{ marginTop: '.7rem', display: 'flex', gap: '.5rem' }}>
            <button className="pdf-fill-btn" onClick={apply}>✅ Formu Doldur</button>
            <button className="pdf-fill-btn" style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border2)' }} onClick={clear}>✕ Temizle</button>
          </div>
        </div>
      )}
    </div>
  )
}

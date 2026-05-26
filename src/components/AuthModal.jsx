// src/components/AuthModal.jsx
import { useState } from 'react'

const ADMIN_SECRET = 'admin123'

export default function AuthModal({ onLogin, onRegister, onAdminLogin, onClose }) {
  const [tab, setTab]         = useState('login')
  const [lUser, setLUser]     = useState('')
  const [lPass, setLPass]     = useState('')
  const [rUser, setRUser]     = useState('')
  const [rName, setRName]     = useState('')
  const [rPass, setRPass]     = useState('')
  const [err, setErr]         = useState('')

  function login() {
    if (!lUser.trim() || !lPass.trim()) { setErr('Kullanici adi ve sifre girin'); return }
    if (lPass === ADMIN_SECRET) { onAdminLogin(lPass); setErr(''); return }
    if (!onLogin(lUser, lPass)) { setErr('Kullanici adi veya sifre hatali'); return }
    setErr('')
  }

  function register() {
    if (!rUser.trim() || rPass.length < 4) { setErr('Kullanici adi ve min. 4 karakter sifre zorunlu'); return }
    if (!onRegister(rUser, rName, rPass)) { setErr('Bu kullanici adi zaten alinmis'); return }
    setErr('')
  }

  return (
    <div className="overlay on" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img src="/logo.png" alt="KitapTube" style={{ height: '64px', marginBottom: '.5rem' }} />
          <h2 className="modal-ttl" style={{ margin: 0, paddingBottom: 0, border: 'none' }}><em>KitapTube</em></h2>
        </div>
        <div className="auth-tabs">
          <button className={'auth-tab' + (tab === 'login' ? ' on' : '')} onClick={() => { setTab('login'); setErr('') }}>Giris Yap</button>
          <button className={'auth-tab' + (tab === 'register' ? ' on' : '')} onClick={() => { setTab('register'); setErr('') }}>Uye Ol</button>
        </div>

        {tab === 'login' && (
          <>
            <div className="form-g" style={{ marginBottom: '.75rem' }}>
              <label className="form-lbl">Kullanici Adi</label>
              <input className="form-in" value={lUser} onChange={e => setLUser(e.target.value)} placeholder="kullaniciadi" onKeyDown={e => e.key === 'Enter' && login()} autoFocus />
            </div>
            <div className="form-g" style={{ marginBottom: '1rem' }}>
              <label className="form-lbl">Sifre</label>
              <input className="form-in" type="password" value={lPass} onChange={e => setLPass(e.target.value)} placeholder="sifre" onKeyDown={e => e.key === 'Enter' && login()} />
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={login}>Giris Yap</button>
          </>
        )}

        {tab === 'register' && (
          <>
            <div className="form-g" style={{ marginBottom: '.75rem' }}>
              <label className="form-lbl">Kullanici Adi *</label>
              <input className="form-in" value={rUser} onChange={e => setRUser(e.target.value)} placeholder="kullaniciadi" />
            </div>
            <div className="form-g" style={{ marginBottom: '.75rem' }}>
              <label className="form-lbl">Ad Soyad</label>
              <input className="form-in" value={rName} onChange={e => setRName(e.target.value)} placeholder="Ad Soyad" />
            </div>
            <div className="form-g" style={{ marginBottom: '1rem' }}>
              <label className="form-lbl">Sifre *</label>
              <input className="form-in" type="password" value={rPass} onChange={e => setRPass(e.target.value)} placeholder="min. 4 karakter" />
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={register}>Uye Ol</button>
          </>
        )}

        {err && <p style={{ color: 'var(--red)', fontSize: '.78rem', marginTop: '.6rem', textAlign: 'center' }}>{err}</p>}
      </div>
    </div>
  )
}

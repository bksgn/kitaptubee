// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-row">
            <span className="footer-name">KitapTube</span>
            <img src="/logo.png" alt="KitapTube" className="footer-logo" />
          </div>
          <p className="footer-tagline">Oku, dinle, keşfet.</p>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Gizlilik Politikası</a>
          <a href="#" className="footer-link">Hakkımızda</a>
          <a href="#" className="footer-link">İletişim</a>
        </div>
        <div className="footer-copy">
          <span>© 2026 <strong>KitapTube</strong>. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  )
}

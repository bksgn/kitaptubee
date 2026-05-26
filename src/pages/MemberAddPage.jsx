// src/pages/MemberAddPage.jsx
import BookForm from '../components/BookForm'

export default function MemberAddPage({ curUser, onSubmit, onCancel, showToast }) {
  function handleSubmit(data) {
    onSubmit(data, curUser.username)
    onCancel()
  }

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 className="page-title"><em>Kitap</em> Öner</h1>
      <p className="page-sub">Eklediğiniz kitap admin onayından sonra yayınlanacaktır.</p>
      <div className="info-box">⏳ Onay bekleyen kitaplarınızı profilinizden takip edebilirsiniz.</div>
      <BookForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
        showToast={showToast}
        submitLabel="📨 Onaya Gönder"
      />
    </div>
  )
}

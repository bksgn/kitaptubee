// src/pages/ProfilePage.jsx
import { initials } from '../utils/storage'

export default function ProfilePage({ curUser, adminIn, books, pending, rejected, likes, onLogout, onOpenBook }) {
  if (!curUser && !adminIn) return null
  const uname = adminIn ? 'admin' : curUser.username
  const dispName = adminIn ? 'Admin' : (curUser.name || curUser.username)
  const myBooks   = books.filter(b => b.addedBy === uname)
  const myPending = adminIn ? [] : pending.filter(p => p.addedBy === uname)
  const myRejected = adminIn ? [] : rejected.filter(r => r.addedBy === uname)
  const myLikes   = Object.keys(likes).filter(id => (likes[id] || []).includes(uname)).length

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.5rem' }}>
      <div className="profile-hdr">
        <div className="profile-avatar-big">{initials(dispName)}</div>
        <h1 className="profile-name"><em>{dispName}</em></h1>
        <p className="profile-role">{adminIn ? '👑 Yönetici' : '👤 Üye'}</p>
        <div className="profile-stats">
          <div className="p-stat"><div className="p-stat-v">{myBooks.length}</div><div className="p-stat-l">Yayınlanan</div></div>
          {myPending.length > 0 && <div className="p-stat"><div className="p-stat-v">{myPending.length}</div><div className="p-stat-l">Bekleyen</div></div>}
          <div className="p-stat"><div className="p-stat-v">{myLikes}</div><div className="p-stat-l">Beğenilen</div></div>
        </div>
        <button className="btn-sec" style={{ marginTop: '1.2rem' }} onClick={onLogout}>Çıkış Yap</button>
      </div>

      {myPending.length > 0 && (
        <>
          <h3 className="section-title">⏳ Onay Bekleyen Kitaplarım</h3>
          {myPending.map(p => (
            <div key={p.id} className="profile-book-item">
              <div style={{ flex: 1 }}><b>{p.title}</b><br /><small style={{ color: 'var(--text2)' }}>{p.author}</small></div>
              <span className="book-status status-pending">Bekliyor</span>
            </div>
          ))}
        </>
      )}

      {myRejected.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: '1.5rem' }}>❌ Reddedilen Kitaplar</h3>
          {myRejected.map(r => (
            <div key={r.id} className="profile-book-item">
              <div style={{ flex: 1 }}><b>{r.title}</b><br /><small style={{ color: 'var(--text2)' }}>{r.author}</small></div>
              <span className="book-status status-rejected">Reddedildi</span>
            </div>
          ))}
        </>
      )}

      {myBooks.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: '1.5rem' }}>✅ Yayınlanan Kitaplarım</h3>
          {myBooks.map(b => (
            <div key={b.id} className="profile-book-item clickable" onClick={() => onOpenBook(b.id)}>
              <div style={{ flex: 1 }}><b>{b.title}</b><br /><small style={{ color: 'var(--text2)' }}>{b.author}</small></div>
              <span className="book-status status-published">Yayında</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}


// src/pages/FavPage.jsx — export as named from same file for simplicity
export function FavPage({ books, favs, likes, comments, userLiked, likeCount, commentCount, toggleFav, onOpen, onListen }) {
  const list = books.filter(b => favs.includes(b.id))
  // lazy import BookCard inline
  const { default: BookCard } = { default: require('../components/BookCard').default }

  if (list.length === 0) {
    return (
      <div className="books-grid">
        <div className="empty">
          <div className="ei">♥</div>
          <h3>Favori yok</h3>
          <p>Kitap kartlarındaki ♥ ile favorilerinize ekleyin.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="hero" style={{ paddingBottom: '1rem' }}>
        <h1 className="hero-title"><em>Favorilerim</em></h1>
      </div>
      <div className="books-grid">
        {list.map((b, i) => (
          <BookCard key={b.id} book={b} isFav delay={i * .05}
            liked={userLiked(b.id)} likeCount={likeCount(b.id)} commentCount={commentCount(b.id)}
            onOpen={onOpen} onListen={onListen} onFav={toggleFav} />
        ))}
      </div>
    </>
  )
}

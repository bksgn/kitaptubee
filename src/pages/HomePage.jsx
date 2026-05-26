// src/pages/HomePage.jsx
import { useState } from 'react'
import BookCard from '../components/BookCard'

export default function HomePage({ books, favs, likes, comments, userLiked, likeCount, commentCount, toggleFav, onOpen, onListen }) {
  const [search, setSearch]   = useState('')
  const [activeCat, setActiveCat] = useState('all')

  const cats = ['all', ...new Set(books.map(b => b.category))]
  const filtered = books.filter(b =>
    (!search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) &&
    (activeCat === 'all' || b.category === activeCat)
  )

  return (
    <>
      <div className="hero">
        <p className="hero-eye">✦ Dijital Kütüphane ✦</p>
        <h1 className="hero-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center' }}>
            KitapTube
            <img src="/logo.png" alt="Logo" className="hero-logo-img" />
          </span>
          <br /><em>ile</em> Oku
        </h1>
        <p className="hero-sub">Yüzlerce kitap, tek platformda. Oku, dinle, keşfet.</p>
        <div className="search-wrap">
          <span className="si">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kitap veya yazar ara..." />
        </div>
      </div>

      <div className="cat-bar">
        {cats.map(c => (
          <button key={c} className={`cat-pill${activeCat === c ? ' on' : ''}`} onClick={() => setActiveCat(c)}>
            {c === 'all' ? 'Tümü' : c}
          </button>
        ))}
      </div>

      <div className="books-grid">
        {filtered.length === 0
          ? <div className="empty"><div className="ei">📚</div><h3>Kitap bulunamadı</h3></div>
          : filtered.map((b, i) => (
              <BookCard
                key={b.id}
                book={b}
                isFav={favs.includes(b.id)}
                liked={userLiked(b.id)}
                likeCount={likeCount(b.id)}
                commentCount={commentCount(b.id)}
                delay={i * 0.05}
                onOpen={onOpen}
                onListen={onListen}
                onFav={toggleFav}
              />
            ))
        }
      </div>
    </>
  )
}

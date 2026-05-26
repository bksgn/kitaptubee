// src/pages/FavPage.jsx
import BookCard from '../components/BookCard'

export default function FavPage({ books, favs, userLiked, likeCount, commentCount, toggleFav, onOpen, onListen }) {
  const list = books.filter(b => favs.includes(b.id))

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
          <BookCard key={b.id} book={b} isFav
            liked={userLiked(b.id)} likeCount={likeCount(b.id)} commentCount={commentCount(b.id)}
            delay={i * .05} onOpen={onOpen} onListen={onListen} onFav={toggleFav} />
        ))}
      </div>
    </>
  )
}

// src/components/BookCard.jsx
import { CAT_COLORS, CAT_ICONS, escH } from '../utils/storage'

export default function BookCard({ book, isFav, liked, likeCount, commentCount, onOpen, onListen, onFav, delay = 0 }) {
  const cc = CAT_COLORS[book.category] || '#1e1e2e'
  const ci = CAT_ICONS[book.category] || '📚'

  return (
    <div className="book-card" style={{ animationDelay: delay + 's' }}>
      <div className="book-cover">
        {book.cover
          ? <img src={book.cover} alt="" onError={e => e.target.style.display = 'none'} />
          : <div className="cover-ph" style={{ background: cc }}>
              <span className="icon">{ci}</span>
              <span className="ttl">{book.title}</span>
            </div>
        }
        <button className={`fav-btn${isFav ? ' on' : ''}`} onClick={() => onFav(book.id)}>♥</button>
      </div>
      <div className="book-info">
        <p className="book-cat">{book.category}</p>
        <h3 className="book-title" onClick={() => onOpen(book.id, false)}>{book.title}</h3>
        <p className="book-author">{book.author}</p>
        {book.addedBy && book.addedBy !== 'admin' && (
          <p className="book-adder">Ekleyen: <span>{book.addedBy}</span></p>
        )}
        <div className="book-stats">
          <span className={`stat-pill${liked ? ' liked' : ''}`}>❤ {likeCount}</span>
          <span className="stat-pill">💬 {commentCount}</span>
        </div>
        <div className="book-btns">
          <button className="btn-read" onClick={() => onOpen(book.id, false)}>📖 Oku</button>
          <button className="btn-listen" onClick={() => onListen(book.id)}>🎙 Dinle</button>
        </div>
      </div>
    </div>
  )
}

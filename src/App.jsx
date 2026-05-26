// src/App.jsx
import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Link, Navigate, useParams } from 'react-router-dom'
import { useAppState } from './hooks/useAppState'
import HomePage from './pages/HomePage'
import ReadPage from './pages/ReadPage'
import AdminPage from './pages/AdminPage'
import MemberAddPage from './pages/MemberAddPage'
import ProfilePage from './pages/ProfilePage'
import FavPage from './pages/FavPage'
import AuthModal from './components/AuthModal'
import { initials } from './utils/storage'
import { generateSlug } from './utils/slugify'

function ReadPageWrapper({ books, curUser, adminIn, likes, comments, toggleLike, addComment, deleteComment, setAuthOpen }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const book = books.find(b => generateSlug(b.author, b.title) === slug)
  
  if (!book && books.length > 0) {
    return <div style={{padding:'2rem',textAlign:'center'}}>Kitap bulunamadı. <Link to="/" style={{color:'var(--accent)'}}>Ana Sayfaya Dön</Link></div>
  }
  if (!book) return null

  return (
    <ReadPage
      book={book} curUser={curUser} adminIn={adminIn}
      likes={likes} comments={comments}
      onBack={() => navigate('/')}
      onLike={toggleLike} onComment={addComment} onDeleteComment={deleteComment}
      setAuthOpen={setAuthOpen}
    />
  )
}

export default function App() {
  const state = useAppState()
  const {
    books, pending, rejected, users, likes, comments, favs,
    curUser, adminIn, darkMode, setDarkMode, toast, authOpen, setAuthOpen,
    likeCount, commentCount, userLiked,
    toggleFav, toggleLike, addComment, deleteComment,
    publishBook, updateBook, deleteBook,
    approvePending, rejectPending, submitPending,
    doLogin, doRegister, doAdminLogin, doLogout,
    addGutenbergBook, showToast
  } = state

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    if (['/giris', '/kayit', '/giriş', '/kayıt'].includes(location.pathname)) {
      setAuthOpen(true)
    }
  }, [location.pathname, setAuthOpen])

  function openBook(id, autoListen) {
    const b = books.find(x => x.id === id)
    if (!b) return
    const slug = generateSlug(b.author, b.title)
    navigate(`/${slug}`, { state: { autoListen, bookId: id } })
  }

  const dispName = adminIn ? 'Admin' : (curUser ? initials(curUser.name || curUser.username) : '')

  return (
    <>
      <nav>
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="KitapTube" className="nav-logo-img" />
          <span>KitapTube</span>
        </Link>
        <Link to="/" className={`nav-btn${location.pathname === '/' ? ' active' : ''}`}>🏠 Ana Sayfa</Link>
        <Link to="/favoriler" className={`nav-btn${location.pathname === '/favoriler' ? ' active' : ''}`}>♥ Favoriler</Link>

        {adminIn && (
          <>
            <Link to="/admin" className={`nav-btn${location.pathname === '/admin' ? ' active' : ''}`}>⚙ Admin</Link>
            <Link to="/admin" className="nav-avatar">A</Link>
          </>
        )}
        {!adminIn && curUser && (
          <>
            <Link to="/kitap-oner" className={`nav-btn${location.pathname === '/kitap-oner' ? ' active' : ''}`}>+ Kitap Öner</Link>
            <Link to="/profil" className="nav-avatar">{dispName}</Link>
          </>
        )}
        {!adminIn && !curUser && (
          <Link to="/giris" className="nav-btn">Giriş / Üye Ol</Link>
        )}

        <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀' : '🌙'}</button>
      </nav>

      <Routes>
        <Route path="/" element={
          <HomePage
            books={books} favs={favs} likes={likes} comments={comments}
            userLiked={userLiked} likeCount={likeCount} commentCount={commentCount}
            toggleFav={toggleFav} onOpen={openBook} onListen={(id) => openBook(id, true)}
          />
        } />
        <Route path="/favoriler" element={
          <FavPage
            books={books} favs={favs}
            userLiked={userLiked} likeCount={likeCount} commentCount={commentCount}
            toggleFav={toggleFav} onOpen={openBook} onListen={(id) => openBook(id, true)}
          />
        } />
        <Route path="/admin" element={
          adminIn ? <AdminPage
            books={books} pending={pending} users={users}
            likeCount={likeCount} commentCount={commentCount}
            onLogout={() => { doLogout(); navigate('/') }}
            onPublish={publishBook} onUpdate={updateBook} onDelete={deleteBook}
            onApprove={approvePending} onReject={rejectPending}
            onAutoAdd={addGutenbergBook} showToast={showToast}
            onOpenBook={id => openBook(id, false)}
          /> : <Navigate to="/" />
        } />
        <Route path="/kitap-oner" element={
          curUser ? <MemberAddPage
            curUser={curUser} onSubmit={submitPending}
            onCancel={() => navigate('/profil')} showToast={showToast}
          /> : <Navigate to="/" />
        } />
        <Route path="/profil" element={
          curUser || adminIn ? <ProfilePage
            curUser={curUser} adminIn={adminIn}
            books={books} pending={pending} rejected={rejected} likes={likes}
            onLogout={() => { doLogout(); navigate('/') }}
            onOpenBook={id => openBook(id, false)}
          /> : <Navigate to="/" />
        } />
        <Route path="/giris" element={
          <HomePage
            books={books} favs={favs} likes={likes} comments={comments}
            userLiked={userLiked} likeCount={likeCount} commentCount={commentCount}
            toggleFav={toggleFav} onOpen={openBook} onListen={(id) => openBook(id, true)}
          />
        } />
        <Route path="/kayit" element={
          <HomePage
            books={books} favs={favs} likes={likes} comments={comments}
            userLiked={userLiked} likeCount={likeCount} commentCount={commentCount}
            toggleFav={toggleFav} onOpen={openBook} onListen={(id) => openBook(id, true)}
          />
        } />
        <Route path="/giriş" element={<Navigate to="/giris" replace />} />
        <Route path="/kayıt" element={<Navigate to="/kayit" replace />} />
        <Route path="/:slug" element={
          <ReadPageWrapper 
             books={books} curUser={curUser} adminIn={adminIn} 
             likes={likes} comments={comments}
             toggleLike={toggleLike} addComment={addComment} deleteComment={deleteComment}
             setAuthOpen={setAuthOpen}
          />
        } />
      </Routes>

      {authOpen && (
        <AuthModal
          onLogin={(...args) => { doLogin(...args); navigate('/') }}
          onRegister={(...args) => { doRegister(...args); navigate('/') }}
          onAdminLogin={(...args) => { doAdminLogin(...args); navigate('/') }}
          onClose={() => {
            setAuthOpen(false)
            if (['/giris', '/kayit', '/giriş', '/kayıt'].includes(location.pathname)) {
               navigate('/')
            }
          }}
        />
      )}

      <div className={`toast${toast.on ? ' on' : ''}`}>{toast.msg}</div>
      <footer><strong>KitapTube</strong> © 2024</footer>
    </>
  )
}

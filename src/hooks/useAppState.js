// src/hooks/useAppState.js
import { useState, useCallback, useEffect } from 'react'
import { sp, ss, DEMO_BOOKS, slugify, ensureSlugs } from '../utils/storage'

function initBooks() {
  const b = sp('k_books', [])
  if (!b.length) { ss('k_books', DEMO_BOOKS); return DEMO_BOOKS }
  const withSlugs = ensureSlugs(b)
  if (withSlugs !== b) ss('k_books', withSlugs)
  return withSlugs
}

export function useAppState() {
  const [books, setBooks]       = useState(initBooks)
  const [pending, setPending]   = useState(() => sp('k_pending', []))
  const [rejected, setRejected] = useState(() => sp('k_rejected', []))
  const [users, setUsers]       = useState(() => sp('k_users', {}))
  const [likes, setLikes]       = useState(() => sp('k_likes', {}))
  const [comments, setComments] = useState(() => sp('k_comments', {}))
  const [favs, setFavs]         = useState(() => sp('k_favs', []))
  const [curUser, setCurUser]   = useState(null)
  const [adminIn, setAdminIn]   = useState(false)
  const [page, setPageRaw]      = useState(() => {
    const h = window.location.hash.slice(1)
    if (h.startsWith('book/')) return 'read'
    if (['home','fav','admin','member-add','profile'].includes(h)) return h
    return 'home'
  })
  const setPage = useCallback((p) => {
    setPageRaw(p)
    if (p === 'home') window.location.hash = ''
    else if (p === 'read') { /* book hash set separately */ }
    else window.location.hash = p
  }, [])
  const [curBook, setCurBookRaw] = useState(() => {
    const h = window.location.hash.slice(1)
    if (h.startsWith('book/')) {
      const bid = h.replace('book/', '')
      const all = initBooks()
      return all.find(b => b.id === bid) || null
    }
    return null
  })
  const setCurBook = useCallback((b) => {
    setCurBookRaw(b)
    if (b && b.id) window.location.hash = 'book/' + b.id
    else if (!b && window.location.hash.startsWith('#book/')) window.location.hash = ''
  }, [])
  const [darkMode, setDarkMode] = useState(true)
  const [toast, setToast]       = useState({ msg: '', on: false })
  const [authOpen, setAuthOpen] = useState(false)
  const [gbOpen, setGbOpen]     = useState(false)

  // Hash routing listener
  useEffect(() => {
    function onHash() {
      const h = window.location.hash.slice(1)
      if (h.startsWith('book/')) {
        const bid = h.replace('book/', '')
        const b = books.find(x => x.id === bid)
        if (b) { setCurBookRaw(b); setPageRaw('read') }
        else { setPageRaw('home') }
      } else if (['home','fav','admin','member-add','profile'].includes(h)) {
        setPageRaw(h)
        if (h !== 'read') setCurBookRaw(null)
      } else if (!h) {
        setPageRaw('home')
        setCurBookRaw(null)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [books])
  const [toastTimer, setToastTimer] = useState(null)

  const save = useCallback((b, p, r, u, l, c, f) => {
    ss('k_books', b); ss('k_pending', p); ss('k_rejected', r)
    ss('k_users', u); ss('k_likes', l); ss('k_comments', c); ss('k_favs', f)
  }, [])

  const showToast = useCallback((msg) => {
    setToast({ msg, on: true })
    clearTimeout(toastTimer)
    const t = setTimeout(() => setToast(prev => ({ ...prev, on: false })), 2800)
    setToastTimer(t)
  }, [toastTimer])

  const likeCount = (id) => (likes[id] || []).length
  const commentCount = (id) => (comments[id] || []).length
  const userLiked = (id) => {
    const u = adminIn ? 'admin' : (curUser ? curUser.username : '')
    return !!(u && (likes[id] || []).includes(u))
  }

  const toggleFav = useCallback((id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      ss('k_favs', next)
      showToast(next.includes(id) ? '❤ Favorilere eklendi' : '💔 Çıkarıldı')
      return next
    })
  }, [showToast])

  const toggleLike = useCallback((bookId) => {
    const u = adminIn ? 'admin' : (curUser ? curUser.username : '')
    if (!u) { setAuthOpen(true); showToast('Beğenmek için giriş yapın'); return }
    setLikes(prev => {
      const arr = [...(prev[bookId] || [])]
      const i = arr.indexOf(u)
      if (i > -1) arr.splice(i, 1); else arr.push(u)
      const next = { ...prev, [bookId]: arr }
      ss('k_likes', next)
      return next
    })
  }, [adminIn, curUser, showToast])

  const addComment = useCallback((bookId, text) => {
    const u = adminIn ? 'admin' : (curUser ? curUser.username : '')
    if (!u) return
    const c = { id: 'c_' + Date.now(), user: u, text, ts: Date.now() }
    setComments(prev => {
      const next = { ...prev, [bookId]: [...(prev[bookId] || []), c] }
      ss('k_comments', next)
      return next
    })
  }, [adminIn, curUser])

  const deleteComment = useCallback((bookId, cid) => {
    setComments(prev => {
      const next = { ...prev, [bookId]: (prev[bookId] || []).filter(c => c.id !== cid) }
      ss('k_comments', next)
      return next
    })
  }, [])

  const publishBook = useCallback((bookData) => {
    setBooks(prev => {
      const slug = slugify(bookData.title)
      const next = [...prev, { ...bookData, id: 'b_' + Date.now(), slug, addedBy: 'admin' }]
      ss('k_books', next)
      return next
    })
    showToast('🚀 Yayınlandı!')
  }, [showToast])

  const updateBook = useCallback((id, bookData) => {
    setBooks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...bookData, slug: slugify(bookData.title || b.title) } : b)
      ss('k_books', next)
      return next
    })
    showToast('✅ Güncellendi')
  }, [showToast])

  const deleteBook = useCallback((id) => {
    setBooks(prev => { const next = prev.filter(b => b.id !== id); ss('k_books', next); return next })
    showToast('🗑 Silindi')
  }, [showToast])

  const approvePending = useCallback((pid) => {
    setPending(prev => {
      const item = prev.find(x => x.id === pid)
      if (!item) return prev
      const slug = slugify(item.title)
      setBooks(b => { const next = [...b, { ...item, id: 'b_' + Date.now(), slug }]; ss('k_books', next); return next })
      const next = prev.filter(x => x.id !== pid)
      ss('k_pending', next)
      showToast(`✅ "${item.title}" yayınlandı!`)
      return next
    })
  }, [showToast])

  const rejectPending = useCallback((pid) => {
    setPending(prev => {
      const item = prev.find(x => x.id === pid)
      if (!item) return prev
      setRejected(r => { const next = [...r, { ...item, status: 'rejected' }]; ss('k_rejected', next); return next })
      const next = prev.filter(x => x.id !== pid)
      ss('k_pending', next)
      showToast(`🗑 "${item.title}" reddedildi`)
      return next
    })
  }, [showToast])

  const submitPending = useCallback((bookData, username) => {
    setPending(prev => {
      const next = [...prev, { ...bookData, id: 'p_' + Date.now(), addedBy: username }]
      ss('k_pending', next)
      return next
    })
    showToast('📨 Kitabınız onay için gönderildi!')
  }, [showToast])

  const doLogin = useCallback((username, password) => {
    const u = users[username]
    if (!u || u.password !== password) return false
    setCurUser(u); setAdminIn(false); setAuthOpen(false)
    showToast(`👋 Hoş geldin, ${u.name || username}!`)
    return true
  }, [users, showToast])

  const doRegister = useCallback((username, name, password) => {
    if (users[username]) return false
    const u = { username, name, password }
    setUsers(prev => { const next = { ...prev, [username]: u }; ss('k_users', next); return next })
    setCurUser(u); setAdminIn(false); setAuthOpen(false)
    showToast(`🎉 Hesap oluşturuldu, hoş geldin ${name || username}!`)
    return true
  }, [users, showToast])

  const doAdminLogin = useCallback((password) => {
    if (password !== 'admin123') return false
    setAdminIn(true); setCurUser(null); setAuthOpen(false)
    showToast('👑 Admin girişi başarılı!')
    return true
  }, [showToast])

  const doLogout = useCallback(() => {
    setCurUser(null); setAdminIn(false)
    setPage('home')
    showToast('Çıkış yapıldı')
  }, [setPage, showToast])

  const addGutenbergBook = useCallback((bookData) => {
    setBooks(prev => {
      const slug = slugify(bookData.title)
      const next = [...prev, { ...bookData, slug, addedBy: 'admin' }]
      ss('k_books', next)
      return next
    })
  }, [])

  return {
    books, pending, rejected, users, likes, comments, favs,
    curUser, adminIn, page, setPage, curBook, setCurBook,
    darkMode, setDarkMode, toast, authOpen, setAuthOpen,
    gbOpen, setGbOpen,
    likeCount, commentCount, userLiked,
    toggleFav, toggleLike, addComment, deleteComment,
    publishBook, updateBook, deleteBook,
    approvePending, rejectPending, submitPending,
    doLogin, doRegister, doAdminLogin, doLogout,
    addGutenbergBook, showToast
  }
}

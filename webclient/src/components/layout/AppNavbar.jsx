import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import ThemeToggle from '@/components/common/ThemeToggle'
import SearchModal from '@/components/common/SearchModal'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default function AppNavbar() {
  const { t } = useTranslation(['navigation', 'common'])
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllRead } = useNotifications()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const notifRef = useRef(null)
  const userRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isDocsPage = location.pathname.startsWith('/docs')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setNotifOpen(false)
    setUserDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const navLinks = [
    { label: t('navigation:about'), path: '/about' },
    { label: t('navigation:portfolio'), path: '/projects' },
    { label: t('navigation:services'), path: '/services' },
    { label: t('navigation:blog'), path: '/blog' },
    { label: t('navigation:contact'), path: '/contact' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const getRoleLabel = () => {
    const roleKey = user?.role?.name
    if (roleKey && ['superadmin', 'admin', 'member'].includes(roleKey)) {
      return t(`common:roles.${roleKey}`)
    }
    return user?.role?.display_name || user?.role?.name || t('common:roles.member')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isDocsPage
            ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]'
            : scrolled
            ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06] shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${isDocsPage ? 'h-[68px]' : 'h-[72px]'}`}>
            {/* Logo */}
            <Link to="/" className="nav-logo group flex items-center gap-2.5 relative">
              <img
                src="/favicon.svg"
                alt={t('common:logoAlt')}
                width="40"
                height="40"
                className={`rounded-full object-contain transition-transform duration-300 group-hover:scale-[1.04] ${
                  isDocsPage ? 'w-9 h-9' : 'w-10 h-10'
                }`}
              />
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold tracking-tight text-[15px] text-gray-900 dark:text-white group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors duration-300">
                  {t('common:appName')}
                </span>
                <span className="font-medium uppercase tracking-[0.2em] text-[9px] text-gray-400 dark:text-gray-500">
                  {t('common:appSubtitle')}
                </span>
              </div>
              {isDocsPage && (
                <>
                  <span className="hidden sm:block text-gray-300 dark:text-white/20 mx-1 text-xl font-thin">/</span>
                  <span className="hidden sm:block text-[13px] font-semibold text-gray-500 dark:text-gray-300">
                    {t('navigation:documentation')}
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            {isDocsPage ? (
              <div className="hidden lg:flex flex-1 items-center mx-6">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="w-full max-w-xl flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 dark:text-gray-500 border border-black/[0.08] dark:border-white/[0.08] bg-gray-50/80 dark:bg-white/[0.03] hover:border-black/[0.16] dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-200"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span className="flex-1 text-left">{t('navigation:searchDocs')}</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] text-[10px] font-code text-gray-400 border border-gray-200/50 dark:border-white/[0.06]">
                    ⌘K
                  </kbd>
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center">
                <div className="nav-links-container relative flex items-center gap-0.5 p-1 rounded-xl bg-gray-100/60 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
                  {navLinks.map((link) => {
                    const active = isActive(link.path)
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`relative z-10 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-200 ${
 active
 ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
 }`}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {!isDocsPage && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="nav-action-btn hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 dark:text-gray-500 border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:border-black/[0.16] dark:hover:border-white/20 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
                  title={t('common:actions.searchLabel')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span className="hidden md:inline font-medium">{t('common:actions.searchLabel')}</span>
                  <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] text-[10px] font-code text-gray-400 border border-gray-200/50 dark:border-white/[0.06]">
                    ⌘K
                  </kbd>
                </button>
              )}

              <div className="hidden sm:block w-px h-6 bg-gray-200 dark:bg-white/10" />

              <LanguageSwitcher />
              <ThemeToggle />

              {/* User / Auth */}
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen((prev) => {
                          const next = !prev
                          if (next) {
                            fetchNotifications()
                          }
                          return next
                        })
                      }}
                      className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all"
                      aria-label={t('navigation:notifications')}
                    >
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-2xl p-4 z-50 animate-slide-down">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{t('navigation:notifications')}</h4>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllRead}
                              className="text-xs text-brand-violet dark:text-brand-cyan hover:underline"
                            >
                              {t('navigation:markAllAsRead')}
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto space-y-2">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-6">{t('navigation:noNotifications')}</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                  !n.read_at
                                    ? 'bg-brand-violet/5 dark:bg-brand-cyan/5 border-l-2 border-brand-violet dark:border-brand-cyan'
                                    : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                                }`}
                              >
                                <div className="font-medium text-gray-900 dark:text-white">{n.title || n.data?.title || t('navigation:notice')}</div>
                                <div className="text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {n.message || n.data?.message}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Avatar Dropdown */}
                  <div className="relative" ref={userRef}>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-slide-down">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                          <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</div>
                          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                          <div className="mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-brand-violet/10 text-brand-violet dark:text-brand-cyan">
                            {getRoleLabel()}
                          </div>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-violet dark:text-brand-cyan hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                          >
                            {t('navigation:adminDashboard')}
                          </Link>
                        )}
                        <Link
                          to="/member/profile"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                        >
                          {t('navigation:myProfile')}
                        </Link>
                        <Link
                          to="/member/settings"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                        >
                          {t('navigation:accountSettings')}
                        </Link>
                        {user?.username && (
                          <Link
                            to={`/author/${user.username}`}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                          >
                            {t('navigation:publicProfile')}
                          </Link>
                        )}

                        <div className="my-1 border-t border-gray-100 dark:border-white/10" />

                        <button
                          type="button"
                          onClick={async () => {
                            await logout()
                            navigate('/')
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium"
                        >
                          {t('navigation:signOut')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/contact"
                    className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-brand text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    {t('navigation:hireMe')}
                  </Link>
                  <Link
                    to="/auth/login"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                  >
                    {t('navigation:signIn')}
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                aria-label={t('navigation:toggleNavigation')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-dark-900/95 backdrop-blur-2xl px-4 py-6 space-y-2 animate-slide-down">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                setSearchOpen(true)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 bg-gray-100 dark:bg-white/[0.05] mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>{t('common:actions.search')}</span>
            </button>

            {navLinks.map((link) => {
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex gap-2">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold border border-gray-300 dark:border-white/20 text-gray-800 dark:text-white"
                >
                  {t('navigation:logIn')}
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-gradient-brand text-white"
                >
                  {t('navigation:signUp')}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

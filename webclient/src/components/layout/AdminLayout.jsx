import React, { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import ThemeToggle from '@/components/common/ThemeToggle'
import AdminSearchModal from '@/components/shared/AdminSearchModal'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default function AdminLayout() {
  const { t } = useTranslation(['navigation', 'common'])
  const { user, isSuperAdmin, logout } = useAuth()
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUi()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Close mobile sidebar on route change
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    setUserMenuOpen(false)
  }, [location.pathname, setSidebarOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const overviewNav = [
    {
      to: '/admin',
      label: t('navigation:dashboard'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
  ]

  const portfolioNav = [
    {
      to: '/admin/projects',
      label: t('navigation:projects'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
    },
    {
      to: '/admin/skills',
      label: t('navigation:skills') || 'Skills & Stack',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-4.486c-.048-.58-.024-1.193.14-1.743m-6.369 6.369c-.275-.275-.436-.639-.475-1.015a3.75 3.75 0 011.015-2.735 3.75 3.75 0 012.735-1.015c.376.039.74.2 1.015.475m-4.29 4.29l4.29-4.29" />
        </svg>
      ),
    },
    {
      to: '/admin/experience',
      label: t('navigation:experience') || 'Experience',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      ),
    },
    {
      to: '/admin/services',
      label: t('navigation:services') || 'Services',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
        </svg>
      ),
    },
  ]

  const contentNav = [
    {
      to: '/admin/blog',
      label: t('navigation:blogPosts'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      to: '/admin/series',
      label: t('navigation:series'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0120.25 9v.878m-16.5 0a2.25 2.25 0 00-.75 1.622v4.5A2.25 2.25 0 005.25 18h13.5A2.25 2.25 0 0021 16.5v-4.5a2.25 2.25 0 00-.75-1.622" />
        </svg>
      ),
    },
    {
      to: '/admin/categories',
      label: t('navigation:categories'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      ),
    },
    {
      to: '/admin/tags',
      label: t('navigation:tags'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
    },
    {
      to: '/admin/media',
      label: t('navigation:media'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
  ]

  const interactionNav = [
    {
      to: '/admin/messages',
      label: t('navigation:messages'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
  ]

  const systemNav = [
    {
      to: '/admin/resume',
      label: t('navigation:resumeCv') || 'Resume / CV',
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      to: '/admin/users',
      label: t('navigation:users'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      to: '/admin/activity-logs',
      label: t('navigation:logs'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/admin/settings',
      label: t('navigation:settings'),
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  const isNavActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const getRoleLabel = () => {
    const roleKey = user?.role?.name
    if (roleKey && ['superadmin', 'admin', 'member'].includes(roleKey)) {
      return t(`common:roles.${roleKey}`)
    }
    return user?.role?.display_name || user?.role?.name || t('common:roles.admin')
  }

  const renderNavGroup = (title, items) => (
    <div className="mb-2">
      {!sidebarCollapsed ? (
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 select-none">
          {title}
        </p>
      ) : (
        <div className="flex justify-center py-2">
          <span className="w-5 h-px bg-gray-200 dark:bg-white/10 rounded-full" />
        </div>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = isNavActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg transition-all duration-200 ${
 sidebarCollapsed ? 'justify-center px-0 py-2.5 mx-auto w-11' : 'px-3 py-2'
 } ${
 active
 ? 'bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan font-semibold'
 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'
 }`}
            >
              <div className="shrink-0">{item.icon}</div>
              {!sidebarCollapsed && <span className="text-[13px] truncate">{item.label}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-slate-50/90 dark:bg-dark-900 transition-colors duration-300">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white dark:bg-dark-800 border-r border-slate-200/90 dark:border-white/[0.06] shadow-sm ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-slate-200/90 dark:border-white/[0.06] flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
            <img
              src="/favicon.svg"
              alt={t('common:logoAlt')}
              width="36"
              height="36"
              className="w-9 h-9 rounded-full object-contain shadow-md shadow-brand-violet/20 flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-[15px] font-sans font-bold tracking-tight text-gray-900 dark:text-white truncate">
                  {t('common:appName')}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                  {t('navigation:adminPanel')}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {renderNavGroup(t('navigation:groups.overview'), overviewNav)}
          {renderNavGroup(t('navigation:portfolio') || 'Portfolio', portfolioNav)}
          {renderNavGroup(t('navigation:groups.content'), contentNav)}
          {renderNavGroup(t('navigation:groups.interaction'), interactionNav)}
          {isSuperAdmin && renderNavGroup(t('navigation:groups.system'), systemNav)}
        </div>

        {/* Footer Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-gray-200/80 dark:border-white/[0.06] shrink-0">
          {!sidebarCollapsed && (
            <span className="text-[11px] text-gray-400 font-medium">{t('navigation:collapseMenu')}</span>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors mx-auto"
            title={sidebarCollapsed ? t('navigation:expandSidebar') : t('navigation:collapseSidebar')}
            aria-label={sidebarCollapsed ? t('navigation:expandSidebar') : t('navigation:collapseSidebar')}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 sm:px-6 bg-white/95 dark:bg-dark-800/80 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              aria-label={t('navigation:toggleNavigation')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <span>← {t('navigation:viewSite')}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
              title={t('navigation:searchShortcut')}
              aria-label={t('common:actions.searchLabel')}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <LanguageSwitcher />
            <ThemeToggle />

            {/* User Profile */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                    {user?.name}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {getRoleLabel()}
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-slide-down">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/member/profile"
                    className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  >
                    {t('navigation:myProfile')}
                  </Link>
                  <Link
                    to="/member/settings"
                    className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  >
                    {t('navigation:accountSettings')}
                  </Link>
                  <div className="border-t border-gray-100 dark:border-white/10 my-1" />
                  <button
                    type="button"
                    onClick={async () => {
                      await logout()
                      navigate('/auth/login')
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium"
                  >
                    {t('navigation:signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Admin Search Modal */}
      <AdminSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

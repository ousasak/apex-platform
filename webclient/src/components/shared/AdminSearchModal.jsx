import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminSearchModal({ open, onClose }) {
  const { t } = useTranslation('common')
  const { isSuperAdmin } = useAuth()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({
    users: [],
    projects: [],
    posts: [],
    messages: [],
    docs: [],
  })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ users: [], projects: [], posts: [], messages: [], docs: [] })
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
      }
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], projects: [], posts: [], messages: [], docs: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await adminApi.search({ q: query })
        setResults(
          data?.data || {
            users: [],
            projects: [],
            posts: [],
            messages: [],
            docs: [],
          }
        )
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  if (!open) return null

  const handleSelect = (url) => {
    onClose()
    navigate(url)
  }

  const getStatusLabel = (status) => {
    if (!status) return ''
    const key = String(status).toLowerCase()
    const known = ['active', 'inactive', 'pending', 'approved', 'rejected', 'published', 'draft', 'archived', 'completed', 'in_progress']
    return known.includes(key) ? t(`status.${key}`) : status
  }

  const filters = [
    { key: 'all', label: t('search.filters.all') },
    ...(isSuperAdmin ? [{ key: 'users', label: t('search.filters.users') }] : []),
    { key: 'projects', label: t('search.filters.projects') },
    { key: 'posts', label: t('search.filters.posts') },
    { key: 'messages', label: t('search.filters.messages') },
    { key: 'docs', label: t('search.filters.docs') },
  ]

  const users = results.users || []
  const projects = results.projects || []
  const posts = results.posts || []
  const messages = results.messages || []
  const docs = results.docs || []

  const showUsers = (activeFilter === 'all' || activeFilter === 'users') && users.length > 0
  const showProjects = (activeFilter === 'all' || activeFilter === 'projects') && projects.length > 0
  const showPosts = (activeFilter === 'all' || activeFilter === 'posts') && posts.length > 0
  const showMessages = (activeFilter === 'all' || activeFilter === 'messages') && messages.length > 0
  const showDocs = (activeFilter === 'all' || activeFilter === 'docs') && docs.length > 0

  const hasResults = showUsers || showProjects || showPosts || showMessages || showDocs

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] sm:pt-[12vh] bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white/95 dark:bg-dark-900/95 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-gray-200/80 dark:ring-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-violet opacity-60" />

        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 sm:px-6 border-b border-gray-100 dark:border-white/[0.06]">
          <svg className="w-5 h-5 text-brand-violet dark:text-brand-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.adminPlaceholder')}
            className="flex-1 h-14 sm:h-16 bg-transparent text-base text-gray-900 dark:text-white placeholder:text-gray-400 outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('actions.clear')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/[0.06] rounded border border-gray-200 dark:border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-5 py-2.5 bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06] text-xs">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
 activeFilter === f.key
 ? 'bg-brand-violet dark:bg-brand-cyan text-white dark:text-dark-900 shadow-sm'
 : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/[0.05]'
 }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && <div className="py-8 text-center text-sm text-gray-400">{t('search.searchingAdmin')}</div>}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-sm text-gray-400">{t('search.noResults', { query })}</div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-sm text-gray-400">
              {t('search.adminPrompt')}
            </div>
          )}

          {showUsers && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
                {t('search.sections.users')}
              </div>
              <div className="space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/users/${u.id}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{u.title || u.name}</div>
                      <div className="text-xs text-gray-500">{u.subtitle || u.email}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.edit')} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showProjects && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
                {t('search.sections.projects')}
              </div>
              <div className="space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/projects/${p.id}/edit`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{p.title}</div>
                      <div className="text-xs text-gray-500">{getStatusLabel(p.status || p.subtitle)}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.edit')} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showPosts && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
                {t('search.sections.posts')}
              </div>
              <div className="space-y-1">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/blog/${post.id}/edit`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{post.title}</div>
                      <div className="text-xs text-gray-500">{getStatusLabel(post.status || post.meta)}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.edit')} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showMessages && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
                {t('search.filters.messages')}
              </div>
              <div className="space-y-1">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => handleSelect('/admin/messages')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{msg.title}</div>
                      <div className="text-xs text-gray-500">{msg.subtitle}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{msg.meta} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showDocs && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
                {t('search.sections.docs')}
              </div>
              <div className="space-y-1">
                {docs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelect(`/admin/docs/${doc.id}/edit`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{doc.title}</div>
                      <div className="text-xs text-gray-500">{doc.subtitle || doc.slug}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.edit')} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

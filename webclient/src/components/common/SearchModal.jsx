import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { publicApi } from '@/services'

export default function SearchModal({ open, onClose }) {
  const { t } = useTranslation('common')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ projects: [], articles: [], pages: [] })
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ projects: [], articles: [], pages: [] })
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
      setResults({ projects: [], articles: [], pages: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [projRes, blogRes] = await Promise.allSettled([
          publicApi.getProjects({ search: query, per_page: 5 }),
          publicApi.getBlogPosts({ search: query, per_page: 5 }),
        ])

        const projects = projRes.status === 'fulfilled' ? projRes.value?.data?.data || [] : []
        const articles = blogRes.status === 'fulfilled' ? blogRes.value?.data?.data || [] : []

        const staticPages = [
          { title: t('search.staticPages.about.title'), path: '/about', desc: t('search.staticPages.about.desc') },
          { title: t('search.staticPages.projects.title'), path: '/projects', desc: t('search.staticPages.projects.desc') },
          { title: t('search.staticPages.blog.title'), path: '/blog', desc: t('search.staticPages.blog.desc') },
          { title: t('search.staticPages.join.title'), path: '/join', desc: t('search.staticPages.join.desc') },
          { title: t('search.staticPages.contact.title'), path: '/contact', desc: t('search.staticPages.contact.desc') },
          { title: t('search.staticPages.docs.title'), path: '/docs', desc: t('search.staticPages.docs.desc') },
        ].filter(
          (p) =>
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.desc.toLowerCase().includes(query.toLowerCase())
        )

        setResults({ projects, articles, pages: staticPages })
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, t])

  if (!open) return null

  const handleSelect = (url) => {
    onClose()
    navigate(url)
  }

  const showProjects = (activeFilter === 'all' || activeFilter === 'projects') && results.projects.length > 0
  const showArticles = (activeFilter === 'all' || activeFilter === 'articles') && results.articles.length > 0
  const showPages = (activeFilter === 'all' || activeFilter === 'pages') && results.pages.length > 0
  const hasResults = showProjects || showArticles || showPages

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
            placeholder={t('search.placeholder')}
            className="flex-1 h-14 sm:h-16 bg-transparent text-base text-gray-900 dark:text-white placeholder:text-gray-400 outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('actions.clear')}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/[0.06] rounded border border-gray-200 dark:border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06] text-xs">
          {['all', 'projects', 'articles', 'pages'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
 activeFilter === f
 ? 'bg-brand-violet dark:bg-brand-cyan text-white dark:text-dark-900 shadow-sm'
 : 'text-gray-500 hover:bg-gray-200/50 dark:hover:bg-white/[0.05]'
 }`}
            >
              {t(`search.filters.${f}`)}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-sm text-gray-400">{t('search.searching')}</div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-sm text-gray-400">
              {t('search.noResults', { query })}
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 text-center text-sm text-gray-400">
              {t('search.prompt')}
            </div>
          )}

          {showProjects && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2">
                {t('search.sections.projects')}
              </div>
              <div className="space-y-1">
                {results.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(`/projects/${p.slug}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{p.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.view')} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showArticles && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2">
                {t('search.sections.articles')}
              </div>
              <div className="space-y-1">
                {results.articles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelect(`/blog/${a.slug}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{a.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{a.summary || a.excerpt}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.read')} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showPages && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 px-2">
                {t('search.sections.pages')}
              </div>
              <div className="space-y-1">
                {results.pages.map((pg) => (
                  <button
                    key={pg.path}
                    type="button"
                    onClick={() => handleSelect(pg.path)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">{pg.title}</div>
                      <div className="text-xs text-gray-500">{pg.desc}</div>
                    </div>
                    <span className="text-xs text-brand-violet dark:text-brand-cyan">{t('actions.go')} →</span>
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

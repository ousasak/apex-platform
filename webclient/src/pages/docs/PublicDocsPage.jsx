import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { publicApi } from '@/services'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})
turndownService.use(gfm)

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

function renderContent(content) {
  if (!content) return ''
  const trimmed = content.trim()

  if (!trimmed.startsWith('<')) {
    return DOMPurify.sanitize(marked.parse(trimmed))
  }

  const hasRichHtml = /<(strong|em|b|i|h[1-6]|pre|code|ul|ol|li|blockquote|table|thead|tbody|tr|td|th|img|a)\b/i.test(trimmed)
  if (hasRichHtml) {
    return DOMPurify.sanitize(trimmed)
  }

  const textContent = trimmed
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()

  const hasMarkdown = /(\*\*|#{1,6} |`|\[.+\]\(.+\))/.test(textContent)
  if (hasMarkdown) {
    return DOMPurify.sanitize(marked.parse(textContent))
  }

  return DOMPurify.sanitize(trimmed)
}

function rawStorageToMarkdown(raw) {
  if (!raw) return ''
  const trimmed = String(raw).trim()
  if (!trimmed) return ''

  if (!trimmed.startsWith('<')) {
    return trimmed
  }

  const hasRichHtml = /<(strong|em|b|i|h[1-6]|pre|code|ul|ol|li|blockquote|table|thead|tbody|tr|td|th|img|a)\b/i.test(trimmed)
  if (hasRichHtml) {
    return turndownService.turndown(trimmed)
  }

  const textContent = trimmed
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim()

  if (/(\*\*|#{1,6} |`|\[.+\]\(.+\))/.test(textContent)) {
    return textContent
  }

  return turndownService.turndown(trimmed)
}

export default function DocsView() {
  const { t, i18n } = useTranslation('docs')
  const { slug: routeSlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = routeSlug || searchParams.get('page')

  const [navTree, setNavTree] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDoc, setCurrentDoc] = useState(null)
  const [docLoading, setDocLoading] = useState(false)
  const [currentSlug, setCurrentSlug] = useState(pageParam || '')
  const initialDocLoadedRef = useRef(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tocItems, setTocItems] = useState([])
  const [activeToc, setActiveToc] = useState('')
  const [collapsedMenus, setCollapsedMenus] = useState(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copyStatus, setCopyStatus] = useState('idle')

  const docCacheRef = useRef(new Map())
  const contentAreaRef = useRef(null)

  function toggleMenu(id) {
    setCollapsedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Load Nav Tree
  useEffect(() => {
    async function fetchNav() {
      try {
        setLoading(true)
        const { data } = await publicApi.getDocsNav()
        const tree = data.data || []
        setNavTree(tree)
        if (tree.length > 0) {
          setCollapsedMenus(new Set([tree[0].id]))
        }
      } catch {
        setNavTree([])
      } finally {
        setLoading(false)
      }
    }
    fetchNav()
  }, [])

  // Flat docs list
  const flatDocs = useMemo(() => {
    const list = []
    for (const mainMenu of navTree) {
      for (const page of mainMenu.pages || []) {
        list.push(page)
        for (const sub of page.children || []) list.push(sub)
      }
      for (const subMenu of mainMenu.children || []) {
        for (const page of subMenu.pages || []) {
          list.push(page)
          for (const sub of page.children || []) list.push(sub)
        }
      }
    }
    return list
  }, [navTree])

  // Filtered tree
  const filteredNavTree = useMemo(() => {
    if (!searchQuery.trim()) return navTree
    const q = searchQuery.toLowerCase()
    const matchPage = (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.children || []).some((c) => c.title.toLowerCase().includes(q))

    return navTree
      .map((mainMenu) => ({
        ...mainMenu,
        pages: (mainMenu.pages || []).filter(matchPage),
        children: (mainMenu.children || [])
          .map((sub) => ({
            ...sub,
            pages: (sub.pages || []).filter(matchPage),
          }))
          .filter((sub) => sub.pages.length > 0),
      }))
      .filter((m) => m.pages.length > 0 || m.children.length > 0)
  }, [navTree, searchQuery])

  // Select initial document (either URL slug/query param or first doc in tree)
  useEffect(() => {
    const targetSlug = pageParam || (flatDocs.length > 0 ? flatDocs[0].slug : '')
    if (!targetSlug) return
    if (!initialDocLoadedRef.current || (pageParam && pageParam !== currentSlug)) {
      initialDocLoadedRef.current = true
      loadDoc(targetSlug)
    }
  }, [flatDocs, pageParam])

  // Load doc when currentSlug changes
  async function loadDoc(slug) {
    if (!slug) return
    setCurrentSlug(slug)
    setSearchParams({ page: slug })
    setSidebarOpen(false)

    if (docCacheRef.current.has(slug)) {
      setCurrentDoc(docCacheRef.current.get(slug))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      setDocLoading(true)
      const { data } = await publicApi.getDoc(slug)
      const doc = data.data
      docCacheRef.current.set(slug, doc)
      setCurrentDoc(doc)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // ignore
    } finally {
      setDocLoading(false)
    }
  }

  // Build TOC from headings in rendered doc
  useEffect(() => {
    if (!currentDoc || !contentAreaRef.current) return
    const timer = setTimeout(() => {
      const headings = contentAreaRef.current.querySelectorAll('h2, h3')
      const items = []
      headings.forEach((h, idx) => {
        if (!h.id) {
          h.id = `heading-${idx}-${h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        }
        items.push({
          id: h.id,
          text: h.textContent,
          level: h.tagName.toLowerCase(),
        })
      })
      setTocItems(items)
    }, 150)
    return () => clearTimeout(timer)
  }, [currentDoc])

  // Scroll spy for TOC and scroll-to-top
  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 400)
      if (!tocItems.length) return
      let currentId = ''
      for (const item of tocItems) {
        const el = document.getElementById(item.id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            currentId = item.id
          }
        }
      }
      setActiveToc(currentId)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  // Prev / Next Docs
  const prevDoc = useMemo(() => {
    const idx = flatDocs.findIndex((d) => d.slug === currentSlug)
    return idx > 0 ? flatDocs[idx - 1] : null
  }, [flatDocs, currentSlug])

  const nextDoc = useMemo(() => {
    const idx = flatDocs.findIndex((d) => d.slug === currentSlug)
    return idx >= 0 && idx < flatDocs.length - 1 ? flatDocs[idx + 1] : null
  }, [flatDocs, currentSlug])

  async function handleCopyMarkdown() {
    if (!currentDoc) return
    const chunks = [`# ${currentDoc.title}`, '']
    if (currentDoc.sections?.length) {
      for (const section of currentDoc.sections) {
        const heading = (section.heading || '').trim()
        const body = rawStorageToMarkdown(section.content || '').trim()
        if (heading) chunks.push(`## ${heading}`, '')
        if (body) chunks.push(body, '')
      }
    } else {
      const body = rawStorageToMarkdown(currentDoc.content || '').trim()
      if (body) chunks.push(body, '')
    }
    try {
      await navigator.clipboard.writeText(chunks.join('\n').trimEnd() + '\n')
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  return (
    <div className="docs-page min-h-screen bg-white dark:bg-dark-900 flex relative">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-[0.35] dark:opacity-50" />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══ Left Sidebar ══ */}
      <aside
        className={`docs-sidebar fixed top-0 left-0 h-full w-64 flex-shrink-0 z-20 overflow-y-auto pt-[68px] transition-transform duration-300 border-r border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-dark-900/80 backdrop-blur-md ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-4 py-6">
          <div className="mb-4 px-2">
            <p className="section-label mb-1">{t('public.sidebar.browse')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('public.sidebar.subtitle')}</p>
          </div>

          {/* Search bar */}
          <div className="mb-4 px-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('public.sidebar.searchPlaceholder')}
              aria-label={t('public.sidebar.searchAriaLabel')}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-white/5 border border-transparent focus:border-brand-violet/50 focus:outline-none dark:text-white"
            />
          </div>

          {loading ? (
            <div className="space-y-4 px-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-brand-violet/15 dark:bg-white/10 rounded w-2/3 mb-2" />
                  <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded w-full mb-1" />
                  <div className="h-2.5 bg-gray-100 dark:bg-white/5 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : (
            <nav className="space-y-4">
              {filteredNavTree.map((mainMenu) => (
                <div key={mainMenu.id} className="mb-4">
                  <button
                    type="button"
                    onClick={() => toggleMenu(mainMenu.id)}
                    className="w-full flex items-center justify-between px-2 mb-2 group text-left"
                  >
                    <span className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                      {mainMenu.name}
                    </span>
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                        collapsedMenus.has(mainMenu.id) ? '' : '-rotate-90'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {collapsedMenus.has(mainMenu.id) && (
                    <div>
                      {/* Direct pages */}
                      {mainMenu.pages?.length > 0 && (
                        <ul className="space-y-0.5 mb-2">
                          {mainMenu.pages.map((page) => (
                            <li key={page.slug}>
                              <button
                                type="button"
                                onClick={() => loadDoc(page.slug)}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                                  currentSlug === page.slug
                                    ? 'bg-brand-violet/10 text-brand-violet dark:text-brand-cyan font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                              >
                                {page.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Sub menus */}
                      {mainMenu.children?.map((sub) => (
                        <div key={sub.id} className="mb-3 pl-2">
                          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 px-2">
                            {sub.name}
                          </p>
                          <ul className="space-y-0.5 border-l border-black/[0.08] dark:border-white/[0.08] ml-2 pl-2">
                            {sub.pages?.map((subPage) => (
                              <li key={subPage.slug}>
                                <button
                                  type="button"
                                  onClick={() => loadDoc(subPage.slug)}
                                  className={`w-full text-left px-2 py-1 rounded-md text-[12.5px] transition-colors ${
                                    currentSlug === subPage.slug
                                      ? 'bg-brand-violet/10 text-brand-violet dark:text-brand-cyan font-semibold'
                                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                >
                                  {subPage.title}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </aside>

      {/* ══ Main Content Area ══ */}
      <main className="flex-1 lg:ml-64 min-w-0 pt-[80px] pb-20 px-4 sm:px-8 xl:pr-64">
        {/* Mobile toggle button */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            {t('public.mobile.menu')}
          </button>
        </div>

        <div className="max-w-4xl mx-auto" ref={contentAreaRef}>
          {docLoading && (
            <div className="h-1 bg-brand-violet animate-pulse mb-6 rounded-full" />
          )}

          {currentDoc ? (
            <article className="prose-doc">
              {/* Header */}
              <div className="mb-8 pb-6 border-b border-gray-100 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <span className="section-label">{t('public.header.label')}</span>
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-gray-100 dark:bg-white/5 hover:bg-brand-violet/10 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.836-.068 1.68-.108 2.524-.108 2.524 0 5.048.36 7.572 1.08m-12.072 1.22v12.568c0 1.135.845 2.098 1.976 2.192 1.68.136 3.36.204 5.04.204s3.36-.068 5.04-.204c1.131-.094 1.976-1.057 1.976-2.192V7.5" />
                    </svg>
                    {copyStatus === 'copied'
                      ? t('public.copy.copied')
                      : copyStatus === 'error'
                        ? t('public.copy.failed')
                        : t('public.copy.button')}
                  </button>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">
                  {currentDoc.title}
                </h1>
                {currentDoc.category && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('public.header.categoryLabel')}{' '}
                    <span className="text-brand-violet dark:text-brand-cyan font-medium">{currentDoc.category}</span>
                  </p>
                )}
              </div>

              {/* Sections or single content */}
              {currentDoc.sections?.length > 0 ? (
                <div className="space-y-10">
                  {currentDoc.sections.map((sec, idx) => (
                    <section key={idx} className="space-y-4">
                      {sec.heading && (
                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                          {sec.heading}
                        </h2>
                      )}
                      <div
                        className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{ __html: renderContent(sec.content) }}
                      />
                    </section>
                  ))}
                </div>
              ) : (
                <div
                  className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: renderContent(currentDoc.content) }}
                />
              )}

              {/* Prev / Next navigation */}
              <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
                {prevDoc ? (
                  <button
                    type="button"
                    onClick={() => loadDoc(prevDoc.slug)}
                    className="flex flex-col items-start p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-violet dark:hover:border-brand-cyan transition-colors group text-left"
                  >
                    <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-brand-violet dark:group-hover:text-brand-cyan">
                      ← {t('public.navigation.previous')}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {prevDoc.title}
                    </span>
                  </button>
                ) : <div />}

                {nextDoc && (
                  <button
                    type="button"
                    onClick={() => loadDoc(nextDoc.slug)}
                    className="flex flex-col items-end p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-violet dark:hover:border-brand-cyan transition-colors group text-right"
                  >
                    <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-brand-violet dark:group-hover:text-brand-cyan">
                      {t('public.navigation.next')} →
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {nextDoc.title}
                    </span>
                  </button>
                )}
              </div>
            </article>
          ) : (
            <div className="text-center py-24">
              <p className="text-gray-400 text-sm">{t('public.empty.selectDoc')}</p>
            </div>
          )}
        </div>
      </main>

      {/* ══ Right TOC Sidebar ══ */}
      {tocItems.length > 0 && (
        <aside className="hidden xl:block fixed top-0 right-0 h-full w-64 pt-[90px] px-6 overflow-y-auto border-l border-black/[0.08] dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {t('public.toc.title')}
          </p>
          <ul className="space-y-2 text-xs">
            {tocItems.map((item) => (
              <li key={item.id} className={item.level === 'h3' ? 'pl-3' : ''}>
                <a
                  href={`#${item.id}`}
                  className={`block transition-colors ${
                    activeToc === item.id
                      ? 'text-brand-violet dark:text-brand-cyan font-medium'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t('public.scrollToTop')}
          title={t('public.scrollToTop')}
          className="fixed bottom-6 right-6 z-30 p-2.5 rounded-lg bg-brand-violet text-white shadow-lg hover:bg-brand-violet/90 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  )
}

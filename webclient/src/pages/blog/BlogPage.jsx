import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { publicApi } from '@/services';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import CustomSelect from '@/components/common/CustomSelect';

function formatDate(date, locale) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return dayjs(date).format('MMM D, YYYY');
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogView() {
  const { t, i18n } = useTranslation('blog');
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US';
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const didMountSearchRef = useRef(false);

  function goProfile(username) {
    navigate(`/author/${username}`);
  }

  async function fetchCategories() {
    try {
      const { data } = await publicApi.getBlogCategories();
      setCategories(data.data || []);
    } catch {
      setCategories([]);
    }
  }

  async function fetchPosts(page = 1) {
    setLoading(true);
    try {
      const pageNum = typeof page === 'number' ? page : 1;
      const { data } = await publicApi.getBlogPosts({
        page: pageNum,
        per_page: 9,
        search: search || undefined,
        category: selectedCategory || undefined,
      });
      setPosts(data.data || []);
      setMeta(data.meta || { current_page: 1, last_page: 1, total: (data.data || []).length });
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [selectedCategory]);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      fetchPosts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function clearFilters() {
    setSearch('');
    setSelectedCategory('');
  }

  function goToPage(page) {
    fetchPosts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const featuredPost = useMemo(() => posts.find((p) => p.is_featured), [posts]);

  const displayPosts = useMemo(() => {
    if (search || selectedCategory || meta.current_page > 1) {
      return posts;
    }
    if (!featuredPost) return posts;
    return posts.filter((p) => p.id !== featuredPost.id);
  }, [posts, search, selectedCategory, meta.current_page, featuredPost]);

  return (
    <div className="blog-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[70svh] sm:min-h-[75svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 blog-hero-grid opacity-[0.04] dark:opacity-[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-dark-900 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-brand-violet/12 blur-[100px] sm:blur-[140px] animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/3 -right-32 w-[240px] sm:w-[420px] h-[240px] sm:h-[420px] rounded-full bg-brand-cyan/10 blur-[100px] sm:blur-[140px] animate-float pointer-events-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 pt-20 pb-16">
          <p className="font-display text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-brand-violet dark:text-brand-cyan mb-6 sm:mb-8">
            {t('public.hero.eyebrow')}
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tightest mb-5 sm:mb-7 leading-[1.02]">
            <span className="text-gray-900 dark:text-white">{t('public.hero.titlePrefix')}</span>{' '}
            <span className="gradient-text">{t('public.hero.titleHighlight')}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('public.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ═══════════════════ FILTERS ═══════════════════ */}
      <section className="pb-10 sm:pb-12 relative z-10 -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="surface-panel flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder={t('public.filters.searchPlaceholder')}
                className="input-field !rounded-xl pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect
                value={selectedCategory}
                options={[
                  { label: t('public.filters.allCategories'), value: '' },
                  ...categories.map((c) => ({ label: c.name, value: c.slug })),
                ]}
                placeholder={t('public.filters.allCategories')}
                onChange={(val) => setSelectedCategory(val)}
              />
            </div>
            {(search || selectedCategory) && (
              <button className="btn-ghost whitespace-nowrap" onClick={clearFilters}>
                {t('common.clear')}
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 ease-premium ${
                    selectedCategory === cat.slug
                      ? 'bg-brand-violet text-white border-brand-violet dark:bg-brand-cyan dark:border-brand-cyan dark:text-dark-900'
                      : 'border-black/[0.08] dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-black/[0.16] dark:hover:border-white/20 hover:text-brand-violet dark:hover:text-brand-cyan'
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {!loading && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 px-1">
              {search || selectedCategory
                ? posts.length === 1
                  ? t('public.filters.articleCountFilteredOne', { count: posts.length })
                  : t('public.filters.articleCountFilteredOther', { count: posts.length })
                : posts.length === 1
                  ? t('public.filters.articleCountOne', { count: posts.length })
                  : t('public.filters.articleCountOther', { count: posts.length })}
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════ FEATURED ═══════════════════ */}
      {featuredPost && !search && !selectedCategory && meta.current_page === 1 && (
        <section className="pb-14 sm:pb-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6">
              <span className="section-label">{t('public.featured.label')}</span>
              <h2 className="section-heading text-3xl md:text-4xl lg:text-5xl">
                {t('public.featured.titlePrefix')} <span className="gradient-text">{t('public.featured.titleHighlight')}</span>
              </h2>
            </div>

            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group block relative surface-panel overflow-hidden hover:shadow-xl dark:hover:shadow-glow/10"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto lg:min-h-[360px] overflow-hidden bg-gray-100 dark:bg-dark-700">
                  {featuredPost.cover_image ? (
                    <img
                      src={featuredPost.cover_image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand opacity-20" />
                  )}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-violet/90 dark:bg-brand-cyan/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {t('public.featured.badge')}
                  </div>
                </div>

                <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                    {featuredPost.category && (
                      <span className="px-2.5 py-1 rounded-md font-medium bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan">
                        {featuredPost.category.name}
                      </span>
                    )}
                    <span className="text-gray-400 dark:text-gray-500">
                      {formatDate(featuredPost.published_at, dateLocale)}
                    </span>
                    {featuredPost.reading_time && (
                      <span className="text-gray-400 dark:text-gray-500">
                        · {t('common.minRead', { minutes: featuredPost.reading_time })}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    {featuredPost.author?.username ? (
                      <button
                        type="button"
                        className="flex items-center gap-3 text-left rounded-xl -m-1 p-1 hover:bg-gray-100/80 dark:hover:bg-dark-700/50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goProfile(featuredPost.author.username);
                        }}
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-brand-violet/20 dark:ring-white/10">
                          {featuredPost.author?.avatar ? (
                            <img
                              src={featuredPost.author.avatar}
                              alt={featuredPost.author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                              {featuredPost.author?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {featuredPost.author?.name}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                            {t('common.author')} · @{featuredPost.author.username}
                          </p>
                        </div>
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-brand-violet/20 dark:ring-white/10">
                          {featuredPost.author?.avatar ? (
                            <img
                              src={featuredPost.author.avatar}
                              alt={featuredPost.author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                              {featuredPost.author?.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {featuredPost.author?.name}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('common.author')}</p>
                        </div>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-violet dark:text-brand-cyan">
                      {t('public.featured.readArticle')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════ GRID ═══════════════════ */}
      <section className="pb-20 sm:pb-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!loading && displayPosts.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <span className="section-label">{t('public.grid.label')}</span>
              <h2 className="section-heading text-3xl md:text-4xl lg:text-5xl">
                {t('public.grid.titlePrefix')} <span className="gradient-text">{t('public.grid.titleHighlight')}</span>
              </h2>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-14 h-14 border-[3px] border-brand-violet/20 dark:border-white/10 border-t-brand-violet dark:border-t-brand-cyan rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-6 h-6 border-[3px] border-brand-violet/20 dark:border-white/10 border-b-brand-cyan dark:border-b-brand-violet rounded-full animate-spin"
                    style={{ animationDirection: 'reverse' }}
                  />
                </div>
              </div>
            </div>
          ) : displayPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayPosts
                .filter((p) => p?.slug)
                .map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col surface-panel overflow-hidden hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-glow/10"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-dark-700">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-300 dark:text-dark-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6V7.5z"
                            />
                          </svg>
                        </div>
                      )}

                      {post.category && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-wider bg-white/95 dark:bg-dark-800/95 text-brand-violet dark:text-brand-cyan backdrop-blur-sm">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                      {post.reading_time && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 text-[10px] rounded-md font-medium bg-black/40 text-white backdrop-blur-sm">
                            {t('common.minShort', { minutes: post.reading_time })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-3">
                        <span>{formatDate(post.published_at, dateLocale)}</span>
                        {post.views_count && <span>· {t('common.viewsCount', { count: post.views_count })}</span>}
                      </div>

                      <h3 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-5 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
                        {post.author?.username ? (
                          <button
                            type="button"
                            className="flex items-center gap-2.5 text-left rounded-lg -m-1 p-1 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              goProfile(post.author.username);
                            }}
                          >
                            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-brand-violet/20 dark:ring-white/10">
                              {post.author?.avatar ? (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-[10px] font-bold">
                                  {post.author?.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {post.author?.name}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-brand-violet/20 dark:ring-white/10">
                              {post.author?.avatar ? (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-[10px] font-bold">
                                  {post.author?.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {post.author?.name}
                            </span>
                          </div>
                        )}
                        <span className="text-xs font-semibold text-brand-violet dark:text-brand-cyan">
                          {t('public.grid.read')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <EmptyState title={t('public.empty.title')} message={t('public.empty.message')} />
          )}

          {meta.last_page > 1 && (
            <div className="mt-12">
              <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={goToPage} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

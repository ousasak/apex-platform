import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { publicApi } from '@/services';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';

export default function PublicSeriesDetailView() {
  const { t, i18n } = useTranslation('blog');
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US';
  const { username, slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [payload, setPayload] = useState(null);

  const series = payload?.series || null;
  const author = payload?.author || { username: '', name: '' };
  const posts = payload?.posts || [];
  const meta = {
    current_page: payload?.meta?.current_page ?? 1,
    last_page: payload?.meta?.last_page ?? 1,
  };

  function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return dayjs(d).format('MMM D, YYYY');
    return date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function loadPage(page = 1) {
    setLoading(true);
    setNotFound(false);
    const u = String(username || '').trim();
    const s = String(slug || '').trim();
    if (!u || !s) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const { data } = await publicApi.getPublicSeriesPage(u, s, { page, per_page: 12 });
      setPayload(data.data);
    } catch (e) {
      if (e.response?.status === 404) setNotFound(true);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage(1);
  }, [username, slug]);

  useEffect(() => {
    if (loading) return;
    const u = String(username || '').trim();
    if (payload?.series && u) {
      document.title = t('seriesDetail.pageTitle', {
        name: payload.series.name || t('seriesDetail.defaultTitle'),
        username: u,
      });
    } else {
      document.title = t('seriesDetail.fallbackPageTitle');
    }
  }, [payload, loading, username, i18n.language, t]);

  return (
    <div className="min-h-screen pb-20">
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : notFound ? (
        <EmptyState title={t('seriesDetail.notFound.title')} message={t('seriesDetail.notFound.message')} />
      ) : (
        <>
          <section className="relative overflow-hidden pt-20 pb-12 sm:pt-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
              <Link to={`/author/${author.username}`} className="text-sm text-brand-cyan/90 hover:underline mb-4 inline-block">
                ← @{author.username}
              </Link>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-brand-cyan border border-white/20">
                  {t('seriesDetail.badge')}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{series?.name}</h1>
              </div>
              {series?.description && (
                <p className="text-gray-300 text-sm max-w-2xl mt-2">{series.description}</p>
              )}
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
            {posts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-dark-700">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-brand opacity-20" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-2">{formatDate(post.published_at)}</p>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 flex-1">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState title={t('seriesDetail.empty.title')} message={t('seriesDetail.empty.message')} />
            )}

            {meta.last_page > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={loadPage}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

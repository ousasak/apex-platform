import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicApi } from '@/services';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';

export default function PublicCollectionDetailView() {
  const { t, i18n } = useTranslation('projects');
  const { username, slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [payload, setPayload] = useState(null);

  const collection = payload?.collection || null;
  const author = payload?.author || { username: '', name: '' };
  const projects = payload?.projects || [];
  const meta = {
    current_page: payload?.meta?.current_page ?? 1,
    last_page: payload?.meta?.last_page ?? 1,
  };

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
      const { data } = await publicApi.getPublicCollectionPage(u, s, { page, per_page: 12 });
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
    if (collection && u) {
      document.title = t('collectionDetail.documentTitle', {
        name: collection.name || t('collectionDetail.badge'),
        username: u,
      });
    } else {
      document.title = t('collectionDetail.fallbackDocumentTitle');
    }
  }, [collection, loading, username, t]);

  return (
    <div className="min-h-screen pb-20">
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : notFound ? (
        <EmptyState
          title={t('collectionDetail.notFound.title')}
          message={t('collectionDetail.notFound.message')}
        />
      ) : (
        <>
          <section className="relative overflow-hidden pt-20 pb-12 sm:pt-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
              <Link to={`/author/${author.username}`} className="text-sm text-brand-cyan/90 hover:underline mb-4 inline-block">
                ← @{author.username}
              </Link>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-brand-cyan border border-white/20">
                  {t('collectionDetail.badge')}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{collection?.name}</h1>
              </div>
              {collection?.description && (
                <p className="text-gray-300 text-sm max-w-2xl mt-2">{collection.description}</p>
              )}
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
            {projects.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-dark-700">
                      {project.cover_image ? (
                        <img
                          src={project.cover_image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-brand opacity-25" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan">
                        {project.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 flex-1">
                        {project.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={t('collectionDetail.empty.title')}
                message={t('collectionDetail.empty.message')}
              />
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

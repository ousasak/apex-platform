import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicApi } from '@/services';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import CustomSelect from '@/components/common/CustomSelect';

const knownStatuses = ['completed', 'active', 'in_progress', 'wip', 'planned', 'archived', 'draft', 'published'];

function formatStatus(status, t) {
  if (!status) return '';
  if (knownStatuses.includes(status)) {
    return t(`status.${status}`);
  }
  return status.replace(/_/g, ' ');
}

function statusClasses(status) {
  const map = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400',
  };
  return map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function ProjectsView() {
  const { t, i18n } = useTranslation('projects');
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const didMountSearchRef = useRef(false);

  const statsSectionRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });
  const [displayCounts, setDisplayCounts] = useState([0, 0, 0]);

  const totalProjects = Number(globalStats?.projects ?? meta.total ?? 0);
  const activeCount = Number(globalStats?.active_projects ?? projects.filter((p) => p.status === 'active').length);
  const openSourceCount = Number(globalStats?.open_source_projects ?? projects.filter((p) => p.is_open_source).length);

  const projectStats = [
    { key: 'total', label: t('public.stats.totalProjects'), display: displayCounts[0] },
    { key: 'active', label: t('public.stats.active'), display: displayCounts[1] },
    { key: 'openSource', label: t('public.stats.openSource'), display: displayCounts[2] },
  ];

  function onStatsPointer(e) {
    const el = statsSectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  }

  function onStatsPointerLeave() {
    setSpotlight((prev) => ({ ...prev, active: false }));
  }

  function animateCount(index, target) {
    const duration = 1400 + index * 120;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(from + (target - from) * eased);
      setDisplayCounts((prev) => {
        const copy = [...prev];
        copy[index] = current;
        return copy;
      });
      if (progress < 1) requestAnimationFrame(tick);
      else {
        setDisplayCounts((prev) => {
          const copy = [...prev];
          copy[index] = target;
          return copy;
        });
      }
    };

    requestAnimationFrame(tick);
  }

  function runStatsAnimation() {
    setStatsInView(true);
    const targets = [totalProjects, activeCount, openSourceCount];
    targets.forEach((target, index) => {
      setTimeout(() => animateCount(index, target), 80 + index * 140);
    });
  }

  async function fetchProjects(page = 1) {
    setLoading(true);
    try {
      const pageNum = typeof page === 'number' ? page : 1;
      const reserveHeroSlot = pageNum === 1 && !search && !selectedTag && !selectedStatus;
      const { data } = await publicApi.getProjects({
        page: pageNum,
        per_page: reserveHeroSlot ? 10 : 9,
        search: search || undefined,
        tag: selectedTag || undefined,
        status: selectedStatus || undefined,
      });
      setProjects(data.data || []);
      setMeta(data.meta || { current_page: 1, last_page: 1, total: (data.data || []).length });
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.allSettled([publicApi.getTags(), publicApi.getStats()]).then(([tagsRes, statsRes]) => {
      if (tagsRes.status === 'fulfilled') {
        setTags(tagsRes.value.data?.data || []);
      }
      if (statsRes.status === 'fulfilled') {
        setGlobalStats(statsRes.value.data?.data || null);
      }
    });
  }, []);

  useEffect(() => {
    fetchProjects(1);
  }, [selectedTag, selectedStatus]);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      fetchProjects(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!loading && (globalStats || projects.length > 0)) {
      runStatsAnimation();
    }
  }, [loading, globalStats, totalProjects, activeCount, openSourceCount]);

  function clearFilters() {
    setSearch('');
    setSelectedTag('');
    setSelectedStatus('');
  }

  function goToPage(page) {
    fetchProjects(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const featuredProject = useMemo(() => projects.find((p) => p.is_featured), [projects]);

  const displayProjects = useMemo(() => {
    if (search || selectedTag || selectedStatus || meta.current_page > 1) {
      return projects;
    }
    if (!featuredProject) return projects;
    return projects.filter((p) => p.id !== featuredProject.id);
  }, [projects, search, selectedTag, selectedStatus, meta.current_page, featuredProject]);

  return (
    <div className="projects-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[70svh] sm:min-h-[75svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 projects-hero-grid opacity-[0.04] dark:opacity-[0.06]" />
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
            <span className="text-gray-900 dark:text-white">{t('public.hero.titlePrefix')}</span>
            <span className="gradient-text"> {t('public.hero.titleHighlight')}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('public.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section
        ref={statsSectionRef}
        className={`stats-section mb-12 sm:mb-16 ${statsInView ? 'is-inview' : ''}`}
        onPointerMove={onStatsPointer}
        onPointerLeave={onStatsPointerLeave}
      >
        <div className="stats-grid-bg" aria-hidden="true" />
        <div
          className="stats-spotlight"
          aria-hidden="true"
          style={{
            opacity: spotlight.active ? '1' : '0',
            '--spot-x': `${spotlight.x}%`,
            '--spot-y': `${spotlight.y}%`,
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="stats-row grid grid-cols-3">
            {projectStats.map((stat, i) => (
              <div key={stat.key} className="stat-item" style={{ '--stat-i': i }}>
                <p className="stat-value">{stat.display}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FILTERS ═══════════════════ */}
      <section className="pb-10 sm:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="surface-panel flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4 p-3 sm:p-4">
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
                aria-label={t('public.filters.searchPlaceholder')}
                className="input-field !rounded-xl pl-10"
              />
            </div>
            <div className="w-full md:w-44">
              <CustomSelect
                value={selectedTag}
                options={[
                  { label: t('public.filters.allTags'), value: '' },
                  ...tags.map((tag) => ({ label: tag.name, value: tag.slug })),
                ]}
                placeholder={t('public.filters.allTags')}
                onChange={(val) => setSelectedTag(val)}
              />
            </div>
            <div className="w-full md:w-44">
              <CustomSelect
                value={selectedStatus}
                options={[
                  { label: t('public.filters.allStatus'), value: '' },
                  { label: t('status.active'), value: 'active' },
                  { label: t('status.wip'), value: 'wip' },
                  { label: t('status.archived'), value: 'archived' },
                ]}
                placeholder={t('public.filters.allStatus')}
                onChange={(val) => setSelectedStatus(val)}
              />
            </div>
            {(search || selectedTag || selectedStatus) && (
              <button className="btn-ghost whitespace-nowrap" onClick={clearFilters}>
                {t('public.filters.clearFilters')}
              </button>
            )}
          </div>
          {!loading && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 px-1">
              {search || selectedTag || selectedStatus
                ? t(
                    projects.length === 1
                      ? 'public.filters.showingOneFiltered'
                      : 'public.filters.showingOtherFiltered',
                    { count: projects.length }
                  )
                : t(
                    projects.length === 1
                      ? 'public.filters.showingOne'
                      : 'public.filters.showingOther',
                    { count: projects.length }
                  )}
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════ FEATURED ═══════════════════ */}
      {featuredProject && !search && !selectedTag && !selectedStatus && meta.current_page === 1 && (
        <section className="pb-14 sm:pb-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="mb-6">
              <span className="section-label">{t('public.featured.eyebrow')}</span>
              <h2 className="section-heading text-3xl md:text-4xl lg:text-5xl">
                {t('public.featured.titlePrefix')} <span className="gradient-text">{t('public.featured.titleHighlight')}</span>
              </h2>
            </div>

            <div className="group relative surface-panel overflow-hidden hover:shadow-xl dark:hover:shadow-glow/10">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto lg:min-h-[360px] overflow-hidden bg-gray-100 dark:bg-dark-700">
                  {featuredProject.cover_image ? (
                    <img
                      src={featuredProject.cover_image}
                      alt={featuredProject.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-brand opacity-20" />
                  )}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-violet/90 dark:bg-brand-cyan/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {t('common.featured')}
                  </div>
                </div>

                <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 text-xs rounded-md font-medium ${statusClasses(featuredProject.status)}`}>
                      {formatStatus(featuredProject.status, t)}
                    </span>
                    {featuredProject.is_open_source && (
                      <span className="px-2.5 py-1 text-xs rounded-md font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {t('common.openSource')}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors duration-300">
                    {featuredProject.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3">
                    {featuredProject.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {(featuredProject.tags || []).slice(0, 5).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 text-xs rounded-md font-medium bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link to={`/projects/${featuredProject.slug}`} className="btn-primary text-sm">
                      {t('public.actions.viewProject')}
                    </Link>
                    {featuredProject.demo_url && (
                      <a
                        href={featuredProject.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm"
                      >
                        {t('common.liveDemo')}
                      </a>
                    )}
                    {featuredProject.repo_url && (
                      <a
                        href={featuredProject.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-sm"
                      >
                        {t('public.actions.source')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ GRID ═══════════════════ */}
      <section className="pb-20 sm:pb-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!loading && displayProjects.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <span className="section-label">{t('public.grid.eyebrow')}</span>
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
          ) : displayProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="group relative flex flex-col surface-panel overflow-hidden hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-glow/10"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-dark-700">
                    {project.cover_image ? (
                      <img
                        src={project.cover_image}
                        alt={project.title}
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
                            d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] rounded-md font-bold uppercase tracking-wider backdrop-blur-sm ${statusClasses(
                          project.status
                        )}`}
                      >
                        {formatStatus(project.status, t)}
                      </span>
                    </div>
                    {project.is_open_source && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-[10px] rounded-md font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-sm">
                          {t('common.oss')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(project.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-[10px] rounded-md font-medium bg-brand-violet/8 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-base font-display font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors duration-300 line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.08] dark:border-white/[0.08] text-xs text-gray-400">
                      <span>{project.creator?.name || t('common.brandName')}</span>
                      <span className="font-semibold text-brand-violet dark:text-brand-cyan group-hover:underline">
                        {t('public.actions.details')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title={t('public.empty.title')}
              message={t('public.empty.message')}
            />
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

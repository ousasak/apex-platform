import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import dayjs from 'dayjs';
import { publicApi } from '@/services';
import MilkyWayGalaxy from '@/components/common/MilkyWayGalaxy';
import { resolveMediaUrl } from '@/utils/media';

const defaultStatDefinitions = [
  { key: 'teamMembers', labelKey: 'home.stats.teamMembers', value: '5+', target: 5, suffix: '+ Yrs' },
  { key: 'projectsShipped', labelKey: 'home.stats.projectsShipped', field: 'projects', target: 10, suffix: '+' },
  { key: 'passion', value: '100%', labelKey: 'home.stats.passion', target: 100, suffix: '%' },
  {
    key: 'linesOfCode',
    value: '20+',
    labelKey: 'home.stats.linesOfCode',
    target: 20,
    suffix: '+',
    hasAccent: true,
  },
];

const services = [
  {
    key: 'webDev',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.558" />
      </svg>
    ),
  },
  {
    key: 'mobileApps',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    key: 'apiBackend',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    key: 'uiUxDesign',
    bgClass: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    key: 'devOpsCloud',
    bgClass: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    key: 'openSource',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
];

const values = [
  {
    key: 'innovation',
    mark: '01',
    bgClass: 'bg-brand-violet/15 text-brand-violet dark:bg-brand-violet/20 dark:text-brand-cyan',
  },
  {
    key: 'collaboration',
    mark: '02',
    bgClass: 'bg-brand-cyan/15 text-brand-cyan dark:bg-brand-cyan/20 dark:text-brand-cyan',
  },
  {
    key: 'excellence',
    mark: '03',
    bgClass: 'bg-brand-violet/15 text-brand-violet dark:bg-brand-violet/20 dark:text-brand-cyan',
  },
];

function formatDate(date, language) {
  if (!date) return '';
  if (language?.startsWith('km')) {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('km-KH-u-nu-latn', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(parsed);
    }
  }
  return dayjs(date).format('MMM D, YYYY');
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function HomeView() {
  const { t, i18n } = useTranslation('public');
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [team, setTeam] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [dbServices, setDbServices] = useState([]);
  const [liveStats, setLiveStats] = useState(null);

  const statsSectionRef = useRef(null);
  const [statsInView, setStatsInView] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(
    defaultStatDefinitions.map((s) => ({ ...s, value: s.infinite ? '∞' : '0', target: s.target || 0, display: s.infinite ? '∞' : '0' }))
  );
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });

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

  function animateStatValue(index, stat) {
    if (stat.infinite) {
      setAnimatedStats((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], ...stat, display: '∞' };
        return copy;
      });
      return;
    }

    const target = stat.target;
    const suffix = stat.suffix || '';
    const duration = 1200 + index * 120;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(target * eased);
      setAnimatedStats((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], ...stat, display: `${current}${suffix}` };
        return copy;
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setAnimatedStats((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], ...stat, display: stat.value };
          return copy;
        });
      }
    };

    requestAnimationFrame(tick);
  }

  useEffect(() => {
    async function loadData() {
      const settled = await Promise.allSettled([
        publicApi.getProjects({ per_page: 3, is_featured: true }),
        publicApi.getBlogPosts({ per_page: 3 }),
        publicApi.getSkills ? publicApi.getSkills() : Promise.resolve({ data: { data: [] } }),
        publicApi.getExperiences ? publicApi.getExperiences() : Promise.resolve({ data: { data: [] } }),
        publicApi.getServices ? publicApi.getServices() : Promise.resolve({ data: { data: [] } }),
        publicApi.getStats(),
        publicApi.getTags(),
      ]);

      let prjs = [];
      if (settled[0].status === 'fulfilled') {
        prjs = settled[0].value.data?.data || [];
      }
      if (!prjs.length) {
        try {
          const { data } = await publicApi.getProjects({ per_page: 3 });
          prjs = data?.data || [];
        } catch {
          // empty
        }
      }
      setProjects(prjs);

      if (settled[1].status === 'fulfilled') {
        const rawPosts = settled[1].value.data?.data;
        setPosts(Array.isArray(rawPosts) ? rawPosts : []);
      }
      if (settled[2].status === 'fulfilled') {
        const rawSkills = settled[2].value.data?.data;
        setSkills(Array.isArray(rawSkills) ? rawSkills : []);
      }
      if (settled[3].status === 'fulfilled') {
        const rawExp = settled[3].value.data?.data;
        setExperiences(Array.isArray(rawExp) ? rawExp : []);
      }
      if (settled[4].status === 'fulfilled') {
        const rawServ = settled[4].value.data?.data;
        setDbServices(Array.isArray(rawServ) ? rawServ : []);
      }
      if (settled[5].status === 'fulfilled') {
        setLiveStats(settled[5].value.data?.data || {});
      }
      if (settled[6].status === 'fulfilled') {
        const rawTags = settled[6].value.data?.data;
        setTechStack(Array.isArray(rawTags) ? rawTags.filter((tag) => Boolean(tag.logo)) : []);
      }
    }

    loadData();

    let observer = null;
    if (statsSectionRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setStatsInView(true);
            observer?.disconnect();
          }
        },
        { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
      );
      observer.observe(statsSectionRef.current);
    } else {
      setStatsInView(true);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!statsInView || !liveStats) return;

    const resolvedStats = defaultStatDefinitions.map((def) => {
      if (def.infinite) return { ...def, value: '∞', target: 0 };
      if (def.field) {
        const numeric = Number(liveStats[def.field] ?? 0);
        const suffix = numeric > 0 ? def.suffix || '' : '';
        return { ...def, target: numeric, suffix, value: `${numeric}${suffix}` };
      }
      return { ...def, value: def.value || `${def.target || 0}${def.suffix || ''}` };
    });

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setAnimatedStats(resolvedStats.map((s) => ({ ...s, display: s.value })));
      return;
    }

    resolvedStats.forEach((stat, index) => {
      setTimeout(() => animateStatValue(index, stat), 80 + index * 140);
    });
  }, [statsInView, liveStats]);

  return (
    <div className="home-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <MilkyWayGalaxy />

        <div className="absolute inset-0 hero-grid opacity-[0.04] dark:opacity-[0.06]" />

        <div className="absolute top-1/4 -left-32 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-brand-violet/12 blur-[100px] sm:blur-[140px] animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/3 -right-32 w-[240px] sm:w-[420px] h-[240px] sm:h-[420px] rounded-full bg-brand-cyan/10 blur-[100px] sm:blur-[140px] animate-float pointer-events-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 pt-16 pb-28">
          <p
            data-aos="fade-up"
            className="font-display text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-brand-violet dark:text-brand-cyan mb-6 sm:mb-8"
          >
            {t('home.hero.eyebrow')}
          </p>

          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-bold tracking-tightest mb-5 sm:mb-7 leading-[1.02]"
          >
            <span className="text-gray-900 dark:text-white">{t('home.hero.titleLine1')}</span>
            <br />
            <span className="gradient-text">{t('home.hero.titleLine2')}</span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed"
          >
            {t('home.hero.subtitle')}
          </p>

          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="flex flex-row flex-wrap justify-center items-center gap-3 sm:gap-4"
          >
            <Link to="/projects" className="btn-primary">
              {t('home.hero.exploreProjects')}
            </Link>
            <Link to="/contact" className="btn-secondary">
              {t('home.hero.meetTheTeam')}
            </Link>
            <a
              href="/api/resume/download"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>{t('home.hero.downloadCv')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section
        ref={statsSectionRef}
        className={`stats-section ${statsInView ? 'is-inview' : ''}`}
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="stats-row grid grid-cols-2 md:grid-cols-4">
            {animatedStats.map((stat, i) => (
              <div key={stat.key} className="stat-item" style={{ '--stat-i': i }}>
                <p className="stat-value" data-infinite={stat.infinite || undefined}>
                  {stat.display}
                </p>
                {stat.hasAccent ? (
                  <p className="stat-label">
                    <Trans
                      t={t}
                      i18nKey={stat.labelKey}
                      components={{ accent: <span className="stat-accent" /> }}
                    />
                  </p>
                ) : (
                  <p className="stat-label">{t(stat.labelKey)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHAT WE DO ═══════════════════ */}
      <section className="py-16 sm:py-20 lg:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 sm:mb-16">
            <div>
              <span className="section-label">{t('home.services.label')}</span>
              <h2 className="section-heading">
                <Trans
                  t={t}
                  i18nKey="home.services.heading"
                  components={{ br: <br />, accent: <span className="gradient-text" /> }}
                />
              </h2>
            </div>
            <p className="section-subheading md:text-right md:max-w-md">
              {t('home.services.subheading')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {(dbServices.length > 0 ? dbServices : services).map((service, idx) => {
              const isDb = Boolean(service.title);
              const title = isDb ? service.title : t(`home.services.items.${service.key}.title`);
              const desc = isDb ? service.description : t(`home.services.items.${service.key}.description`);
              const bgClass = service.bgClass || 'bg-brand-violet/15 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-cyan';
              return (
                <div
                  key={service.id || service.key || idx}
                  className="group surface-panel p-7 sm:p-8 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-glow/10"
                >
                  <div
                    className={`w-12 h-12 rounded-xl mb-5 flex items-center justify-center transition-transform duration-500 ease-expo group-hover:scale-110 ${bgClass}`}
                  >
                    {service.icon && typeof service.icon !== 'string' ? (
                      service.icon
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors duration-300 ease-premium">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURED PROJECTS ═══════════════════ */}
      <section className="py-16 sm:py-20 lg:py-28 relative z-10 bg-gray-50/60 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 sm:mb-16">
            <div>
              <span className="section-label">{t('home.projects.label')}</span>
              <h2 className="section-heading">
                <Trans
                  t={t}
                  i18nKey="home.projects.heading"
                  components={{ accent: <span className="gradient-text" /> }}
                />
              </h2>
            </div>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-violet dark:text-brand-cyan hover:gap-3 transition-all duration-300 ease-premium"
            >
              {t('home.projects.viewAll')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.slug}`}
                  className="group block"
                >
                  <div className="surface-panel overflow-hidden hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-glow/10">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-dark-700">
                      {resolveMediaUrl(project.cover_image) ? (
                        <img
                          src={resolveMediaUrl(project.cover_image)}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-14 h-14 rounded-xl bg-gradient-brand/10 flex items-center justify-center">
                            <svg className="w-7 h-7 text-brand-violet/40 dark:text-brand-cyan/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(project.tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand-violet/8 text-brand-violet/80 dark:bg-brand-cyan/8 dark:text-brand-cyan/80"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors duration-300 ease-premium">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                        {project.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-violet dark:text-brand-cyan group-hover:gap-2 transition-all duration-300 ease-premium">
                        {t('home.projects.viewProject')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">{t('home.projects.empty')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ SKILLS & TECH STACK ═══════════════════ */}
      <section className="py-16 sm:py-20 lg:py-28 relative z-10" id="skills">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-14">
            <div>
              <span className="section-label">{t('navigation:skills') || 'Expertise'}</span>
              <h2 className="section-heading">
                Tech Stack & <span className="gradient-text">Skills</span>
              </h2>
            </div>
            <p className="section-subheading md:text-right md:max-w-md">
              Specialized tools, languages, and frameworks powering production-grade systems.
            </p>
          </div>

          {skills.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="surface-panel p-4 flex flex-col items-center text-center hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-cyan group-hover:scale-110 transition-transform">
                    {skill.icon ? (
                      <span className="text-sm font-bold font-mono uppercase">{skill.icon.slice(0, 3)}</span>
                    ) : (
                      <span className="text-sm font-bold font-mono uppercase">{skill.name.slice(0, 2)}</span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate w-full">
                    {skill.name}
                  </h4>
                  <span className="mt-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 capitalize">
                    {skill.category || 'Skill'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {['React', 'Laravel', 'TypeScript', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Next.js', 'REST APIs'].map((item, idx) => (
                <div key={idx} className="surface-panel p-4 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-cyan" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ EXPERIENCE TIMELINE ═══════════════════ */}
      <section className="py-16 sm:py-20 lg:py-28 relative z-10 bg-gray-50/60 dark:bg-dark-900/50" id="experience">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 sm:mb-16">
            <div>
              <span className="section-label">{t('navigation:experience') || 'Career'}</span>
              <h2 className="section-heading">
                Work Experience & <span className="gradient-text">Journey</span>
              </h2>
            </div>
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-violet dark:text-brand-cyan hover:gap-3 transition-all duration-300 ease-premium"
            >
              <span>View Full Bio & Journey</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="space-y-6 max-w-4xl">
            {experiences.length > 0 ? (
              experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="surface-panel p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 relative border-l-4 border-l-brand-violet dark:border-l-brand-cyan"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-display font-bold text-gray-900 dark:text-white">
                        {exp.title}
                      </h3>
                      <p className="text-sm font-medium text-brand-violet dark:text-brand-cyan">
                        {exp.company} {exp.location ? `• ${exp.location}` : ''}
                      </p>
                    </div>
                    <span className="inline-flex self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {exp.start_date || '2024'} — {exp.is_current ? 'Present' : (exp.end_date || 'Past')}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="surface-panel p-6 sm:p-8 border-l-4 border-l-brand-violet dark:border-l-brand-cyan">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Senior Full-Stack Engineer</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-violet/10 text-brand-cyan">2024 — Present</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">APEX Platform • Phnom Penh, Cambodia</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Architecting full-stack web platforms and cloud-native systems.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ LATEST BLOG ═══════════════════ */}
      <section className="py-16 sm:py-20 lg:py-28 relative z-10 bg-gray-50/60 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 sm:mb-16">
            <div>
              <span className="section-label">{t('home.blog.label')}</span>
              <h2 className="section-heading">
                <Trans
                  t={t}
                  i18nKey="home.blog.heading"
                  components={{ accent: <span className="gradient-text" /> }}
                />
              </h2>
            </div>
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-violet dark:text-brand-cyan hover:gap-3 transition-all duration-300 ease-premium"
            >
              {t('home.blog.readAll')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts
                .filter((p) => p?.slug)
                .map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <div className="surface-panel overflow-hidden h-full flex flex-col hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-glow/10">
                      {resolveMediaUrl(post.cover_image) && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={resolveMediaUrl(post.cover_image)}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-expo group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          {post.category?.name && (
                            <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand-violet/8 text-brand-violet/80 dark:bg-brand-cyan/8 dark:text-brand-cyan/80">
                              {post.category.name}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            {formatDate(post.published_at, i18n.language)}
                          </span>
                        </div>
                        <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors duration-300 ease-premium line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
                          {post.author?.username ? (
                            <button
                              type="button"
                              className="flex items-center gap-2 text-left rounded-lg -m-1 p-1 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors duration-300 ease-premium"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/author/${post.author.username}`);
                              }}
                            >
                              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden">
                                {resolveMediaUrl(post.author.avatar) ? (
                                  <img
                                    src={resolveMediaUrl(post.author.avatar)}
                                    alt={post.author.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-[10px] font-bold">{post.author.name?.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{post.author.name}</span>
                            </button>
                          ) : post.author ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden">
                                {resolveMediaUrl(post.author.avatar) ? (
                                  <img
                                    src={resolveMediaUrl(post.author.avatar)}
                                    alt={post.author.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-[10px] font-bold">{post.author.name?.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{post.author.name}</span>
                            </div>
                          ) : null}
                          {post.reading_time && (
                            <span className="text-[10px] text-gray-400 ml-auto">
                              {t('home.blog.readingTime', { minutes: post.reading_time })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══════════════════ TECH STACK — BLACK HOLE ORBIT ═══════════════════ */}
      <section className="tech-section relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-14">
          <span className="section-label">{t('home.techStack.label')}</span>
          <h2 className="section-heading mb-4">
            <Trans
              t={t}
              i18nKey="home.techStack.heading"
              components={{ accent: <span className="gradient-text" /> }}
            />
          </h2>
          <p className="section-subheading mx-auto">
            {t('home.techStack.subheading')}
          </p>
        </div>

        <div className="orbit-shell">
          <div className="blackhole-glow blackhole-glow-violet" />
          <div className="blackhole-glow blackhole-glow-cyan" />
          <div className="blackhole-ring ring-outer" />
          <div className="blackhole-ring ring-mid" />
          <div className="blackhole-ring ring-inner" />

          <div className="event-horizon">
            <div className="event-horizon-core" />
          </div>

          <div className="orbit-track">
            {techStack.slice(0, 12).map((tech, i, arr) => (
              <div
                key={tech.id || tech.slug || tech.name}
                title={tech.name}
                className="orbit-node group"
                style={{
                  '--i': i,
                  '--count': Math.max(arr.length, 1),
                }}
              >
                <div className="orbit-node-inner">
                  <img src={tech.logo} alt={tech.name} className="tech-logo" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {techStack.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {techStack.map((tech) => (
              <Link
                key={tech.id || tech.slug || tech.name}
                to={`/projects`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white/80 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-gray-200 hover:border-brand-violet/40 dark:hover:border-brand-cyan/40 transition-all backdrop-blur-sm"
              >
                <img src={tech.logo} alt={tech.name} className="w-4 h-4 object-contain" loading="lazy" />
                <span>{tech.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { publicApi } from '@/services';
import EmptyState from '@/components/common/EmptyState';

const purifyConfig = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'src', 'style', 'data-youtube-video'],
};

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

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

export default function ProjectDetailView() {
  const { t, i18n } = useTranslation('projects');
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const dateLocale = i18n.language === 'km' ? 'km-KH' : 'en-US';

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      try {
        const { data } = await publicApi.getProject(slug);
        setProject(data.data);
      } catch {
        setProject(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [slug]);

  useEffect(() => {
    if (loading) return;
    if (project) {
      document.title = t('detail.documentTitle', { title: project.title || t('detail.defaultTitle') });
    } else {
      document.title = t('detail.notFoundDocumentTitle');
    }
  }, [project, loading, t]);

  const renderedContent = useMemo(() => {
    if (!project?.long_description) return '';
    return DOMPurify.sanitize(marked.parse(project.long_description), purifyConfig);
  }, [project?.long_description]);

  return (
    <div className="project-detail-page">
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="relative">
            <div className="w-14 h-14 border-[3px] border-gray-200 dark:border-dark-600 border-t-brand-violet dark:border-t-brand-cyan rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-6 h-6 border-[3px] border-gray-200 dark:border-dark-600 border-b-brand-cyan dark:border-b-brand-violet rounded-full animate-spin"
                style={{ animationDirection: 'reverse' }}
              />
            </div>
          </div>
        </div>
      ) : project ? (
        <>
          {/* ═══════════════════ HERO ═══════════════════ */}
          <section className="relative overflow-hidden">
            {project.cover_image ? (
              <div className="absolute inset-0">
                <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white dark:from-dark-900/90 dark:via-dark-900/80 dark:to-dark-900 backdrop-blur-sm" />
              </div>
            ) : (
              <div className="absolute inset-0">
                <div className="absolute inset-0 projects-hero-grid opacity-[0.03] dark:opacity-[0.05]" />
                <div className="absolute top-1/3 -left-20 sm:-left-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-brand-violet/10 blur-[80px] sm:blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 sm:-right-40 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-brand-cyan/10 blur-[70px] sm:blur-[100px]" />
              </div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-10 sm:pb-16">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors mb-10 group"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                {t('detail.backToProjects')}
              </Link>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${statusClasses(project.status)}`}>
                  {formatStatus(project.status, t)}
                </span>
                {project.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {t('common.featured')}
                  </span>
                )}
                {project.is_open_source && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {t('common.openSource')}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {{ ...project }.title}
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed mb-6 sm:mb-8">
                {project.description}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-8 sm:mb-10">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-brand text-white font-semibold rounded-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {t('common.liveDemo')}
                  </a>
                )}
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-all duration-300 hover:-translate-y-0.5 text-sm backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    {t('detail.viewSource')}
                  </a>
                )}
              </div>

              {/* Meta info bar */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
                {project.creator?.username ? (
                  <Link
                    to={`/author/${project.creator.username}`}
                    className="flex items-center gap-2 rounded-lg -m-1 p-1 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                  >
                    {project.creator.avatar ? (
                      <img src={project.creator.avatar} alt={project.creator.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center text-white text-[10px] font-bold">
                        {project.creator.name?.charAt(0)}
                      </span>
                    )}
                    {project.creator.name}
                  </Link>
                ) : project.creator ? (
                  <span className="flex items-center gap-2">
                    {project.creator.avatar ? (
                      <img src={project.creator.avatar} alt={project.creator.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center text-white text-[10px] font-bold">
                        {project.creator.name?.charAt(0)}
                      </span>
                    )}
                    {project.creator.name}
                  </span>
                ) : null}

                {project.created_at && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {new Date(project.created_at).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ═══════════════════ COVER IMAGE ═══════════════════ */}
          {project.cover_image && (
            <section className="pb-12">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] shadow-glass dark:shadow-glass-dark">
                  <img src={project.cover_image} alt={project.title} className="w-full h-auto max-h-[500px] object-cover" />
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════ CONTENT ═══════════════════ */}
          <section className="pb-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 overflow-hidden">
              <div className="grid lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
                {/* Main content */}
                <div className="min-w-0">
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 text-xs rounded-full font-medium bg-brand-violet/8 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan border border-brand-violet/10 dark:border-brand-cyan/15"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {renderedContent ? (
                    <article
                      className="prose prose-lg dark:prose-invert max-w-none overflow-hidden
                        prose-headings:font-sans prose-headings:font-bold
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-gray-900 dark:prose-h2:text-white
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                        prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed
                        prose-a:text-brand-violet dark:prose-a:text-brand-cyan prose-a:no-underline hover:prose-a:underline
                        prose-code:text-brand-violet dark:prose-code:text-brand-cyan prose-code:bg-brand-violet/5 dark:prose-code:bg-brand-cyan/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-code prose-code:text-sm
                        prose-pre:bg-[#0d1117] dark:prose-pre:bg-[#0d1117] prose-pre:border-0 prose-pre:rounded-none prose-pre:m-0 prose-pre:p-0
                        prose-img:rounded-xl prose-img:border prose-img:border-gray-100 dark:prose-img:border-dark-600
                        prose-blockquote:border-brand-violet dark:prose-blockquote:border-brand-cyan prose-blockquote:bg-brand-violet/5 dark:prose-blockquote:bg-brand-cyan/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6
                        prose-li:text-gray-600 dark:prose-li:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-gray-400 dark:text-gray-500 text-sm italic">{t('detail.noDescription')}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="min-w-0 space-y-6">
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="p-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm">
                      <h3 className="text-sm font-sans font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                        {t('detail.sidebar.techStack')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 text-xs rounded-full font-medium bg-gray-50 dark:bg-dark-700 text-gray-700 dark:text-gray-300 border border-black/[0.08] dark:border-white/[0.08]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm">
                    <h3 className="text-sm font-sans font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      {t('detail.sidebar.projectInfo')}
                    </h3>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">{t('detail.sidebar.status')}</dt>
                        <dd>
                          <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${statusClasses(project.status)}`}>
                            {formatStatus(project.status, t)}
                          </span>
                        </dd>
                      </div>
                      {project.is_open_source && (
                        <div className="flex justify-between">
                          <dt className="text-xs text-gray-500 dark:text-gray-400">{t('detail.sidebar.license')}</dt>
                          <dd className="text-xs text-gray-700 dark:text-gray-300 font-medium">{t('common.openSource')}</dd>
                        </div>
                      )}
                      {project.created_at && (
                        <div className="flex justify-between">
                          <dt className="text-xs text-gray-500 dark:text-gray-400">{t('detail.sidebar.created')}</dt>
                          <dd className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                            {new Date(project.created_at).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })}
                          </dd>
                        </div>
                      )}
                      {project.creator && (
                        <div className="flex justify-between items-center">
                          <dt className="text-xs text-gray-500 dark:text-gray-400">{t('detail.sidebar.creator')}</dt>
                          <dd className="text-xs text-gray-700 dark:text-gray-300 font-medium min-w-0">
                            {project.creator.username ? (
                              <Link
                                to={`/author/${project.creator.username}`}
                                className="inline-flex items-center gap-1.5 max-w-full rounded-md hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                              >
                                {project.creator.avatar && (
                                  <img src={project.creator.avatar} alt={project.creator.name} className="w-4 h-4 shrink-0 rounded-full object-cover" />
                                )}
                                <span className="truncate">{project.creator.name}</span>
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1.5">
                                {project.creator.avatar && (
                                  <img src={project.creator.avatar} alt={project.creator.name} className="w-4 h-4 rounded-full object-cover" />
                                )}
                                {project.creator.name}
                              </span>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="p-6 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm">
                    <h3 className="text-sm font-sans font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      {t('detail.sidebar.links')}
                    </h3>
                    <div className="space-y-2">
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/5 dark:hover:bg-brand-cyan/5 transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          {t('common.liveDemo')}
                        </a>
                      )}
                      {project.repo_url && (
                        <a
                          href={project.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/5 dark:hover:bg-brand-cyan/5 transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          {t('detail.sidebar.githubRepository')}
                        </a>
                      )}
                      {!project.demo_url && !project.repo_url && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 italic px-3">
                          {t('detail.sidebar.noExternalLinks')}
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* ═══════════════════ NAVIGATION ═══════════════════ */}
          <section className="pb-24">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-dark-600">
                <Link
                  to="/projects"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/5 dark:hover:bg-brand-cyan/5 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  {t('detail.allProjects')}
                </Link>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-brand-violet dark:text-brand-cyan hover:bg-brand-violet/5 dark:hover:bg-brand-cyan/5 transition-all duration-300"
                >
                  {t('detail.contactCta')}
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="min-h-[50vh] flex items-center justify-center">
          <EmptyState title={t('detail.notFound.title')} message={t('detail.notFound.message')} />
        </div>
      )}
    </div>
  );
}

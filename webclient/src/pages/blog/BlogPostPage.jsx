import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import dayjs from 'dayjs';
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

const bqKeywords = [
  'tip', 'info', 'warning', 'danger', 'success', 'note', 'important',
  'quote', 'curly', 'qbox', 'qline', 'qround', 'qdash', 'qbold', 'qbubble',
  'conclusion', 'condark', 'conmin', 'conbold', 'confresh'
];
const bqKeywordRe = new RegExp('^(>\\s*)\\[(' + bqKeywords.join('|') + ')\\][ \\t]+(.+)$', 'gim');

function formatDate(date, locale) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return dayjs(date).format('MMMM D, YYYY');
  return d.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BlogPostView() {
  const { t, i18n } = useTranslation('blog');
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US';
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const { data } = await publicApi.getBlogPost(slug);
        setPost(data.data);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (loading) return;
    if (post) {
      document.title = t('post.pageTitle', { title: post.title || t('post.defaultTitle') });
    } else {
      document.title = t('post.notFoundPageTitle');
    }
  }, [post, loading, i18n.language, t]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return '';
    let md = post.content.replace(bqKeywordRe, (_, prefix, kw, rest) => {
      return `${prefix}[${kw}]\n${prefix}${rest}`;
    });
    const html = marked.parse(md);
    return DOMPurify.sanitize(html, purifyConfig);
  }, [post?.content]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="blog-post-page">
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
      ) : post ? (
        <>
          {/* ═══════════════════ HERO ═══════════════════ */}
          <section className="relative min-h-[45vh] sm:min-h-[55vh] flex items-end overflow-hidden">
            {post.cover_image ? (
              <div className="absolute inset-0">
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-brand opacity-80" />
            )}

            <Link
              to="/blog"
              className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white/90 bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {t('post.backToBlog')}
            </Link>

            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 pt-24 sm:pt-32">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {post.category && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-violet/80 dark:bg-brand-cyan/80 text-white backdrop-blur-sm">
                    {post.category.name}
                  </span>
                )}
                {post.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/80 text-white backdrop-blur-sm">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {t('public.featured.badge')}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-white leading-tight mb-4 sm:mb-5">
                {{ ...post }.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-white/70">
                {post.author?.username ? (
                  <Link
                    to={`/author/${post.author.username}`}
                    className="flex items-center gap-2.5 rounded-lg hover:bg-white/10 transition-colors -m-1 p-1"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                          {post.author.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-white leading-tight">{post.author.name}</span>
                      <span className="text-white/60 text-xs sm:text-sm truncate">@{post.author.username}</span>
                    </div>
                  </Link>
                ) : post.author ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
                          {post.author.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-white leading-tight">{post.author.name}</span>
                    </div>
                  </div>
                ) : null}

                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {formatDate(post.published_at, dateLocale)}
                </span>

                {post.reading_time && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('common.minRead', { minutes: post.reading_time })}
                  </span>
                )}

                {post.views_count && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('common.viewsCount', { count: post.views_count })}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ═══════════════════ COVER IMAGE (Full-width) ═══════════════════ */}
          {post.cover_image && (
            <section className="py-8 relative z-10">
              <div className="max-w-5xl mx-auto px-4">
                <div className="rounded-2xl overflow-hidden shadow-2xl dark:shadow-glow/10">
                  <img src={post.cover_image} alt={post.title} className="w-full object-cover max-h-[500px]" />
                </div>
              </div>
            </section>
          )}

          {/* ═══════════════════ CONTENT + SIDEBAR ═══════════════════ */}
          <section className="py-8 sm:py-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-10">
                {/* Main content */}
                <article className="min-w-0 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm p-4 sm:p-8 md:p-12 overflow-hidden">
                  {post.excerpt && (
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium border-l-4 border-brand-violet dark:border-brand-cyan pl-5 mb-8 italic">
                      {post.excerpt}
                    </p>
                  )}

                  <div
                    className="prose prose-lg dark:prose-invert max-w-none
                      prose-headings:font-sans prose-headings:text-gray-900 dark:prose-headings:text-white
                      prose-a:text-brand-violet dark:prose-a:text-brand-cyan prose-a:no-underline hover:prose-a:underline
                      prose-code:text-brand-violet dark:prose-code:text-brand-cyan prose-code:bg-brand-violet/5 dark:prose-code:bg-brand-cyan/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                      prose-pre:bg-[#0d1117] dark:prose-pre:bg-[#0d1117] prose-pre:border-0 prose-pre:rounded-none prose-pre:m-0 prose-pre:p-0
                      prose-img:rounded-xl prose-img:shadow-lg
                      prose-blockquote:border-brand-violet dark:prose-blockquote:border-brand-cyan prose-blockquote:bg-brand-violet/5 dark:prose-blockquote:bg-brand-cyan/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-6
                      prose-hr:border-gray-200 dark:prose-hr:border-dark-600
                      prose-strong:text-gray-900 dark:prose-strong:text-white"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                  />
                </article>

                {/* Sidebar */}
                <aside className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
                  {/* Author card */}
                  {post.author?.username ? (
                    <Link
                      to={`/author/${post.author.username}`}
                      className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm p-6 text-center overflow-hidden block hover:border-black/[0.16] dark:hover:border-white/20 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-brand-violet/20 dark:ring-brand-cyan/20 mx-auto mb-3">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                            {post.author.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-brand-violet dark:text-brand-cyan uppercase tracking-wider mb-2">{t('common.author')}</p>
                      <h3 className="font-sans font-bold text-gray-900 dark:text-white truncate">{post.author.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{post.author.username}</p>
                      {post.author.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{post.author.bio}</p>
                      )}
                    </Link>
                  ) : post.author ? (
                    <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm p-6 text-center overflow-hidden">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-3 ring-brand-violet/20 dark:ring-brand-cyan/20 mx-auto mb-3">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                            {post.author.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-brand-violet dark:text-brand-cyan uppercase tracking-wider mb-2">{t('common.author')}</p>
                      <h3 className="font-sans font-bold text-gray-900 dark:text-white truncate">{post.author.name}</h3>
                      {post.author.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{post.author.bio}</p>
                      )}
                    </div>
                  ) : null}

                  {/* Article info card */}
                  <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm p-6 overflow-hidden">
                    <h4 className="text-xs font-sans font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      {t('post.articleInfo.title')}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-gray-500 dark:text-gray-400 shrink-0">{t('post.articleInfo.published')}</span>
                        <span className="text-gray-900 dark:text-white font-medium text-right truncate">{formatDate(post.published_at, dateLocale)}</span>
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('post.articleInfo.readingTime')}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{t('common.minShort', { minutes: post.reading_time })}</span>
                        </div>
                      )}
                      {post.views_count && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('post.articleInfo.views')}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{post.views_count}</span>
                        </div>
                      )}
                      {post.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('post.articleInfo.category')}</span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Share card */}
                  <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm p-6 overflow-hidden">
                    <h4 className="text-xs font-sans font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                      {t('post.share.title')}
                    </h4>
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('post.share.facebook')}
                        aria-label={t('post.share.facebook')}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-[#1877F2]/10 hover:border-[#1877F2] hover:text-[#1877F2] transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span className="text-[9px] font-semibold leading-none">FB</span>
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('post.share.telegram')}
                        aria-label={t('post.share.telegram')}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-[#229ED9]/10 hover:border-[#229ED9] hover:text-[#229ED9] transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        <span className="text-[9px] font-semibold leading-none">TG</span>
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(post.title + '\n' + currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('post.share.whatsapp')}
                        aria-label={t('post.share.whatsapp')}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-[#25D366]/10 hover:border-[#25D366] hover:text-[#25D366] transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                        </svg>
                        <span className="text-[9px] font-semibold leading-none">WA</span>
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('post.share.x')}
                        aria-label={t('post.share.x')}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-gray-900/10 dark:hover:bg-white/10 hover:border-gray-800 dark:hover:border-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span className="text-[9px] font-semibold leading-none">X</span>
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('post.share.linkedin')}
                        aria-label={t('post.share.linkedin')}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <span className="text-[9px] font-semibold leading-none">in</span>
                      </a>
                    </div>
                    <button
                      onClick={copyLink}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-all duration-300 ${
 copied
 ? 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400'
 : 'border-gray-200 dark:border-dark-500 text-gray-600 dark:text-gray-400 hover:border-black/[0.16] dark:hover:border-white/20 hover:text-brand-violet dark:hover:text-brand-cyan'
 }`}
                    >
                      {copied ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {t('post.share.linkCopied')}
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 6.364l4.5 4.5a4.5 4.5 0 006.364-6.364L16.5 7.5" />
                          </svg>
                          {t('post.share.copyLink')}
                        </>
                      )}
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* ═══════════════════ NAVIGATION ═══════════════════ */}
          <section className="pb-24 relative z-10">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-center justify-center">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium border border-black/[0.08] dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-black/[0.16] dark:hover:border-white/20 hover:text-brand-violet dark:hover:text-brand-cyan bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  {t('post.backToAllArticles')}
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
          <EmptyState title={t('post.notFound.title')} message={t('post.notFound.message')} />
        </div>
      )}
    </div>
  );
}

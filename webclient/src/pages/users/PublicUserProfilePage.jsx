import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/km';
import { publicApi } from '@/services';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';

const ROLE_KEY_MAP = {
  superadmin: 'roles.superadmin',
  super_admin: 'roles.superadmin',
  'super-admin': 'roles.superadmin',
  'super admin': 'roles.superadmin',
  admin: 'roles.admin',
  editor: 'roles.editor',
  moderator: 'roles.moderator',
  author: 'roles.author',
  member: 'roles.member',
  user: 'roles.user',
  viewer: 'roles.viewer',
  guest: 'roles.guest',
};

function getRoleLabel(role, t) {
  if (!role) return '';
  const rawName = String(role.name || role.display_name || '').trim().toLowerCase();
  const key = ROLE_KEY_MAP[rawName];
  if (key) return t(key);
  return role.display_name || role.name || '';
}

export default function PublicUserProfileView() {
  const { username } = useParams();
  const { t, i18n } = useTranslation('users');
  const dayjsLocale = i18n.language?.startsWith('km') ? 'km' : 'en';

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsMeta, setPostsMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [postSeriesFilter, setPostSeriesFilter] = useState('all');

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsMeta, setProjectsMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [projectCollectionFilter, setProjectCollectionFilter] = useState('all');

  const seriesChipsList = useMemo(() => {
    const m = new Map();
    for (const p of posts) {
      if (p.series) m.set(p.series.slug, p.series);
    }
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [posts]);

  const collectionChipsList = useMemo(() => {
    const m = new Map();
    for (const p of projects) {
      if (p.collection) m.set(p.collection.slug, p.collection);
    }
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const postSeriesBlocks = useMemo(() => {
    const map = new Map();
    const unc = [];
    for (const p of posts) {
      if (!p.series) unc.push(p);
      else {
        const k = p.series.slug;
        if (!map.has(k)) map.set(k, { series: p.series, posts: [] });
        map.get(k).posts.push(p);
      }
    }
    const groups = [...map.values()].sort((a, b) => a.series.name.localeCompare(b.series.name));
    return { groups, uncategorized: unc };
  }, [posts]);

  const projectCollectionBlocks = useMemo(() => {
    const map = new Map();
    const unc = [];
    for (const p of projects) {
      if (!p.collection) unc.push(p);
      else {
        const k = p.collection.slug;
        if (!map.has(k)) map.set(k, { collection: p.collection, projects: [] });
        map.get(k).projects.push(p);
      }
    }
    const groups = [...map.values()].sort((a, b) => a.collection.name.localeCompare(b.collection.name));
    return { groups, uncategorized: unc };
  }, [projects]);

  function formatDate(date) {
    return date ? dayjs(date).locale(dayjsLocale).format('MMM D, YYYY') : '';
  }

  function formatJoined(date) {
    return date ? dayjs(date).locale(dayjsLocale).format('MMMM YYYY') : '';
  }

  function postListParams(page) {
    const params = { page, per_page: 48 };
    if (postSeriesFilter === 'uncategorized') params.uncategorized = true;
    else if (postSeriesFilter !== 'all') params.series = postSeriesFilter;
    return params;
  }

  function projectListParams(page) {
    const params = { page, per_page: 48 };
    if (projectCollectionFilter === 'uncategorized') params.uncategorized = true;
    else if (projectCollectionFilter !== 'all') params.collection = projectCollectionFilter;
    return params;
  }

  async function fetchPosts(page = 1, currentProf = profile) {
    const u = String(username || '').trim();
    if (!u) return;
    const pg = typeof page === 'number' ? page : 1;
    setPostsLoading(true);
    try {
      const { data } = await publicApi.getProfileBlogPosts(u, postListParams(pg));
      setPosts(data.data || []);
      setPostsMeta({
        current_page: data.meta?.current_page ?? 1,
        last_page: data.meta?.last_page ?? 1,
        total: data.meta?.total ?? (data.data || []).length,
      });
    } catch {
      try {
        const uid = currentProf?.id;
        if (uid) {
          const { data } = await publicApi.getBlogPosts({
            author_id: uid,
            page: pg,
            per_page: 48,
          });
          setPosts(data.data || []);
          setPostsMeta({
            current_page: data.meta?.current_page ?? 1,
            last_page: data.meta?.last_page ?? 1,
            total: data.meta?.total ?? (data.data || []).length,
          });
        } else {
          setPosts([]);
          setPostsMeta({ current_page: 1, last_page: 1, total: 0 });
        }
      } catch {
        setPosts([]);
        setPostsMeta({ current_page: 1, last_page: 1, total: 0 });
      }
    } finally {
      setPostsLoading(false);
    }
  }

  async function fetchProjects(page = 1, currentProf = profile) {
    const u = String(username || '').trim();
    if (!u) return;
    const pg = typeof page === 'number' ? page : 1;
    setProjectsLoading(true);
    try {
      const { data } = await publicApi.getProfileProjects(u, projectListParams(pg));
      setProjects(data.data || []);
      setProjectsMeta({
        current_page: data.meta?.current_page ?? 1,
        last_page: data.meta?.last_page ?? 1,
        total: data.meta?.total ?? (data.data || []).length,
      });
    } catch {
      try {
        const uid = currentProf?.id;
        if (uid) {
          const { data } = await publicApi.getProjects({
            created_by: uid,
            page: pg,
            per_page: 48,
          });
          setProjects(data.data || []);
          setProjectsMeta({
            current_page: data.meta?.current_page ?? 1,
            last_page: data.meta?.last_page ?? 1,
            total: data.meta?.total ?? (data.data || []).length,
          });
        } else {
          setProjects([]);
          setProjectsMeta({ current_page: 1, last_page: 1, total: 0 });
        }
      } catch {
        setProjects([]);
        setProjectsMeta({ current_page: 1, last_page: 1, total: 0 });
      }
    } finally {
      setProjectsLoading(false);
    }
  }

  async function loadProfile() {
    setLoading(true);
    setNotFound(false);
    setLoadFailed(false);
    setProfile(null);
    setPosts([]);
    setProjects([]);
    setPostsMeta({ current_page: 1, last_page: 1, total: 0 });
    setProjectsMeta({ current_page: 1, last_page: 1, total: 0 });
    setPostSeriesFilter('all');
    setProjectCollectionFilter('all');

    const u = String(username || '').trim();
    if (!u) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const { data } = await publicApi.getUserProfile(u);
      const d = data.data;
      const { blog_posts: _bp, blog_posts_meta: _bpm, projects: _pr, projects_meta: _prm, ...profileFields } = d;

      setProfile(profileFields);
      document.title = t('publicProfile.pageTitle', {
        name: profileFields.name,
        username: profileFields.username,
      });

      await fetchPosts(1, profileFields);
      await fetchProjects(1, profileFields);
    } catch (e) {
      const status = e.response?.status;
      if (status === 404) {
        setNotFound(true);
      } else {
        setLoadFailed(true);
      }
      setProfile(null);
      document.title = t('publicProfile.fallbackTitle');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      document.title = t('publicProfile.pageTitle', {
        name: profile.name,
        username: profile.username,
      });
    } else if (notFound || loadFailed) {
      document.title = t('publicProfile.fallbackTitle');
    }
  }, [profile, notFound, loadFailed, i18n.language, t]);

  useEffect(() => {
    if (profile) {
      fetchPosts(1, profile);
    }
  }, [postSeriesFilter]);

  useEffect(() => {
    if (profile) {
      fetchProjects(1, profile);
    }
  }, [projectCollectionFilter]);

  return (
    <div className="public-profile-page min-h-screen pb-24">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-[3px] border-gray-200 dark:border-dark-600 border-t-brand-violet dark:border-t-brand-cyan rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-6 h-6 border-[3px] border-gray-200 dark:border-dark-600 border-b-brand-cyan dark:border-b-brand-violet rounded-full animate-spin"
                style={{ animationDirection: 'reverse' }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('publicProfile.loading')}</p>
        </div>
      ) : notFound ? (
        <EmptyState
          title={t('publicProfile.notFoundTitle')}
          message={t('publicProfile.notFoundMessage')}
        />
      ) : loadFailed ? (
        <EmptyState
          title={t('publicProfile.loadFailedTitle')}
          message={t('publicProfile.loadFailedMessage')}
        />
      ) : profile ? (
        <div key={profile.id}>
          {/* Hero */}
          <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20">
            <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-brand-cyan/8 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start gap-8">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-brand-violet to-brand-cyan p-[3px] shadow-lg shadow-brand-violet/25">
                  <div className="w-full h-full rounded-[13px] bg-dark-800 overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-brand-violet/30 to-brand-cyan/30">
                        {profile.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-4xl font-sans font-bold text-white truncate">{profile.name}</h1>
                  {profile.role?.display_name && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wider bg-white/10 text-brand-cyan border border-white/20">
                      {getRoleLabel(profile.role, t)}
                    </span>
                  )}
                </div>
                <p className="text-brand-cyan/90 text-lg font-medium mb-3">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-4">{profile.bio}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {profile.joined_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {t('publicProfile.joined', { date: formatJoined(profile.joined_at) })}
                    </span>
                  )}
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-gray-300 hover:text-brand-cyan transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      {t('publicProfile.social.github')}
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-gray-300 hover:text-brand-cyan transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      {t('publicProfile.social.linkedin')}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
            <div className="flex flex-wrap gap-2 p-1.5 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] w-fit shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
 activeTab === 'posts'
 ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-md'
 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
 }`}
              >
                {t('publicProfile.tabs.posts')}
                <span className="ml-1.5 text-xs opacity-70">({postsMeta.total ?? posts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
 activeTab === 'projects'
 ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-md'
 : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
 }`}
              >
                {t('publicProfile.tabs.projects')}
                <span className="ml-1.5 text-xs opacity-70">({projectsMeta.total ?? projects.length})</span>
              </button>
            </div>

            {/* Posts */}
            {activeTab === 'posts' && (
              <div className="mt-10">
                <div className="flex flex-wrap gap-2 mb-8">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
 postSeriesFilter === 'all'
 ? 'border-brand-violet bg-brand-violet/10 text-brand-violet dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan'
 : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-black/[0.14]'
 }`}
                    onClick={() => setPostSeriesFilter('all')}
                  >
                    {t('publicProfile.filters.all')}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
 postSeriesFilter === 'uncategorized'
 ? 'border-brand-violet bg-brand-violet/10 text-brand-violet dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan'
 : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-black/[0.14]'
 }`}
                    onClick={() => setPostSeriesFilter('uncategorized')}
                  >
                    {t('publicProfile.filters.uncategorized')}
                  </button>
                  {seriesChipsList.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors max-w-[200px] truncate ${
 postSeriesFilter === s.slug
 ? 'border-brand-violet bg-brand-violet/10 text-brand-violet dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan'
 : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-black/[0.14]'
 }`}
                      title={s.name}
                      onClick={() => setPostSeriesFilter(s.slug)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>

                {postsLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
                  </div>
                ) : posts.length > 0 ? (
                  postSeriesFilter === 'all' ? (
                    <>
                      {postSeriesBlocks.groups.map((block) => (
                        <div key={block.series.slug} className="mb-12 last:mb-0">
                          <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-violet/15 text-brand-violet dark:bg-brand-cyan/15 dark:text-brand-cyan">
                              {t('publicProfile.badges.series')}
                            </span>
                            <Link
                              to={`/series/${profile.username}/${block.series.slug}`}
                              className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                            >
                              {block.series.name}
                            </Link>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({block.posts.length})</span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                            {block.posts.map((post) => (
                              <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-glow/10"
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
                                <div className="flex flex-col flex-1 p-5">
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{formatDate(post.published_at)}</p>
                                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                                    {post.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{post.excerpt}</p>
                                  {post.series && (
                                    <span className="mt-3 inline-flex self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan">
                                      {post.series.name}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}

                      {postSeriesBlocks.uncategorized.length > 0 && (
                        <div className="mt-12 pt-10 border-t border-gray-200 dark:border-dark-600">
                          <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700 dark:bg-dark-600 dark:text-gray-300">
                              {t('publicProfile.filters.uncategorized')}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({postSeriesBlocks.uncategorized.length})
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                            {postSeriesBlocks.uncategorized.map((post) => (
                              <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                                <div className="flex flex-col flex-1 p-5">
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{formatDate(post.published_at)}</p>
                                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                                    {post.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{post.excerpt}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                      {posts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/blog/${post.slug}`}
                          className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-glow/10"
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
                          <div className="flex flex-col flex-1 p-5">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{formatDate(post.published_at)}</p>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{post.excerpt}</p>
                            {post.series && (
                              <span className="mt-3 inline-flex self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan">
                                {post.series.name}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                ) : (
                  <EmptyState
                    title={t('publicProfile.empty.postsTitle')}
                    message={t('publicProfile.empty.postsMessage')}
                  />
                )}

                {postsMeta.last_page > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={postsMeta.current_page}
                      lastPage={postsMeta.last_page}
                      onPageChange={fetchPosts}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <div className="mt-10">
                <div className="flex flex-wrap gap-2 mb-8">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
 projectCollectionFilter === 'all'
 ? 'border-brand-violet bg-brand-violet/10 text-brand-violet dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan'
 : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-black/[0.14]'
 }`}
                    onClick={() => setProjectCollectionFilter('all')}
                  >
                    {t('publicProfile.filters.all')}
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
 projectCollectionFilter === 'uncategorized'
 ? 'border-brand-violet bg-brand-violet/10 text-brand-violet dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan'
 : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-black/[0.14]'
 }`}
                    onClick={() => setProjectCollectionFilter('uncategorized')}
                  >
                    {t('publicProfile.filters.uncategorized')}
                  </button>
                  {collectionChipsList.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors max-w-[200px] truncate ${
 projectCollectionFilter === c.slug
 ? 'border-brand-violet bg-brand-violet/10 text-brand-violet dark:border-brand-cyan dark:bg-brand-cyan/10 dark:text-brand-cyan'
 : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 hover:border-black/[0.14]'
 }`}
                      title={c.name}
                      onClick={() => setProjectCollectionFilter(c.slug)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {projectsLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
                  </div>
                ) : projects.length > 0 ? (
                  projectCollectionFilter === 'all' ? (
                    <>
                      {projectCollectionBlocks.groups.map((block) => (
                        <div key={block.collection.slug} className="mb-12 last:mb-0">
                          <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-cyan/15 text-brand-cyan dark:bg-brand-violet/15 dark:text-brand-violet">
                              {t('publicProfile.badges.collection')}
                            </span>
                            <Link
                              to={`/collections/${profile.username}/${block.collection.slug}`}
                              className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                            >
                              {block.collection.name}
                            </Link>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({block.projects.length})</span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                            {block.projects.map((project) => (
                              <Link
                                key={project.id}
                                to={`/projects/${project.slug}`}
                                className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                                <div className="p-5 flex-1 flex flex-col">
                                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{project.description}</p>
                                  {project.collection && (
                                    <span className="mt-3 inline-flex self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan dark:bg-brand-violet/10 dark:text-brand-violet">
                                      {project.collection.name}
                                    </span>
                                  )}
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(project.tags || []).slice(0, 3).map((tag) => (
                                      <span
                                        key={tag.id}
                                        className="px-2 py-0.5 text-[10px] rounded-md bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan"
                                      >
                                        {tag.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}

                      {projectCollectionBlocks.uncategorized.length > 0 && (
                        <div className="mt-12 pt-10 border-t border-gray-200 dark:border-dark-600">
                          <div className="flex flex-wrap items-center gap-3 mb-5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200/80 text-gray-700 dark:bg-dark-600 dark:text-gray-300">
                              {t('publicProfile.filters.uncategorized')}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({projectCollectionBlocks.uncategorized.length})
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                            {projectCollectionBlocks.uncategorized.map((project) => (
                              <Link
                                key={project.id}
                                to={`/projects/${project.slug}`}
                                className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                                <div className="p-5 flex-1 flex flex-col">
                                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{project.description}</p>
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {(project.tags || []).slice(0, 3).map((tag) => (
                                      <span
                                        key={tag.id}
                                        className="px-2 py-0.5 text-[10px] rounded-md bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan"
                                      >
                                        {tag.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                      {projects.map((project) => (
                        <Link
                          key={project.id}
                          to={`/projects/${project.slug}`}
                          className="group flex flex-col rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm overflow-hidden hover:border-black/[0.16] dark:hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{project.description}</p>
                            {project.collection && (
                              <span className="mt-3 inline-flex self-start text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan dark:bg-brand-violet/10 dark:text-brand-violet">
                                {project.collection.name}
                              </span>
                            )}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(project.tags || []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-2 py-0.5 text-[10px] rounded-md bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan"
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )
                ) : (
                  <EmptyState
                    title={t('publicProfile.empty.projectsTitle')}
                    message={t('publicProfile.empty.projectsMessage')}
                  />
                )}

                {projectsMeta.last_page > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={projectsMeta.current_page}
                      lastPage={projectsMeta.last_page}
                      onPageChange={fetchProjects}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

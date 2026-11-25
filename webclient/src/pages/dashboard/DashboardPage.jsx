import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import StorageStats from '@/components/shared/StorageStats'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)
dayjs.extend(relativeTime)

export default function DashboardView() {
  const { t, i18n } = useTranslation('dashboard')
  const { user, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const currentLocale = i18n.language?.startsWith('km') ? 'km' : 'en'

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(123, 47, 255, 0.1)' } },
      x: { grid: { display: false } },
    },
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, usePointStyle: true, padding: 16 },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(123, 47, 255, 0.1)' } },
      x: { grid: { display: false } },
    },
  }

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [statsRes, activityRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getDashboardActivity(),
      ])
      setStats(statsRes.data?.data || {})
      setRecentActivity(activityRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError(err.response?.data?.message || t('errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadData()
  }, [loadData])

  const statsCards = useMemo(() => {
    const cards = []

    if (isSuperAdmin) {
      cards.push({
        label: t('stats.totalUsers'),
        value: stats?.total_users ?? 0,
        subtext: t('subtext.users', {
          active: stats?.active_users ?? 0,
          inactive: stats?.inactive_users ?? 0,
        }),
        to: '/admin/users',
        icon: '👥',
        bgClass: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800/30 dark:text-blue-400',
      })
    }

    cards.push(
      {
        label: t('stats.projects'),
        value: stats?.total_projects ?? 0,
        subtext: t('subtext.projects', {
          active: stats?.projects_by_status?.active ?? 0,
          wip: stats?.projects_by_status?.wip ?? 0,
        }),
        to: '/admin/projects',
        icon: '📁',
        bgClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/30 dark:text-emerald-400',
      },
      {
        label: t('stats.blogPosts'),
        value: stats?.total_blog_posts ?? 0,
        subtext: t('subtext.blogPosts', {
          drafts: stats?.blog_posts_by_status?.draft ?? 0,
          views: (stats?.total_blog_views ?? 0).toLocaleString(),
        }),
        to: '/admin/blog',
        icon: '📝',
        bgClass: 'bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/30 dark:border-purple-800/30 dark:text-purple-400',
      },
      {
        label: t('stats.messages'),
        value: stats?.unread_messages ?? 0,
        subtext: t('subtext.messages', {
          total: stats?.total_messages ?? 0,
          pendingApps: stats?.pending_applications ?? 0,
        }),
        to: '/admin/messages',
        icon: '✉️',
        bgClass: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/30 dark:border-amber-800/30 dark:text-amber-400',
      }
    )

    if (!isSuperAdmin) {
      cards.push({
        label: t('stats.docs'),
        value: stats?.total_docs ?? 0,
        subtext: t('subtext.docs', {
          published: stats?.published_docs ?? 0,
          draft: stats?.draft_docs ?? 0,
        }),
        to: '/admin/docs',
        icon: '📚',
        bgClass: 'bg-cyan-50 text-cyan-600 border border-cyan-100 dark:bg-cyan-900/30 dark:border-cyan-800/30 dark:text-cyan-400',
      })
    }

    return cards
  }, [stats, t, isSuperAdmin])

  const secondaryMetrics = useMemo(() => {
    if (!stats) return []
    const items = [
      { label: t('secondary.docsPublished'), value: `${stats.published_docs ?? 0} / ${stats.total_docs ?? 0}`, to: '/admin/docs' },
      {
        label: t('secondary.applications'),
        value: t('secondary.pendingOfTotal', {
          pending: stats.pending_applications ?? 0,
          total: stats.total_applications ?? 0,
        }),
        to: '/admin/applications',
      },
      { label: t('secondary.seriesCollections'), value: `${stats.total_series ?? 0} / ${stats.total_collections ?? 0}`, to: '/admin/series' },
      { label: t('secondary.mediaAssets'), value: stats.total_media ?? 0, to: '/admin/media' },
    ]
    if (isSuperAdmin) {
      items.push({
        label: t('secondary.pendingApprovals'),
        value: stats.pending_approvals ?? 0,
        to: '/admin/approvals',
      })
    }
    return items
  }, [stats, t, isSuperAdmin])

  const chartData = useMemo(() => {
    if (!stats) return null
    const labels = isSuperAdmin
      ? [t('chart.users'), t('chart.projects'), t('chart.posts'), t('chart.docs'), t('chart.messages'), t('chart.applications')]
      : [t('chart.projects'), t('chart.posts'), t('chart.docs'), t('chart.messages'), t('chart.applications')]
    const values = isSuperAdmin
      ? [
          stats.total_users || 0,
          stats.total_projects || 0,
          stats.total_blog_posts || 0,
          stats.total_docs || 0,
          stats.unread_messages || 0,
          stats.pending_applications || 0,
        ]
      : [
          stats.total_projects || 0,
          stats.total_blog_posts || 0,
          stats.total_docs || 0,
          stats.unread_messages || 0,
          stats.pending_applications || 0,
        ]
    const colors = isSuperAdmin
      ? ['#7b2fff', '#10b981', '#9d5fff', '#00d4ff', '#f59e0b', '#ec4899']
      : ['#10b981', '#9d5fff', '#00d4ff', '#f59e0b', '#ec4899']

    return {
      labels,
      datasets: [
        {
          label: t('chart.count'),
          data: values,
          backgroundColor: colors,
          borderRadius: 8,
        },
      ],
    }
  }, [stats, t, isSuperAdmin])

  const trendChartData = useMemo(() => {
    const trends = stats?.monthly_trends
    if (!Array.isArray(trends) || trends.length === 0) return null

    const datasets = [
      {
        label: t('chart.projects'),
        data: trends.map((m) => m.projects || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        tension: 0.35,
        fill: true,
      },
      {
        label: t('chart.posts'),
        data: trends.map((m) => m.blog_posts || 0),
        borderColor: '#7b2fff',
        backgroundColor: 'rgba(123, 47, 255, 0.12)',
        tension: 0.35,
        fill: true,
      },
      {
        label: t('chart.messages'),
        data: trends.map((m) => m.messages || 0),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        tension: 0.35,
        fill: false,
      },
      {
        label: t('chart.applications'),
        data: trends.map((m) => m.applications || 0),
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.08)',
        tension: 0.35,
        fill: false,
      },
    ]

    if (isSuperAdmin) {
      datasets.unshift({
        label: t('chart.users'),
        data: trends.map((m) => m.users || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.35,
        fill: false,
      })
    }

    return {
      labels: trends.map((m) =>
        m.month ? dayjs(`${m.month}-01`).locale(currentLocale).format('MMM YYYY') : m.label
      ),
      datasets,
    }
  }, [stats, t, isSuperAdmin, currentLocale])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('welcome', { name: user?.name || '' })}
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200 hover:border-brand-violet/40 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <span className={loading ? 'animate-spin inline-block' : ''}>↻</span>
          {loading ? t('actions.refreshing') : t('actions.refresh')}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0"
          >
            {t('actions.retry')}
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <Link
            key={i}
            to={stat.to}
            className="surface-panel p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">
                  {loading && !stats ? '—' : stat.value}
                </p>
                {stat.subtext && (
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1.5">
                    {stat.subtext}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${stat.bgClass}`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Secondary Live Summary Bar */}
      {secondaryMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {secondaryMetrics.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="surface-panel px-4 py-3 flex flex-col justify-between hover:border-brand-violet/30 transition-colors"
            >
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
                {item.label}
              </span>
              <span className="text-lg font-display font-bold text-slate-900 dark:text-white mt-1">
                {item.value}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Overview Bar Chart */}
        <div className="surface-panel p-6">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">
            {t('overview')}
          </h3>
          <div className="h-64">
            {chartData ? (
              <Bar data={chartData} options={barOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                {t('loadingChart')}
              </div>
            )}
          </div>
        </div>

        {/* 6-Month Growth & Activity Trend */}
        <div className="surface-panel p-6">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">
            {t('trendsTitle')}
          </h3>
          <div className="h-64">
            {trendChartData ? (
              <Line data={trendChartData} options={lineOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                {t('loadingChart')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="surface-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">
            {t('recentActivity')}
          </h3>
          {isSuperAdmin && (
            <Link
              to="/admin/activity-logs"
              className="text-xs font-semibold text-brand-violet dark:text-brand-cyan hover:underline"
            >
              {t('viewAllLogs')}
            </Link>
          )}
        </div>
        <div className="space-y-4 max-h-72 overflow-y-auto scrollbar-thin">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-brand-violet/10 dark:bg-brand-cyan/10 flex items-center justify-center text-brand-violet dark:text-brand-cyan font-bold shrink-0">
                {activity.user?.name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activity.user?.name || t('system')}
                  </span>{' '}
                  {activity.description || `${activity.action} ${activity.subject_type || activity.target_type || ''}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {dayjs(activity.created_at).locale(currentLocale).fromNow()}
                </p>
              </div>
            </div>
          ))}
          {!recentActivity.length && !loading && (
            <p className="text-gray-400 text-sm">{t('noRecentActivity')}</p>
          )}
        </div>
      </div>

      {/* Storage Usage (superadmin only) */}
      {isSuperAdmin && (
        <div className="mt-8">
          <StorageStats />
        </div>
      )}
    </div>
  )
}

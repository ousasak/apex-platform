import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import Pagination from '@/components/common/Pagination'
import CustomSelect from '@/components/common/CustomSelect'

const ACTION_KEYS = {
  create: 'actions.create',
  update: 'actions.update',
  delete: 'actions.delete',
  created: 'actions.created',
  updated: 'actions.updated',
  deleted: 'actions.deleted',
  login: 'actions.login',
  logout: 'actions.logout',
}

const RESOURCE_KEYS = {
  user: 'resources.user',
  role: 'resources.role',
  permission: 'resources.permission',
  post: 'resources.post',
  blogpost: 'resources.blogpost',
  project: 'resources.project',
  document: 'resources.document',
  documentation: 'resources.documentation',
  category: 'resources.category',
  tag: 'resources.tag',
  application: 'resources.application',
  message: 'resources.message',
  setting: 'resources.setting',
  approvalrequest: 'resources.approvalrequest',
  comment: 'resources.comment',
  media: 'resources.media',
  page: 'resources.page',
  event: 'resources.event',
  team: 'resources.team',
  member: 'resources.member',
  partner: 'resources.partner',
  faq: 'resources.faq',
  announcement: 'resources.announcement',
  activitylog: 'resources.activitylog',
}

export default function ActivityLogsView() {
  const { t, i18n } = useTranslation('operations')
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [detailLog, setDetailLog] = useState(null)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const debounceTimer = useRef(null)

  function getActionLabel(action) {
    const key = ACTION_KEYS[action?.toLowerCase()]
    return key ? t(key) : action
  }

  function getResourceLabel(subjectType) {
    if (!subjectType) return ''
    const normalized = String(subjectType).split('\\').pop().replace(/[\s_-]+/g, '').toLowerCase()
    const key = RESOURCE_KEYS[normalized]
    return key ? t(key) : subjectType
  }

  const actionCounts = useMemo(() => {
    const counts = { created: 0, updated: 0, deleted: 0 }
    logs.forEach(l => {
      if (counts[l.action] !== undefined) counts[l.action]++
    })
    return counts
  }, [logs])

  const groupedByDate = useMemo(() => {
    const groups = {}
    logs.forEach(log => {
      const d = formatDateShort(log.created_at)
      if (!groups[d]) groups[d] = []
      groups[d].push(log)
    })
    return groups
  }, [logs, t, locale])

  function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function actionBadge(action) {
    const map = {
      created: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      updated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      deleted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      login: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      logout: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    }
    return map[action] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  function renderActionIcon(action) {
    switch (action) {
      case 'created':
        return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
      case 'updated':
        return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      case 'deleted':
        return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      case 'login':
        return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
      case 'logout':
        return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      default:
        return null
    }
  }

  function dotColor(action) {
    const map = { created: 'bg-green-500', updated: 'bg-blue-500', deleted: 'bg-red-500', login: 'bg-purple-500', logout: 'bg-gray-400' }
    return map[action] || 'bg-gray-400'
  }

  function timeAgo(date) {
    if (!date) return ''
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('logs.time.justNow')
    if (mins < 60) return t('logs.time.minutesAgo', { count: mins })
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t('logs.time.hoursAgo', { count: hours })
    const days = Math.floor(hours / 24)
    if (days < 30) return t('logs.time.daysAgo', { count: days })
    return t('logs.time.monthsAgo', { count: Math.floor(days / 30) })
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function formatDateShort(d) {
    if (!d) return t('common.unknown')
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return t('logs.time.today')
    if (date.toDateString() === yesterday.toDateString()) return t('logs.time.yesterday')
    return date.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  async function fetchLogs(page = 1, searchOverride = search) {
    setLoading(true)
    try {
      const params = { page: typeof page === 'number' ? page : 1 }
      if (searchOverride) params.search = searchOverride
      if (actionFilter) params.action = actionFilter
      const { data } = await adminApi.getActivityLogs(params)
      setLogs(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, total: 0 })
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [actionFilter])

  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchLogs(1, val)
    }, 300)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('logs.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('logs.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(meta.current_page)}
            className="p-2 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/10 dark:hover:bg-brand-cyan/10 transition-colors"
            title={t('common.refresh')}
            aria-label={t('common.refresh')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('logs.stats.totalLogs')}</p>
            <p className="text-lg font-bold dark:text-white">{meta.total || 0}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('actions.created')}</p>
            <p className="text-lg font-bold text-green-500">{actionCounts.created}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('actions.updated')}</p>
            <p className="text-lg font-bold text-blue-500">{actionCounts.updated}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('actions.deleted')}</p>
            <p className="text-lg font-bold text-red-500">{actionCounts.deleted}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card !p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              value={search}
              onChange={handleSearchChange}
              type="text"
              placeholder={t('logs.filters.searchPlaceholder')}
              className="input-field !pl-10 w-full"
            />
          </div>
          <CustomSelect
            value={actionFilter}
            options={[
              { label: t('logs.filters.allActions'), value: '' },
              { label: t('actions.created'), value: 'created' },
              { label: t('actions.updated'), value: 'updated' },
              { label: t('actions.deleted'), value: 'deleted' },
              { label: t('actions.login'), value: 'login' },
              { label: t('actions.logout'), value: 'logout' }
            ]}
            placeholder={t('logs.filters.allActions')}
            size="md"
            className="w-full md:w-44"
            onChange={val => setActionFilter(val)}
          />
          <div className="flex items-center border border-gray-200 dark:border-dark-600 rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              title={t('logs.views.table')}
              aria-label={t('logs.views.table')}
              className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              title={t('logs.views.timeline')}
              aria-label={t('logs.views.timeline')}
              className={`p-2 transition-colors ${viewMode === 'timeline' ? 'bg-brand-violet/10 text-brand-violet dark:bg-brand-cyan/10 dark:text-brand-cyan' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : viewMode === 'table' && logs.length > 0 ? (
        /* Table View */
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-600">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('logs.table.user')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('logs.table.action')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('logs.table.description')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('logs.table.target')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('logs.table.ipAddress')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('logs.table.time')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-600 flex-shrink-0">
                          {log.user?.avatar ? (
                            <img src={log.user.avatar} alt={log.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{getInitials(log.user?.name)}</div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{log.user?.name || t('logs.systemUser')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${actionBadge(log.action)}`}>
                        {renderActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[300px] truncate">{log.description}</td>
                    <td className="px-4 py-3">
                      {log.subject_type ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-dark-600 font-mono text-[10px]">{getResourceLabel(log.subject_type)}</span>
                          <span className="text-gray-400">#{log.subject_id}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.ip_address ? (
                        <span className="text-xs font-mono text-gray-400">{log.ip_address}</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{timeAgo(log.created_at)}</span>
                        <span className="text-[10px] text-gray-400">{formatDate(log.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDetailLog(log)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/10 dark:hover:bg-brand-cyan/10 transition-colors" title={t('logs.actions.viewDetails')} aria-label={t('logs.actions.viewDetails')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'timeline' && logs.length > 0 ? (
        /* Timeline View */
        <div className="space-y-0">
          {Object.entries(groupedByDate).map(([date, group]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date}</h3>
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-dark-700 rounded-full">
                  {group.length === 1
                    ? t('logs.timeline.eventCountSingular', { count: 1 })
                    : t('logs.timeline.eventCountPlural', { count: group.length })}
                </span>
              </div>
              <div className="ml-4 border-l-2 border-gray-200 dark:border-dark-600 pl-6 space-y-3">
                {group.map(log => (
                  <div
                    key={log.id}
                    className="glass-card !p-4 relative cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setDetailLog(log)}
                  >
                    <div className={`absolute -left-[31px] top-5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-800 ${dotColor(log.action)}`} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-600 flex-shrink-0 mt-0.5">
                          {log.user?.avatar ? (
                            <img src={log.user.avatar} alt={log.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">{getInitials(log.user?.name)}</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{log.user?.name || t('logs.systemUser')}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${actionBadge(log.action)}`}>{getActionLabel(log.action)}</span>
                            {log.subject_type && (
                              <span className="text-xs text-gray-400">
                                {getResourceLabel(log.subject_type)} <span className="font-mono">#{log.subject_id}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">{log.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">{timeAgo(log.created_at)}</span>
                        {log.ip_address && (
                          <span className="text-[10px] font-mono text-gray-400 mt-0.5">{log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('logs.empty.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{search || actionFilter ? t('logs.empty.filteredSubtitle') : t('logs.empty.defaultSubtitle')}</p>
          {(search || actionFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setActionFilter('')
                fetchLogs(1)
              }}
              className="mt-4 text-sm text-brand-violet dark:text-brand-cyan hover:underline"
            >
              {t('logs.actions.clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.last_page > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={page => fetchLogs(page)}
          />
        </div>
      )}

      {/* Detail Modal */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailLog(null)}>
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-dark-600 max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-bold text-gray-900 dark:text-white">{t('logs.modal.title')}</h3>
              <button onClick={() => setDetailLog(null)} title={t('common.close')} aria-label={t('common.close')} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-dark-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto space-y-5">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-600">
                  {detailLog.user?.avatar ? (
                    <img src={detailLog.user.avatar} alt={detailLog.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">{getInitials(detailLog.user?.name)}</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{detailLog.user?.name || t('logs.systemUser')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(detailLog.created_at)}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-full bg-gray-50 dark:bg-dark-700">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('logs.table.action')}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${actionBadge(detailLog.action)}`}>{getActionLabel(detailLog.action)}</span>
                </div>
                <div className="p-3 rounded-full bg-gray-50 dark:bg-dark-700">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('logs.table.target')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {detailLog.subject_type ? (
                      <span>{getResourceLabel(detailLog.subject_type)} <span className="font-mono text-gray-400">#{detailLog.subject_id}</span></span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-gray-50 dark:bg-dark-700">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('logs.table.ipAddress')}</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">{detailLog.ip_address || '—'}</p>
                </div>
                <div className="p-3 rounded-full bg-gray-50 dark:bg-dark-700">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('logs.table.time')}</p>
                  <p className="text-sm text-gray-900 dark:text-white">{timeAgo(detailLog.created_at)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-full bg-gray-50 dark:bg-dark-700">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{t('logs.table.description')}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{detailLog.description}</p>
              </div>

              {/* Properties / Changes */}
              {detailLog.properties && Object.keys(detailLog.properties).length > 0 && (
                <div className="p-3 rounded-full bg-gray-50 dark:bg-dark-700">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('logs.modal.changesData')}</p>
                  <div className="max-h-[200px] overflow-y-auto">
                    <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all">{JSON.stringify(detailLog.properties, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

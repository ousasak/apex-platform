import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import Pagination from '@/components/common/Pagination'
import CustomSelect from '@/components/common/CustomSelect'
import { TableEmpty } from '@/components/ui/empty'
import { Briefcase } from 'lucide-react'

const STATUS_KEYS = {
  pending: 'status.pending',
  reviewing: 'status.reviewing',
  reviewed: 'status.reviewed',
  accepted: 'status.accepted',
  approved: 'status.approved',
  rejected: 'status.rejected',
}

export default function ApplicationsView() {
  const { t, i18n } = useTranslation('operations')
  const { showToast } = useUi()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  function getStatusLabel(status) {
    const key = STATUS_KEYS[status]
    return key ? t(key) : status
  }

  const [applications, setApplications] = useState([])
  const [allApplications, setAllApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [selectedIds, setSelectedIds] = useState([])
  const [detailApp, setDetailApp] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  const countByStatus = (status) => allApplications.filter((a) => a.status === status).length

  const allSelected = useMemo(
    () => applications.length > 0 && selectedIds.length === applications.length,
    [applications, selectedIds]
  )

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : applications.map((a) => a.id))
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function fetchApplications(page = 1) {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = {
        page,
        search: search || undefined,
        status: statusFilter || undefined,
      }
      const { data } = await adminApi.getApplications(params)
      setApplications(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchAllForStats() {
    try {
      const { data } = await adminApi.getApplications({ per_page: 999 })
      setAllApplications(data.data || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchAllForStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  async function updateStatus(app, status, notes) {
    try {
      await adminApi.updateApplicationStatus(app.id, {
        status,
        admin_notes: notes || undefined,
      })
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status, admin_notes: notes } : a))
      )
      setAllApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status, admin_notes: notes } : a))
      )
      if (detailApp && detailApp.id === app.id) {
        setDetailApp({ ...detailApp, status, admin_notes: notes })
      }
      showToast(t('applications.toast.statusUpdated', { status: getStatusLabel(status) }))
    } catch {
      showToast(t('applications.toast.statusUpdateFailed'), 'error')
    }
  }

  async function bulkUpdateStatus(status) {
    for (const id of selectedIds) {
      const app = applications.find((a) => a.id === id)
      if (app) await updateStatus(app, status)
    }
    setSelectedIds([])
  }

  function parseSkills(skills) {
    if (!skills) return []
    if (Array.isArray(skills)) return skills
    return skills.split(',').map((s) => s.trim()).filter(Boolean)
  }

  function statusBadge(status) {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('applications.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('applications.subtitle')}
          </p>
        </div>
        <span className="text-xs text-gray-400">{t('applications.totalCount', { count: meta.total || 0 })}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setStatusFilter('')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            statusFilter === '' ? 'ring-2 ring-brand-violet dark:ring-brand-cyan' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('applications.stats.total')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{allApplications.length}</p>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            statusFilter === 'pending' ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.pending')}</p>
            <p className="text-lg font-bold text-yellow-500">{countByStatus('pending')}</p>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('accepted')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            statusFilter === 'accepted' ? 'ring-2 ring-green-400' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.accepted')}</p>
            <p className="text-lg font-bold text-green-500">{countByStatus('accepted')}</p>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('rejected')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            statusFilter === 'rejected' ? 'ring-2 ring-red-400' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.rejected')}</p>
            <p className="text-lg font-bold text-red-500">{countByStatus('rejected')}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="surface-panel !p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('applications.filters.searchPlaceholder')}
              className="input-field pl-10 text-sm w-full"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { label: t('applications.filters.allStatus'), value: '' },
              { label: t('status.pending'), value: 'pending' },
              { label: t('status.reviewing'), value: 'reviewing' },
              { label: t('status.accepted'), value: 'accepted' },
              { label: t('status.rejected'), value: 'rejected' },
            ]}
            placeholder={t('applications.filters.allStatus')}
          />

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkUpdateStatus('accepted')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20"
              >
                {t('applications.actions.acceptAll')}
              </button>
              <button
                onClick={() => bulkUpdateStatus('rejected')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
              >
                {t('applications.actions.rejectAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table View */}
      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label={t('applications.table.selectAll')}
                    className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                  />
                </th>
                <th className="p-4">{t('applications.table.applicant')}</th>
                <th className="p-4 hidden md:table-cell">{t('applications.table.role')}</th>
                <th className="p-4 hidden lg:table-cell">{t('applications.table.skills')}</th>
                <th className="p-4 text-center">{t('applications.table.status')}</th>
                <th className="p-4 hidden xl:table-cell">{t('applications.table.applied')}</th>
                <th className="p-4 text-right">{t('applications.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    {t('applications.loading')}
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <TableEmpty colSpan={7} icon={Briefcase} title={t('applications.empty')} />
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        aria-label={t('applications.table.selectRow', { name: app.name || '' })}
                        className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {app.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{app.name}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet dark:text-brand-cyan">
                        {app.role_applied}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {parseSkills(app.skills).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 hidden xl:table-cell">
                      {new Date(app.created_at).toLocaleDateString(locale)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailApp(app)
                            setAdminNotes(app.admin_notes || '')
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-white/5 hover:bg-brand-violet/10 hover:text-brand-violet transition-colors"
                        >
                          {t('common.view')}
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => updateStatus(app, 'accepted')}
                              className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-colors"
                              title={t('applications.actions.accept')}
                              aria-label={t('applications.actions.accept')}
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(app, 'rejected')}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                              title={t('applications.actions.reject')}
                              aria-label={t('applications.actions.reject')}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={(p) => fetchApplications(p)}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                  {detailApp.name}
                </h3>
                <p className="text-xs text-gray-500">{detailApp.email}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge(detailApp.status)}`}>
                {getStatusLabel(detailApp.status)}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">{t('applications.modal.roleApplied')}</p>
                <p className="text-gray-900 dark:text-white font-medium">{detailApp.role_applied}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">{t('applications.modal.skills')}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parseSkills(detailApp.skills).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {detailApp.motivation && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">{t('applications.modal.motivation')}</p>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl mt-1 leading-relaxed text-xs">
                    {detailApp.motivation}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3 pt-2">
                {detailApp.github_url && (
                  <a
                    href={detailApp.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-violet dark:text-brand-cyan hover:underline"
                  >
                    {t('applications.modal.github')} →
                  </a>
                )}
                {detailApp.linkedin_url && (
                  <a
                    href={detailApp.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-violet dark:text-brand-cyan hover:underline"
                  >
                    {t('applications.modal.linkedin')} →
                  </a>
                )}
                {detailApp.portfolio_url && (
                  <a
                    href={detailApp.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-violet dark:text-brand-cyan hover:underline"
                  >
                    {t('applications.modal.portfolio')} →
                  </a>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{t('applications.modal.adminNotes')}</p>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={t('applications.modal.adminNotesPlaceholder')}
                  className="input-field text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setDetailApp(null)}
                className="btn-secondary text-xs"
              >
                {t('common.close')}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateStatus(detailApp, 'reviewing', adminNotes)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                >
                  {t('status.reviewing')}
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(detailApp, 'rejected', adminNotes)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  {t('applications.actions.reject')}
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(detailApp, 'accepted', adminNotes)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 hover:bg-green-500/20"
                >
                  {t('applications.actions.accept')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

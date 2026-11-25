import React, { useState, useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'

const STATUS_KEYS = {
  pending: 'status.pending',
  approved: 'status.approved',
  rejected: 'status.rejected',
  reviewed: 'status.reviewed',
  reviewing: 'status.reviewing',
  accepted: 'status.accepted',
}

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

export default function ApprovalRequestsView() {
  const { t, i18n } = useTranslation('operations')
  const { showToast } = useUi()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  function getStatusLabel(status) {
    const key = STATUS_KEYS[status?.toLowerCase()]
    return key ? t(key) : status
  }

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

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 20, total: 0 })
  const [pendingCount, setPendingCount] = useState(0)

  const [approveModal, setApproveModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [selectedReq, setSelectedReq] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [noteError, setNoteError] = useState('')

  const tabs = [
    { label: t('status.pending'), value: 'pending' },
    { label: t('approvals.tabs.all'), value: 'all' },
  ]

  function actionStyle(action) {
    if (action === 'create') return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
    if (action === 'update') return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' }
    return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  async function fetchRequests(pageNum = page, tabVal = activeTab) {
    setLoading(true)
    try {
      const { data } = await adminApi.getApprovalRequests({ status: tabVal, page: pageNum })
      setRequests(data.data || [])
      if (data.meta) {
        setMeta(data.meta)
        if (tabVal === 'pending') {
          setPendingCount(data.meta.total || 0)
        }
      }
    } catch {
      showToast(t('approvals.toast.loadFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchPendingCount() {
    try {
      const { data } = await adminApi.getApprovalRequests({ status: 'pending' })
      setPendingCount(data.meta?.total || 0)
    } catch {}
  }

  useEffect(() => {
    fetchRequests(1, activeTab)
    if (activeTab !== 'pending') {
      fetchPendingCount()
    }
  }, [activeTab])

  function openApprove(req) {
    setSelectedReq(req)
    setReviewNote('')
    setApproveModal(true)
  }

  function openReject(req) {
    setSelectedReq(req)
    setReviewNote('')
    setNoteError('')
    setRejectModal(true)
  }

  async function confirmApprove() {
    if (!selectedReq) return
    setProcessing(selectedReq.id)
    try {
      await adminApi.approveRequest(selectedReq.id, { note: reviewNote })
      showToast(t('approvals.toast.approved'))
      setApproveModal(false)
      await fetchRequests(page, activeTab)
      await fetchPendingCount()
    } catch (err) {
      showToast(err.response?.data?.message || t('approvals.toast.approveFailed'), 'error')
    } finally {
      setProcessing(null)
    }
  }

  async function confirmReject() {
    if (!selectedReq) return
    if (!reviewNote.trim()) {
      setNoteError(t('approvals.modal.rejectReasonRequired'))
      return
    }
    setNoteError('')
    setProcessing(selectedReq.id)
    try {
      await adminApi.rejectRequest(selectedReq.id, { note: reviewNote })
      showToast(t('approvals.toast.rejected'))
      setRejectModal(false)
      await fetchRequests(page, activeTab)
      await fetchPendingCount()
    } catch (err) {
      showToast(err.response?.data?.message || t('approvals.toast.rejectFailed'), 'error')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('approvals.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('approvals.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t('approvals.pendingBadge', { count: pendingCount })}
            </span>
          )}
          <button
            onClick={() => fetchRequests(page, activeTab)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card !p-1 flex gap-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value)
              setPage(1)
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
 activeTab === tab.value
 ? 'bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan shadow-sm'
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
 }`}
          >
            {tab.label}
            {tab.value === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : !requests.length ? (
        /* Empty State */
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {activeTab === 'pending' ? t('approvals.empty.pendingTitle') : t('approvals.empty.allTitle')}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {activeTab === 'pending' ? t('approvals.empty.pendingSubtitle') : t('approvals.empty.allSubtitle')}
          </p>
        </div>
      ) : (
        /* Requests List */
        <div className="space-y-3">
          {requests.map(req => {
            const style = actionStyle(req.action)
            return (
              <div
                key={req.id}
                className="glass-card !p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Action badge + Subject */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}>
                    <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {req.action === 'create' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                      ) : req.action === 'update' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      )}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.badge}`}>
                        {getActionLabel(req.action)}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{getResourceLabel(req.subject_type)}</span>
                      {(req.subject_title || req.subject_label) && (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          "{req.subject_title || req.subject_label}"
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{t('common.by')}</span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{req.requester?.name || t('common.unknown')}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(req.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => openApprove(req)}
                        disabled={processing === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800/40 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        {t('approvals.actions.approve')}
                      </button>
                      <button
                        onClick={() => openReject(req)}
                        disabled={processing === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/40 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        {t('approvals.actions.reject')}
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {req.status === 'approved' ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        )}
                        {getStatusLabel(req.status)}
                      </span>
                      {req.reviewer && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">{t('approvals.byReviewer', { name: req.reviewer.name })}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={meta.current_page === 1}
            onClick={() => {
              const newP = page - 1
              setPage(newP)
              fetchRequests(newP, activeTab)
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← {t('common.prev')}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{meta.current_page} / {meta.last_page}</span>
          <button
            disabled={meta.current_page === meta.last_page}
            onClick={() => {
              const newP = page + 1
              setPage(newP)
              fetchRequests(newP, activeTab)
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.next')} →
          </button>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setApproveModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('approvals.modal.approveTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvals.modal.approveSubtitle')}</p>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-full bg-gray-50 dark:bg-dark-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <Trans
                  t={t}
                  i18nKey={(selectedReq?.subject_title || selectedReq?.subject_label) ? 'approvals.modal.summaryWithLabel' : 'approvals.modal.summaryWithoutLabel'}
                  values={{
                    action: getActionLabel(selectedReq?.action),
                    subject: getResourceLabel(selectedReq?.subject_type),
                    label: selectedReq?.subject_title || selectedReq?.subject_label || '',
                    requester: selectedReq?.requester?.name || t('common.unknown'),
                  }}
                  components={{
                    action: <span className="font-semibold" />,
                    subject: <span className="font-semibold" />,
                    requester: <span className="font-semibold" />,
                  }}
                />
              </p>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('approvals.modal.noteOptional')}</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                rows="2"
                className="input-field resize-none"
                placeholder={t('approvals.modal.notePlaceholder')}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setApproveModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">{t('common.cancel')}</button>
              <button onClick={confirmApprove} disabled={processing} className="btn-primary text-sm flex items-center gap-2">
                {processing && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                )}
                {processing ? t('approvals.actions.approving') : t('approvals.actions.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setRejectModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('approvals.modal.rejectTitle')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('approvals.modal.rejectSubtitle')}</p>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-full bg-gray-50 dark:bg-dark-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <Trans
                  t={t}
                  i18nKey={(selectedReq?.subject_title || selectedReq?.subject_label) ? 'approvals.modal.summaryWithLabel' : 'approvals.modal.summaryWithoutLabel'}
                  values={{
                    action: getActionLabel(selectedReq?.action),
                    subject: getResourceLabel(selectedReq?.subject_type),
                    label: selectedReq?.subject_title || selectedReq?.subject_label || '',
                    requester: selectedReq?.requester?.name || t('common.unknown'),
                  }}
                  components={{
                    action: <span className="font-semibold" />,
                    subject: <span className="font-semibold" />,
                    requester: <span className="font-semibold" />,
                  }}
                />
              </p>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('approvals.modal.rejectReason')} <span className="text-red-500">*</span></label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                rows="2"
                className="input-field resize-none"
                placeholder={t('approvals.modal.rejectReasonPlaceholder')}
              />
              {noteError && <p className="text-xs text-red-500 mt-1">{noteError}</p>}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">{t('common.cancel')}</button>
              <button onClick={confirmReject} disabled={processing} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
                {processing && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                )}
                {processing ? t('approvals.actions.rejecting') : t('approvals.actions.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

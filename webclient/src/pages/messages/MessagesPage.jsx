import React, { useState, useEffect, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import Pagination from '@/components/common/Pagination'
import CustomSelect from '@/components/common/CustomSelect'
import { TableEmpty } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Mail } from 'lucide-react'

export default function MessagesView() {
  const { t, i18n } = useTranslation('operations')
  const { showToast } = useUi()
  const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  const [messages, setMessages] = useState([])
  const [allMessages, setAllMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const unreadCount = useMemo(() => allMessages.filter((m) => !m.is_read).length, [allMessages])
  const readCount = useMemo(() => allMessages.filter((m) => m.is_read).length, [allMessages])

  const allSelected = useMemo(
    () => messages.length > 0 && selectedIds.length === messages.length,
    [messages, selectedIds]
  )

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : messages.map((m) => m.id))
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function fetchMessages(page = 1) {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = {
        page,
        search: search || undefined,
      }
      if (readFilter === 'unread') params.is_read = false
      else if (readFilter === 'read') params.is_read = true

      const { data } = await adminApi.getMessages(params)
      setMessages(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })
    } catch {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchAllForStats() {
    try {
      const { data } = await adminApi.getMessages({ per_page: 999 })
      setAllMessages(data.data || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchAllForStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, readFilter])

  async function markAsRead(msg) {
    if (msg.is_read) return
    try {
      await adminApi.markMessageRead(msg.id)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      )
      setAllMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
      )
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, is_read: true })
      }
    } catch {
      // ignore
    }
  }

  async function bulkMarkRead() {
    try {
      await Promise.all(selectedIds.map((id) => adminApi.markMessageRead(id)))
      showToast(t('messages.toast.markedRead'))
      setSelectedIds([])
      fetchMessages(meta.current_page)
      fetchAllForStats()
    } catch {
      showToast(t('messages.toast.markReadFailed'), 'error')
    }
  }

  async function bulkDelete() {
    if (!window.confirm(t('messages.confirm.bulkDelete', { count: selectedIds.length }))) return
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteMessage(id)))
      showToast(t('messages.toast.bulkDeleted', { count: selectedIds.length }))
      setSelectedIds([])
      fetchMessages(meta.current_page)
      fetchAllForStats()
    } catch {
      showToast(t('messages.toast.bulkDeleteFailed'), 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteMessage(deleteTarget.id)
      showToast(t('messages.toast.deleted'))
      setDeleteTarget(null)
      if (selectedMessage && selectedMessage.id === deleteTarget.id) {
        setSelectedMessage(null)
      }
      fetchMessages(meta.current_page)
      fetchAllForStats()
    } catch {
      showToast(t('messages.toast.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  function openMessage(msg) {
    setSelectedMessage(msg)
    markAsRead(msg)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('messages.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('messages.subtitle')}
          </p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={bulkMarkRead}
              className="btn-secondary text-xs"
            >
              {t('messages.actions.markReadCount', { count: selectedIds.length })}
            </button>
            <button
              onClick={bulkDelete}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20"
            >
              {t('messages.actions.deleteCount', { count: selectedIds.length })}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() => setReadFilter('')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            readFilter === '' ? 'ring-2 ring-brand-violet dark:ring-brand-cyan' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('messages.stats.total')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{allMessages.length}</p>
          </div>
        </div>

        <div
          onClick={() => setReadFilter('unread')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            readFilter === 'unread' ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center relative">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-dark-800" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.unread')}</p>
            <p className="text-lg font-bold text-blue-500">{unreadCount}</p>
          </div>
        </div>

        <div
          onClick={() => setReadFilter('read')}
          className={`surface-panel !p-4 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] ${
            readFilter === 'read' ? 'ring-2 ring-green-400' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.read')}</p>
            <p className="text-lg font-bold text-green-500">{readCount}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
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
              placeholder={t('messages.filters.searchPlaceholder')}
              className="input-field pl-10 text-sm w-full"
            />
          </div>

          <CustomSelect
            value={readFilter}
            onChange={(val) => setReadFilter(val)}
            options={[
              { label: t('messages.filters.allMessages'), value: '' },
              { label: t('messages.filters.unreadOnly'), value: 'unread' },
              { label: t('messages.filters.readOnly'), value: 'read' },
            ]}
            placeholder={t('messages.filters.allMessages')}
          />
        </div>
      </div>

      {/* Messages List */}
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
                    aria-label={t('messages.table.selectAll')}
                    className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                  />
                </th>
                <th className="p-4">{t('messages.table.sender')}</th>
                <th className="p-4">{t('messages.table.subject')}</th>
                <th className="p-4 hidden md:table-cell">{t('messages.table.date')}</th>
                <th className="p-4 text-right">{t('messages.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    {t('messages.loading')}
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <TableEmpty colSpan={5} icon={Mail} title={t('messages.empty')} />
              ) : (
                messages.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                      !m.is_read ? 'bg-brand-violet/5 dark:bg-white/[0.02] font-semibold' : ''
                    }`}
                    onClick={() => openMessage(m)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        aria-label={t('messages.table.selectRow', { name: m.name || '' })}
                        className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {m.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white">{m.name}</p>
                          <p className="text-xs text-gray-500 font-normal">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 dark:text-white">{m.subject}</p>
                      <p className="text-xs text-gray-500 font-normal truncate max-w-sm">
                        {m.message}
                      </p>
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-normal hidden md:table-cell">
                      {new Date(m.created_at).toLocaleDateString(locale)}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
              onPageChange={(p) => fetchMessages(p)}
            />
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                  {selectedMessage.subject}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('messages.modal.fromLabel')} <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                </p>
                <p className="text-[11px] text-gray-400">
                  {new Date(selectedMessage.created_at).toLocaleString(locale)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                title={t('common.close')}
                aria-label={t('common.close')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {selectedMessage.message}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="btn-primary text-xs inline-flex items-center gap-1.5"
              >
                {t('messages.actions.replyViaEmail')}
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedMessage)}
                  className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  {t('common.delete')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="btn-secondary text-xs"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t('messages.deleteModal.title')}
        description={
          deleteTarget ? (
            <Trans
              t={t}
              i18nKey="messages.deleteModal.confirm"
              values={{ name: deleteTarget.name }}
              components={{ strong: <strong /> }}
            />
          ) : null
        }
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        loadingLabel={t('common.deleting')}
      />
    </div>
  )
}

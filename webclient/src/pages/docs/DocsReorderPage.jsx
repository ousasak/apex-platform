import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import BackButton from '@/components/ui/back-button'

function DocRow({ doc, idx, total, onMove }) {
  const { t } = useTranslation('docs')
  const status = doc.status ?? 'draft'
  const statusLabel = status === 'published' ? t('status.published') : status === 'draft' ? t('status.draft') : status

  return (
    <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors select-none">
      {/* Up/Down */}
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => onMove(-1)}
          title={t('reorder.moveUp')}
          aria-label={t('reorder.moveUp')}
          className="p-0.5 rounded text-gray-400 hover:text-green-500 hover:bg-green-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"/></svg>
        </button>
        <button
          type="button"
          disabled={idx >= total - 1}
          onClick={() => onMove(1)}
          title={t('reorder.moveDown')}
          aria-label={t('reorder.moveDown')}
          className="p-0.5 rounded text-gray-400 hover:text-green-500 hover:bg-green-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>

      {/* Doc icon */}
      <svg className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>

      {/* Info */}
      <div className="flex-1 min-w-0 pl-0.5">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{doc.title}</p>
        <p className="text-xs text-gray-400 font-mono truncate">{doc.slug}</p>
      </div>

      {/* Status badge */}
      <span
        className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
          doc.status === 'published'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }`}
      >
        {statusLabel}
      </span>

      {/* Position */}
      <span className="shrink-0 text-xs font-mono text-gray-300 dark:text-gray-600 w-4 text-right">{idx + 1}</span>
    </div>
  )
}

export default function DocsReorderView() {
  const { t, i18n } = useTranslation('docs')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mainMenus, setMainMenus] = useState([])
  const [unassigned, setUnassigned] = useState([])
  const [originalSnapshot, setOriginalSnapshot] = useState('')
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })
  const toastTimer = useRef(null)

  function showToast(type, message) {
    clearTimeout(toastTimer.current)
    setToast({ show: true, type, message })
    toastTimer.current = setTimeout(() => {
      setToast({ show: false, type: 'success', message: '' })
    }, 3000)
  }

  function buildSnapshot(mms = mainMenus, unass = unassigned) {
    return JSON.stringify({
      menus: mms.map(mm => ({
        id: mm.id,
        subs: (mm.subMenus || []).map(sm => ({ id: sm.id, docs: (sm.docs || []).map(d => d.id) })),
        docs: (mm.docs || []).map(d => d.id),
      })),
      unassigned: unass.map(d => d.id),
    })
  }

  const isDirty = useMemo(() => {
    return buildSnapshot(mainMenus, unassigned) !== originalSnapshot
  }, [mainMenus, unassigned, originalSnapshot])

  async function loadData() {
    setLoading(true)
    try {
      const [menusRes, docsRes] = await Promise.all([
        adminApi.getDocMenus(),
        adminApi.getAllDocs(),
      ])

      const rawMenus = menusRes.data.data || []
      const rawDocs = docsRes.data.data || []

      const docsByMenu = {}
      for (const doc of rawDocs) {
        const key = doc.doc_menu_id ?? '__unassigned__'
        if (!docsByMenu[key]) docsByMenu[key] = []
        docsByMenu[key].push(doc)
      }

      for (const key of Object.keys(docsByMenu)) {
        docsByMenu[key].sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0))
      }

      const mms = rawMenus.map(mm => ({
        id: mm.id,
        name: mm.name,
        slug: mm.slug,
        order_num: mm.order_num,
        subMenus: (mm.children || []).map(sm => ({
          id: sm.id,
          name: sm.name,
          slug: sm.slug,
          order_num: sm.order_num,
          parent_id: mm.id,
          docs: docsByMenu[sm.id] || [],
        })),
        docs: docsByMenu[mm.id] || [],
      }))

      const unass = docsByMenu['__unassigned__'] || []

      setMainMenus(mms)
      setUnassigned(unass)
      setOriginalSnapshot(buildSnapshot(mms, unass))
    } catch {
      showToast('error', t('reorder.toast.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function moveItem(arr, idx, dir) {
    const next = idx + dir
    if (next < 0 || next >= arr.length) return
    const newArr = [...arr]
    const temp = newArr[idx]
    newArr[idx] = newArr[next]
    newArr[next] = temp
    return newArr
  }

  function handleMoveMainMenu(mmIdx, dir) {
    const next = mmIdx + dir
    if (next < 0 || next >= mainMenus.length) return
    setMainMenus(prev => moveItem(prev, mmIdx, dir))
  }

  function handleMoveSubMenu(mmIdx, smIdx, dir) {
    setMainMenus(prev => {
      const copy = [...prev]
      const mm = { ...copy[mmIdx] }
      mm.subMenus = moveItem(mm.subMenus, smIdx, dir)
      copy[mmIdx] = mm
      return copy
    })
  }

  function handleMoveDocUnderSubMenu(mmIdx, smIdx, docIdx, dir) {
    setMainMenus(prev => {
      const copy = [...prev]
      const mm = { ...copy[mmIdx] }
      const subMenus = [...mm.subMenus]
      const sm = { ...subMenus[smIdx] }
      sm.docs = moveItem(sm.docs, docIdx, dir)
      subMenus[smIdx] = sm
      mm.subMenus = subMenus
      copy[mmIdx] = mm
      return copy
    })
  }

  function handleMoveDirectDoc(mmIdx, docIdx, dir) {
    setMainMenus(prev => {
      const copy = [...prev]
      const mm = { ...copy[mmIdx] }
      mm.docs = moveItem(mm.docs, docIdx, dir)
      copy[mmIdx] = mm
      return copy
    })
  }

  function handleMoveUnassigned(docIdx, dir) {
    setUnassigned(prev => moveItem(prev, docIdx, dir))
  }

  async function saveOrder() {
    setSaving(true)
    try {
      const menuItems = []
      mainMenus.forEach((mm, mmIdx) => {
        menuItems.push({ id: mm.id, order_num: mmIdx, parent_id: null })
        ;(mm.subMenus || []).forEach((sm, smIdx) => {
          menuItems.push({ id: sm.id, order_num: smIdx, parent_id: mm.id })
        })
      })

      const docItems = []
      mainMenus.forEach(mm => {
        (mm.docs || []).forEach((d, idx) => {
          docItems.push({ id: d.id, order_num: idx, doc_menu_id: mm.id })
        })
        ;(mm.subMenus || []).forEach(sm => {
          (sm.docs || []).forEach((d, idx) => {
            docItems.push({ id: d.id, order_num: idx, doc_menu_id: sm.id })
          })
        })
      })
      unassigned.forEach((d, idx) => {
        docItems.push({ id: d.id, order_num: idx, doc_menu_id: null })
      })

      await Promise.all([
        menuItems.length ? adminApi.reorderDocMenus({ items: menuItems }) : Promise.resolve(),
        docItems.length ? adminApi.reorderDocs({ items: docItems }) : Promise.resolve(),
      ])

      setOriginalSnapshot(buildSnapshot(mainMenus, unassigned))
      showToast('success', t('reorder.toast.saved'))
    } catch {
      showToast('error', t('reorder.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('reorder.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('reorder.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BackButton to="/admin/docs" label={t('reorder.backToDocs')} />
          <button
            onClick={saveOrder}
            disabled={saving || loading || !isDirty}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            )}
            {saving ? t('common.saving') : t('reorder.saveOrder')}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl text-sm font-medium pointer-events-none transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : !mainMenus.length && !unassigned.length ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400">{t('reorder.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Menus */}
          {mainMenus.map((mm, mmIdx) => (
            <div key={mm.id} className="rounded-2xl border border-brand-violet/30 bg-white dark:bg-dark-800/60 overflow-hidden shadow-sm">
              {/* Main Menu Header */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-brand-violet/10 select-none border-b border-brand-violet/20">
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveMainMenu(mmIdx, -1)}
                    disabled={mmIdx === 0}
                    title={t('reorder.moveUp')}
                    aria-label={t('reorder.moveUp')}
                    className="p-0.5 rounded text-brand-violet/50 hover:text-brand-violet hover:bg-brand-violet/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveMainMenu(mmIdx, 1)}
                    disabled={mmIdx === mainMenus.length - 1}
                    title={t('reorder.moveDown')}
                    aria-label={t('reorder.moveDown')}
                    className="p-0.5 rounded text-brand-violet/50 hover:text-brand-violet hover:bg-brand-violet/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-violet/20 text-brand-violet">{t('reorder.badges.main')}</span>
                <span className="font-semibold text-sm text-gray-800 dark:text-white flex-1 truncate">{mm.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {t('reorder.counts.mainSummary', { subCount: (mm.subMenus || []).length, directCount: (mm.docs || []).length })}
                </span>
                <span className="shrink-0 text-xs font-mono text-gray-300 dark:text-gray-600 w-5 text-right">{mmIdx + 1}</span>
              </div>

              <div className="p-2 space-y-2">
                {/* Sub-Menus */}
                {(mm.subMenus || []).map((sm, smIdx) => (
                  <div key={sm.id} className="rounded-xl border border-brand-cyan/20 bg-white dark:bg-dark-700/40 overflow-hidden">
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-brand-cyan/5 select-none border-b border-brand-cyan/10">
                      <div className="flex flex-col shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveSubMenu(mmIdx, smIdx, -1)}
                          disabled={smIdx === 0}
                          title={t('reorder.moveUp')}
                          aria-label={t('reorder.moveUp')}
                          className="p-0.5 rounded text-brand-cyan/50 hover:text-brand-cyan hover:bg-brand-cyan/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSubMenu(mmIdx, smIdx, 1)}
                          disabled={smIdx === mm.subMenus.length - 1}
                          title={t('reorder.moveDown')}
                          aria-label={t('reorder.moveDown')}
                          className="p-0.5 rounded text-brand-cyan/50 hover:text-brand-cyan hover:bg-brand-cyan/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan">{t('reorder.badges.sub')}</span>
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{sm.name}</span>
                      <span className="shrink-0 text-xs text-gray-400">{t('reorder.counts.pages', { count: (sm.docs || []).length })}</span>
                      <span className="shrink-0 text-xs font-mono text-gray-300 dark:text-gray-600 w-5 text-right">{smIdx + 1}</span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-dark-600 min-h-[2rem]">
                      {(sm.docs || []).map((doc, docIdx) => (
                        <DocRow
                          key={doc.id}
                          doc={doc}
                          idx={docIdx}
                          total={sm.docs.length}
                          onMove={dir => handleMoveDocUnderSubMenu(mmIdx, smIdx, docIdx, dir)}
                        />
                      ))}
                      {(!sm.docs || sm.docs.length === 0) && (
                        <div className="px-4 py-3 text-center text-xs text-gray-400 italic">{t('reorder.emptySubMenu')}</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Docs directly under this Main Menu */}
                <div className="rounded-xl border border-gray-200 dark:border-dark-600 overflow-hidden">
                  <div className="px-2.5 py-1.5 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-dark-600">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('reorder.directPages')}</span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-dark-600 min-h-[2rem]">
                    {(mm.docs || []).map((doc, docIdx) => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        idx={docIdx}
                        total={mm.docs.length}
                        onMove={dir => handleMoveDirectDoc(mmIdx, docIdx, dir)}
                      />
                    ))}
                    {(!mm.docs || mm.docs.length === 0) && (
                      <div className="px-4 py-3 text-center text-xs text-gray-400 italic">{t('reorder.emptyDirectPages')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Unassigned Docs */}
          {unassigned.length > 0 && (
            <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-white dark:bg-dark-800/40 overflow-hidden shadow-sm">
              <div className="px-3 py-2.5 bg-yellow-400/10 border-b border-yellow-400/20 select-none">
                <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{t('reorder.unassigned.title')}</span>
                <span className="ml-2 text-xs text-gray-400">{t('reorder.unassigned.subtitle')}</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-dark-600 min-h-[2rem]">
                {unassigned.map((doc, docIdx) => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    idx={docIdx}
                    total={unassigned.length}
                    onMove={dir => handleMoveUnassigned(docIdx, dir)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

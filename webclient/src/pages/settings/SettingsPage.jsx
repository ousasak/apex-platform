import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'

export default function SettingsView() {
  const { t, i18n } = useTranslation('management')
  const { showToast } = useUi()
  const [groupedSettings, setGroupedSettings] = useState({})
  const [originalValues, setOriginalValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeGroup, setActiveGroup] = useState('')

  const groupNames = useMemo(() => Object.keys(groupedSettings), [groupedSettings])

  function formatLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  function getGroupLabel(group) {
    const key = `settings.groups.${group}.label`
    return i18n.exists(key, { ns: 'management' }) ? t(key) : formatLabel(group)
  }

  function getFieldLabel(key) {
    const labelKey = `settings.fields.${key}`
    return i18n.exists(labelKey, { ns: 'management' }) ? t(labelKey) : formatLabel(key)
  }

  function groupStyle(group) {
    const styles = {
      general: { bg: 'bg-brand-violet/10 dark:bg-brand-violet/20', text: 'text-brand-violet' },
      social: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      seo: { bg: 'bg-green-500/10', text: 'text-green-500' },
      permissions: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
      storage: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    }
    return styles[group] || { bg: 'bg-gray-100 dark:bg-dark-700', text: 'text-gray-500' }
  }

  function groupDescription(group) {
    const key = `settings.groups.${group}.description`
    return i18n.exists(key, { ns: 'management' }) ? t(key) : t('settings.groups.defaultDescription')
  }

  function fieldHint(key) {
    const hintKey = `settings.hints.${key}`
    return i18n.exists(hintKey, { ns: 'management' }) ? t(hintKey) : ''
  }

  function isUrlField(key) {
    return key.includes('_url') || key.includes('_link')
  }

  function isEmailField(key) {
    return key.includes('email')
  }

  function isTextareaField(key) {
    return key.includes('description') || key.includes('about') || key.includes('bio')
  }

  function isBoolTrue(val) {
    return val === true || val === 1 || val === '1' || val === 'true'
  }

  function handleFieldChange(group, key, newValue) {
    setGroupedSettings(prev => ({
      ...prev,
      [group]: prev[group].map(s => s.key === key ? { ...s, value: newValue } : s)
    }))
    setHasChanges(true)
  }

  function toggleBoolean(group, setting) {
    const newVal = isBoolTrue(setting.value) ? '0' : '1'
    handleFieldChange(group, setting.key, newVal)
  }

  function resetChanges() {
    setGroupedSettings(prev => {
      const updated = { ...prev }
      for (const group of Object.keys(updated)) {
        updated[group] = updated[group].map(s => ({
          ...s,
          value: originalValues[s.key] ?? s.value
        }))
      }
      return updated
    })
    setHasChanges(false)
  }

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await adminApi.getSettings()
        const fetched = data.data || {}
        setGroupedSettings(fetched)
        const orig = {}
        for (const group of Object.keys(fetched)) {
          for (const s of fetched[group]) {
            orig[s.key] = s.value
          }
        }
        setOriginalValues(orig)
        const groups = Object.keys(fetched)
        if (groups.length) setActiveGroup(groups[0])
      } catch {
        // error
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    const settings = {}
    Object.values(groupedSettings).flat().forEach(s => {
      settings[s.key] = s.value
    })

    try {
      await adminApi.updateSettings({ settings })
      setOriginalValues({ ...settings })
      setHasChanges(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      showToast(t('settings.toasts.saveSuccess'))
    } catch {
      showToast(t('settings.toasts.saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('settings.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t('settings.unsavedChanges')}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            )}
            {saving ? t('common.saving') : t('settings.actions.saveChanges')}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : (
        /* Settings Sections */
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="glass-card !p-1 flex gap-1 overflow-x-auto">
            {groupNames.map(group => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
 activeGroup === group
 ? 'bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan shadow-sm'
 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
 }`}
              >
                <div className="flex items-center gap-2">
                  {group === 'general' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  ) : group === 'social' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  ) : group === 'seo' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  ) : group === 'storage' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                  )}
                  <span>{getGroupLabel(group)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Group Settings */}
          {groupNames.map(group => {
            if (activeGroup !== group) return null
            const style = groupStyle(group)
            return (
              <div key={group} className="glass-card">
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-dark-600">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bg}`}>
                    {group === 'general' ? (
                      <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    ) : group === 'social' ? (
                      <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    ) : group === 'seo' ? (
                      <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    ) : group === 'storage' ? (
                      <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
                    ) : (
                      <svg className={`w-5 h-5 ${style.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings.sectionTitle', { group: getGroupLabel(group) })}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{groupDescription(group)}</p>
                  </div>
                </div>

                {/* Settings Fields */}
                <div className="space-y-5">
                  {(groupedSettings[group] || []).map(setting => (
                    <div key={setting.key} className="group/field">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {getFieldLabel(setting.key)}
                        {fieldHint(setting.key) && (
                          <span className="text-xs font-normal text-gray-400">{fieldHint(setting.key)}</span>
                        )}
                      </label>

                      {/* Boolean Toggle */}
                      {setting.type === 'boolean' ? (
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => toggleBoolean(group, setting)}
                            aria-label={getFieldLabel(setting.key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isBoolTrue(setting.value) ? 'bg-brand-violet dark:bg-brand-cyan' : 'bg-gray-300 dark:bg-dark-500'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isBoolTrue(setting.value) ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-sm ${isBoolTrue(setting.value) ? 'text-brand-violet dark:text-brand-cyan font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                            {isBoolTrue(setting.value) ? t('settings.status.enabled') : t('settings.status.disabled')}
                          </span>
                        </div>
                      ) : isUrlField(setting.key) ? (
                        /* URL Fields */
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                          </div>
                          <input
                            type="url"
                            value={setting.value || ''}
                            onChange={e => handleFieldChange(group, setting.key, e.target.value)}
                            className="input-field !pl-10 font-mono text-sm"
                            placeholder={t('settings.placeholders.url')}
                          />
                        </div>
                      ) : isEmailField(setting.key) ? (
                        /* Email Fields */
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          </div>
                          <input
                            type="email"
                            value={setting.value || ''}
                            onChange={e => handleFieldChange(group, setting.key, e.target.value)}
                            className="input-field !pl-10"
                            placeholder={t('settings.placeholders.email')}
                          />
                        </div>
                      ) : isTextareaField(setting.key) ? (
                        /* Textarea Fields */
                        <div>
                          <textarea
                            value={setting.value || ''}
                            onChange={e => handleFieldChange(group, setting.key, e.target.value)}
                            rows="3"
                            className="input-field resize-y min-h-[80px]"
                            placeholder={t('settings.placeholders.enterField', { field: getFieldLabel(setting.key) })}
                          />
                          <p className="text-xs text-gray-400 mt-1 text-right">{t('settings.charactersCount', { count: (setting.value || '').length })}</p>
                        </div>
                      ) : setting.key === 'allowed_storage_providers' ? (
                        /* Storage Provider Selector */
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleFieldChange(group, setting.key, 'supabase')}
                              className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-center flex items-center justify-center gap-2 ${
 setting.value === 'supabase'
 ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 ring-1 ring-emerald-200 dark:ring-emerald-500/20'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-dark-600 hover:border-gray-300'
 }`}
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 109 113" fill="currentColor"><path d="M63.7 110.3c-2.6 3.1-7.8 3.1-10.4 0L2.5 49.2c-3.5-4.2-.3-10.4 5.2-10.4h100.6c5.5 0 8.7 6.2 5.2 10.4l-49.8 61.1z"/></svg>
                              {t('settings.storage.supabaseOnly')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFieldChange(group, setting.key, 'both')}
                              className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-center flex items-center justify-center gap-2 ${
 setting.value === 'both'
 ? 'bg-brand-violet/10 text-brand-violet border-brand-violet/30 dark:bg-brand-cyan/10 dark:text-brand-cyan dark:border-brand-cyan/30 ring-1 ring-brand-violet/20 dark:ring-brand-cyan/20'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-dark-600 hover:border-gray-300'
 }`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                              {t('settings.storage.both')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFieldChange(group, setting.key, 'cloudinary')}
                              className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-center flex items-center justify-center gap-2 ${
 setting.value === 'cloudinary'
 ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 ring-1 ring-blue-200 dark:ring-blue-500/20'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-dark-600 hover:border-gray-300'
 }`}
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                              {t('settings.storage.cloudinaryOnly')}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">{t('settings.storage.helperText')}</p>
                        </div>
                      ) : (
                        /* Standard Input */
                        <div>
                          <input
                            type="text"
                            value={setting.value || ''}
                            onChange={e => handleFieldChange(group, setting.key, e.target.value)}
                            className="input-field"
                            placeholder={t('settings.placeholders.enterField', { field: getFieldLabel(setting.key) })}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Save Footer (Sticky) */}
          {hasChanges && (
            <div className="sticky bottom-4 z-10">
              <div className="glass-card !p-4 border border-amber-200 dark:border-amber-800/30 bg-amber-50/80 dark:bg-amber-900/10 backdrop-blur-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('settings.unsavedBanner')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={resetChanges} className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">{t('settings.actions.discard')}</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                    {saving ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : null}
                    {saving ? t('common.saving') : t('settings.actions.saveChanges')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {t('settings.toasts.saveSuccess')}
        </div>
      )}
    </div>
  )
}

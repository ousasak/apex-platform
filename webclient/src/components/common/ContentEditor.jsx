import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { adminApi } from '@/services'

export default function ContentEditor({
  value = '',
  onChange,
  placeholder,
}) {
  const { t } = useTranslation('common')
  const [mode, setMode] = useState('markdown') // 'markdown' | 'preview' | 'split'
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef(null)

  const effectivePlaceholder = placeholder ?? t('editor.placeholder')
  const charCount = value ? value.length : 0

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const replacement = before + selected + after
    const nextVal = value.substring(0, start) + replacement + value.substring(end)
    onChange?.(nextVal)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await adminApi.uploadMedia(formData)
      const url = data?.data?.url || data?.url
      if (url) {
        insertText(`![${file.name}](${url})`)
      }
    } catch {
      alert(t('editor.uploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  const renderHtml = () => {
    try {
      return DOMPurify.sanitize(marked.parse(value || ''))
    } catch {
      return value
    }
  }

  return (
    <div className="content-editor border border-gray-200 dark:border-dark-600 rounded-xl overflow-hidden bg-white dark:bg-dark-800">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/30">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-600 rounded-full p-0.5">
          <button
            type="button"
            onClick={() => setMode('markdown')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
 mode === 'markdown'
 ? 'bg-white dark:bg-dark-800 text-brand-violet dark:text-brand-cyan shadow-sm'
 : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
 }`}
          >
            {t('editor.tabs.editor')}
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
 mode === 'split'
 ? 'bg-white dark:bg-dark-800 text-brand-violet dark:text-brand-cyan shadow-sm'
 : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
 }`}
          >
            {t('editor.tabs.split')}
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
 mode === 'preview'
 ? 'bg-white dark:bg-dark-800 text-brand-violet dark:text-brand-cyan shadow-sm'
 : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
 }`}
          >
            {t('editor.tabs.preview')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{t('editor.chars', { count: charCount })}</span>
        </div>
      </div>

      {/* Toolbar */}
      {mode !== 'preview' && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-dark-600 bg-gray-50/80 dark:bg-dark-700/20 text-xs">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            title={t('editor.toolbar.bold')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-dark-600 font-bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*')}
            title={t('editor.toolbar.italic')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-dark-600 italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertText('~~', '~~')}
            title={t('editor.toolbar.strikethrough')}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-dark-600 line-through"
          >
            S
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-dark-500 mx-1" />
          <button
            type="button"
            onClick={() => insertText('# ')}
            title={t('editor.toolbar.h1')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 font-bold text-xs"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertText('## ')}
            title={t('editor.toolbar.h2')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 font-bold text-xs"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertText('### ')}
            title={t('editor.toolbar.h3')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 font-bold text-xs"
          >
            H3
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-dark-500 mx-1" />
          <button
            type="button"
            onClick={() => insertText('- ')}
            title={t('editor.toolbar.bulletList')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            • {t('editor.toolbar.bulletListLabel')}
          </button>
          <button
            type="button"
            onClick={() => insertText('1. ')}
            title={t('editor.toolbar.numberedList')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            {t('editor.toolbar.numberedListLabel')}
          </button>
          <button
            type="button"
            onClick={() => insertText('> ')}
            title={t('editor.toolbar.quote')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            {t('editor.toolbar.quote')}
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`')}
            title={t('editor.toolbar.code')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 font-mono text-xs"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            onClick={() => insertText('```javascript\n', '\n```')}
            title={t('editor.toolbar.codeBlock')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 font-mono text-xs"
          >
            {t('editor.toolbar.codeBlockLabel')}
          </button>
          <div className="w-px h-4 bg-gray-300 dark:bg-dark-500 mx-1" />
          <button
            type="button"
            onClick={() => {
              const url = prompt(t('editor.enterLinkUrl'))
              if (url) insertText(`[${t('editor.linkText')}](`, `${url})`)
            }}
            title={t('editor.toolbar.link')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            🔗 {t('editor.toolbar.link')}
          </button>
          <label className="cursor-pointer px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs inline-flex items-center gap-1">
            <span>🖼 {t('editor.toolbar.upload')}</span>
            <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
          </label>
          <button
            type="button"
            onClick={() => {
              const url = prompt(t('editor.enterImageUrl'))
              if (url) insertText(`![${t('editor.imageAlt')}](${url})`)
            }}
            title={t('editor.toolbar.imageUrl')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            {t('editor.toolbar.urlImageLabel')}
          </button>
          <button
            type="button"
            onClick={() => {
              insertText(t('editor.tableTemplate'))
            }}
            title={t('editor.toolbar.table')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            {t('editor.toolbar.table')}
          </button>
          <button
            type="button"
            onClick={() => insertText('\n---\n')}
            title={t('editor.toolbar.horizontalLine')}
            className="px-1.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-xs"
          >
            {t('editor.toolbar.hrLabel')}
          </button>
          {uploading && <span className="text-brand-violet text-xs animate-pulse">{t('editor.uploading')}</span>}
        </div>
      )}

      {/* Editor Body */}
      <div className={`grid ${mode === 'split' ? 'grid-cols-2 divide-x divide-gray-200 dark:divide-dark-600' : 'grid-cols-1'}`}>
        {mode !== 'preview' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={effectivePlaceholder}
            rows={14}
            className="w-full p-4 font-mono text-sm bg-transparent outline-none resize-y text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div
            className="p-4 prose dark:prose-invert max-w-none overflow-y-auto max-h-[500px]"
            dangerouslySetInnerHTML={{ __html: renderHtml() }}
          />
        )}
      </div>
    </div>
  )
}

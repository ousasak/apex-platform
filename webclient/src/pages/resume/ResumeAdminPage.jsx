import React, { useState, useEffect } from 'react'
import { adminApi, publicApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import { FileText, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResumeAdminPage() {
  const { showToast } = useUi()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  async function fetchStatus() {
    setLoading(true)
    try {
      const res = await adminApi.getResumeStatus()
      setStatus(res.data?.data || null)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  async function handleUpload(e) {
    e.preventDefault()
    if (!selectedFile) {
      showToast('Please select a PDF file first.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('resume', selectedFile)

    setUploading(true)
    try {
      await adminApi.uploadResume(formData)
      showToast('Resume uploaded and published successfully.')
      setSelectedFile(null)
      fetchStatus()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload resume.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-brand-violet" />
          Resume / CV Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload and maintain your latest Curriculum Vitae (PDF) for visitors, recruiters, and clients.
        </p>
      </div>

      {/* Current Resume Status Card */}
      <div className="surface-panel p-6 sm:p-8">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
          Current Published CV
        </h2>

        {loading ? (
          <div className="text-sm text-gray-400">Loading CV status...</div>
        ) : status?.has_resume ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {status.filename || 'resume.pdf'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated: {status.updated_at ? new Date(status.updated_at).toLocaleDateString() : 'Active'} • Size: {status.size || 'PDF'}
                </p>
              </div>
            </div>
            <a
              href="/api/resume/download"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Published CV</span>
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>No custom PDF uploaded yet. Upload your PDF below to enable public CV downloads.</span>
          </div>
        )}
      </div>

      {/* Upload Form Card */}
      <div className="surface-panel p-6 sm:p-8">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          Upload New PDF Resume
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          File must be a valid PDF document (Max 10MB). Uploading a new file automatically replaces the previous version.
        </p>

        <form onSubmit={handleUpload} className="space-y-5">
          <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-8 text-center hover:border-brand-violet transition-colors">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="resume-file-input"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="resume-file-input"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
            >
              Browse PDF File
            </label>
            {selectedFile && (
              <p className="mt-3 text-xs font-semibold text-brand-violet dark:text-brand-cyan">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload & Publish Resume'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

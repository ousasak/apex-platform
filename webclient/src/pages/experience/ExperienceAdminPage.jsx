import React, { useState, useEffect } from 'react'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Briefcase, Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react'

export default function ExperienceAdminPage() {
  const { showToast } = useUi()
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({
    type: 'work',
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    sort_order: 0,
  })
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchExperiences() {
    setLoading(true)
    try {
      const res = await adminApi.getExperiences()
      setExperiences(res.data.data || [])
    } catch {
      showToast('Failed to load experiences.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  function openCreateModal() {
    setEditingItem(null)
    setForm({
      type: 'work',
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      sort_order: experiences.length + 1,
    })
    setShowModal(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setForm({
      type: item.type || 'work',
      title: item.title,
      company: item.company,
      location: item.location || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      is_current: !!item.is_current,
      description: item.description || '',
      sort_order: item.sort_order || 0,
    })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingItem) {
        await adminApi.updateExperience(editingItem.id, form)
        showToast('Experience updated successfully.')
      } else {
        await adminApi.createExperience(form)
        showToast('Experience created successfully.')
      }
      setShowModal(false)
      fetchExperiences()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save experience.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingItem) return
    setDeleting(true)
    try {
      await adminApi.deleteExperience(deletingItem.id)
      showToast('Experience deleted.')
      setShowDeleteModal(false)
      setDeletingItem(null)
      fetchExperiences()
    } catch {
      showToast('Failed to delete experience.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-gray-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand-violet" />
            Experience & Education Timeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showcase your professional career milestones, work roles, and education.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {loading ? (
          <div className="surface-panel p-12 text-center text-gray-400">Loading timeline...</div>
        ) : experiences.length === 0 ? (
          <div className="surface-panel p-12 text-center text-gray-400">No experience records yet.</div>
        ) : (
          experiences.map((item) => (
            <div
              key={item.id}
              className="surface-panel p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-l-4 border-l-brand-violet dark:border-l-brand-cyan"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${item.type === 'education' ? 'bg-blue-500/10 text-blue-500' : 'bg-brand-violet/10 text-brand-cyan'}`}>
                    {item.type}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-brand-violet dark:text-brand-cyan">{item.company}</span>
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.start_date} — {item.is_current ? 'Present' : (item.end_date || 'Past')}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 pt-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingItem(item)
                    setShowDeleteModal(true)
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 sm:p-8 space-y-5 animate-scale-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingItem ? 'Edit Experience' : 'Add Experience'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="work">Work Role</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Job Title / Degree</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Company / School</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="e.g. APEX Platform"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Phnom Penh, Cambodia"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    placeholder="e.g. 2024 or Jan 2024"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="text"
                    disabled={form.is_current}
                    value={form.is_current ? 'Present' : form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    placeholder="e.g. Present or Dec 2024"
                    className="input-field disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_current}
                    onChange={(e) => setForm({ ...form, is_current: e.target.checked })}
                    className="rounded text-brand-violet focus:ring-brand-violet"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description / Key Achievements</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Key responsibilities, technical challenges solved, stack used..."
                  className="input-field resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-sm px-5 py-2"
                >
                  {saving ? 'Saving...' : 'Save Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Experience"
        message={`Are you sure you want to delete this experience record?`}
      />
    </div>
  )
}

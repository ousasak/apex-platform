import React, { useState, useEffect } from 'react'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react'
import slugify from 'slugify'

export default function ServicesAdminPage() {
  const { showToast } = useUi()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingItem, setDeletingItem] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchServices() {
    setLoading(true)
    try {
      const res = await adminApi.getServices()
      setServices(res.data.data || [])
    } catch {
      showToast('Failed to load services.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  function openCreateModal() {
    setEditingItem(null)
    setForm({
      title: '',
      slug: '',
      description: '',
      icon: '',
      sort_order: services.length + 1,
      is_active: true,
    })
    setShowModal(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setForm({
      title: item.title,
      slug: item.slug || '',
      description: item.description || '',
      icon: item.icon || '',
      sort_order: item.sort_order || 0,
      is_active: !!item.is_active,
    })
    setShowModal(true)
  }

  function handleTitleChange(val) {
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editingItem ? prev.slug : slugify(val, { lower: true, strict: true }),
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingItem) {
        await adminApi.updateService(editingItem.id, form)
        showToast('Service updated successfully.')
      } else {
        await adminApi.createService(form)
        showToast('Service created successfully.')
      }
      setShowModal(false)
      fetchServices()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save service.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingItem) return
    setDeleting(true)
    try {
      await adminApi.deleteService(deletingItem.id)
      showToast('Service deleted.')
      setShowDeleteModal(false)
      setDeletingItem(null)
      fetchServices()
    } catch {
      showToast('Failed to delete service.', 'error')
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
            <Layers className="w-6 h-6 text-brand-violet" />
            Engineering Services
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define the digital solutions, consulting, and development services you offer.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full surface-panel p-12 text-center text-gray-400">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full surface-panel p-12 text-center text-gray-400">No services created yet.</div>
        ) : (
          services.map((item) => (
            <div
              key={item.id}
              className="surface-panel p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center font-bold text-xs text-brand-violet dark:text-brand-cyan">
                    {item.icon ? item.icon.slice(0, 3).toUpperCase() : item.title.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${item.is_active ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                <span className="text-[11px] font-mono text-gray-400">Order: {item.sort_order}</span>
                <div className="flex items-center gap-2">
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
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 sm:p-8 space-y-5 animate-scale-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingItem ? 'Edit Service' : 'Add Service'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Full-Stack Web Development"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input-field"
                  />
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Icon Key / Tag</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. web, api, cloud"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the deliverables, tech stack, and benefits of this service..."
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded text-brand-violet focus:ring-brand-violet"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Service</span>
                </label>
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
                  {saving ? 'Saving...' : 'Save Service'}
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
        title="Delete Service"
        message={`Are you sure you want to delete "${deletingItem?.title}"?`}
      />
    </div>
  )
}

import React, { useState, useEffect, useMemo } from 'react'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Wrench, Plus, Search, Edit2, Trash2, CheckCircle2 } from 'lucide-react'

export default function SkillsAdminPage() {
  const { showToast } = useUi()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [form, setForm] = useState({
    name: '',
    category: 'frontend',
    icon: '',
    proficiency: 'Advanced',
    sort_order: 0,
    is_featured: true,
    is_visible: true,
  })
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingSkill, setDeletingSkill] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchSkills() {
    setLoading(true)
    try {
      const res = await adminApi.getSkills()
      setSkills(res.data.data || [])
    } catch {
      showToast('Failed to load skills.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const categories = useMemo(() => {
    const set = new Set(skills.map((s) => s.category).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [skills])

  const filteredSkills = useMemo(() => {
    return skills.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [skills, searchQuery, selectedCategory])

  function openCreateModal() {
    setEditingSkill(null)
    setForm({
      name: '',
      category: 'frontend',
      icon: '',
      proficiency: 'Advanced',
      sort_order: skills.length + 1,
      is_featured: true,
      is_visible: true,
    })
    setShowModal(true)
  }

  function openEditModal(skill) {
    setEditingSkill(skill)
    setForm({
      name: skill.name,
      category: skill.category || 'frontend',
      icon: skill.icon || '',
      proficiency: skill.proficiency || 'Advanced',
      sort_order: skill.sort_order || 0,
      is_featured: !!skill.is_featured,
      is_visible: !!skill.is_visible,
    })
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSkill) {
        await adminApi.updateSkill(editingSkill.id, form)
        showToast('Skill updated successfully.')
      } else {
        await adminApi.createSkill(form)
        showToast('Skill created successfully.')
      }
      setShowModal(false)
      fetchSkills()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save skill.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingSkill) return
    setDeleting(true)
    try {
      await adminApi.deleteSkill(deletingSkill.id)
      showToast('Skill deleted.')
      setShowDeleteModal(false)
      setDeletingSkill(null)
      fetchSkills()
    } catch {
      showToast('Failed to delete skill.', 'error')
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
            <Wrench className="w-6 h-6 text-brand-violet" />
            Skills & Tech Stack
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage programming languages, frameworks, databases, and engineering tools.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-violet text-white'
                  : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 border border-slate-200 dark:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface-panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No skills found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/[0.06] text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Proficiency</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center font-mono font-bold text-xs text-brand-violet dark:text-brand-cyan">
                        {skill.icon ? skill.icon.slice(0, 3).toUpperCase() : skill.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{skill.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 capitalize">
                        {skill.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {skill.proficiency}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {skill.is_featured && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-500">Featured</span>
                        )}
                        <span className={`w-2 h-2 rounded-full ${skill.is_visible ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(skill)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingSkill(skill)
                            setShowDeleteModal(true)
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 sm:p-8 space-y-5 animate-scale-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. React, PostgreSQL, Docker"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="database">Database</option>
                    <option value="devops">DevOps / Cloud</option>
                    <option value="mobile">Mobile</option>
                    <option value="tools">Tools & Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Proficiency</label>
                  <select
                    value={form.proficiency}
                    onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                    className="input-field"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Icon Identifier</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="e.g. react, laravel"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded text-brand-violet focus:ring-brand-violet"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Skill</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                    className="rounded text-brand-violet focus:ring-brand-violet"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publicly Visible</span>
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
                  {saving ? 'Saving...' : 'Save Skill'}
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
        title="Delete Skill"
        message={`Are you sure you want to delete "${deletingSkill?.name}"?`}
      />
    </div>
  )
}

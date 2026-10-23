'use client'

import { useState, useEffect } from 'react'
import AdminNav from '../_nav'
import { useConfirm } from '@/components/ConfirmModal'
import LoadingState from '@/components/LoadingState'

interface Mentor {
  id: string
  name: string
  pin: string | null
  status: string
  core_skill: string | null
  country: string | null
  language: string | null
  photo_path: string | null
}

const compressAndUploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 2000
        const MAX_HEIGHT = 2000
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error('Canvas is empty'))
          const formData = new FormData()
          const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_')
          formData.append('file', new File([blob], safeName + ".webp", { type: 'image/webp' }))
          
          try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()
            resolve(data.path)
          } catch (err) {
            reject(err)
          }
        }, 'image/webp', 0.8)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

export default function AdminMentorsPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)

  // Add form state
  const [form, setForm] = useState({ name: '', pin: '', core_skill: '', country: '', language: '', photo_path: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Edit/Expand state
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', pin: '', core_skill: '', country: '', language: '', photo_path: '' })
  const [saving, setSaving] = useState(false)
  const [editUploadingPhoto, setEditUploadingPhoto] = useState(false)

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const createUniquePin = (list: Mentor[]) => {
    const used = new Set(list.map(m => m.pin).filter(Boolean))
    let candidate = ''
    do {
      candidate = String(Math.floor(100000 + Math.random() * 900000))
    } while (used.has(candidate))
    return candidate
  }

  const load = () =>
    fetch('/api/mentors')
      .then(r => r.json())
      .then((data: Mentor[]) => {
        setMentors(data)
        setForm(prev => prev.pin ? prev : { ...prev, pin: createUniquePin(data) })
      })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const copyPin = (id: string, pin: string | null) => {
    if (!pin) return
    navigator.clipboard.writeText(pin)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(prev => (prev === id ? null : prev))
    }, 2000)
  }

  const findDuplicateMentor = (pinValue: string, excludeId?: string) => {
    const clean = pinValue.trim()
    if (!clean) return null
    return mentors.find(m => m.pin === clean && m.id !== excludeId) || null
  }

  const addPinDuplicate = findDuplicateMentor(form.pin)
  const editPinDuplicate = editingId ? findDuplicateMentor(editForm.pin, editingId) : null

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    const setUploadState = isEdit ? setEditUploadingPhoto : setUploadingPhoto
    const setFormState = isEdit ? setEditForm : setForm
    
    setUploadState(true)
    setError('')
    try {
      const url = await compressAndUploadImage(file)
      setFormState(prev => ({ ...prev, photo_path: url }))
    } catch {
      setError('Failed to upload and compress photo')
    } finally {
      setUploadState(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.pin.trim() || !form.core_skill.trim() || !form.country.trim() || !form.language.trim()) return
    if (addPinDuplicate) {
      setError(`PIN "${form.pin}" is already used by ${addPinDuplicate.name}.`)
      return
    }
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Failed to add')
        return
      }
      const created = await res.json()
      const updatedList = [...mentors, created]
      setForm({
        name: '',
        pin: createUniquePin(updatedList),
        core_skill: '',
        country: '',
        language: '',
        photo_path: '',
      })
      load()
    } catch {
      setError('Failed to add mentor')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleStatus = async (m: Mentor) => {
    const newStatus = m.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch(`/api/admin/mentors/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) { setError('Failed to update status'); return }
      setMentors(prev => prev.map(x => x.id === m.id ? { ...x, status: newStatus } : x))
    } catch {
      setError('Failed to update status')
    }
  }

  const startEdit = (m: Mentor) => { 
    setEditingId(m.id)
    setExpandedId(m.id)
    setEditForm({ 
      name: m.name, 
      pin: m.pin || createUniquePin(mentors),
      core_skill: m.core_skill || '', 
      country: m.country || '', 
      language: m.language || '', 
      photo_path: m.photo_path || '' 
    }) 
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm.name.trim() || !editForm.pin.trim() || !editForm.core_skill.trim() || !editForm.country.trim() || !editForm.language.trim()) return
    if (editPinDuplicate) {
      setError(`PIN "${editForm.pin}" is already used by ${editPinDuplicate.name}.`)
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/mentors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) { setError((await res.json()).error || 'Failed to save'); return }
      const updated = await res.json()
      setMentors(prev => prev.map(m => m.id === id ? updated : m))
      setEditingId(null)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'Delete Mentor',
      message: `Archive mentor "${name}"? Their past sessions and reports will be preserved.`,
      confirmText: 'Delete',
      variant: 'danger',
    })
    if (!ok) return
    try {
      await fetch('/api/mentors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setMentors(prev => prev.filter(m => m.id !== id))
    } catch {
      setError('Failed to delete')
    }
  }

  const toggleExpand = (id: string) => {
    if (editingId === id) return 
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <AdminNav />
      <ConfirmDialog />
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-6">Manage Mentors</h1>

        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-[#E8D5B7] p-5 mb-6">
          <h2 className="text-sm font-semibold text-[#2C1A0E] mb-4">Add New Mentor</h2>
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">{error}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[#6B5744] mb-1">Full Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. John Jaymark Daza"
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B5744] mb-1">Login PIN (6 Digits, Unique) *</label>
              <div className="flex gap-2">
                <input
                  value={form.pin}
                  onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="e.g. 482910"
                  maxLength={6}
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 ${
                    addPinDuplicate ? 'border-red-400 focus:ring-red-300' : 'border-[#E8D5B7] focus:ring-[#F5A623]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, pin: createUniquePin(mentors) }))}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#E8D5B7] bg-[#FAFAF8] text-[#6B5744] hover:text-[#2C1A0E] hover:bg-[#F5A623]/10 transition-colors whitespace-nowrap"
                >
                  Generate PIN
                </button>
              </div>
              {addPinDuplicate && (
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  PIN already used by {addPinDuplicate.name}. Please use another PIN.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-[#6B5744] mb-1">Core Skill *</label>
              <input
                value={form.core_skill}
                onChange={e => setForm(f => ({ ...f, core_skill: e.target.value }))}
                placeholder="e.g. Math, STEAM, Chemistry"
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B5744] mb-1">Country of Origin *</label>
              <input
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="e.g. Philippines"
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#6B5744] mb-1">Languages *</label>
              <input
                value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                placeholder="e.g. English, Tagalog"
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#6B5744] mb-1">Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, false)}
                disabled={uploadingPhoto}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F5A623]/10 file:text-[#F5A623] hover:file:bg-[#F5A623]/20"
              />
              {uploadingPhoto && <p className="text-xs text-[#F5A623] mt-2">Compressing and uploading photo...</p>}
              {form.photo_path && !uploadingPhoto && (
                 <div className="mt-3 flex items-center gap-3">
                   <img src={form.photo_path} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-[#E8D5B7]" />
                   <span className="text-xs text-green-600 font-medium">Photo ready</span>
                 </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                adding ||
                uploadingPhoto ||
                !form.name.trim() ||
                form.pin.trim().length < 4 ||
                Boolean(addPinDuplicate) ||
                !form.core_skill.trim() ||
                !form.country.trim() ||
                !form.language.trim()
              }
              className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-6 py-2 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
            >
              {adding ? 'Adding...' : 'Add Mentor'}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl border border-[#E8D5B7]">
          <div className="px-5 py-4 border-b border-[#E8D5B7]">
            <h2 className="text-sm font-semibold text-[#2C1A0E]">{mentors.length} mentors</h2>
          </div>
          {loading ? (
            <LoadingState className="py-20" />
          ) : mentors.length === 0 ? (
            <p className="text-sm text-[#6B5744] p-5">No mentors yet.</p>
          ) : (
            <div className="divide-y divide-[#E8D5B7]">
              {mentors.map(m => {
                const isExpanded = expandedId === m.id
                const isEditing = editingId === m.id
                const isCopied = copiedId === m.id

                return (
                  <div key={m.id} className="transition-all">
                    {/* Compact Row */}
                    <div 
                      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 cursor-pointer hover:bg-[#FAFAF8] transition-colors ${isExpanded ? 'bg-[#FAFAF8]' : ''}`}
                      onClick={() => toggleExpand(m.id)}
                    >
                      <div className="flex items-center gap-3">
                        {m.photo_path ? (
                          <img src={m.photo_path} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-[#E8D5B7]" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#E8D5B7]/50 flex items-center justify-center text-[#2C1A0E] font-bold text-xs border border-[#E8D5B7]">
                            {m.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className={`text-sm font-medium ${m.status === 'inactive' ? 'text-[#6B5744]' : 'text-[#2C1A0E]'}`}>
                            {m.name}
                          </p>
                          <p className="text-xs text-[#6B5744]">{m.core_skill || 'No core skill'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 sm:gap-3" onClick={e => e.stopPropagation()}>
                        {/* PIN & Copy Button */}
                        <div className="flex items-center bg-[#FAFAF8] border border-[#E8D5B7]/80 rounded-lg px-2.5 py-1 gap-2">
                          <span className="text-[11px] font-semibold text-[#8a7662] uppercase">PIN:</span>
                          <span className="text-xs font-mono font-bold tracking-wider text-[#2C1A0E]">
                            {m.pin || '—'}
                          </span>
                          {m.pin && (
                            <button
                              type="button"
                              onClick={() => copyPin(m.id, m.pin)}
                              title="Copy PIN to share with mentor"
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                                isCopied
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-[#F5A623]/15 text-[#2C1A0E] hover:bg-[#F5A623]/30'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                  Copied
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {m.status === 'active' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">Inactive</span>
                        )}
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`text-xs transition-colors ${m.status === 'active' ? 'text-gray-400 hover:text-gray-600' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {m.status === 'active' ? 'Set Inactive' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => startEdit(m)}
                          className="text-xs text-[#F5A623] hover:text-[#E09615] transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-[#FAFAF8] border-t border-[#E8D5B7]/30">
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B5744] mb-1 uppercase tracking-wider">Full Name</label>
                              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-[#E8D5B7] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B5744] mb-1 uppercase tracking-wider">Login PIN (6 Digits, Unique)</label>
                              <div className="flex gap-2">
                                <input
                                  value={editForm.pin}
                                  onChange={e => setEditForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                  maxLength={6}
                                  className={`flex-1 border rounded-lg px-2.5 py-1.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 ${
                                    editPinDuplicate ? 'border-red-400 focus:ring-red-300' : 'border-[#E8D5B7] focus:ring-[#F5A623]'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditForm(f => ({ ...f, pin: createUniquePin(mentors) }))}
                                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E8D5B7] bg-white text-[#6B5744] hover:text-[#2C1A0E] transition-colors whitespace-nowrap"
                                >
                                  Regenerate
                                </button>
                              </div>
                              {editPinDuplicate && (
                                <p className="text-[11px] text-red-600 font-medium mt-1">
                                  PIN already used by {editPinDuplicate.name}.
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B5744] mb-1 uppercase tracking-wider">Core Skill</label>
                              <input value={editForm.core_skill} onChange={e => setEditForm(f => ({ ...f, core_skill: e.target.value }))} className="w-full border border-[#E8D5B7] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#6B5744] mb-1 uppercase tracking-wider">Country of Origin</label>
                              <input value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} className="w-full border border-[#E8D5B7] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#6B5744] mb-1 uppercase tracking-wider">Languages</label>
                              <input value={editForm.language} onChange={e => setEditForm(f => ({ ...f, language: e.target.value }))} className="w-full border border-[#E8D5B7] rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#6B5744] mb-1 uppercase tracking-wider">Photo</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, true)}
                                disabled={editUploadingPhoto}
                                className="w-full text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#F5A623]/10 file:text-[#F5A623] hover:file:bg-[#F5A623]/20"
                              />
                              {editUploadingPhoto && <p className="text-[10px] text-[#F5A623] mt-1.5">Compressing and uploading photo...</p>}
                              {editForm.photo_path && !editUploadingPhoto && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img src={editForm.photo_path} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-[#E8D5B7]" />
                                  <span className="text-[10px] text-green-600 font-medium">Photo ready</span>
                                </div>
                              )}
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                              <button onClick={() => { setEditingId(null); setExpandedId(null); }} className="text-xs text-[#6B5744] hover:text-[#2C1A0E] px-4 py-1.5 rounded-lg border border-[#E8D5B7] bg-white transition-colors">Cancel</button>
                              <button
                                onClick={() => handleSaveEdit(m.id)}
                                disabled={
                                  saving ||
                                  editUploadingPhoto ||
                                  !editForm.name.trim() ||
                                  editForm.pin.trim().length < 4 ||
                                  Boolean(editPinDuplicate) ||
                                  !editForm.core_skill.trim() ||
                                  !editForm.country.trim() ||
                                  !editForm.language.trim()
                                }
                                className="bg-[#F5A623] text-[#2C1A0E] text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
                              >
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pl-11">
                            <div>
                              <p className="text-[11px] font-semibold text-[#6B5744] uppercase tracking-wider mb-0.5">Login PIN</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-mono font-bold text-[#2C1A0E] tracking-wider">{m.pin || '-'}</p>
                                {m.pin && (
                                  <button
                                    type="button"
                                    onClick={() => copyPin(m.id, m.pin)}
                                    className="text-xs text-[#F5A623] hover:text-[#E09615] font-semibold underline"
                                  >
                                    {isCopied ? 'Copied!' : 'Copy PIN'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-[#6B5744] uppercase tracking-wider mb-0.5">Country of Origin</p>
                              <p className="text-sm text-[#2C1A0E]">{m.country || '-'}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-[#6B5744] uppercase tracking-wider mb-0.5">Languages</p>
                              <p className="text-sm text-[#2C1A0E]">{m.language || '-'}</p>
                            </div>
                            {m.photo_path && (
                              <div className="md:col-span-3">
                                <p className="text-[11px] font-semibold text-[#6B5744] uppercase tracking-wider mb-1">Photo</p>
                                <img src={m.photo_path} alt={m.name} className="h-20 w-20 object-cover rounded-xl border border-[#E8D5B7]" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../_nav'

interface Mentor {
  id: string
  name: string
  status: string
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () =>
    fetch('/api/mentors').then(r => r.json()).then(setMentors).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Failed to add')
        return
      }
      setNewName('')
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

  const startEdit = (m: Mentor) => { setEditingId(m.id); setEditName(m.name) }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/mentors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
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
    if (!confirm(`Delete mentor "${name}"?`)) return
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

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-6">Manage Mentors</h1>

        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-[#E8D5B7] p-5 mb-6">
          <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">Add New Mentor</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{error}</div>
          )}
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Mentor name"
              className="flex-1 border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl border border-[#E8D5B7]">
          <div className="px-5 py-4 border-b border-[#E8D5B7]">
            <h2 className="text-sm font-semibold text-[#2C1A0E]">{mentors.length} mentors</h2>
          </div>
          {loading ? (
            <p className="text-sm text-[#6B5744] p-5">Loading...</p>
          ) : mentors.length === 0 ? (
            <p className="text-sm text-[#6B5744] p-5">No mentors yet.</p>
          ) : (
            <div className="divide-y divide-[#E8D5B7]">
              {mentors.map(m => (
                <div key={m.id}>
                  {editingId === m.id ? (
                    <div className="px-5 py-4 bg-[#FAFAF8] flex items-center gap-2">
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                      />
                      <button
                        onClick={() => handleSaveEdit(m.id)}
                        disabled={saving || !editName.trim()}
                        className="bg-[#F5A623] text-[#2C1A0E] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-[#6B5744] hover:text-[#2C1A0E] px-4 py-2 rounded-lg border border-[#E8D5B7] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${m.status === 'inactive' ? 'text-[#6B5744]' : 'text-[#2C1A0E]'}`}>
                          {m.name}
                        </p>
                        {m.status === 'active' ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">(Inactive)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className={`text-xs transition-colors ${m.status === 'active' ? 'text-gray-400 hover:text-gray-600' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {m.status === 'active' ? 'Set Inactive' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => startEdit(m)}
                          className="text-xs text-[#F5A623] hover:text-[#E09615] transition-colors"
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
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

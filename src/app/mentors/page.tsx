'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Mentor {
  id: string
  name: string
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    fetch('/api/mentors')
      .then(r => r.json())
      .then(setMentors)
      .finally(() => setLoading(false))
  }

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
        const data = await res.json()
        setError(data.error || 'Gagal menambah mentor')
        return
      }
      setNewName('')
      load()
    } catch {
      setError('Gagal menambahkan mentor')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus mentor ini?')) return
    try {
      await fetch('/api/mentors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setMentors(prev => prev.filter(m => m.id !== id))
    } catch {
      setError('Gagal menghapus mentor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mentor</h1>
            <p className="text-sm text-gray-500 mt-0.5">{mentors.length} mentor terdaftar</p>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Tambah Mentor Baru</p>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nama mentor"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={adding || !newName.trim()}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {adding ? 'Menambah...' : 'Tambah'}
            </button>
          </div>
        </form>

        {/* List */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Memuat...</p>
        ) : mentors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada mentor.</p>
        ) : (
          <div className="space-y-2">
            {mentors.map(m => (
              <div key={m.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{m.name}</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

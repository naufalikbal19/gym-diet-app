import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Search, Users, ChevronRight, X } from 'lucide-react'

const GOALS = [
  { value: 'cut', label: 'Turun BB (Cut)' },
  { value: 'bulk', label: 'Naik BB (Bulk)' },
  { value: 'maintain', label: 'Maintenance' },
  { value: 'toning', label: 'Toning' },
]

function AddClientModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', phone: '', gender: 'male', age: '', height_cm: '', goal: 'cut', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field, val) { setForm(prev => ({ ...prev, [field]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.from('clients').insert([{
      name: form.name,
      phone: form.phone || null,
      gender: form.gender,
      age: form.age ? parseInt(form.age) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      goal: form.goal,
      notes: form.notes || null,
    }])
    if (error) { setError(error.message); setLoading(false); return }
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-semibold text-white">Tambah Klien Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Nama Lengkap *</label>
            <input className="input" placeholder="Contoh: Budi Santoso" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Jenis Kelamin</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="label">Umur (tahun)</label>
              <input className="input" type="number" placeholder="25" min="10" max="100" value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tinggi Badan (cm)</label>
              <input className="input" type="number" placeholder="170" min="100" max="250" step="0.1" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
            </div>
            <div>
              <label className="label">No. Telepon</label>
              <input className="input" placeholder="08xx" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Goal / Tujuan</label>
            <select className="input" value={form.goal} onChange={e => set('goal', e.target.value)}>
              {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Catatan</label>
            <textarea className="input h-20 resize-none" placeholder="Kondisi khusus, injury, dll..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const goalBadge = {
  cut: <span className="badge-bad">Cut</span>,
  bulk: <span className="badge-good">Bulk</span>,
  maintain: <span className="badge-warn">Maintain</span>,
  toning: <span className="badge-good">Toning</span>,
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Klien</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} klien terdaftar</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Klien
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          className="input pl-10"
          placeholder="Cari nama atau nomor HP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card animate-pulse h-16 bg-gray-800" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">{search ? 'Tidak ada klien yang cocok' : 'Belum ada klien. Klik "Tambah Klien" untuk mulai.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link
              key={c.id}
              to={`/clients/${c.id}`}
              className="card flex items-center justify-between hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-600/30 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-100">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                    {c.age ? `, ${c.age} thn` : ''}
                    {c.height_cm ? `, ${c.height_cm} cm` : ''}
                    {c.phone ? ` · ${c.phone}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.goal && goalBadge[c.goal]}
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && <AddClientModal onClose={() => setShowModal(false)} onAdded={load} />}
    </div>
  )
}

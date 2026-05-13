import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Scale, Info } from 'lucide-react'

function Field({ label, name, placeholder, unit, hint, form, setForm, type = 'number', step = '0.1', min, max }) {
  return (
    <div>
      <label className="label">
        {label}
        {unit && <span className="text-gray-600 ml-1">({unit})</span>}
        {hint && (
          <span className="ml-1 text-gray-600 text-xs" title={hint}>
            <Info className="w-3 h-3 inline" />
          </span>
        )}
      </label>
      <input
        className="input"
        type={type}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm(prev => ({ ...prev, [name]: e.target.value }))}
      />
    </div>
  )
}

export default function AddBodyinPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    measured_at: new Date().toISOString().slice(0, 10),
    weight_kg: '',
    bmi: '',
    body_fat_percentage: '',
    muscle_mass_kg: '',
    bone_mass_kg: '',
    body_water_percentage: '',
    visceral_fat: '',
    metabolic_age: '',
    bmr_kcal: '',
    protein_percentage: '',
    subcutaneous_fat_percentage: '',
  })

  useEffect(() => {
    supabase.from('clients').select('name, height_cm, goal').eq('id', id).single()
      .then(({ data }) => setClient(data))
  }, [id])

  // Auto-calculate BMI if weight & height exist
  useEffect(() => {
    if (form.weight_kg && client?.height_cm) {
      const h = client.height_cm / 100
      const bmi = (parseFloat(form.weight_kg) / (h * h)).toFixed(1)
      setForm(prev => ({ ...prev, bmi }))
    }
  }, [form.weight_kg, client])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      client_id: id,
      measured_at: form.measured_at,
    }
    const numFields = ['weight_kg', 'bmi', 'body_fat_percentage', 'muscle_mass_kg', 'bone_mass_kg',
      'body_water_percentage', 'visceral_fat', 'metabolic_age', 'bmr_kcal', 'protein_percentage', 'subcutaneous_fat_percentage']
    numFields.forEach(f => { if (form[f] !== '') payload[f] = parseFloat(form[f]) })

    const { error } = await supabase.from('bodyin_measurements').insert([payload])
    if (error) { setError(error.message); setLoading(false); return }
    navigate(`/clients/${id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to={`/clients/${id}`} className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Input Data BodyIn</h1>
          {client && <p className="text-gray-500 text-sm mt-0.5">Klien: <span className="text-gray-300">{client.name}</span></p>}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-800">
          <Scale className="w-5 h-5 text-emerald-400" />
          <p className="font-semibold text-white">Hasil Pengukuran Mesin BodyIn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label className="label">Tanggal Pengukuran</label>
            <input
              className="input"
              type="date"
              value={form.measured_at}
              onChange={e => setForm(prev => ({ ...prev, measured_at: e.target.value }))}
              required
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Data Utama</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Berat Badan *" name="weight_kg" placeholder="70.5" unit="kg" form={form} setForm={setForm} />
              <Field label="BMI" name="bmi" placeholder="Auto-hitung" unit="kg/m²" hint="Otomatis dihitung dari berat & tinggi badan" form={form} setForm={setForm} />
              <Field label="Lemak Tubuh" name="body_fat_percentage" placeholder="20.5" unit="%" form={form} setForm={setForm} />
              <Field label="Massa Otot" name="muscle_mass_kg" placeholder="35.2" unit="kg" form={form} setForm={setForm} />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Data Tambahan</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Massa Tulang" name="bone_mass_kg" placeholder="3.1" unit="kg" form={form} setForm={setForm} />
              <Field label="Kadar Air" name="body_water_percentage" placeholder="55.0" unit="%" form={form} setForm={setForm} />
              <Field label="Lemak Visceral" name="visceral_fat" placeholder="8" unit="level" step="1" form={form} setForm={setForm} hint="Level lemak di sekitar organ dalam (skala 1-30)" />
              <Field label="Usia Metabolik" name="metabolic_age" placeholder="25" unit="tahun" step="1" form={form} setForm={setForm} />
              <Field label="BMR" name="bmr_kcal" placeholder="1600" unit="kcal" step="1" form={form} setForm={setForm} hint="Basal Metabolic Rate — kebutuhan kalori dasar" />
              <Field label="Lemak Subkutan" name="subcutaneous_fat_percentage" placeholder="15.0" unit="%" form={form} setForm={setForm} />
              <Field label="Protein" name="protein_percentage" placeholder="17.5" unit="%" form={form} setForm={setForm} />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Link to={`/clients/${id}`} className="btn-secondary flex-1 text-center">Batal</Link>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Pengukuran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

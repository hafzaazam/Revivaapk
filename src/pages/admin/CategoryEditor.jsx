import { useEffect, useState } from 'react'

const defaultSpec = () => ({ label: '', value: '' })

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60)
}

export default function CategoryEditor({ categories = [], initial, onSave, onClose }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    slug: '',
    title: '',
    description: '',
    parent_id: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    spec_list: [defaultSpec()],
    position: 0,
    active: true,
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) {
      const specs = Array.isArray(initial.spec_list) && initial.spec_list.length
        ? initial.spec_list.map((s) => ({ label: s.label || '', value: s.value || '' }))
        : [defaultSpec()]
      setForm({
        id: initial.id || '',
        name: initial.name || '',
        slug: initial.slug || '',
        title: initial.title || '',
        description: initial.description || '',
        parent_id: initial.parent_id || '',
        meta_title: initial.meta_title || '',
        meta_description: initial.meta_description || '',
        meta_keywords: initial.meta_keywords || '',
        spec_list: specs,
        position: initial.position ?? 0,
        active: initial.active ?? true,
      })
    }
  }, [initial])

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => {
      const next = { ...p, [key]: val }
      if (key === 'name' && !initial) next.slug = slugify(val)
      return next
    })
  }

  const setSpec = (i, key) => (e) => {
    setForm((p) => {
      const list = [...p.spec_list]
      list[i] = { ...list[i], [key]: e.target.value }
      return { ...p, spec_list: list }
    })
  }

  const addSpec = () => setForm((p) => ({ ...p, spec_list: [...p.spec_list, defaultSpec()] }))
  const removeSpec = (i) =>
    setForm((p) => ({ ...p, spec_list: p.spec_list.filter((_, j) => j !== i) }))

  const parentOptions = categories.filter((c) => c.id !== form.id)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Name and slug are required')
      return
    }
    setBusy(true)
    const specs = form.spec_list.filter((s) => s.label.trim())
    await onSave({ ...form, spec_list: specs })
    setBusy(false)
  }

  return (
    <form className="admin-editor" onSubmit={onSubmit}>
      <div className="admin-editor__header">
        <h3>{initial ? 'Edit category' : 'New category'}</h3>
        <button type="button" className="admin-link" onClick={onClose}>
          Close
        </button>
      </div>

      {error && (
        <p className="admin-banner admin-banner--error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-editor__grid admin-editor__grid--2">
        <label>
          <span>Name *</span>
          <input value={form.name} onChange={set('name')} required />
        </label>
        <label>
          <span>Slug *</span>
          <input value={form.slug} onChange={set('slug')} required />
        </label>
        <label>
          <span>Parent category</span>
          <select value={form.parent_id} onChange={set('parent_id')}>
            <option value="">None (top-level)</option>
            {parentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Position</span>
          <input type="number" value={form.position} onChange={set('position')} />
        </label>
      </div>

      <label className="admin-editor__span">
        <span>Title (SEO)</span>
        <input value={form.title} onChange={set('title')} placeholder="Category page title" />
      </label>

      <label className="admin-editor__span">
        <span>Description</span>
        <textarea rows={2} value={form.description} onChange={set('description')} />
      </label>

      <div className="admin-editor__grid admin-editor__grid--3">
        <label>
          <span>Meta title</span>
          <input value={form.meta_title} onChange={set('meta_title')} />
        </label>
        <label>
          <span>Meta description</span>
          <input value={form.meta_description} onChange={set('meta_description')} />
        </label>
        <label>
          <span>Meta keywords</span>
          <input value={form.meta_keywords} onChange={set('meta_keywords')} />
        </label>
      </div>

      <div className="admin-editor__span">
        <p className="admin-editor__section-label">Specifications</p>
        {form.spec_list.map((s, i) => (
          <div key={i} className="admin-editor__row">
            <input
              className="admin-editor__kv-input"
              placeholder="Label"
              value={s.label}
              onChange={setSpec(i, 'label')}
            />
            <input
              className="admin-editor__kv-input"
              placeholder="Value"
              value={s.value}
              onChange={setSpec(i, 'value')}
            />
            <button type="button" className="admin-link" onClick={() => removeSpec(i)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="admin-link" onClick={addSpec}>
          + Add specification
        </button>
      </div>

      <label className="admin-editor__inline">
        <input type="checkbox" checked={form.active} onChange={set('active')} />
        <span>Active</span>
      </label>

      <button type="submit" className="admin-btn admin-btn--full" disabled={busy}>
        {busy ? 'Saving…' : initial ? 'Save category' : 'Create category'}
      </button>
    </form>
  )
}
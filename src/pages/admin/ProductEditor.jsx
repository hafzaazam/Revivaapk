import { useEffect, useRef, useState } from 'react'
import { uploadProductMedia } from '../../lib/adminApi'

const newSpec = () => ({ label: '', value: '' })
const newVariation = (i) => ({ id: null, size: '', price: '', sale_price: '', stock: '-1', position: (i + 1) * 10 })
const newMediaEntry = (f) => ({
  id: null,
  kind: f.type?.startsWith('video') ? 'video' : 'image',
  url: null,
  objectUrl: URL.createObjectURL(f),
  file: f,
  alt: '',
  label: '',
  poster_url: '',
})

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60)
}

function MediaThumb({ item, onRemove }) {
  const src = item.url || item.objectUrl
  return (
    <div className="admin-product__media-thumb">
      {item.kind === 'video' ? (
        <div className="admin-product__media-thumb-video">Video</div>
      ) : (
        <img src={src} alt={item.alt || ''} />
      )}
      <button type="button" className="admin-link" onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}

export default function ProductEditor({ categories = [], initial, onSave, onClose }) {
  const fileRef = useRef(null)
  const [form, setForm] = useState(() => blankForm(initial))
  const [specs, setSpecs] = useState(() => (Array.isArray(initial?.spec_list) ? initial.spec_list : []))
  const [variations, setVariations] = useState(() => (initial?.variations?.length ? initial.variations : []))
  const [mediaList, setMediaList] = useState(() => (initial?.media || []).map((m) => ({ ...m })))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function blankForm(src) {
    return {
      id: src?.id || '',
      name: src?.name || '',
      slug: src?.slug || '',
      subtitle: src?.subtitle || '',
      description: src?.description || '',
      image_url: src?.image_url || '',
      unit_price: src?.unit_price ?? '',
      sale_price: src?.sale_price ?? '',
      stock: src?.stock ?? '100',
      min_qty: src?.min_qty ?? 1,
      max_qty: src?.max_qty ?? 12,
      category_id: src?.category_id || '',
      featured: src?.featured ?? false,
      is_new: src?.is_new ?? false,
      best_seller: src?.best_seller ?? false,
      draft: src?.draft ?? false,
      active: src?.active === undefined ? true : src?.active,
      low_stock_threshold: src?.low_stock_threshold ?? 10,
      sort_order: src?.sort_order ?? 0,
      video_url: src?.video_url || '',
      meta_title: src?.meta_title || '',
      meta_description: src?.meta_description || '',
      meta_keywords: src?.meta_keywords || '',
    }
  }

  useEffect(() => {
    setForm(blankForm(initial))
    setSpecs(Array.isArray(initial?.spec_list) ? initial.spec_list : [])
    setVariations(initial?.variations?.length ? initial.variations : [])
    setMediaList((initial?.media || []).map((m) => ({ ...m })))
    setError('')
  }, [initial])

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => {
      const next = { ...p, [key]: val }
      if (key === 'name' && !initial) next.slug = slugify(val)
      return next
    })
  }

  const setSpec = (i, key) => (e) =>
    setSpecs((p) => {
      const next = [...p]
      next[i] = { ...next[i], [key]: e.target.value }
      return next
    })
  const addSpec = () => setSpecs((p) => [...p, newSpec()])
  const removeSpec = (i) => setSpecs((p) => p.filter((_, j) => j !== i))

  const setVar = (i, key) => (e) =>
    setVariations((p) => {
      const next = [...p]
      next[i] = { ...next[i], [key]: e.target.value }
      return next
    })
  const addVar = () => setVariations((p) => [...p, newVariation(p.length)])
  const removeVar = (i) => setVariations((p) => p.filter((_, j) => j !== i))

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    setMediaList((p) => [...p, ...files.map(newMediaEntry)])
    if (fileRef.current) fileRef.current.value = ''
  }
  const removeMedia = (i) => setMediaList((p) => p.filter((_, j) => j !== i))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Product name is required')
      return
    }
    setBusy(true)
    try {
      const id = form.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const uploadedMedia = []
      for (const m of mediaList) {
        if (m.url) {
          uploadedMedia.push({
            id: m.id || undefined,
            kind: m.kind,
            url: m.url,
            alt: m.alt,
            label: m.label,
            poster_url: m.poster_url,
            position: m.position ?? 0,
          })
        } else if (m.file) {
          const { data, error: upErr } = await uploadProductMedia(m.file, id)
          if (upErr) throw upErr
          uploadedMedia.push({
            id: m.id || undefined,
            kind: m.kind,
            url: data.publicUrl,
            alt: m.alt,
            label: m.label,
            poster_url: m.poster_url,
            position: m.position ?? 0,
          })
        }
      }
      const firstImageUrl = uploadedMedia.find((m) => m.kind === 'image')?.url || ''
      await onSave({
        product: { ...form, id, image_url: form.image_url || firstImageUrl },
        variations: variations.map((v, i) => ({ ...v, id: v.id || undefined, position: v.position ?? (i + 1) * 10 })),
        media: uploadedMedia,
      })
    } catch (err) {
      setError(err?.message || 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-editor" onSubmit={onSubmit}>
      <div className="admin-editor__header">
        <h3>{initial ? 'Edit product' : 'New product'}</h3>
        <button type="button" className="admin-link" onClick={onClose}>
          Close
        </button>
      </div>

      {error && (
        <p className="admin-banner admin-banner--error" role="alert">
          {error}
        </p>
      )}

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">Basic</p>
        <div className="admin-editor__grid admin-editor__grid--2">
          <label>
            <span>Name *</span>
            <input value={form.name} onChange={set('name')} required />
          </label>
          <label>
            <span>Slug</span>
            <input value={form.slug} onChange={set('slug')} />
          </label>
        </div>
        <label className="admin-editor__span">
          <span>Category</span>
          <select value={form.category_id} onChange={set('category_id')}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_id ? '↳ ' : ''}
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-editor__span">
          <span>Subtitle</span>
          <input value={form.subtitle} onChange={set('subtitle')} />
        </label>
        <label className="admin-editor__span">
          <span>Description</span>
          <textarea rows={3} value={form.description} onChange={set('description')} />
        </label>
      </section>

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">Pricing &amp; stock</p>
        <div className="admin-editor__grid admin-editor__grid--4">
          <label>
            <span>Price (PKR) *</span>
            <input type="number" min="0" value={form.unit_price} onChange={set('unit_price')} required />
          </label>
          <label>
            <span>Sale price</span>
            <input type="number" min="0" value={form.sale_price} onChange={set('sale_price')} />
          </label>
          <label>
            <span>Stock (-1 = unlimited)</span>
            <input type="number" value={form.stock} onChange={set('stock')} />
          </label>
          <label>
            <span>Low-stock threshold</span>
            <input type="number" min="0" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} />
          </label>
        </div>
        <div className="admin-editor__grid admin-editor__grid--3">
          <label>
            <span>Min qty</span>
            <input type="number" min="1" value={form.min_qty} onChange={set('min_qty')} />
          </label>
          <label>
            <span>Max qty</span>
            <input type="number" min="1" value={form.max_qty} onChange={set('max_qty')} />
          </label>
          <label>
            <span>Sort order</span>
            <input type="number" value={form.sort_order} onChange={set('sort_order')} />
          </label>
        </div>
      </section>

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">Visibility &amp; tags</p>
        <div className="admin-editor__checks">
          {[
            ['active', 'Active'],
            ['draft', 'Draft'],
            ['featured', 'Featured'],
            ['is_new', 'New'],
            ['best_seller', 'Best seller'],
          ].map(([key, label]) => (
            <label key={key} className="admin-editor__inline">
              <input type="checkbox" checked={Boolean(form[key])} onChange={set(key)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">SEO &amp; meta</p>
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
        <label className="admin-editor__span">
          <span>Video URL</span>
          <input value={form.video_url} onChange={set('video_url')} placeholder="YouTube / direct video URL" />
        </label>
      </section>

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">Specifications</p>
        {specs.map((s, i) => (
          <div key={i} className="admin-editor__row">
            <input className="admin-editor__kv-input" placeholder="Label" value={s.label || ''} onChange={setSpec(i, 'label')} />
            <input className="admin-editor__kv-input" placeholder="Value" value={s.value || ''} onChange={setSpec(i, 'value')} />
            <button type="button" className="admin-link" onClick={() => removeSpec(i)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="admin-link" onClick={addSpec}>
          + Add specification
        </button>
      </section>

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">Variations</p>
        {variations.map((v, i) => (
          <div key={v.id || i} className="admin-editor__var-row">
            <input className="admin-editor__var-input" placeholder="Size (e.g. 150 ml)" value={v.size || ''} onChange={setVar(i, 'size')} />
            <input className="admin-editor__var-input" type="number" min="0" placeholder="Price" value={v.price ?? ''} onChange={setVar(i, 'price')} />
            <input className="admin-editor__var-input" type="number" min="0" placeholder="Sale price" value={v.sale_price ?? ''} onChange={setVar(i, 'sale_price')} />
            <input className="admin-editor__var-input" type="number" placeholder="Stock (-1=∞)" value={v.stock ?? ''} onChange={setVar(i, 'stock')} />
            <button type="button" className="admin-link" onClick={() => removeVar(i)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="admin-link" onClick={addVar}>
          + Add variation
        </button>
      </section>

      <section className="admin-editor__section">
        <p className="admin-editor__section-label">Media</p>
        <div className="admin-product__media-list">
          {mediaList.map((m, i) => (
            <MediaThumb key={m.id || i} item={m} onRemove={() => removeMedia(i)} />
          ))}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="admin-editor__file-input"
          onChange={handleFiles}
        />
        <button type="button" className="admin-btn" onClick={() => fileRef.current?.click()}>
          Upload files
        </button>
      </section>

      <button type="submit" className="admin-btn admin-btn--full" disabled={busy}>
        {busy ? 'Saving…' : initial ? 'Save product' : 'Create product'}
      </button>
    </form>
  )
}
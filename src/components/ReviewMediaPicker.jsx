import { useRef, useState } from 'react'
import { Plus, Upload, Link2, Loader2, X } from 'lucide-react'
import { uploadReviewMedia, classifyMediaUrl } from '../lib/reviews'
import ReviewMediaItem from './ReviewMediaItem'
import './ReviewMediaPicker.css'

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function ReviewMediaPicker({ value = [], onChange, disabled = false, max = 6 }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState('')
  const [urlRow, setUrlRow] = useState(null)

  const add = (item) => {
    if (!disabled && onChange) onChange([...value, item])
  }
  const remove = (id) => {
    if (!disabled && onChange) onChange(value.filter((m) => m.id !== id))
  }

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    for (const file of files.slice(0, max - value.length)) {
      setBusy(file.name)
      const { data, error } = await uploadReviewMedia(file)
      if (error) {
        setBusy('')
        continue
      }
      add({
        id: uid(),
        kind: data.kind,
        url: data.url,
        path: data.path,
        posterUrl: data.posterUrl || null,
        position: value.length + 1,
      })
    }
    setBusy('')
  }

  const addUrl = () => {
    const u = (urlRow.url || '').trim()
    if (!u) return
    add({
      id: uid(),
      kind: urlRow.kind || classifyMediaUrl(u) || 'image',
      url: u,
      path: null,
      posterUrl: null,
      position: value.length + 1,
    })
    setUrlRow({ open: true, url: '', kind: urlRow.kind || 'video' })
  }

  return (
    <div className={`rmedia-picker ${disabled ? 'rmedia-picker--disabled' : ''}`}>
      <div className="rmedia-picker__grid">
        {value.map((item) => (
          <div className="rmedia-picker__item" key={item.id}>
            <ReviewMediaItem item={item} />
            <button
              type="button"
              className="rmedia-picker__remove"
              aria-label="Remove media"
              onClick={() => remove(item.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <>
            {urlRow?.open ? (
              <div className="rmedia-picker__url">
                <input
                  value={urlRow.url}
                  onChange={(e) => setUrlRow({ ...urlRow, url: e.target.value })}
                  placeholder="Paste image or video URL"
                  aria-label="Media URL"
                />
                <div className="rmedia-picker__url-actions">
                  <button type="button" disabled={!urlRow.url.trim()} onClick={addUrl}>
                    Add
                  </button>
                  <button type="button" onClick={() => setUrlRow(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="rmedia-picker__tile"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                >
                  {busy ? <Loader2 size={18} className="rmedia-picker__spin" /> : <Upload size={18} />}
                  <span>{busy ? 'Uploading…' : 'Upload'}</span>
                </button>
                <button
                  type="button"
                  className="rmedia-picker__tile"
                  onClick={() => setUrlRow({ open: true, url: '', kind: 'video' })}
                >
                  <Link2 size={18} />
                  <span>URL</span>
                </button>
              </>
            )}
          </>
        )}
      </div>

      {urlRow?.open && value.length < max && (
        <div className="rmedia-picker__hint">
          <label>
            Kinds
            <select
              value={urlRow.kind}
              onChange={(e) => setUrlRow({ ...urlRow, kind: e.target.value })}
            >
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </label>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={onFiles}
      />
      <p className="rmedia-picker__note">
        <Plus size={12} /> Images and videos (up to {max}). Owned uploads or paste a URL.
      </p>
    </div>
  )
}
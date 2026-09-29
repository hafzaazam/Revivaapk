import { Star } from 'lucide-react'
import './Stars.css'

export default function Stars({ value = 0, size = 14 }) {
  const rounded = Math.round(value)
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.6}
          className={`stars__star ${i <= rounded ? 'stars__star--on' : ''}`}
          fill={i <= rounded ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

export function StarPicker({ value, onChange }) {
  return (
    <div className="stars stars--picker" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i === value}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          className={`stars__star ${i <= value ? 'stars__star--on' : ''}`}
          onClick={() => onChange(i)}
        >
          <Star size={26} strokeWidth={1.4} fill={i <= value ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
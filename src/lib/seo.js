const TITLE_SUFFIX = ' · revivaa'

function set(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setDocMeta({ title, description, keywords } = {}) {
  const prev = document.title
  if (title) document.title = title.endsWith(TITLE_SUFFIX) ? title : title + TITLE_SUFFIX
  else document.title = 'revivaa'
  if (description) set('description', description)
  if (keywords) set('keywords', keywords)

  return () => {
    document.title = prev
  }
}
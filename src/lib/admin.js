/** Admin identity used for client checks + signup guidance */
export const ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL || 'Admin@gmail.com'
).trim().toLowerCase()

export function emailIsAdmin(email) {
  if (!email) return false
  return String(email).trim().toLowerCase() === ADMIN_EMAIL
}

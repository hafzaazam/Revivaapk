import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getCart,
  subscribeCart,
  addItem as cartAdd,
  setQty as cartSetQty,
  removeItem as cartRemove,
  clearCart as cartClear,
  cartCount as countOf,
  cartTotal as totalOf,
} from './cart'
import CartDrawer from '../components/CartDrawer'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(getCart)
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeCart((all) => setItems([...all])), [])

  const add = useCallback((item) => {
    cartAdd(item)
  }, [])

  const setQty = useCallback((key, qty) => cartSetQty(key, qty), [])
  const remove = useCallback((key) => cartRemove(key), [])
  const clear = useCallback(() => cartClear(), [])

  const value = useMemo(
    () => ({
      items,
      count: countOf(),
      subtotal: totalOf(),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, open, add, setQty, remove, clear],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
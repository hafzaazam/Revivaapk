import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

/* Landing is the critical path and stays eager; everything else is a separate
   chunk so the first paint never parses the admin dashboard or the blog. */
import HomePage from './pages/HomePage'

const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const TrackPage = lazy(() => import('./pages/TrackPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const IngredientsPage = lazy(() => import('./pages/IngredientsPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'))
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const RequireAdmin = lazy(() => import('./auth/RequireAdmin'))

/**
 * Blocks navigation on the lazy route chunk. Keeps the previous page mounted
 * (no blank flash) and announces the pending state to assistive tech.
 */
function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="route-fallback__dot" />
      <span className="sr-only">Loading page</span>
    </div>
  )
}

function ScrollOnNavigate() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return undefined
    }

    const id = hash.slice(1)
    // Anchor targets arrive with the lazy route chunk, so poll a short window
    // instead of scrolling once and losing the target.
    let attempts = 0
    let timer

    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        // 'auto' rather than 'smooth': `html { scroll-behavior: smooth }`
        // already handles easing, and a second smooth pass fights it.
        el.scrollIntoView({ behavior: 'auto', block: 'start' })
        return
      }
      attempts += 1
      if (attempts < 40) {
        timer = window.setTimeout(tryScroll, 50)
      }
    }

    tryScroll()
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <>
      <ScrollOnNavigate />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/product" element={<Navigate to="/product/revivaa-oil-150" replace />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/returns" element={<Navigate to="/refund-policy" replace />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/shipping" element={<Navigate to="/shipping-policy" replace />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

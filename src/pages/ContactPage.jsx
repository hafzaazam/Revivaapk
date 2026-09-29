import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Send,
  Check,
  ChevronDown,
  ArrowRight,
} from 'lucide-react'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { PAGE_SEO, SITE_DOMAIN, ORGANIZATION_SCHEMA } from '../lib/seoConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import './ContactPage.css'

function InstagramIcon({ size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const EASE = [0.22, 1, 0.36, 1]

const FAQS = [
  {
    q: 'How long does delivery take across Pakistan?',
    a: 'Orders are dispatched within 24 hours. Standard delivery via express couriers takes 2–4 business days across major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta) and surrounding regions.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes! Cash on Delivery is available for all orders nationwide with zero advance payment needed.',
  },
  {
    q: 'How can I track my parcel?',
    a: 'Once your order is confirmed, you will receive a tracking ID (e.g. RVN-XXXXXX). You can paste this code directly into our Track Order page or ask our WhatsApp care team for live parcel updates.',
  },
  {
    q: 'Is Revivaa suitable for chemically treated or colored hair?',
    a: 'Absolutely. Revivaa is 100% plant-powered and free from parabens, mineral oils, sulfates, and synthetic chemicals, making it gentle and restorative for colored, keratin-treated, or bleached hair.',
  },
]

export default function ContactPage() {
  const reduced = usePrefersReducedMotion()
  const [form, setForm] = useState({ name: '', email: '', phone: '', orderId: '', message: '' })
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    const prev = document.title
    document.title = 'Contact & Concierge · Revivaa Care'
    return () => {
      document.title = prev
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    window.setTimeout(() => {
      setForm({ name: '', email: '', phone: '', orderId: '', message: '' })
    }, 2000)
  }

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: PAGE_SEO.contact.h1,
    description: PAGE_SEO.contact.description,
    url: `${SITE_DOMAIN}/contact`,
    mainEntity: ORGANIZATION_SCHEMA,
  }

  return (
    <div className="app contact-app">
      <SEO
        title={PAGE_SEO.contact.title}
        description={PAGE_SEO.contact.description}
        canonical={PAGE_SEO.contact.canonical}
        keywords={PAGE_SEO.contact.keywords}
        ogType={PAGE_SEO.contact.ogType}
        structuredData={contactSchema}
        schemaId="contact-page-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" tabIndex={-1} className="contact-page">
        <Breadcrumbs items={[{ label: 'Contact', href: '/contact' }]} />

        {/* ——— Hero with faded map background ——— */}
        <section className="contact-hero">
          <div className="contact-hero__bg" aria-hidden>
            <div className="contact-hero__bg-image" />
            <div className="contact-hero__bg-grid" />
            <div className="contact-hero__bg-glow" />
            <div className="contact-hero__bg-vignette" />
            <div className="contact-hero__bg-grain" />
          </div>

          <div className="container contact-hero__inner">
            <motion.div
              className="contact-hero__content"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE }}
            >
              <span className="section-label">
                Customer Concierge
              </span>
              <h1 className="contact-hero__title">
                Contact Revivaa
                <em> · Concierge &amp; Customer Care</em>
              </h1>
              <p className="contact-hero__lead">
                Have a question about your order, tracking status, or want personalized hair advice?
                Reach out to our care team directly.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ——— Direct Contact Channels Grid ——— */}
        <section className="contact-channels container">
          <div className="contact-channels__grid">
            <a
              href="https://wa.me/923440888847"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card contact-card--wa clay"
            >
              <div className="contact-card__icon-wrap">
                <MessageCircle size={26} />
              </div>
              <span className="contact-card__type">Instant Live Support</span>
              <h3>WhatsApp Chat</h3>
              <p className="contact-card__detail">+92 344 0888847</p>
              <p className="contact-card__note">Fastest response for order queries & hair routine advice.</p>
              <span className="contact-card__action">
                Open WhatsApp <ArrowRight size={15} />
              </span>
            </a>

            <a
              href="https://www.instagram.com/revivaaa_care?stkn=NDRpbG1tbTR6eDZm"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card contact-card--ig clay"
            >
              <div className="contact-card__icon-wrap">
                <InstagramIcon size={26} />
              </div>
              <span className="contact-card__type">Social Community</span>
              <h3>Instagram</h3>
              <p className="contact-card__detail">@revivaaa_care</p>
              <p className="contact-card__note">Follow for hair transformations, reviews, and updates.</p>
              <span className="contact-card__action">
                Visit Profile <ArrowRight size={15} />
              </span>
            </a>

            <div className="contact-card clay">
              <div className="contact-card__icon-wrap">
                <Mail size={26} />
              </div>
              <span className="contact-card__type">Direct Email</span>
              <h3>Email Concierge</h3>
              <p className="contact-card__detail">hello@revivaa.com</p>
              <p className="contact-card__note">For partnerships, corporate orders, and general questions.</p>
              <a href="mailto:hello@revivaa.com" className="contact-card__action">
                Send Email <ArrowRight size={15} />
              </a>
            </div>

            <div className="contact-card clay">
              <div className="contact-card__icon-wrap">
                <MapPin size={26} />
              </div>
              <span className="contact-card__type">Nationwide Logistics</span>
              <h3>Shipping Coverage</h3>
              <p className="contact-card__detail">All Pakistan Cities</p>
              <p className="contact-card__note">Cash on Delivery & express courier tracking everywhere.</p>
              <div className="contact-card__action">
                <Clock size={15} /> 2–4 Business Days
              </div>
            </div>
          </div>
        </section>

        {/* ——— Inquiry Form & FAQ 2-Column Section ——— */}
        <section className="contact-split container">
          <div className="contact-split__grid">
            {/* Left: Message Form */}
            <div className="contact-form-wrap clay">
              <h2>Send Us a Message</h2>
              <p className="contact-form__lead">
                Fill out the form below and our care team will get back to you within 24 hours.
              </p>

              {sent ? (
                <div className="contact-form__success">
                  <div className="contact-form__success-icon">
                    <Check size={28} />
                  </div>
                  <h3>Message Received!</h3>
                  <p>Thank you for reaching out. We will respond promptly.</p>
                  <button
                    type="button"
                    className="clay-btn contact-form__new-btn"
                    onClick={() => setSent(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="contact-form">
                  <div className="contact-form__row">
                    <label className="contact-form__field">
                      <span>Your Name *</span>
                      <input
                        required
                        placeholder="e.g. Fatima Ali"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </label>

                    <label className="contact-form__field">
                      <span>WhatsApp / Phone *</span>
                      <input
                        required
                        type="tel"
                        placeholder="03XXXXXXXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </label>
                  </div>

                  <div className="contact-form__row">
                    <label className="contact-form__field">
                      <span>Email Address</span>
                      <input
                        type="email"
                        placeholder="fatima@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </label>

                    <label className="contact-form__field">
                      <span>Tracking / Order ID (Optional)</span>
                      <input
                        placeholder="e.g. RVN-1A2B3C4D"
                        value={form.orderId}
                        onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                      />
                    </label>
                  </div>

                  <label className="contact-form__field">
                    <span>Your Message *</span>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can we help you today?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </label>

                  <button type="submit" className="clay-btn contact-form__submit">
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Right: FAQs */}
            <div className="contact-faq-wrap">
              <h2>Frequently Asked Questions</h2>
              <p className="contact-faq__lead">
                Quick answers to common questions about delivery, orders, and products.
              </p>

              <div className="contact-faqs">
                {FAQS.map((faq, i) => {
                  const isOpen = openFaq === i
                  return (
                    <div
                      key={i}
                      className={`contact-faq-item clay ${isOpen ? 'is-open' : ''}`}
                    >
                      <button
                        type="button"
                        className="contact-faq-item__btn"
                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={18} className="contact-faq-item__arrow" />
                      </button>
                      {isOpen && (
                        <div className="contact-faq-item__ans">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
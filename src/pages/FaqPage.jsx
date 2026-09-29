import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, MessageCircle, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PAGE_SEO } from '../lib/seoConfig'
import './FaqPage.css'

const FAQ_CATEGORIES = [
  {
    id: 'orders',
    name: 'Orders & Cash on Delivery',
    icon: Truck,
    questions: [
      {
        q: 'Do you offer Cash on Delivery (COD) across Pakistan?',
        a: 'Yes, we provide Cash on Delivery (COD) to all major cities, towns, and regions throughout Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Orders are dispatched within 24 hours. Delivery typically takes 2 to 4 business days depending on your destination city. You will receive an SMS and tracking code to follow your parcel.',
      },
      {
        q: 'How can I track my Revivaa order?',
        a: 'You can track your order anytime on our dedicated Order Tracking page (/track) using your Order ID or phone number, or by contacting our WhatsApp team at +92 344 0888847.',
      },
    ],
  },
  {
    id: 'product',
    name: 'Ingredients & Formula',
    icon: Sparkles,
    questions: [
      {
        q: 'What ingredients are in Revivaa Botanical Hair Oil?',
        a: 'Revivaa is formulated with 13 pure cold-pressed botanicals: Amla Oil, Amla Powder, Retha Oil, Sikakai Oil, Dhaniya Oil, Rosemary, Lavender, Coconut Oil, Onion Extract, Aloe Vera, Alisi (Flaxseed) Oil, Badam Roghan (Sweet Almond), and Vitamin E.',
      },
      {
        q: 'Is Revivaa free from mineral oils, parabens, and silicones?',
        a: 'Yes, absolutely 100%. We never use liquid paraffin, mineral oil, parabens, silicones, sulfates, or artificial fragrances. Our formula is pure, breathable, and plant-derived.',
      },
      {
        q: 'What size is the signature bottle?',
        a: 'Our signature amber glass bottle contains 150ml of concentrated botanical elixir, providing approximately 2 to 3 months of regular application.',
      },
    ],
  },
  {
    id: 'routine',
    name: 'Routine & Hair Types',
    icon: ShieldCheck,
    questions: [
      {
        q: 'How often should I apply Revivaa Hair Oil?',
        a: 'We recommend applying 2 to 3 times per week. Warm 5–8 drops in your palms, massage gently into your scalp for 3–5 minutes, and leave in for at least 45 minutes or overnight before washing.',
      },
      {
        q: 'Is it suitable for chemically treated or color-treated hair?',
        a: 'Yes. Because Revivaa is 100% free of sulfates and mineral oils, it is exceptionally gentle and safe for bleached, colored, keratin-treated, and sensitive scalps.',
      },
      {
        q: 'Will it leave my hair greasy or heavy?',
        a: 'No. Our cold-pressed botanical carrier oils (such as sweet almond and flaxseed) have a lightweight molecular structure that absorbs into the scalp and strands without sticky residue.',
      },
    ],
  },
]

export default function FaqPage() {
  const [openItem, setOpenItem] = useState('orders-0')

  // Flatten all questions for FAQPage schema
  const allFaqs = FAQ_CATEGORIES.flatMap((cat) => cat.questions)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }

  return (
    <div className="app">
      <SEO
        title={PAGE_SEO.faq.title}
        description={PAGE_SEO.faq.description}
        canonical={PAGE_SEO.faq.canonical}
        keywords={PAGE_SEO.faq.keywords}
        ogType={PAGE_SEO.faq.ogType}
        structuredData={faqSchema}
        schemaId="faq-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" className="faq-page" tabIndex={-1}>
        <Breadcrumbs items={[{ label: 'FAQ', href: '/faq' }]} />

        <section className="faq-page__hero container">
          <p className="section-label">Questions &amp; Answers</p>
          <h1 className="section-title faq-page__title">
            Frequently Asked Questions
            <em> · Revivaa Hair Care &amp; Delivery</em>
          </h1>
          <p className="section-lead faq-page__lead">
            Everything you need to know about our 13-botanical formula, application ritual, nationwide Cash on Delivery in Pakistan, and order tracking.
          </p>
        </section>

        <section className="faq-page__content container" aria-label="FAQ Sections">
          <div className="faq-page__categories">
            {FAQ_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon
              return (
                <div key={cat.id} className="faq-page__group">
                  <div className="faq-page__group-header">
                    <span className="faq-page__group-icon clay-icon">
                      <CatIcon size={18} />
                    </span>
                    <h2>{cat.name}</h2>
                  </div>

                  <div className="faq-page__accordion">
                    {cat.questions.map((faq, index) => {
                      const itemId = `${cat.id}-${index}`
                      const isOpen = openItem === itemId

                      return (
                        <div
                          key={faq.q}
                          className={`faq-page__item ${isOpen ? 'is-open' : ''} clay`}
                        >
                          <button
                            type="button"
                            className="faq-page__trigger"
                            aria-expanded={isOpen}
                            onClick={() => setOpenItem(isOpen ? null : itemId)}
                          >
                            <span className="faq-page__q-text">{faq.q}</span>
                            <span className="faq-page__chevron">
                              <ChevronDown size={18} />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="faq-page__answer">
                              <p>{faq.a}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Concierge Help Box */}
        <section className="faq-page__help container">
          <div className="faq-page__help-box clay-cream">
            <div className="faq-page__help-icon clay-icon">
              <MessageCircle size={24} />
            </div>
            <div className="faq-page__help-text">
              <h3>Still have questions? We’re here to help.</h3>
              <p>Our hair care concierge is available daily on WhatsApp to guide your personalized routine.</p>
            </div>
            <div className="faq-page__help-actions">
              <a
                href="https://wa.me/923440888847"
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn"
              >
                <span>WhatsApp: +92 344 0888847</span>
                <ArrowRight size={16} />
              </a>
              <Link to="/contact" className="clay-btn clay-btn-light">
                <span>Contact Page</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

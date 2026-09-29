import { Link } from 'react-router-dom'
import { Truck, Clock, MapPin, CheckCircle2, MessageCircle, Mail } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PAGE_SEO } from '../lib/seoConfig'
import './LegalPage.css'

export default function ShippingPolicyPage() {
  const seoData = PAGE_SEO.shippingPolicy || {
    title: 'Shipping & Delivery Policy | Revivaa Hair Care Pakistan',
    description: 'Learn about Revivaa shipping timelines, nationwide Cash on Delivery (COD) coverage, parcel tracking, and courier delivery policies across Pakistan.',
    canonical: 'https://revivaabyzaish.com/shipping-policy',
  }

  return (
    <div className="app">
      <SEO
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.canonical}
        ogType="article"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" className="legal-page" tabIndex={-1}>
        <Breadcrumbs items={[{ label: 'Shipping & Delivery Policy', href: '/shipping-policy' }]} />

        <section className="legal-page__hero container">
          <div className="legal-page__badge">
            <Truck size={14} />
            <span>Logistics &amp; Delivery</span>
          </div>
          <h1 className="section-title legal-page__title">
            Shipping &amp; Delivery Policy
            <em> · Nationwide Delivery Directly to Your Doorstep</em>
          </h1>
          <p className="section-lead">
            We deliver Revivaa Botanical Hair Oil to all major cities, towns, and regional destinations across Pakistan with trusted courier partners and seamless Cash on Delivery.
          </p>
          <div className="legal-page__meta">
            <span className="legal-page__meta-item">
              <Clock size={14} /> Last Updated: March 2026
            </span>
            <span className="legal-page__meta-item">
              <MapPin size={14} /> All Pakistan Coverage
            </span>
          </div>
        </section>

        {/* Legal Switcher Tabs */}
        <div className="container">
          <nav className="legal-nav-tabs" aria-label="Legal Navigation">
            <Link to="/refund-policy" className="legal-nav-tab">
              Refund &amp; Returns
            </Link>
            <Link to="/shipping-policy" className="legal-nav-tab is-active">
              Shipping &amp; Delivery
            </Link>
            <Link to="/privacy-policy" className="legal-nav-tab">
              Privacy Policy
            </Link>
            <Link to="/terms" className="legal-nav-tab">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>

        {/* Highlights */}
        <section className="container">
          <div className="legal-highlights">
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Truck size={22} />
              </div>
              <h3>Fast Nationwide Dispatch</h3>
              <p>All confirmed orders are processed and handed over to premier couriers within 12 to 24 hours.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Clock size={22} />
              </div>
              <h3>2 to 4 Business Days</h3>
              <p>Express delivery in major metropolitan hubs (Karachi, Lahore, Islamabad) and 3–5 days elsewhere.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <CheckCircle2 size={22} />
              </div>
              <h3>Cash on Delivery (COD)</h3>
              <p>Pay comfortably at your door when the parcel arrives anywhere in Pakistan.</p>
            </div>
          </div>
        </section>

        {/* Detailed Clauses */}
        <section className="container legal-content-container">
          <article className="legal-article">
            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">1</span>
                <h2 className="legal-section__title">Shipping Coverage &amp; Logistics Partners</h2>
              </div>
              <p>
                Revivaa delivers nationwide throughout Pakistan. Our distribution network covers Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad Capital Territory, Azad Jammu &amp; Kashmir, and Gilgit-Baltistan.
              </p>
              <p>
                We partner with premier domestic logistics and courier services, including <strong>TCS, Leopards Courier, Trax Logistics, and PostEx</strong>, ensuring secure handling of our glass amber bottles.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">2</span>
                <h2 className="legal-section__title">Estimated Delivery Times</h2>
              </div>
              <p>
                Orders are processed and packed Monday through Saturday (excluding national public holidays):
              </p>
              <ul>
                <li><strong>Major Metros (Karachi, Lahore, Islamabad, Rawalpindi):</strong> 2 to 3 business days.</li>
                <li><strong>Other Key Cities (Faisalabad, Multan, Peshawar, Sialkot, Gujranwala, Hyderabad, Quetta):</strong> 3 to 4 business days.</li>
                <li><strong>Regional, Rural, and Remote Areas:</strong> 4 to 6 business days depending on local courier branch routes.</li>
              </ul>
              <div className="legal-callout">
                <strong>Note on High Volume Periods:</strong> During Ramadan, Eid festivals, or national monsoon weather advisories, courier transit may experience slight delays of 24–48 hours.
              </div>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">3</span>
                <h2 className="legal-section__title">Shipping Rates &amp; Free Delivery</h2>
              </div>
              <p>
                Standard courier shipping across Pakistan is PKR 250 per order.
              </p>
              <p>
                We regularly provide <strong>Free Nationwide Shipping</strong> on promotional bundles, multi-bottle orders, or limited-time campaign offers as indicated on the website and checkout page.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">4</span>
                <h2 className="legal-section__title">Order Verification &amp; Cash on Delivery (COD) Protocol</h2>
              </div>
              <p>
                To maintain seamless delivery rates and prevent spurious bookings, first-time orders may receive a quick verification call or WhatsApp confirmation message from our customer care team.
              </p>
              <ul>
                <li>Please ensure your mobile number and shipping address (including house/apartment number, street name, and prominent landmark) are accurate.</li>
                <li>When selecting <strong>Cash on Delivery (COD)</strong>, please ensure someone is available at the address with the exact payment amount ready for the rider.</li>
                <li>As per standard courier industry regulations in Pakistan, parcel inspection prior to payment is subject to individual courier company protocols. If there is any concern about damage after handover, Revivaa immediately covers it under our <Link to="/refund-policy">7-day replacement guarantee</Link>.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">5</span>
                <h2 className="legal-section__title">Tracking Your Order</h2>
              </div>
              <p>
                As soon as your parcel is booked and scanned by the courier, you will receive an SMS and email notification containing your tracking number and live tracking link.
              </p>
              <p>
                You can also track your shipment status at any time by visiting our dedicated <Link to="/track">Order Tracking Page (/track)</Link> or by messaging our WhatsApp support line with your Order ID.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">6</span>
                <h2 className="legal-section__title">Delivery Attempts &amp; Failed Deliveries</h2>
              </div>
              <p>
                The courier will attempt delivery up to 2 to 3 times before returning the parcel to our hub. If you missed a call from the rider:
              </p>
              <ul>
                <li>Please contact the rider or local courier office immediately using the phone number in your delivery SMS.</li>
                <li>Reach out to our WhatsApp concierge at <a href="https://wa.me/923440888847" target="_blank" rel="noreferrer">+92 344 0888847</a> so our logistics coordinator can arrange an immediate re-attempt.</li>
              </ul>
            </div>
          </article>

          {/* Concierge Box */}
          <div className="legal-concierge">
            <div className="legal-concierge__info">
              <div className="legal-concierge__icon">
                <MessageCircle size={26} />
              </div>
              <div>
                <h3>Questions About Delivery to Your Area?</h3>
                <p>Our logistics team is available on WhatsApp to check courier coverage and coordinate special delivery instructions.</p>
              </div>
            </div>
            <div className="legal-concierge__actions">
              <a
                href="https://wa.me/923440888847"
                className="legal-concierge__btn legal-concierge__btn--wa"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp Care
              </a>
              <a
                href="mailto:hello@revivaa.com"
                className="legal-concierge__btn legal-concierge__btn--email"
              >
                <Mail size={16} /> Email Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ShieldCheck, RotateCcw, Clock, AlertCircle, MessageCircle, Mail } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PAGE_SEO } from '../lib/seoConfig'
import './LegalPage.css'

export default function RefundPolicyPage() {
  const seoData = PAGE_SEO.refundPolicy || {
    title: 'Refund & Return Policy | Revivaa Botanical Hair Oil Pakistan',
    description: 'Read the official Revivaa Refund & Return Policy. 7-day transit replacement guarantee, unopened item returns, and Cash on Delivery refund terms across Pakistan.',
    canonical: 'https://revivaabyzaish.com/refund-policy',
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
        <Breadcrumbs items={[{ label: 'Refund & Return Policy', href: '/refund-policy' }]} />

        <section className="legal-page__hero container">
          <div className="legal-page__badge">
            <RotateCcw size={14} />
            <span>Customer Protection</span>
          </div>
          <h1 className="section-title legal-page__title">
            Refund &amp; Return Policy
            <em> · Transparent, Fair &amp; Customer-Centric Care</em>
          </h1>
          <p className="section-lead">
            At Revivaa, we take pride in the artisanal quality of our 13-botanical cold-pressed formula. If your order arrives damaged or unsealed, we are committed to making it right immediately.
          </p>
          <div className="legal-page__meta">
            <span className="legal-page__meta-item">
              <Clock size={14} /> Last Updated: March 2026
            </span>
            <span className="legal-page__meta-item">
              <ShieldCheck size={14} /> Revivaa by Zaish Quality Guarantee
            </span>
          </div>
        </section>

        {/* Legal Switcher Tabs */}
        <div className="container">
          <nav className="legal-nav-tabs" aria-label="Legal Navigation">
            <Link to="/refund-policy" className="legal-nav-tab is-active">
              Refund &amp; Returns
            </Link>
            <Link to="/shipping-policy" className="legal-nav-tab">
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

        {/* Key Highlights */}
        <section className="container">
          <div className="legal-highlights">
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <ShieldCheck size={22} />
              </div>
              <h3>Transit Damage Guarantee</h3>
              <p>Free, immediate replacement if your bottle arrives leaked or damaged during courier transit.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Clock size={22} />
              </div>
              <h3>7-Day Return Window</h3>
              <p>Report transit damage or return unopened bottles with tamper seals intact within 7 calendar days.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <RotateCcw size={22} />
              </div>
              <h3>COD Refund Methods</h3>
              <p>Cash on Delivery refunds are disbursed directly via Bank Transfer, JazzCash, or EasyPaisa.</p>
            </div>
          </div>
        </section>

        {/* Detailed Clauses */}
        <section className="container legal-content-container">
          <article className="legal-article">
            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">1</span>
                <h2 className="legal-section__title">Damaged, Defective, or Leaking Parcels</h2>
              </div>
              <p>
                Our signature 150ml botanical hair oil is packaged in secure amber glass bottles engineered to protect cold-pressed nutrients. Although every parcel is padded with multi-layer protective materials, transit mishandling can occasionally occur.
              </p>
              <p>
                If your parcel arrives with visible leakage, broken glass, or defective dropper/seal:
              </p>
              <ul>
                <li><strong>Notify us within 48 hours</strong> of parcel delivery via WhatsApp at <a href="https://wa.me/923440888847" target="_blank" rel="noreferrer">+92 344 0888847</a> or email at <a href="mailto:hello@revivaa.com">hello@revivaa.com</a>.</li>
                <li>Please share a clear photograph or unboxing video highlighting the order number and damaged bottle.</li>
                <li>Upon quick verification, we will dispatch a <strong>brand-new replacement bottle at zero additional shipping cost</strong> within 24 business hours.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">2</span>
                <h2 className="legal-section__title">Hygiene &amp; Cosmetic Safety Policy</h2>
              </div>
              <p>
                Revivaa Botanical Hair Oil is a personal wellness cosmetic formula applied directly to the human scalp and hair. Under Pakistan consumer hygiene protocols and international cosmetic safety standards:
              </p>
              <div className="legal-callout legal-callout--alert">
                <AlertCircle size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                <strong>Important Notice:</strong> Once the security seal is broken, opened, or the oil is partially used, the item is <strong>non-returnable</strong> for sanitary and safety reasons.
              </div>
              <p>
                We cannot accept returns on bottles where the seal has been removed or tampered with, unless the item arrived defective from the manufacturing batch.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">3</span>
                <h2 className="legal-section__title">Unopened Returns (Change of Mind)</h2>
              </div>
              <p>
                If you change your mind and wish to return an unopened order:
              </p>
              <ul>
                <li>The item must be in its original condition: unused, unopened, with all original packaging, amber bottle seal intact, and accompanied by the original invoice.</li>
                <li>You must initiate the return request within <strong>7 calendar days</strong> from the delivery date.</li>
                <li>Return courier shipping charges (PKR 250–350 standard) are the responsibility of the customer for change-of-mind returns.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">4</span>
                <h2 className="legal-section__title">Refund Disbursement Process</h2>
              </div>
              <p>
                Once your returned parcel is received at our Karachi distribution hub and inspected:
              </p>
              <ol>
                <li>We will notify you via WhatsApp or SMS regarding the approval or rejection of your refund.</li>
                <li><strong>For Cash on Delivery (COD) orders:</strong> Refunds are transferred directly to your designated Pakistani bank account (IBAN), JazzCash, or EasyPaisa wallet.</li>
                <li><strong>For Prepaid / Bank Transfer orders:</strong> Refunds are credited back to the original funding account.</li>
                <li>Processing typically takes <strong>3 to 5 business days</strong> from the date the return is inspected and approved.</li>
              </ol>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">5</span>
                <h2 className="legal-section__title">Order Cancellation Policy</h2>
              </div>
              <p>
                You may cancel your order free of charge at any point <strong>before dispatch</strong>. We typically dispatch parcels within 12 to 24 hours of confirmation. To cancel, please message our WhatsApp concierge at <a href="https://wa.me/923440888847" target="_blank" rel="noreferrer">+92 344 0888847</a> with your Order ID.
              </p>
              <p>
                Once an order has been picked up by our courier partners (TCS / Leopards / Trax), it cannot be cancelled mid-transit and must follow the standard return procedure.
              </p>
            </div>
          </article>

          {/* Concierge Box */}
          <div className="legal-concierge">
            <div className="legal-concierge__info">
              <div className="legal-concierge__icon">
                <MessageCircle size={26} />
              </div>
              <div>
                <h3>Need Assistance With a Return?</h3>
                <p>Our dedicated care concierge is available 7 days a week to review your case and ensure a seamless resolution.</p>
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

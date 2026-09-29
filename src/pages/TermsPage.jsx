import { Link } from 'react-router-dom'
import { FileText, Scale, AlertTriangle, Copyright, MessageCircle, Mail, Clock, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PAGE_SEO } from '../lib/seoConfig'
import './LegalPage.css'

export default function TermsPage() {
  const seoData = PAGE_SEO.terms || {
    title: 'Terms & Conditions | Revivaa Botanical Hair Oil Pakistan',
    description: 'Review the official Terms & Conditions for ordering and using Revivaa Botanical Hair Oil products and services across Pakistan.',
    canonical: 'https://revivaabyzaish.com/terms',
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
        <Breadcrumbs items={[{ label: 'Terms & Conditions', href: '/terms' }]} />

        <section className="legal-page__hero container">
          <div className="legal-page__badge">
            <Scale size={14} />
            <span>Legal Framework &amp; User Agreement</span>
          </div>
          <h1 className="section-title legal-page__title">
            Terms &amp; Conditions
            <em> · Clear, Transparent Guidelines for Our Valued Patrons</em>
          </h1>
          <p className="section-lead">
            By accessing revivaabyzaish.com or ordering Revivaa Botanical Hair Oil, you agree to comply with the terms and practices detailed in this user agreement.
          </p>
          <div className="legal-page__meta">
            <span className="legal-page__meta-item">
              <Clock size={14} /> Last Updated: March 2026
            </span>
            <span className="legal-page__meta-item">
              <CheckCircle size={14} /> Revivaa by Zaish (Pakistan)
            </span>
          </div>
        </section>

        {/* Legal Switcher Tabs */}
        <div className="container">
          <nav className="legal-nav-tabs" aria-label="Legal Navigation">
            <Link to="/refund-policy" className="legal-nav-tab">
              Refund &amp; Returns
            </Link>
            <Link to="/shipping-policy" className="legal-nav-tab">
              Shipping &amp; Delivery
            </Link>
            <Link to="/privacy-policy" className="legal-nav-tab">
              Privacy Policy
            </Link>
            <Link to="/terms" className="legal-nav-tab is-active">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>

        {/* Highlights */}
        <section className="container">
          <div className="legal-highlights">
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Scale size={22} />
              </div>
              <h3>Pakistani Commercial Law</h3>
              <p>Governed in accordance with the commercial and consumer protection statutes of Pakistan.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <AlertTriangle size={22} />
              </div>
              <h3>Cosmetic Wellness Use</h3>
              <p>Pure botanical hair elixir intended for cosmetic hair and scalp nourishment. Always perform a patch test.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Copyright size={22} />
              </div>
              <h3>Protected Intellectual Property</h3>
              <p>Formulations, branding, trademarks, and photography are proprietary to Revivaa by Zaish.</p>
            </div>
          </div>
        </section>

        {/* Detailed Clauses */}
        <section className="container legal-content-container">
          <article className="legal-article">
            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">1</span>
                <h2 className="legal-section__title">Introduction &amp; Brand Identity</h2>
              </div>
              <p>
                This website is owned and operated by <strong>Revivaa</strong> (also commercially identified as <strong>Revivaa by Zaish</strong>), an independent botanical hair wellness enterprise based in Pakistan.
              </p>
              <div className="legal-callout">
                <strong>Brand Disambiguation Notice:</strong> Revivaa is an autonomous botanical brand specializing in cold-pressed hair and scalp formulations. We have no affiliation, partnership, or connection with any foreign entities or trademark holders bearing similar names such as Revival.
              </div>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">2</span>
                <h2 className="legal-section__title">Product Usage, Disclaimers &amp; Patch Testing</h2>
              </div>
              <p>
                Revivaa Botanical Hair Oil is a topical cosmetic formulation blended with 13 pure cold-pressed botanicals (including Amla, Retha, Sikakai, Rosemary, Lavender, Coconut, Almond, and Vitamin E):
              </p>
              <ul>
                <li><strong>Cosmetic Purpose:</strong> Our oil is designed for external aesthetic cosmetic care to condition the scalp, tame frizz, and enhance hair shine. It is not intended to diagnose, treat, cure, or prevent any medical dermatological diseases.</li>
                <li><strong>Patch Test Recommendation:</strong> Because natural botanical extracts contain potent active plant phytonutrients, we recommend performing a small 24-hour skin patch test on your inner forearm or behind the ear before first full application to ensure no personal plant allergies exist.</li>
                <li><strong>External Use Only:</strong> Avoid direct contact with eyes. In case of accidental eye contact, rinse immediately with clean cool water. Keep out of reach of young children.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">3</span>
                <h2 className="legal-section__title">Pricing, Payments &amp; Currency</h2>
              </div>
              <p>
                All prices displayed on revivaabyzaish.com are denominated in <strong>Pakistani Rupees (PKR)</strong>.
              </p>
              <ul>
                <li>We reserve the right to amend pricing, introduce promotional rates, or modify bottle sizes without prior notice.</li>
                <li>In the unlikely event that a product is mistakenly listed at an incorrect price due to a clerical or technical error, Revivaa reserves the right to cancel or adjust orders placed at the inaccurate value.</li>
                <li>Accepted payment channels include <strong>Cash on Delivery (COD)</strong> across Pakistan, as well as designated direct Bank Transfers.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">4</span>
                <h2 className="legal-section__title">Order Acceptance &amp; Fair Purchasing Policy</h2>
              </div>
              <p>
                Receipt of an electronic order confirmation does not signify our final legal acceptance of your purchase. Revivaa reserves the right at any time after receipt of your order to accept, decline, or limit the quantity ordered for reasons including:
              </p>
              <ul>
                <li>Inability to verify delivery contact information or recipient phone number.</li>
                <li>Courier delivery service restrictions to specific remote postal codes.</li>
                <li>Repeated unfulfilled or refused Cash on Delivery parcels associated with the phone number or address.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">5</span>
                <h2 className="legal-section__title">Intellectual Property &amp; Trademarks</h2>
              </div>
              <p>
                All content published on this website—including but not limited to brand naming, trademarks, logos, typography arrangements, photography, product formulations, descriptions, and custom interactive UI components—is the exclusive intellectual property of Revivaa by Zaish.
              </p>
              <p>
                No part of this website may be reproduced, mirrored, scraped, or republished for commercial redistribution without explicit prior written authorization from Revivaa management.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">6</span>
                <h2 className="legal-section__title">Governing Jurisdiction</h2>
              </div>
              <p>
                These Terms &amp; Conditions and any separate purchase agreements between the consumer and Revivaa shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan, subject to the jurisdiction of competent courts in Karachi, Sindh.
              </p>
            </div>
          </article>

          {/* Concierge Box */}
          <div className="legal-concierge">
            <div className="legal-concierge__info">
              <div className="legal-concierge__icon">
                <FileText size={26} />
              </div>
              <div>
                <h3>Questions Regarding Our Terms?</h3>
                <p>Our concierge is pleased to assist with any corporate inquiries, wholesale questions, or clarifications.</p>
              </div>
            </div>
            <div className="legal-concierge__actions">
              <a
                href="mailto:hello@revivaa.com"
                className="legal-concierge__btn legal-concierge__btn--email"
              >
                <Mail size={16} /> Legal Inquiries
              </a>
              <a
                href="https://wa.me/923440888847"
                className="legal-concierge__btn legal-concierge__btn--wa"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp Concierge
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

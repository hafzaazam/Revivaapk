import { Link } from 'react-router-dom'
import { Lock, Shield, Eye, Database, MessageCircle, Mail, Clock } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { PAGE_SEO } from '../lib/seoConfig'
import './LegalPage.css'

export default function PrivacyPolicyPage() {
  const seoData = PAGE_SEO.privacyPolicy || {
    title: 'Privacy Policy | Revivaa Botanical Hair Oil Pakistan',
    description: 'Learn how Revivaa collects, uses, and safeguards your personal data. 100% transparent privacy practices, secure ordering, and data rights across Pakistan.',
    canonical: 'https://revivaabyzaish.com/privacy-policy',
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
        <Breadcrumbs items={[{ label: 'Privacy Policy', href: '/privacy-policy' }]} />

        <section className="legal-page__hero container">
          <div className="legal-page__badge">
            <Lock size={14} />
            <span>Data Protection &amp; Confidentiality</span>
          </div>
          <h1 className="section-title legal-page__title">
            Privacy Policy
            <em> · Protecting Your Personal Information with Complete Integrity</em>
          </h1>
          <p className="section-lead">
            Your privacy is fundamental to our relationship. This policy outlines how Revivaa collects, processes, and protects your information when you visit or order from revivaabyzaish.com.
          </p>
          <div className="legal-page__meta">
            <span className="legal-page__meta-item">
              <Clock size={14} /> Last Updated: March 2026
            </span>
            <span className="legal-page__meta-item">
              <Shield size={14} /> Strictly No Selling of Data
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
            <Link to="/privacy-policy" className="legal-nav-tab is-active">
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
                <Lock size={22} />
              </div>
              <h3>256-Bit SSL Encryption</h3>
              <p>All data transmitted between your browser and our servers is secured over enforced HTTPS encryption.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Eye size={22} />
              </div>
              <h3>Zero Data Brokering</h3>
              <p>We never sell, rent, or lease your personal information or contact details to third-party marketers.</p>
            </div>
            <div className="legal-highlight-card">
              <div className="legal-highlight-card__icon">
                <Database size={22} />
              </div>
              <h3>Order Fulfilment Only</h3>
              <p>Your address and phone number are shared solely with assigned couriers to complete parcel delivery.</p>
            </div>
          </div>
        </section>

        {/* Detailed Clauses */}
        <section className="container legal-content-container">
          <article className="legal-article">
            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">1</span>
                <h2 className="legal-section__title">Information We Collect</h2>
              </div>
              <p>
                When you interact with Revivaa through revivaabyzaish.com, place an order, or reach out to our concierge, we collect:
              </p>
              <ul>
                <li><strong>Contact &amp; Delivery Details:</strong> Full name, shipping address, city, mobile phone number, and email address for order booking and courier dispatch.</li>
                <li><strong>Order &amp; Transaction Details:</strong> Products ordered, order value, payment method (Cash on Delivery or Bank Transfer), and delivery instructions.</li>
                <li><strong>Technical &amp; Browsing Data:</strong> IP address, browser type, operating system, and anonymous interaction metrics via Google Analytics to diagnose performance bottlenecks and improve user experience.</li>
                <li><strong>Customer Support Inquiries:</strong> Any messages, feedback, or review photographs you voluntarily send to our WhatsApp concierge or customer email.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">2</span>
                <h2 className="legal-section__title">How We Use Your Information</h2>
              </div>
              <p>
                We use the collected information strictly for legitimate commercial and operational purposes:
              </p>
              <ul>
                <li>Processing, packing, and dispatching your orders.</li>
                <li>Sending SMS or WhatsApp tracking notifications and delivery confirmation updates.</li>
                <li>Providing customer support, resolving transit inquiries, and processing returns or replacements.</li>
                <li>Detecting and preventing fraudulent bookings or duplicate Cash on Delivery entries.</li>
                <li>Improving our botanical product formulations and digital user interface.</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">3</span>
                <h2 className="legal-section__title">Third-Party Disclosures &amp; Courier Partners</h2>
              </div>
              <p>
                Revivaa does not monetize personal data. We disclose information only to essential service partners required to operate our business:
              </p>
              <ul>
                <li><strong>Domestic Courier Services (TCS, Leopards, Trax, PostEx):</strong> We share your recipient name, phone number, and physical shipping address so the delivery rider can locate your premises and coordinate handover.</li>
                <li><strong>Cloud Infrastructure &amp; Hosting (Vercel, Supabase):</strong> Encrypted database and server infrastructure for secure site hosting and order record storage.</li>
                <li><strong>Legal Requirements:</strong> If compelled by Pakistani law enforcement or judicial authorities under applicable national legislation (including the Prevention of Electronic Crimes Act).</li>
              </ul>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">4</span>
                <h2 className="legal-section__title">Cookies &amp; Analytics Tracking</h2>
              </div>
              <p>
                Our site uses standard cookies to enable essential site navigation, remember your shopping cart items, and store your visual theme preference (Light/Dark mode).
              </p>
              <p>
                We utilize Google Analytics 4 to understand aggregate website usage patterns (such as page visit counts, device types, and geographic regions within Pakistan). Google Analytics collects non-personally identifiable, anonymized browsing statistics. You can disable cookies at any time via your browser settings.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">5</span>
                <h2 className="legal-section__title">Data Security &amp; Storage</h2>
              </div>
              <p>
                We implement industry-standard physical, electronic, and managerial safeguards to protect your personal details against unauthorized access, alteration, or disclosure. All web traffic is strictly served over modern TLS/SSL encrypted HTTPS connections.
              </p>
            </div>

            <div className="legal-section">
              <div className="legal-section__heading">
                <span className="legal-section__num">6</span>
                <h2 className="legal-section__title">Your Data Rights &amp; Contact</h2>
              </div>
              <p>
                You have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or request complete deletion of your customer profile and historical contact details from our records.
              </p>
              <p>
                To exercise any of these rights, please email our Data Privacy Officer at <a href="mailto:hello@revivaa.com">hello@revivaa.com</a> with the subject line &quot;Data Privacy Request&quot;.
              </p>
            </div>
          </article>

          {/* Concierge Box */}
          <div className="legal-concierge">
            <div className="legal-concierge__info">
              <div className="legal-concierge__icon">
                <Shield size={26} />
              </div>
              <div>
                <h3>Questions Regarding Your Privacy?</h3>
                <p>We are dedicated to total transparency. Contact our team anytime for clarifications on our data handling practices.</p>
              </div>
            </div>
            <div className="legal-concierge__actions">
              <a
                href="mailto:hello@revivaa.com"
                className="legal-concierge__btn legal-concierge__btn--email"
              >
                <Mail size={16} /> Contact Privacy Team
              </a>
              <a
                href="https://wa.me/923440888847"
                className="legal-concierge__btn legal-concierge__btn--wa"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

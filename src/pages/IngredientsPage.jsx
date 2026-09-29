import { Link } from 'react-router-dom'
import {
  Leaf,
  Droplets,
  Heart,
  Shield,
  Sun,
  Flower2,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { INGREDIENTS } from '../data/ingredients'
import { PAGE_SEO } from '../lib/seoConfig'
import './IngredientsPage.css'

const ICONS = {
  leaf: Leaf,
  droplet: Droplets,
  heart: Heart,
  shield: Shield,
  sun: Sun,
  flower: Flower2,
  flask: FlaskConical,
}

const INGREDIENT_DETAILS = [
  {
    name: 'Amla Oil (Emblica Officinalis)',
    benefit: 'Rich in vitamin C and tannins to help strengthen hair roots and reduce premature breakage.',
    origin: 'Cold-pressed from wild Indian Gooseberries.',
  },
  {
    name: 'Amla Powder',
    benefit: 'Natural source of antioxidants that purifies and invigorates the scalp micro-environment.',
    origin: 'Finely milled sun-dried amla berries.',
  },
  {
    name: 'Retha Oil (Sapindus Mukorossi)',
    benefit: 'Contains natural plant saponins that gently lift buildup while maintaining natural moisture.',
    origin: 'Cold extraction from organic soapnuts.',
  },
  {
    name: 'Sikakai Oil (Acacia Concinna)',
    benefit: 'Traditional Ayurvedic botanical known for smoothing lengths and promoting silky detangling.',
    origin: 'Cold-pressed from wild-harvested sikakai fruit pods.',
  },
  {
    name: 'Dhaniya Oil (Coriandrum Sativum)',
    benefit: 'Soothes scalp irritation, balances sebum, and helps hair feel fuller and more resilient.',
    origin: 'Extracted from aromatic coriander seeds.',
  },
  {
    name: 'Rosemary (Rosmarinus Officinalis)',
    benefit: 'Celebrated worldwide for awakening scalp circulation and supporting healthy strand anchoring.',
    origin: 'Steam-distilled Mediterranean rosemary needles.',
  },
  {
    name: 'Lavender (Lavandula Angustifolia)',
    benefit: 'Calms the senses, balances sensitive scalps, and imparts a subtle, natural botanical scent.',
    origin: 'Cold-infused French lavender blossoms.',
  },
  {
    name: 'Coconut Oil (Cocos Nucifera)',
    benefit: 'Deeply penetrates the hair cortex to prevent protein loss and lock in essential moisture.',
    origin: 'Pure cold-pressed virgin coconut oil.',
  },
  {
    name: 'Onion Extract (Allium Cepa)',
    benefit: 'Abundant in bioactive sulfur that supports natural keratin synthesis and root resilience.',
    origin: 'Pure cold-processed red onion bulb extract.',
  },
  {
    name: 'Aloe Vera (Aloe Barbadensis)',
    benefit: 'Delivers lightweight hydration, enzymes, and soothing moisture to dry or irritated scalps.',
    origin: 'Cold-pressed inner leaf aloe vera gel.',
  },
  {
    name: 'Alisi Oil (Linum Usitatissimum / Flaxseed)',
    benefit: 'Concentrated Omega-3 fatty acids that restore elasticity and seal split cuticles against frizz.',
    origin: 'Cold-pressed golden flaxseeds.',
  },
  {
    name: 'Badam Roghan (Prunus Dulcis / Sweet Almond)',
    benefit: 'Packed with vitamins A, B, and E to provide luminous shine and lightweight silkiness.',
    origin: '100% pure cold-pressed sweet almond oil.',
  },
  {
    name: 'Vitamin E (Tocopherol)',
    benefit: 'Potent antioxidant defense against environmental stressors and free radical damage.',
    origin: 'Natural botanical plant tocopherols.',
  },
]

export default function IngredientsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '13 Pure Botanicals in Revivaa Hair Oil',
    description: PAGE_SEO.ingredients.description,
    itemListElement: INGREDIENTS.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      description: item.description,
      image: item.image,
    })),
  }

  return (
    <div className="app">
      <SEO
        title={PAGE_SEO.ingredients.title}
        description={PAGE_SEO.ingredients.description}
        canonical={PAGE_SEO.ingredients.canonical}
        keywords={PAGE_SEO.ingredients.keywords}
        ogType={PAGE_SEO.ingredients.ogType}
        structuredData={structuredData}
        schemaId="ingredients-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" className="ing-page" tabIndex={-1}>
        <Breadcrumbs items={[{ label: 'Ingredients', href: '/ingredients' }]} />

        {/* Hero Section */}
        <section className="ing-page__hero container">
          <p className="section-label">Botanical Purity &amp; Science</p>
          <h1 className="section-title ing-page__title">
            Natural Ingredients in Revivaa Hair Oil
            <em> · 13 Pure Botanicals</em>
          </h1>
          <p className="section-lead ing-page__lead">
            Every drop of Revivaa Botanical Hair Oil 150ml contains thirteen concentrated, cold-pressed plant extracts. We never use mineral oils, silicones, sulfates, or artificial fragrances.
          </p>

          <div className="ing-page__pillars">
            <div className="ing-page__pillar">
              <CheckCircle2 size={18} className="ing-page__pillar-icon" />
              <span>100% Cold-Pressed Extraction</span>
            </div>
            <div className="ing-page__pillar">
              <CheckCircle2 size={18} className="ing-page__pillar-icon" />
              <span>Zero Liquid Paraffin or Mineral Oil</span>
            </div>
            <div className="ing-page__pillar">
              <CheckCircle2 size={18} className="ing-page__pillar-icon" />
              <span>Cruelty-Free &amp; Toxin-Free</span>
            </div>
          </div>
        </section>

        {/* 13 Ingredients Grid */}
        <section className="ing-page__grid-section container" aria-label="Ingredient Directory">
          <div className="ing-page__grid">
            {INGREDIENTS.map((item, index) => {
              const Icon = ICONS[item.icon] ?? Leaf
              const details = INGREDIENT_DETAILS[index] || {}
              return (
                <article key={item.id} className="ing-page__card">
                  <div className="ing-page__card-media">
                    <img
                      src={item.image}
                      alt={`${item.name} - Botanical ingredient in Revivaa Hair Oil`}
                      className="ing-page__card-img"
                      width={400}
                      height={250}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="ing-page__card-badge">
                      <Icon size={14} />
                      <span>{item.category}</span>
                    </span>
                    <span className="ing-page__card-num">
                      {String(item.order).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="ing-page__card-body">
                    <h2 className="ing-page__card-name">{details.name || item.name}</h2>
                    <p className="ing-page__card-desc">{details.benefit || item.description}</p>
                    {details.origin && (
                      <p className="ing-page__card-origin">
                        <strong>Source:</strong> {details.origin}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Contextual Internal Linking & CTA Section */}
        <section className="ing-page__cta-wrap container">
          <div className="ing-page__cta-box">
            <div className="ing-page__cta-content">
              <span className="section-label" style={{ color: 'var(--color-orange)' }}>
                Experience the 13 Botanicals
              </span>
              <h2>Ready to transform your hair routine?</h2>
              <p>
                Discover the synergistic power of cold-pressed Amla, Rosemary, Sikakai, and Almond in our signature 150ml elixir.
              </p>
              <div className="ing-page__cta-actions">
                <Link to="/product/revivaa-oil-150" className="clay-btn">
                  <span>Explore Revivaa Hair Oil 150ml</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="clay-btn clay-btn-light">
                  <span>See 3-Step Routine</span>
                </Link>
                <Link to="/faq" className="ing-page__cta-link">
                  Have questions? Read our FAQ →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
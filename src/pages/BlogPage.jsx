import { Link } from 'react-router-dom'
import { Clock, User, ArrowRight, BookOpen } from 'lucide-react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Cursor from '../components/Cursor'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BLOG_POSTS } from '../data/blogPosts'
import { PAGE_SEO, SITE_DOMAIN } from '../lib/seoConfig'
import './BlogPage.css'

export default function BlogPage() {
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: PAGE_SEO.blog.h1,
    description: PAGE_SEO.blog.description,
    url: `${SITE_DOMAIN}/blog`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: BLOG_POSTS.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_DOMAIN}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  }

  return (
    <div className="app">
      <SEO
        title={PAGE_SEO.blog.title}
        description={PAGE_SEO.blog.description}
        canonical={PAGE_SEO.blog.canonical}
        keywords={PAGE_SEO.blog.keywords}
        ogType={PAGE_SEO.blog.ogType}
        structuredData={blogListSchema}
        schemaId="blog-list-schema"
      />
      <Cursor />
      <ScrollToTop />
      <Navbar />

      <main id="main" className="blog-page" tabIndex={-1}>
        <Breadcrumbs items={[{ label: 'Journal', href: '/blog' }]} />

        {/* Hero */}
        <section className="blog-page__hero container">
          <p className="section-label">Botanical Journal &amp; Hair Wisdom</p>
          <h1 className="section-title blog-page__title">
            The Hair Care Journal
            <em> · Botanical Science &amp; Rituals</em>
          </h1>
          <p className="section-lead blog-page__lead">
            Explore deep-dive guides on cold-pressed botanical oils, traditional scalp oiling rituals, and healthy hair care techniques from the Revivaa formulators.
          </p>
        </section>

        {/* Articles Grid */}
        <section className="blog-page__grid-section container" aria-label="Blog Articles">
          <div className="blog-page__grid">
            {BLOG_POSTS.map((post) => (
              <article key={post.slug} className="blog-page__card clay">
                <Link to={`/blog/${post.slug}`} className="blog-page__card-media">
                  <img
                    src={post.coverImage}
                    alt={post.coverImageAlt || post.title}
                    className="blog-page__card-img"
                    width={480}
                    height={300}
                    loading="lazy"
                  />
                  <span className="blog-page__card-cat">{post.category}</span>
                </Link>

                <div className="blog-page__card-body">
                  <div className="blog-page__card-meta">
                    <span className="blog-page__card-meta-item">
                      <Clock size={13} />
                      {post.readingTime}
                    </span>
                    <span className="blog-page__card-meta-sep">·</span>
                    <span className="blog-page__card-meta-item">
                      <User size={13} />
                      By {post.author.name}
                    </span>
                  </div>

                  <h2 className="blog-page__card-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="blog-page__card-excerpt">{post.excerpt}</p>

                  <Link to={`/blog/${post.slug}`} className="blog-page__card-read">
                    <span>Read Full Guide</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Product Callout */}
        <section className="blog-page__cta container">
          <div className="blog-page__cta-box clay-cream">
            <div className="blog-page__cta-icon clay-icon">
              <BookOpen size={24} />
            </div>
            <div className="blog-page__cta-text">
              <h3>Rooted in Natural Care &amp; Science</h3>
              <p>Experience the botanical formula behind our articles with Revivaa Botanical Hair Oil 150ml.</p>
            </div>
            <Link to="/product/revivaa-oil-150" className="clay-btn">
              <span>Shop Revivaa Oil</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

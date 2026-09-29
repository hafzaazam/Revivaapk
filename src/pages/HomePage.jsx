import { lazy } from 'react'
import LazySection from '../components/LazySection'
import Cursor from '../components/Cursor'
import ScrollProgress from '../components/ScrollProgress'
import ScrollToTop from '../components/ScrollToTop'
import Navbar from '../components/Navbar'
import Preloader from '../components/Preloader'
import OilTransition from '../components/OilTransition'
import Hero from '../components/Hero'
import SEO from '../components/SEO'
import { PAGE_SEO } from '../lib/seoConfig'
import { usePreloader } from '../hooks/usePreloader'
import logoUrl from '../assets/logo-r.png'

const ProblemSolution = lazy(() => import('../components/ProblemSolution'))
const WhyRevivaa = lazy(() => import('../components/WhyRevivaa'))
const InfluencerReels = lazy(() => import('../components/InfluencerReels'))
const ScrollFilm = lazy(() => import('../components/ScrollFilm'))
const MarketGap = lazy(() => import('../components/MarketGap'))
const Ingredients = lazy(() => import('../components/Ingredients'))
const StoryJourney = lazy(() => import('../components/StoryJourney'))
const Testimonials = lazy(() => import('../components/Testimonials'))
const Footer = lazy(() => import('../components/Footer'))

const PRELOAD_ASSETS = [
  logoUrl,
  '/images/hero-product.webp',
  '/videos/hero-oil.mp4',
]

/**
 * Landing — refined section order with deferred LazySection boundaries.
 */
export default function HomePage() {
  const { isLoading, progress, phase, mode, reducedMotion, complete } = usePreloader({
    assets: PRELOAD_ASSETS,
  })

  return (
    <>
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        canonical={PAGE_SEO.home.canonical}
        keywords={PAGE_SEO.home.keywords}
        ogType={PAGE_SEO.home.ogType}
      />
      <div
        className="app"
        inert={isLoading || undefined}
        aria-hidden={isLoading ? true : undefined}
      >
        <Cursor />
        <ScrollProgress />
        <ScrollToTop />
        <Navbar />
        <main id="main" tabIndex={-1}>
          <Hero ready={!isLoading} />

          <LazySection minHeight="450px">
            <OilTransition />
            <ProblemSolution />
          </LazySection>

          <LazySection minHeight="450px">
            <OilTransition />
            <WhyRevivaa />
          </LazySection>

          <LazySection minHeight="450px">
            <OilTransition />
            <InfluencerReels />
          </LazySection>

          <LazySection minHeight="360px">
            <OilTransition />
            <ScrollFilm />
            <div className="scroll-film-under">
              <MarketGap />
            </div>
          </LazySection>

          <LazySection minHeight="500px">
            <OilTransition />
            <Ingredients />
          </LazySection>

          <LazySection minHeight="450px">
            <OilTransition />
            <StoryJourney />
          </LazySection>

          <LazySection minHeight="450px">
            <OilTransition />
            <Testimonials />
          </LazySection>
        </main>

        <LazySection minHeight="320px">
          <Footer />
        </LazySection>
      </div>

      {isLoading && (
        <Preloader
          progress={progress}
          phase={phase}
          mode={mode}
          reducedMotion={reducedMotion}
          onExitComplete={complete}
        />
      )}
    </>
  )
}

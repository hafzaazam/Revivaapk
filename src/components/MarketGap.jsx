import { useRef } from 'react'
import { motion, useTransform } from 'framer-motion'
import {
  FlaskConical,
  Target,
  Pill,
  Sprout,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react'
import { useScrollPin } from '../hooks/useScrollPin'
import ScrollPinnedSection, {
  PinProgress,
  PinTabs,
  PinPanelStack,
} from './ScrollPinnedSection'
import ScrollReveal from './ScrollReveal'
import './MarketGap.css'

const missing = [
  { icon: FlaskConical, text: 'Harsh chemicals & synthetic formulas' },
  { icon: Target, text: 'Focus on symptoms, not root cause' },
  { icon: Pill, text: 'Temporary results, dependence on more' },
  { icon: Sprout, text: 'One-size-fits-all approach' },
  { icon: ShieldCheck, text: 'Lack of transparency & trust' },
]

const difference = [
  'Clean, plant-powered & science-backed ingredients',
  'Targets the root, supports real & lasting wellness',
  'Long-term transformation, not just short-term relief',
  'Personalized support for real people with real needs',
  '100% transparent formulas, honest promise',
]

const market = [
  'Artificial additives & questionable ingredients',
  'Masks the problem, doesn’t solve it',
  'Quick fixes with side effects or plateaus',
  'Generic solutions for everyone',
  'Hidden ingredients, exaggerated claims',
]

const slides = ['Missing today', 'The market', 'revivaa difference']
const THRESHOLDS = [0.3, 0.62]

export default function MarketGap() {
  const ref = useRef(null)
  const {
    scrollYProgress,
    activeIndex,
    progressWidth,
    reducedMotion,
    unpin,
    scrollToPanel,
  } = useScrollPin(ref, { panels: 3, thresholds: THRESHOLDS })

  const footerOpacity = useTransform(scrollYProgress, [0.72, 0.86], [0.35, 1])

  if (unpin) {
    return (
      <section id="difference" ref={ref} className="gap-cinema gap-cinema--stack section">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <p className="section-label">REVERSE · REVITALIZE · REVIVE</p>
            <h2 className="section-title">How revivaa fills the market gap</h2>
            <p className="section-lead">
              Scroll the comparison — watch the difference slide into focus.
            </p>
          </ScrollReveal>

          <div className="gap-cinema__stack">
            <ScrollReveal variant="fade-up" delay={0.05}>
              <MissingSlide />
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.1}>
              <MarketSlide />
            </ScrollReveal>
            <ScrollReveal variant="scale-in" delay={0.15}>
              <DuelSlide elevated popIcons />
            </ScrollReveal>
            <ScrollReveal variant="fade-up" delay={0.2}>
              <p className="gap-cinema__footer clay">
                revivaa isn&apos;t here to compete. We&apos;re here to raise the standard.
                <strong> Real ingredients. Real results. Real revival.</strong>
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
    )
  }

  return (
    <ScrollPinnedSection
      ref={ref}
      id="difference"
      height="280vh"
      className="gap-cinema"
      reducedMotion={reducedMotion}
      unpin={unpin}
    >
      <PinProgress progressWidth={progressWidth} activeIndex={activeIndex} labels={slides} />

      <div className="gap-cinema__intro container">
        <p className="section-label">REVERSE · REVITALIZE · REVIVE</p>
        <h2 className="section-title">How revivaa fills the market gap</h2>
        <p className="section-lead">
          Scroll the comparison — watch the difference slide into focus.
        </p>

        <PinTabs
          tabs={slides}
          activeIndex={activeIndex}
          label="Comparison panels"
          className="gap-cinema__tabs"
          onSelect={scrollToPanel}
        />
      </div>

      {/* One full-width panel at a time — never a 300% horizontal track */}
      <PinPanelStack activeIndex={activeIndex} className="gap-cinema__panels container">
        <MissingSlide active={activeIndex === 0} />
        <MarketSlide active={activeIndex === 1} />
        <DuelSlide elevated={activeIndex === 2} popIcons={activeIndex === 2} />
      </PinPanelStack>

      <motion.p className="gap-cinema__footer container clay" style={{ opacity: footerOpacity }}>
        revivaa isn&apos;t here to compete. We&apos;re here to raise the standard.
        <strong> Real ingredients. Real results. Real revival.</strong>
      </motion.p>
    </ScrollPinnedSection>
  )
}

function MissingSlide({ active = true }) {
  return (
    <div className={`gap-cinema__card clay ${active ? 'is-active' : ''}`}>
      <div className="gap-cinema__card-head">
        <h3>What&apos;s missing today</h3>
        <p>The gap people feel — and brands ignore.</p>
      </div>
      <ul className="gap-cinema__grid">
        {missing.map(({ icon: Icon, text }, i) => (
          <li
            key={text}
            className={`gap-cinema__item clay-cream ${active ? 'is-pop' : ''}`}
            style={{ '--pop-delay': `${i * 55}ms` }}
          >
            <span className="clay-icon">
              <Icon />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MarketSlide({ active = true }) {
  return (
    <div className={`gap-cinema__card clay ${active ? 'is-active' : ''}`}>
      <div className="gap-cinema__card-head">
        <h3>What the market offers</h3>
        <p>Quick fixes. Loud claims. Little lasting change.</p>
      </div>
      <ul className="gap-cinema__grid">
        {market.map((text, i) => (
          <li
            key={text}
            className={`gap-cinema__item clay-cream ${active ? 'is-pop' : ''}`}
            style={{ '--pop-delay': `${i * 55}ms` }}
          >
            <span className={`gap-cinema__x ${active ? 'is-pop' : ''}`} style={{ '--pop-delay': `${i * 55}ms` }}>
              <X size={16} strokeWidth={2.4} />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DuelSlide({ elevated = false, popIcons = false }) {
  return (
    <div className={`gap-cinema__duel ${elevated ? 'is-elevated' : ''}`}>
      <aside className="gap-cinema__side clay gap-cinema__side--muted">
        <h4>Them</h4>
        <ul>
          {market.slice(0, 3).map((text, i) => (
            <li key={text}>
              <span
                className={`gap-cinema__x ${popIcons ? 'is-pop' : ''}`}
                style={{ '--pop-delay': `${i * 70}ms` }}
              >
                <X size={14} strokeWidth={2.4} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>

      <span className="gap-cinema__vs">vs</span>

      <div className={`gap-cinema__center ${elevated ? 'is-hero' : ''}`}>
        <div className="gap-cinema__center-head">The revivaa Difference</div>
        <div className="gap-cinema__center-body clay-cream">
          <ul>
            {difference.map((text, i) => (
              <li key={text} className={popIcons ? 'is-pop' : ''}>
                <span
                  className={`gap-cinema__check ${popIcons ? 'is-pop' : ''}`}
                  style={{ '--pop-delay': `${80 + i * 70}ms` }}
                >
                  <Check size={15} strokeWidth={2.5} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <span className="gap-cinema__vs gap-cinema__vs--end">vs</span>

      <aside className="gap-cinema__side clay gap-cinema__side--muted">
        <h4>The noise</h4>
        <ul>
          {missing.slice(0, 3).map(({ text }, i) => (
            <li key={text}>
              <span
                className={`gap-cinema__x ${popIcons ? 'is-pop' : ''}`}
                style={{ '--pop-delay': `${i * 70}ms` }}
              >
                <X size={14} strokeWidth={2.4} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}

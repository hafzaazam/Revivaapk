import { useRef } from 'react'
import { motion, useTransform } from 'framer-motion'
import {
  Frown,
  Smile,
  Scissors,
  Sparkles,
  Leaf,
  Droplets,
  User,
  Waves,
} from 'lucide-react'
import { useScrollPin } from '../hooks/useScrollPin'
import ScrollPinnedSection, {
  PinProgress,
  PinTabs,
  PinPanelStack,
} from './ScrollPinnedSection'
import ScrollReveal from './ScrollReveal'
import './ProblemSolution.css'

const problems = [
  { icon: Waves, label: 'Hairfall', line: 'Strands that slip away every wash.' },
  { icon: Scissors, label: 'Breakage', line: 'Ends that snap before they grow.' },
  { icon: Frown, label: 'Dull hair', line: 'No shine. No life. No bounce.' },
  { icon: Sparkles, label: 'Tangled', line: 'Knots that fight every brush.' },
]

const solutions = [
  { icon: Leaf, label: 'Reduces hairfall', line: 'Roots feel anchored again.' },
  { icon: Waves, label: 'Stronger & thicker', line: 'Density you can feel.' },
  { icon: Sparkles, label: 'Nourished & healthy', line: 'Softness from scalp to tip.' },
  { icon: Droplets, label: 'Supports growth', line: 'A ritual that rebuilds.' },
]

const chapters = ['The Problem', 'The Shift', 'The Revival']
const THRESHOLDS = [0.32, 0.62]

export default function ProblemSolution() {
  const ref = useRef(null)
  const {
    scrollYProgress,
    activeIndex,
    progressWidth,
    reducedMotion,
    unpin,
    scrollToPanel,
  } = useScrollPin(ref, { panels: 3, thresholds: THRESHOLDS })

  /* Bottle glow intensifies toward revival (Shift + Revival panels) */
  const bottleGlow = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.12, 0.28, 0.55, 0.72])
  const traitsOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0.2, 1])

  if (unpin) {
    return (
      <section id="solution" ref={ref} className="ps-story ps-story--stack section">
        <div className="container">
          <ScrollReveal variant="fade-up">
            <p className="section-label">A Problem & Solution</p>
            <h2 className="section-title">From hairfall to revival</h2>
          </ScrollReveal>

          <div className="ps-story__stack">
            <ScrollReveal variant="fade-up" delay={0.05}>
              <article className="ps-story__panel ps-story__panel--problem clay-cream is-focus">
                <ProblemPanel focused />
              </article>
            </ScrollReveal>

            <ScrollReveal variant="scale-in" delay={0.1} className="ps-story__hero">
              <div className="ps-story__bottle" style={{ '--bottle-glow': 0.55 }}>
                <img
                  src="/images/bottle-solo.png"
                  alt="revivaa oil bottle"
                  width={150}
                  height={300}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="ps-story__shift is-static">Then comes the shift.</p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.15}>
              <article className="ps-story__panel ps-story__panel--solution clay is-focus">
                <SolutionPanel focused />
              </article>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.2}>
              <div className="ps-story__traits">
                <TraitsBar />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    )
  }

  return (
    <ScrollPinnedSection
      ref={ref}
      id="solution"
      height="280vh"
      className="ps-story"
      reducedMotion={reducedMotion}
      unpin={unpin}
    >
      <PinProgress progressWidth={progressWidth} activeIndex={activeIndex} labels={chapters} />

      <div className="ps-story__meta container">
        <div className="ps-story__head">
          <p className="section-label">A Problem & Solution</p>
          <h2 className="section-title">From hairfall to revival</h2>
        </div>

        <PinTabs
          tabs={chapters}
          activeIndex={activeIndex}
          label="Story chapters"
          className="ps-story__chapters"
          onSelect={scrollToPanel}
        />
      </div>

      {/* One chapter at a time — not a permanent 3-column stage */}
      <PinPanelStack activeIndex={activeIndex} className="ps-story__panels container">
        <article className="ps-story__panel ps-story__panel--problem clay-cream is-focus">
          <ProblemPanel focused={activeIndex === 0} />
        </article>

        <div className="ps-story__hero ps-story__hero--panel">
          <motion.div className="ps-story__bottle" style={{ '--bottle-glow': bottleGlow }}>
            <img
              src="/images/bottle-solo.png"
              alt="revivaa oil bottle"
              width={150}
              height={300}
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <p className="ps-story__shift is-static">Then comes the shift.</p>
        </div>

        <article className="ps-story__panel ps-story__panel--solution clay is-focus">
          <SolutionPanel focused={activeIndex === 2} />
        </article>
      </PinPanelStack>

      <motion.div className="ps-story__traits container" style={{ opacity: traitsOpacity }}>
        <TraitsBar />
      </motion.div>
    </ScrollPinnedSection>
  )
}

function ProblemPanel({ focused = false }) {
  return (
    <>
      <span className="ps-story__act">Act I</span>
      <h3>The problem</h3>
      <p className="ps-story__caption">
        Not just a bad hair day. It&apos;s a story your scalp keeps rewriting.
      </p>
      <ul className="ps-story__list">
        {problems.map(({ icon: Icon, label, line }) => (
          <li key={label} className={`ps-story__row ${focused ? 'is-on' : ''}`}>
            <span className="clay-icon">
              <Icon />
            </span>
            <div>
              <strong>{label}</strong>
              <small>{line}</small>
            </div>
          </li>
        ))}
      </ul>
      <div className="ps-story__banner clay-dark">
        <Frown size={18} strokeWidth={1.5} />
        <p>Does this sound like you?</p>
      </div>
    </>
  )
}

function SolutionPanel({ focused = false }) {
  return (
    <>
      <span className="ps-story__act">Act III</span>
      <h3>revivaa arrives</h3>
      <p className="ps-story__caption">
        One oil. A quieter ritual. Stronger hair — happier you.
      </p>
      <ul className="ps-story__list">
        {solutions.map(({ icon: Icon, label, line }) => (
          <li key={label} className={`ps-story__row ${focused ? 'is-on' : ''}`}>
            <span className="clay-icon">
              <Icon />
            </span>
            <div>
              <strong>{label}</strong>
              <small>{line}</small>
            </div>
          </li>
        ))}
      </ul>
      <div className="ps-story__banner clay-dark">
        <Smile size={18} strokeWidth={1.5} />
        <p>Stronger hair. Happier you. #ChooseRevivaa</p>
      </div>
    </>
  )
}

function TraitsBar() {
  return (
    <div className="ps-story__traits-inner clay-dark">
      <div>
        <Leaf size={20} strokeWidth={1.5} />
        <span>Natural Ingredients</span>
      </div>
      <div>
        <Droplets size={20} strokeWidth={1.5} />
        <span>Toxin Free</span>
      </div>
      <div>
        <User size={20} strokeWidth={1.5} />
        <span>Suits All Hair Types</span>
      </div>
    </div>
  )
}

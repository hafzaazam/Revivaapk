import { Leaf, Sprout, Droplet, Heart } from 'lucide-react'
import ScrollReveal from './ScrollReveal'
import OilAtmosphere from './OilAtmosphere'
import { useParallax } from '../hooks/useParallax'
import './WhyRevivaa.css'

const features = [
  {
    icon: Leaf,
    anim: 'sway',
    title: 'Nourishes Deeply',
    text: 'Infused with nature-inspired ingredients that nourish your scalp and roots.',
  },
  {
    icon: Sprout,
    anim: 'grow',
    title: 'Supports Healthier Hair',
    text: 'Helps reduce hair fall and supports stronger, healthier, and shinier hair.',
  },
  {
    icon: Droplet,
    anim: 'drip',
    title: 'Gentle & Natural',
    text: 'A soft and natural formula that is safe for all hair types.',
  },
]

export default function WhyRevivaa() {
  const { ref: stageRef } = useParallax(8)
  return (
    <section id="why" className="why section">
      <OilAtmosphere />

      <div className="why__layout container">
        <div className="why__copy">
          <ScrollReveal variant="fade-up">
            <p className="section-label">Why revivaa?</p>
            <h2 className="section-title">
              Because your hair deserves the <em>best</em> kind of care.
            </h2>
            <p className="section-lead">
              Healthy hair starts here — with a botanical blend made to revive from root to tip.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="stagger-children" stagger={0.1} className="why__cards">
            {features.map(({ icon: Icon, anim, title, text }) => (
              <article key={title} className={`why__card clay-cream why__card--${anim}`}>
                <span className="why__icon clay-icon" aria-hidden>
                  <Icon />
                  {anim === 'drip' && <span className="why__drip" />}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={0.15}>
            <p className="why__closing">
              Healthy Hair <em>Starts Here.</em>
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="scale-in" delay={0.12} className="why__visual">
          <div className="why__stage" ref={stageRef}>
            <img
              src="/images/bottle-solo.png"
              alt="revivaa oil bottle"
              className="why__product"
              width={200}
              height={400}
              loading="lazy"
              decoding="async"
            />
          </div>
        </ScrollReveal>
      </div>

      <div className="why__bar">
        <div className="container why__bar-inner">
          <span><Leaf size={18} strokeWidth={1.5} /> Natural Ingredients</span>
          <span><Droplet size={18} strokeWidth={1.5} /> Non-Greasy Formula</span>
          <span><Sprout size={18} strokeWidth={1.5} /> For All Hair Types</span>
          <span><Heart size={18} strokeWidth={1.5} /> Made with Love</span>
        </div>
      </div>
    </section>
  )
}

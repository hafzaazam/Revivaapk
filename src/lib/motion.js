/**
 * Shared scroll / section-transition vocabulary.
 *
 * Prefer these over one-off motion patterns when building sections.
 *
 *   import { ScrollReveal, OilTransition, useScrollPin, ScrollPinnedSection, PinProgress, PinTabs } from './lib/motion'
 */
export { default as ScrollReveal, SCROLL_REVEAL_VARIANTS } from '../components/ScrollReveal'
export { default as OilTransition } from '../components/OilTransition'
export {
  default as ScrollPinnedSection,
  PinProgress,
  PinTabs,
  PinPanelStack,
} from '../components/ScrollPinnedSection'
export { useScrollPin, progressToIndex } from '../hooks/useScrollPin'
export { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
export { useIsMobilePin, useMediaQuery } from '../hooks/useMediaQuery'
export { oilPourClip, oilRevealClip } from './liquidClip'
export { OIL_EDGE_PATHS, oilEdgeIndex } from './oilEdgePaths'

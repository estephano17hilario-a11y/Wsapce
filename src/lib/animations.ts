import { gsap } from 'gsap';

type TweenVars = gsap.TweenVars;

export function ctaTitle(
  el: Element | null,
  options?: { duration?: number; from?: TweenVars; to?: TweenVars }
) {
  const duration = options?.duration ?? 1.8;
  const fromVars: TweenVars = {
    opacity: 0,
    filter: 'blur(14px)',
    letterSpacing: '0.15em',
    scale: 1.2,
    y: 40,
    transformOrigin: 'center center',
    ...(options?.from || {}),
  };
  const toVars: TweenVars = {
    opacity: 1,
    filter: 'blur(0px)',
    letterSpacing: '0em',
    scale: 1,
    y: 0,
    ease: 'expo.out',
    duration,
    ...(options?.to || {}),
  };
  return el ? gsap.fromTo(el, fromVars, toVars) : gsap.to({}, { duration: 0 });
}

export function ctaSubtitle(
  el: Element | null,
  options?: { duration?: number; from?: TweenVars; to?: TweenVars }
) {
  const duration = options?.duration ?? 1.4;
  const fromVars: TweenVars = {
    opacity: 0,
    filter: 'blur(10px)',
    y: 30,
    ...(options?.from || {}),
  };
  const toVars: TweenVars = {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    ease: 'power3.out',
    duration,
    ...(options?.to || {}),
  };
  return el ? gsap.fromTo(el, fromVars, toVars) : gsap.to({}, { duration: 0 });
}

export function ctaFadeOut(
  title: Element | null,
  subtitle: Element | null,
  options?: { duration?: number; ease?: string }
) {
  const targets = [title, subtitle].filter(Boolean) as Element[];
  const duration = options?.duration ?? 1.0;
  const ease = options?.ease ?? 'power2.in';
  return targets.length
    ? gsap.to(targets, { opacity: 0, duration, ease })
    : gsap.to({}, { duration: 0 });
}
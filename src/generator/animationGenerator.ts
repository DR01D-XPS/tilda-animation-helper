import type { TildaElement, AnimationPresetId, AnimationOptions, GeneratedCode } from '../types';
import { DEFAULT_OPTIONS } from '../types';
import { generateUniqueClassName } from '../utils/domUtils';
import { getPreset } from './presets';

// ─── CSS Templates ────────────────────────────────────────────────────────────

function fadeUpCSS(cls: string, opts: AnimationOptions): string {
  const d = opts.distance;
  return `/* Tilda Animation Helper: Fade Up */
.${cls} {
  opacity: 0;
  transform: translateY(${d}px);
  transition: opacity ${opts.duration}ms ${opts.easing} ${opts.delay}ms,
              transform ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: opacity, transform;
}
.${cls}.tah-visible {
  opacity: 1;
  transform: translateY(0);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transform: none; transition: opacity ${opts.duration}ms ${opts.easing}; }
}` : ''}
${opts.responsive ? `@media (max-width: 640px) {
  .${cls} { transform: translateY(${Math.round(d * 0.6)}px); }
}` : ''}`;
}

function fadeInCSS(cls: string, opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Fade In */
.${cls} {
  opacity: 0;
  transition: opacity ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: opacity;
}
.${cls}.tah-visible {
  opacity: 1;
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transition-duration: 100ms; }
}` : ''}`;
}

function slideLeftCSS(cls: string, opts: AnimationOptions): string {
  const d = opts.distance * 2;
  return `/* Tilda Animation Helper: Slide from Right */
.${cls} {
  opacity: 0;
  transform: translateX(${d}px);
  transition: opacity ${opts.duration}ms ${opts.easing} ${opts.delay}ms,
              transform ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: opacity, transform;
}
.${cls}.tah-visible {
  opacity: 1;
  transform: translateX(0);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transform: none; }
}` : ''}
${opts.responsive ? `@media (max-width: 640px) {
  .${cls} { transform: translateX(${Math.round(d * 0.5)}px); }
}` : ''}`;
}

function slideRightCSS(cls: string, opts: AnimationOptions): string {
  const d = opts.distance * 2;
  return `/* Tilda Animation Helper: Slide from Left */
.${cls} {
  opacity: 0;
  transform: translateX(-${d}px);
  transition: opacity ${opts.duration}ms ${opts.easing} ${opts.delay}ms,
              transform ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: opacity, transform;
}
.${cls}.tah-visible {
  opacity: 1;
  transform: translateX(0);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transform: none; }
}` : ''}`;
}

function scaleInCSS(cls: string, opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Scale In */
.${cls} {
  opacity: 0;
  transform: scale(0.85);
  transition: opacity ${opts.duration}ms ${opts.easing} ${opts.delay}ms,
              transform ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: opacity, transform;
}
.${cls}.tah-visible {
  opacity: 1;
  transform: scale(1);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transform: none; }
}` : ''}`;
}

function parallaxScrollCSS(cls: string, _opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Parallax Scroll */
.${cls} {
  will-change: transform;
  transition: none;
}
/* Parallax is driven by JS scroll handler */`;
}

function floatingLoopCSS(cls: string, opts: AnimationOptions): string {
  const d = Math.round(opts.distance * 0.4);
  const dur = Math.round(opts.duration * 4);
  return `/* Tilda Animation Helper: Floating Loop */
@keyframes tah-float-${cls} {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-${d}px); }
}
.${cls} {
  animation: tah-float-${cls} ${dur}ms ease-in-out infinite;
  will-change: transform;
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { animation: none; }
}` : ''}`;
}

function hoverLiftCSS(cls: string, opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Hover Lift */
.${cls} {
  transition: transform ${opts.duration * 0.3}ms ease,
              box-shadow ${opts.duration * 0.3}ms ease;
  cursor: pointer;
}
.${cls}:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}
.${cls}:active {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls}, .${cls}:hover, .${cls}:active { transform: none; }
}` : ''}`;
}

function textRevealCSS(cls: string, opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Text Reveal */
.${cls}-wrap {
  overflow: hidden;
  display: inline-block;
}
.${cls} {
  display: inline-block;
  transform: translateY(100%);
  opacity: 0;
  transition: transform ${opts.duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${opts.delay}ms,
              opacity ${opts.duration * 0.5}ms ease ${opts.delay}ms;
}
.${cls}.tah-visible {
  transform: translateY(0);
  opacity: 1;
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transform: none; }
}` : ''}`;
}

function staggerAnimationCSS(cls: string, opts: AnimationOptions): string {
  const d = opts.distance;
  return `/* Tilda Animation Helper: Stagger Animation */
.${cls} {
  opacity: 0;
  transform: translateY(${d}px);
  transition: opacity ${opts.duration}ms ${opts.easing},
              transform ${opts.duration}ms ${opts.easing};
  will-change: opacity, transform;
}
.${cls}.tah-visible {
  opacity: 1;
  transform: translateY(0);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { transform: none; }
}` : ''}`;
}

function backgroundBlurGlowCSS(cls: string, opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Background Blur Glow */
.${cls} {
  opacity: 0;
  filter: blur(8px);
  transition: opacity ${opts.duration}ms ${opts.easing} ${opts.delay}ms,
              filter ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: opacity, filter;
}
.${cls}.tah-visible {
  opacity: 1;
  filter: blur(0px);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} { filter: none; }
}` : ''}`;
}

function smoothImageZoomCSS(cls: string, opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Smooth Image Zoom */
.${cls} {
  overflow: hidden;
}
.${cls} img,
.${cls}.tah-img-self {
  transform: scale(1.08);
  transition: transform ${opts.duration}ms ${opts.easing} ${opts.delay}ms;
  will-change: transform;
}
.${cls}.tah-visible img,
.${cls}.tah-visible.tah-img-self {
  transform: scale(1);
}
${opts.reducedMotion ? `@media (prefers-reduced-motion: reduce) {
  .${cls} img, .${cls}.tah-img-self { transform: none; }
}` : ''}`;
}

function scrollPinCSS(cls: string, _opts: AnimationOptions): string {
  return `/* Tilda Animation Helper: Scroll Pin */
/* NOTE: Scroll Pin requires JS to function. CSS below is for the pinned state */
.${cls}-section {
  position: relative;
}
.${cls}-pinned {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
.${cls}-past {
  position: absolute;
  bottom: 0;
  top: auto;
}`;
}

// ─── JS Templates ─────────────────────────────────────────────────────────────

function intersectionObserverJS(selector: string, cls: string, threshold = 0.2): string {
  return `(function() {
  function initTAH() {
    var els = document.querySelectorAll(${JSON.stringify(selector)});
    if (!els.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('tah-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: ${threshold} });
    els.forEach(function(el) {
      el.classList.add(${JSON.stringify(cls)});
      observer.observe(el);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTAH);
  } else {
    initTAH();
  }
})();`;
}

function staggerJS(selector: string, cls: string, staggerDelay: number): string {
  return `(function() {
  function initTAH() {
    var els = document.querySelectorAll(${JSON.stringify(selector)});
    if (!els.length) return;
    els.forEach(function(el, i) {
      el.classList.add(${JSON.stringify(cls)});
      el.style.transitionDelay = (i * ${staggerDelay}) + 'ms';
    });
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('tah-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(function(el) { observer.observe(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTAH);
  } else {
    initTAH();
  }
})();`;
}

function parallaxJS(selector: string, cls: string, speed = 0.3): string {
  return `(function() {
  var els = [];
  function initTAH() {
    var found = document.querySelectorAll(${JSON.stringify(selector)});
    if (!found.length) return;
    found.forEach(function(el) {
      el.classList.add(${JSON.stringify(cls)});
      els.push(el);
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  function onScroll() {
    var scrollY = window.pageYOffset;
    els.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var centerY = rect.top + scrollY + rect.height / 2;
      var offset = (scrollY - centerY) * ${speed};
      el.style.transform = 'translateY(' + offset + 'px)';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTAH);
  } else {
    initTAH();
  }
})();`;
}

function textRevealJS(selector: string, cls: string): string {
  return `(function() {
  function initTAH() {
    var els = document.querySelectorAll(${JSON.stringify(selector)});
    if (!els.length) return;
    els.forEach(function(el) {
      var wrap = document.createElement('span');
      wrap.className = ${JSON.stringify(cls + '-wrap')};
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      el.classList.add(${JSON.stringify(cls)});
    });
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('tah-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    els.forEach(function(el) { observer.observe(el); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTAH);
  } else {
    initTAH();
  }
})();`;
}

function scrollPinJS(selector: string, cls: string): string {
  return `(function() {
  function initTAH() {
    var el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return;
    var section = el.closest('[id^="rec"]') || el.parentElement;
    if (!section) return;
    el.classList.add(${JSON.stringify(cls + '-pinned')});
    var sectionTop = section.offsetTop;
    var sectionH = section.offsetHeight;
    var elH = el.offsetHeight;
    window.addEventListener('scroll', function() {
      var scrollY = window.pageYOffset;
      if (scrollY < sectionTop) {
        el.style.position = '';
        el.style.top = '';
      } else if (scrollY >= sectionTop && scrollY < sectionTop + sectionH - elH) {
        el.style.position = 'fixed';
        el.style.top = '0';
      } else {
        el.style.position = 'absolute';
        el.style.top = (sectionH - elH) + 'px';
      }
    }, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTAH);
  } else {
    initTAH();
  }
})();`;
}

function hoverLiftJS(selector: string, cls: string): string {
  return `(function() {
  function initTAH() {
    var els = document.querySelectorAll(${JSON.stringify(selector)});
    els.forEach(function(el) { el.classList.add(${JSON.stringify(cls)}); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTAH);
  } else {
    initTAH();
  }
})();`;
}

// ─── Main generator ────────────────────────────────────────────────────────────

function buildInstructions(presetId: AnimationPresetId, selector: string): string {
  return `Как вставить код в Tilda:

1. Откройте редактор страницы в Tilda.
2. Добавьте новый блок "T123 — HTML-код" (другое название: "Произвольный HTML").
   — Либо перейдите: Настройки страницы → SEO → HTML-код перед закрывающим тегом </body>
3. В блок HTML вставьте сначала блок <style>...</style> с CSS-кодом.
4. Затем вставьте <script>...</script> с JS-кодом.
5. Сохраните и опубликуйте страницу.

Важно:
• Код применится ТОЛЬКО на текущей странице.
• Если нужно применить ко всему сайту: Настройки сайта → HTML-код → перед </body>.
• Селектор в JS: ${selector}
• Убедитесь, что элемент существует на странице после публикации.
${presetId === 'stagger-animation' ? '\n• Для stagger анимации укажите общий родительский контейнер или класс группы элементов.' : ''}
${presetId === 'parallax-scroll' ? '\n• Параллакс может быть отключён на мобильных браузерах из соображений производительности.' : ''}`;
}

export function generateAnimation(
  element: TildaElement,
  presetId: AnimationPresetId,
  userOptions: Partial<AnimationOptions> = {}
): GeneratedCode {
  const opts: AnimationOptions = { ...DEFAULT_OPTIONS, ...userOptions };
  const cls = generateUniqueClassName();
  const sel = element.selector;
  const preset = getPreset(presetId);

  let css = '';
  let js = '';

  switch (presetId) {
    case 'fade-up':
      css = fadeUpCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.2);
      break;
    case 'fade-in':
      css = fadeInCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.15);
      break;
    case 'slide-left':
      css = slideLeftCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.2);
      break;
    case 'slide-right':
      css = slideRightCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.2);
      break;
    case 'scale-in':
      css = scaleInCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.25);
      break;
    case 'parallax-scroll':
      css = parallaxScrollCSS(cls, opts);
      js = parallaxJS(sel, cls, 0.3);
      break;
    case 'floating-loop':
      css = floatingLoopCSS(cls, opts);
      js = hoverLiftJS(sel, cls); // just adds class
      break;
    case 'hover-lift':
      css = hoverLiftCSS(cls, opts);
      js = hoverLiftJS(sel, cls);
      break;
    case 'text-reveal':
      css = textRevealCSS(cls, opts);
      js = textRevealJS(sel, cls);
      break;
    case 'stagger-animation':
      css = staggerAnimationCSS(cls, opts);
      js = staggerJS(sel + ' > *', cls, opts.staggerDelay);
      break;
    case 'background-blur-glow':
      css = backgroundBlurGlowCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.2);
      break;
    case 'smooth-image-zoom':
      css = smoothImageZoomCSS(cls, opts);
      js = intersectionObserverJS(sel, cls, 0.1);
      break;
    case 'scroll-pin':
      css = scrollPinCSS(cls, opts);
      js = scrollPinJS(sel, cls);
      break;
  }

  const warnings: string[] = [...preset.warningsForZeroBlock];
  if (element.hasExistingTransform && ['fade-up', 'slide-left', 'slide-right', 'scale-in', 'parallax-scroll', 'floating-loop'].includes(presetId)) {
    warnings.unshift('⚠️ Элемент уже имеет CSS transform. Анимация может конфликтовать с существующим положением элемента.');
  }
  if (element.selectorStability === 'fragile') {
    warnings.unshift('⚠️ Селектор нестабилен (использует nth-child). При изменении структуры страницы код может перестать работать.');
  }
  if (element.selectorStability === 'unstable') {
    warnings.unshift('⚠️ Селектор относительно нестабилен. Рекомендуется проверить после редактирования страницы.');
  }

  return {
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    elementLabel: element.humanLabel,
    selector: sel,
    presetId,
    presetName: preset.nameRu,
    css: `<style>\n${css}\n</style>`,
    js: `<script>\n${js}\n</script>`,
    instructions: buildInstructions(presetId, sel),
    warnings,
    animClassName: cls,
  };
}

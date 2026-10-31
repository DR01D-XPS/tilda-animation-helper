import type { TildaElement } from '../types';
import { PRESET_IDS } from './presets';
import { generateUniqueClassName } from '../utils/domUtils';

export function buildAnimationPrompt(element: TildaElement, animationQuery: string): string {
  const elementInfo = buildElementInfo(element);
  const presetList = PRESET_IDS.filter((id) => id !== 'custom').join(', ');

  return `You are a CSS/JS animation expert for Tilda website builder.

The user wants to animate an element with the following properties:
${elementInfo}

User's animation request: "${animationQuery}"

Available animation presets: ${presetList}

Respond with valid JSON only:
{
  "presetId": "<one of the preset IDs>",
  "options": {
    "duration": <number in ms, optional>,
    "delay": <number in ms, optional>,
    "easing": "<css easing, optional>",
    "distance": <number in px, optional>,
    "staggerDelay": <number in ms, optional>
  },
  "explanation": "<brief explanation of your choice in Russian>"
}

Important:
- If element already has transform and preset uses transform, pick a preset that uses only opacity.
- For images, prefer smooth-image-zoom or fade-in.
- For buttons, prefer hover-lift.
- For headings, prefer text-reveal or fade-up.
- For groups/cards, prefer stagger-animation.
- For background elements, prefer floating-loop or parallax-scroll.`;
}

/**
 * Prompt for fully custom animation generation.
 * AI returns raw CSS + JS code, not a preset selection.
 */
export function buildCustomAnimationPrompt(
  element: TildaElement,
  description: string,
  uniqueClass: string
): string {
  const elementInfo = buildElementInfo(element);
  const selector = element.selector;
  const transformWarning = element.hasExistingTransform
    ? '⚠️ WARNING: This element already has a CSS transform (used by Tilda for positioning). DO NOT set transform on the element itself — only on its children (.tn-atom, img inside it).'
    : '';

  return `You are a CSS/JS animation expert for Tilda website builder (Zero Block).

ELEMENT INFO:
${elementInfo}

CSS SELECTOR to use: ${selector}
UNIQUE CSS CLASS to use: ${uniqueClass}
${transformWarning}

USER'S ANIMATION DESCRIPTION:
"${description}"

RULES (follow strictly):
1. Pure CSS + Vanilla JS ONLY. No jQuery, no GSAP, no external libraries.
2. Use the provided unique class "${uniqueClass}" for ALL CSS rules.
3. For scroll-triggered animations: use IntersectionObserver (threshold 0.15–0.3).
4. For scroll-linked (parallax): use window scroll + requestAnimationFrame.
5. For hover effects: pure CSS :hover pseudo-class — no JS needed.
6. For loop animations: pure CSS @keyframes — no JS needed.
7. JS MUST use: document.querySelectorAll(${JSON.stringify(selector)}) to find elements.
8. JS MUST be wrapped in: (function() { ... })();
9. JS MUST handle: if (document.readyState === 'loading') { addEventListener('DOMContentLoaded', init) } else { init() }
10. Add @media (prefers-reduced-motion: reduce) { /* disable/simplify animation */ }
11. Do NOT use position:fixed or position:absolute unless the user explicitly asks.
12. Do NOT change the element's layout (width, height, display, margin, padding) — only use opacity, transform on CHILDREN, filter, box-shadow, clip-path.
13. will-change: add only on animated properties.

RESPOND IN THIS EXACT FORMAT — nothing before ===CSS=== and nothing after ===END===:
===CSS===
/* paste complete CSS here */
===JS===
/* paste complete JS here, or write "NO_JS" if animation is CSS-only */
===END===`;
}

export function parseAIResponse(raw: string): {
  presetId: string;
  options: Record<string, number | string>;
  explanation: string;
} {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found');
    return JSON.parse(match[0]);
  } catch {
    return {
      presetId: 'fade-up',
      options: {},
      explanation: 'Не удалось разобрать ответ AI, применяю пресет по умолчанию.',
    };
  }
}

export function parseCustomResponse(raw: string): { css: string; js: string } {
  const cssMatch = raw.match(/===CSS===\s*([\s\S]*?)\s*===JS===/);
  const jsMatch = raw.match(/===JS===\s*([\s\S]*?)\s*===END===/);

  const css = cssMatch?.[1]?.trim() || '';
  const jsRaw = jsMatch?.[1]?.trim() || '';
  const js = jsRaw === 'NO_JS' ? '' : jsRaw;

  return { css, js };
}

function buildElementInfo(element: TildaElement): string {
  return [
    `Tag: ${element.tagName}`,
    `Type: ${element.humanType}`,
    `Label: ${element.humanLabel}`,
    `CSS selector: ${element.selector}`,
    element.textContent ? `Text: "${element.textContent}"` : null,
    `Has existing transform: ${element.hasExistingTransform}`,
    `Is Zero Block element: ${element.isZeroBlock}`,
    `Size: ${element.boundingRect.width}×${element.boundingRect.height}px`,
  ]
    .filter(Boolean)
    .join('\n');
}

// Re-export for use in aiProvider
export { generateUniqueClassName };

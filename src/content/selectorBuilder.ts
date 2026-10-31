import type { SelectorStability } from '../types';

export interface SelectorResult {
  selector: string;
  stability: SelectorStability;
}

/**
 * Builds a stable CSS selector for a DOM element, prioritising:
 * 1. #rec<id> + data-elem-id combination (most stable for Zero Block)
 * 2. id attribute
 * 3. data-elem-id alone
 * 4. unique class combination
 * 5. Fallback nth-child (fragile)
 */
export function buildSelector(el: Element): SelectorResult {
  // 1. Zero Block: find ancestor #rec block + data-elem-id
  const elemId = el.getAttribute('data-elem-id') ||
    el.closest('[data-elem-id]')?.getAttribute('data-elem-id');
  const recAncestor = findRecAncestor(el);

  if (recAncestor && elemId) {
    const recId = recAncestor.id;
    const selector = `#${CSS.escape(recId)} .tn-elem[data-elem-id="${elemId}"]`;
    return { selector, stability: 'stable' };
  }

  // 2. data-elem-id without rec block
  if (elemId) {
    return {
      selector: `.tn-elem[data-elem-id="${elemId}"]`,
      stability: 'stable',
    };
  }

  // 3. Element's own id
  if (el.id && el.id.trim()) {
    return {
      selector: `#${CSS.escape(el.id)}`,
      stability: 'stable',
    };
  }

  // 4. Unique class within rec block
  if (recAncestor) {
    const recId = recAncestor.id;
    const classes = getUniqueClasses(el);
    if (classes.length > 0) {
      const classSelector = classes.map((c) => `.${CSS.escape(c)}`).join('');
      const selector = `#${CSS.escape(recId)} ${classSelector}`;
      if (isUnique(selector)) {
        return { selector, stability: 'unstable' };
      }
    }
  }

  // 5. Try unique class combination in whole document
  const classes = getUniqueClasses(el);
  if (classes.length > 0) {
    const classSelector = classes.map((c) => `.${CSS.escape(c)}`).join('');
    if (isUnique(classSelector)) {
      return { selector: classSelector, stability: 'unstable' };
    }
  }

  // 6. Tag + class within rec block (less unique)
  if (recAncestor) {
    const recId = recAncestor.id;
    const tag = el.tagName.toLowerCase();
    const primaryClass = getPrimaryTildaClass(el);
    if (primaryClass) {
      const selector = `#${CSS.escape(recId)} ${tag}.${CSS.escape(primaryClass)}`;
      if (isUnique(selector)) {
        return { selector, stability: 'unstable' };
      }
    }
  }

  // 7. Last resort: full nth-child path (fragile)
  return { selector: buildNthChildSelector(el), stability: 'fragile' };
}

function findRecAncestor(el: Element): Element | null {
  let current: Element | null = el;
  while (current) {
    if (current.id && /^rec\d+$/.test(current.id)) return current;
    current = current.parentElement;
  }
  return null;
}

function getUniqueClasses(el: Element): string[] {
  const classes = Array.from(el.classList).filter(
    (c) =>
      // Exclude generic/structural Tilda classes
      !c.startsWith('t396') &&
      !['tn-elem', 'tn-atom', 't-container', 't-col', 't-row'].includes(c) &&
      c.length > 2
  );
  return classes;
}

function getPrimaryTildaClass(el: Element): string | null {
  const priorities = ['tn-atom__img', 'tn-atom_btn', 'tn-atom__text', 'tn-atom__title', 't-btn'];
  for (const cls of priorities) {
    if (el.classList.contains(cls)) return cls;
  }
  return Array.from(el.classList)[0] || null;
}

function isUnique(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

function buildNthChildSelector(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.body) {
    const parent = current.parentElement;
    if (!parent) break;

    const tag = current.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(
      (c) => c.tagName === current!.tagName
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;

    // Stop at rec block to keep selector reasonably short
    if (parent.id && /^rec\d+$/.test(parent.id)) {
      parts.unshift(`#${parent.id}`);
      break;
    }
  }

  return parts.join(' > ');
}

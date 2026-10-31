export function getShortText(el: Element, maxLen = 80): string {
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

export function detectElementType(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const cls = (el.className || '').toString();

  if (tag === 'img') return 'image';
  if (tag === 'svg' || el.querySelector('svg')) return 'svg';
  if (tag === 'video') return 'video';
  if (tag === 'button') return 'button';
  if (tag === 'a' && (cls.includes('btn') || cls.includes('button'))) return 'button';
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading';

  // Tilda-specific classes
  if (cls.includes('tn-atom__img') || cls.includes('t-img')) return 'image';
  if (cls.includes('tn-atom_btn') || cls.includes('t-btn') || cls.includes('t396__btn')) return 'button';
  if (cls.includes('t-title') || cls.includes('tn-atom__title')) return 'heading';
  if (cls.includes('t-text') || cls.includes('tn-atom__text')) return 'text';
  if (cls.includes('t-btn')) return 'button';

  const hasImg = !!el.querySelector('img');
  if (hasImg) return 'image';

  const style = window.getComputedStyle(el);
  const bg = style.backgroundImage;
  if (bg && bg !== 'none' && bg.includes('url(')) return 'image';

  const text = (el.textContent || '').trim();
  if (text && text.length < 300) return 'text';

  return 'unknown';
}

export function generateUniqueClassName(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const ts = Date.now().toString(36).slice(-4);
  return `tah-${rand}${ts}`;
}

export function isElementVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    parseFloat(style.opacity) > 0
  );
}

export function formatSelector(sel: string): string {
  return sel.length > 60 ? sel.slice(0, 57) + '…' : sel;
}

export function hasTransformOtherThanNone(el: Element): boolean {
  const style = window.getComputedStyle(el);
  const transform = style.transform;
  return transform !== 'none' && transform !== '' && transform !== 'matrix(1, 0, 0, 1, 0, 0)';
}

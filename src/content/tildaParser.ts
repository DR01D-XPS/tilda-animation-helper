import type { TildaElement, HumanElementType } from '../types';
import { getShortText, detectElementType, hasTransformOtherThanNone } from '../utils/domUtils';
import { buildSelector } from './selectorBuilder';

let blockIndexCounter = 0;
const blockIndexMap = new Map<string, number>();

function getBlockIndex(recId: string): number {
  if (!blockIndexMap.has(recId)) {
    blockIndexMap.set(recId, blockIndexCounter++);
  }
  return blockIndexMap.get(recId)!;
}

function parseDataset(el: Element): Record<string, string> {
  const result: Record<string, string> = {};
  const dataset = (el as HTMLElement).dataset;
  for (const key in dataset) {
    if (Object.prototype.hasOwnProperty.call(dataset, key)) {
      result[key] = dataset[key] || '';
    }
  }
  return result;
}

function buildHumanLabel(el: Element, blockId: string, humanType: HumanElementType): string {
  const typeLabels: Record<HumanElementType, string> = {
    heading: 'Заголовок',
    text: 'Текст',
    button: 'Кнопка',
    image: 'Изображение',
    shape: 'Фигура',
    group: 'Группа',
    video: 'Видео',
    svg: 'SVG-фигура',
    background: 'Фон',
    unknown: 'Элемент',
  };

  const typeLabel = typeLabels[humanType];
  const text = getShortText(el, 40);

  if ((humanType === 'heading' || humanType === 'text' || humanType === 'button') && text) {
    return `${typeLabel}: "${text}" [${blockId}]`;
  }

  const imgEl = el.tagName === 'IMG' ? el : el.querySelector('img');
  if (imgEl) {
    const alt = (imgEl as HTMLImageElement).alt?.trim();
    if (alt) return `${typeLabel}: "${alt}" [${blockId}]`;
  }

  const ariaLabel = el.getAttribute('aria-label')?.trim();
  if (ariaLabel) return `${typeLabel}: "${ariaLabel}" [${blockId}]`;

  const elemId = el.getAttribute('data-elem-id') || el.closest('[data-elem-id]')?.getAttribute('data-elem-id');
  if (elemId) return `${typeLabel} #${elemId} [${blockId}]`;

  return `${typeLabel} в блоке ${blockId}`;
}

export function parseElement(el: Element, blockId: string, blockIndex: number): TildaElement | null {
  try {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const { selector, stability } = buildSelector(el);
    const rawType = detectElementType(el);
    const humanType = rawType as HumanElementType;
    const dataset = parseDataset(el);
    const elemId = dataset['elemId'] || el.getAttribute('data-elem-id') || '';

    const imgEl = el.tagName === 'IMG' ? (el as HTMLImageElement) : el.querySelector('img');

    return {
      id: `elem-${blockId}-${elemId || Math.random().toString(36).slice(2, 8)}`,
      blockId,
      elemId,
      tagName: el.tagName.toLowerCase(),
      className: (el.className || '').toString(),
      textContent: getShortText(el, 80),
      selector,
      humanLabel: buildHumanLabel(el, blockId, humanType),
      humanType,
      boundingRect: {
        top: Math.round(rect.top + window.scrollY),
        left: Math.round(rect.left + window.scrollX),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom + window.scrollY),
      },
      dataset,
      computedStyles: {
        width: style.width,
        height: style.height,
        top: style.top,
        left: style.left,
        opacity: style.opacity,
        transform: style.transform,
        zIndex: style.zIndex,
        position: style.position,
      },
      isZeroBlock: true,
      blockIndex,
      hasExistingTransform: hasTransformOtherThanNone(el),
      selectorStability: stability,
      altText: imgEl ? (imgEl as HTMLImageElement).alt : undefined,
      ariaLabel: el.getAttribute('aria-label') || undefined,
    };
  } catch {
    return null;
  }
}

export function parseBlock(recBlock: Element): TildaElement[] {
  const blockId = recBlock.id || `block-${Math.random().toString(36).slice(2, 6)}`;
  const blockIndex = getBlockIndex(blockId);

  const elements: TildaElement[] = [];

  // Find Zero Block artboards
  const artboards = recBlock.querySelectorAll('.t396__artboard');

  if (artboards.length === 0) {
    // Not a Zero Block — parse top-level meaningful children
    const children = recBlock.querySelectorAll('h1,h2,h3,h4,h5,h6,p,img,button,a,div.t-btn,[class*="t-title"],[class*="t-text"]');
    children.forEach((child) => {
      const parsed = parseElement(child, blockId, blockIndex);
      if (parsed) elements.push(parsed);
    });
    return elements;
  }

  // Zero Block: parse .tn-elem children
  artboards.forEach((artboard) => {
    const tnElems = artboard.querySelectorAll('.tn-elem');
    tnElems.forEach((tnElem) => {
      // Parse the atom inside tn-elem (the actual content element)
      const atom = tnElem.querySelector('.tn-atom');
      const target = atom || tnElem;
      const parsed = parseElement(target, blockId, blockIndex);
      if (parsed) elements.push(parsed);
    });
  });

  return elements;
}

export function resetBlockIndex(): void {
  blockIndexCounter = 0;
  blockIndexMap.clear();
}

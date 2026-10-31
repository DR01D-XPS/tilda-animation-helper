import type { TildaElement, HumanElementType } from '../types';
import { parseBlock, resetBlockIndex } from './tildaParser';

export class PageScanner {
  scan(): TildaElement[] {
    resetBlockIndex();

    // Find all #rec... blocks (Tilda sections)
    const recBlocks = Array.from(document.querySelectorAll('[id^="rec"]'));

    if (recBlocks.length === 0) {
      // Fallback: parse body for any Zero Block elements
      const zeroBlocks = document.querySelectorAll('.t396');
      if (zeroBlocks.length > 0) {
        const allElems: TildaElement[] = [];
        zeroBlocks.forEach((zb) => {
          const parsed = parseBlock(zb.closest('[id^="rec"]') || zb);
          allElems.push(...parsed);
        });
        return sortByPosition(allElems);
      }
      return [];
    }

    const allElements: TildaElement[] = [];
    recBlocks.forEach((block) => {
      try {
        const elements = parseBlock(block);
        allElements.push(...elements);
      } catch {
        // Skip blocks that fail to parse
      }
    });

    return sortByPosition(allElements);
  }

  searchElements(query: string, elements: TildaElement[]): TildaElement[] {
    if (!query.trim()) return elements;

    const q = query.toLowerCase().trim();
    const scored = elements.map((el) => ({ el, score: scoreMatch(el, q) }));
    const matched = scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);

    return matched.map((x) => x.el);
  }
}

function sortByPosition(elements: TildaElement[]): TildaElement[] {
  return [...elements].sort((a, b) => {
    if (a.blockIndex !== b.blockIndex) return a.blockIndex - b.blockIndex;
    return a.boundingRect.top - b.boundingRect.top;
  });
}

function scoreMatch(el: TildaElement, query: string): number {
  let score = 0;

  // Exact text match
  if (el.textContent.toLowerCase().includes(query)) score += 10;

  // Human label match
  if (el.humanLabel.toLowerCase().includes(query)) score += 8;

  // Type keywords
  const typeMap: Record<string, HumanElementType[]> = {
    'заголовок': ['heading'],
    'заголовки': ['heading'],
    'heading': ['heading'],
    'title': ['heading'],
    'текст': ['text'],
    'text': ['text'],
    'кнопка': ['button'],
    'кнопку': ['button'],
    'button': ['button'],
    'btn': ['button'],
    'картинка': ['image'],
    'картинку': ['image'],
    'изображение': ['image'],
    'фото': ['image'],
    'image': ['image'],
    'img': ['image'],
    'фигура': ['shape'],
    'shape': ['shape'],
    'круг': ['shape', 'svg'],
    'svg': ['svg'],
    'видео': ['video'],
    'video': ['video'],
    'фон': ['background', 'image'],
    'background': ['background'],
  };

  for (const [keyword, types] of Object.entries(typeMap)) {
    if (query.includes(keyword) && (types as string[]).includes(el.humanType)) {
      score += 5;
    }
  }

  // Block position keywords
  const blockNum = parseInt(query.match(/(\d+)[- ]*(й|ой|ий|блок|block)/)?.[1] || '0');
  if (blockNum > 0 && el.blockIndex === blockNum - 1) score += 7;

  if ((query.includes('первый') || query.includes('first') || query.includes('1 блок')) && el.blockIndex === 0) score += 6;
  if ((query.includes('последний') || query.includes('last')) && isLastBlock(el)) score += 6;
  if ((query.includes('второй') || query.includes('second') || query.includes('2 блок')) && el.blockIndex === 1) score += 5;
  if ((query.includes('третий') || query.includes('third') || query.includes('3 блок')) && el.blockIndex === 2) score += 5;

  // Position keywords
  if (query.includes('справа') && el.boundingRect.left > window.innerWidth * 0.5) score += 3;
  if (query.includes('слева') && el.boundingRect.left < window.innerWidth * 0.5) score += 3;
  if (query.includes('сверху') && el.boundingRect.top < window.innerHeight) score += 2;
  if (query.includes('снизу') && el.boundingRect.top > window.innerHeight) score += 2;
  if (query.includes('центр') && Math.abs(el.boundingRect.left - window.innerWidth / 2) < 200) score += 3;

  // Class/id partial match
  if (el.className.toLowerCase().includes(query.replace(/\s+/g, ''))) score += 4;
  if (el.elemId && el.elemId.includes(query)) score += 4;

  // Alt text / aria-label
  if (el.altText?.toLowerCase().includes(query)) score += 6;
  if (el.ariaLabel?.toLowerCase().includes(query)) score += 6;

  return score;
}

let _maxBlockIndex = 0;
function isLastBlock(el: TildaElement): boolean {
  // Rough heuristic — updated after scan
  return el.blockIndex >= _maxBlockIndex;
}

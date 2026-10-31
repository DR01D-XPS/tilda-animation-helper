import type { TildaElement } from '../types';
import { parseElement } from './tildaParser';

const HIGHLIGHT_STYLE = [
  'outline: 2px dashed #6366f1 !important',
  'outline-offset: 2px !important',
  'cursor: crosshair !important',
  'transition: outline 0.15s ease !important',
].join(';');

const SELECTED_STYLE = [
  'outline: 3px solid #6366f1 !important',
  'outline-offset: 2px !important',
].join(';');

export class ElementPicker {
  private active = false;
  private hoveredEl: HTMLElement | null = null;
  private onSelectCallback: ((el: TildaElement) => void) | null = null;
  private onCancelCallback: (() => void) | null = null;
  private overlay: HTMLDivElement | null = null;

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.active) return;
    const target = this.getPickableTarget(e.target as HTMLElement);
    if (!target || target === this.hoveredEl) return;

    if (this.hoveredEl) this.clearHighlight(this.hoveredEl);
    this.hoveredEl = target;
    this.applyHighlight(target);
    this.updateOverlayLabel(target, e);
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.active) return;
    e.preventDefault();
    e.stopPropagation();

    const target = this.getPickableTarget(e.target as HTMLElement);
    if (!target) return;

    if (this.hoveredEl) this.clearHighlight(this.hoveredEl);
    this.applySelectedHighlight(target);

    // Find nearest block
    const recBlock = target.closest('[id^="rec"]');
    const blockId = recBlock?.id || 'unknown';
    const blockIndex = parseInt(blockId.replace('rec', '')) || 0;

    const parsed = parseElement(target, blockId, blockIndex);
    if (parsed) {
      this.onSelectCallback?.(parsed);
    }

    this.stop();
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.active) {
      this.stop();
      this.onCancelCallback?.();
    }
  };

  private getPickableTarget(el: HTMLElement | null): HTMLElement | null {
    if (!el) return null;
    // Skip our own UI elements
    if (el.id === 'tah-root' || el.closest('#tah-root') || el.closest('[data-tah]')) {
      return null;
    }
    // Prefer .tn-elem or .t396__elem if nearby
    const tnElem = el.closest('.tn-elem') as HTMLElement;
    if (tnElem) return tnElem.querySelector('.tn-atom') as HTMLElement || tnElem;
    return el;
  }

  start(onSelect: (el: TildaElement) => void, onCancel?: () => void): void {
    if (this.active) return;
    this.active = true;
    this.onSelectCallback = onSelect;
    this.onCancelCallback = onCancel || null;

    document.addEventListener('mousemove', this.handleMouseMove, true);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeyDown, true);

    this.createOverlayLabel();
    document.body.style.cursor = 'crosshair';
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;

    document.removeEventListener('mousemove', this.handleMouseMove, true);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);

    if (this.hoveredEl) this.clearHighlight(this.hoveredEl);
    this.hoveredEl = null;
    this.removeOverlayLabel();
    document.body.style.cursor = '';
  }

  highlightBySelector(selector: string): void {
    this.clearAllHighlights();
    try {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) this.applyHighlight(el);
    } catch {
      // invalid selector
    }
  }

  clearAllHighlights(): void {
    document.querySelectorAll('[data-tah-highlight]').forEach((el) => {
      (el as HTMLElement).style.cssText = (el as HTMLElement).getAttribute('data-tah-original-style') || '';
      el.removeAttribute('data-tah-highlight');
      el.removeAttribute('data-tah-original-style');
    });
  }

  isActive(): boolean {
    return this.active;
  }

  private applyHighlight(el: HTMLElement): void {
    el.setAttribute('data-tah-original-style', el.style.cssText);
    el.setAttribute('data-tah-highlight', 'hover');
    el.style.cssText += ';' + HIGHLIGHT_STYLE;
  }

  private applySelectedHighlight(el: HTMLElement): void {
    el.setAttribute('data-tah-highlight', 'selected');
    el.style.cssText += ';' + SELECTED_STYLE;
  }

  private clearHighlight(el: HTMLElement): void {
    const originalStyle = el.getAttribute('data-tah-original-style');
    if (originalStyle !== null) {
      el.style.cssText = originalStyle;
    }
    el.removeAttribute('data-tah-highlight');
    el.removeAttribute('data-tah-original-style');
  }

  private createOverlayLabel(): void {
    this.overlay = document.createElement('div');
    this.overlay.setAttribute('data-tah', 'picker-label');
    this.overlay.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'pointer-events:none',
      'background:#6366f1',
      'color:#fff',
      'padding:4px 8px',
      'border-radius:4px',
      'font:12px/1.4 system-ui,sans-serif',
      'opacity:0',
      'transition:opacity 0.15s',
      'max-width:300px',
      'word-break:break-all',
    ].join(';');
    this.overlay.textContent = 'Кликните чтобы выбрать элемент | Esc — отмена';
    document.body.appendChild(this.overlay);
    setTimeout(() => {
      if (this.overlay) this.overlay.style.opacity = '1';
    }, 50);
  }

  private updateOverlayLabel(el: HTMLElement, e: MouseEvent): void {
    if (!this.overlay) return;
    const tag = el.tagName.toLowerCase();
    const cls = Array.from(el.classList).slice(0, 2).join('.');
    this.overlay.textContent = `<${tag}>${cls ? ' .' + cls : ''} | Esc — отмена`;

    // Position near cursor
    const x = Math.min(e.clientX + 12, window.innerWidth - 320);
    const y = Math.max(e.clientY - 36, 8);
    this.overlay.style.left = `${x}px`;
    this.overlay.style.top = `${y}px`;
  }

  private removeOverlayLabel(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

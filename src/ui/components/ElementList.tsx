import React from 'react';
import type { TildaElement, HumanElementType } from '../../types';

const TYPE_ICONS: Record<HumanElementType, string> = {
  heading: '🔤',
  text: '📝',
  button: '🔲',
  image: '🖼️',
  shape: '🔶',
  group: '📦',
  video: '🎬',
  svg: '✦',
  background: '🌅',
  unknown: '◻',
};

interface Props {
  elements: TildaElement[];
  selectedElement: TildaElement | null;
  onSelect: (el: TildaElement) => void;
  onHover?: (el: TildaElement | null) => void;
}

export const ElementList: React.FC<Props> = ({ elements, selectedElement, onSelect, onHover }) => {
  if (elements.length === 0) {
    return (
      <div className="tah-empty">
        <span className="tah-empty-icon">🔍</span>
        <span>Ничего не найдено</span>
      </div>
    );
  }

  return (
    <div className="tah-elem-list">
      {elements.map((el) => (
        <div
          key={el.id}
          className={`tah-elem-item${el.id === selectedElement?.id ? ' selected' : ''}`}
          onClick={() => onSelect(el)}
          onMouseEnter={() => onHover?.(el)}
          onMouseLeave={() => onHover?.(null)}
          title={el.selector}
        >
          <span className="tah-elem-icon">{TYPE_ICONS[el.humanType]}</span>
          <div className="tah-elem-info">
            <div className="tah-elem-label">{el.humanLabel}</div>
            <div className="tah-elem-sub">
              {el.selector.length > 45 ? el.selector.slice(0, 45) + '…' : el.selector}
            </div>
          </div>
          <span className={`tah-stability-badge tah-stability-${el.selectorStability}`}>
            {el.selectorStability === 'stable' ? '✓' : el.selectorStability === 'fragile' ? '!' : '~'}
          </span>
        </div>
      ))}
    </div>
  );
};

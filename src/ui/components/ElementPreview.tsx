import React from 'react';
import type { TildaElement } from '../../types';

interface Props {
  element: TildaElement;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="tah-preview-row">
    <span className="tah-preview-key">{label}</span>
    <span className="tah-preview-val">{value || '—'}</span>
  </div>
);

export const ElementPreview: React.FC<Props> = ({ element }) => {
  const size = `${element.boundingRect.width} × ${element.boundingRect.height} px`;
  const pos = `top: ${element.boundingRect.top}, left: ${element.boundingRect.left}`;

  return (
    <div className="tah-preview">
      <Row label="Тег" value={`<${element.tagName}>`} />
      <Row label="Тип" value={element.humanType} />
      {element.textContent && <Row label="Текст" value={`"${element.textContent}"`} />}
      <Row label="Размер" value={size} />
      <Row label="Позиция" value={pos} />
      <Row label="Блок" value={element.blockId} />
      {element.elemId && <Row label="Elem ID" value={element.elemId} />}
      <Row
        label="Selector"
        value={element.selector.length > 55 ? element.selector.slice(0, 55) + '…' : element.selector}
      />
      <div className="tah-preview-row">
        <span className="tah-preview-key">Стабил.</span>
        <span className={`tah-stability-badge tah-stability-${element.selectorStability}`}>
          {element.selectorStability}
        </span>
      </div>
      {element.hasExistingTransform && (
        <div className="tah-warning" style={{ marginTop: 4 }}>
          <span>⚠️</span>
          <span>Элемент уже имеет CSS transform. Некоторые анимации могут конфликтовать.</span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import type { GeneratedCode } from '../../types';

interface Props {
  history: GeneratedCode[];
  onSelect: (code: GeneratedCode) => void;
  onClear: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export const History: React.FC<Props> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="tah-empty">
        <span className="tah-empty-icon">📋</span>
        <span>История пуста</span>
        <span style={{ fontSize: 11 }}>Сгенерируйте первую анимацию</span>
      </div>
    );
  }

  return (
    <div className="tah-section">
      <div className="tah-row">
        <span className="tah-section-title" style={{ flex: 1 }}>
          История ({history.length})
        </span>
        <button className="tah-btn tah-btn-danger tah-btn-sm" onClick={onClear}>
          Очистить
        </button>
      </div>

      {history.map((item) => (
        <div
          key={item.id}
          className="tah-history-item"
          onClick={() => onSelect(item)}
          title="Нажмите чтобы открыть в генераторе"
        >
          <div className="tah-history-label">{item.elementLabel}</div>
          <div className="tah-history-meta">
            <span className="tah-badge tah-badge-accent" style={{ marginRight: 5 }}>
              {item.presetName}
            </span>
            {formatDate(item.timestamp)}
          </div>
          <div className="tah-history-meta" style={{ fontFamily: 'monospace', fontSize: 10 }}>
            {item.selector.length > 50 ? item.selector.slice(0, 50) + '…' : item.selector}
          </div>
        </div>
      ))}
    </div>
  );
};

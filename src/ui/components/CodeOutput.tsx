import React, { useState } from 'react';
import type { GeneratedCode } from '../../types';
import { copyToClipboard } from '../../utils/clipboard';

interface Props {
  code: GeneratedCode;
  onSave: () => void;
}

type CopiedState = Record<string, boolean>;

export const CodeOutput: React.FC<Props> = ({ code, onSave }) => {
  const [copied, setCopied] = useState<CopiedState>({});
  const [showInstructions, setShowInstructions] = useState(false);

  const copy = async (key: string, text: string) => {
    await copyToClipboard(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  const copyAll = async () => {
    const all = `${code.css}\n\n${code.js}`;
    await copy('all', all);
  };

  return (
    <div className="tah-section">
      {/* Info row */}
      <div className="tah-row" style={{ flexWrap: 'wrap', gap: '6px' }}>
        <span className="tah-badge tah-badge-accent">{code.presetName}</span>
        <span className="tah-badge tah-badge-success">Готово</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', flex: 1 }}>
          {code.elementLabel}
        </span>
      </div>

      {/* Warnings */}
      {code.warnings.map((w, i) => (
        <div key={i} className="tah-warning">
          <span>⚠️</span>
          <span>{w}</span>
        </div>
      ))}

      {/* CSS */}
      <div className="tah-code-block">
        <div className="tah-code-header">
          <span className="tah-code-lang">CSS</span>
          <button
            className="tah-btn tah-btn-secondary tah-btn-sm"
            onClick={() => copy('css', code.css)}
          >
            {copied.css ? '✓ Скопировано' : '📋 Копировать CSS'}
          </button>
        </div>
        <pre className="tah-code-pre">{code.css}</pre>
      </div>

      {/* JS */}
      <div className="tah-code-block">
        <div className="tah-code-header">
          <span className="tah-code-lang">JS</span>
          <button
            className="tah-btn tah-btn-secondary tah-btn-sm"
            onClick={() => copy('js', code.js)}
          >
            {copied.js ? '✓ Скопировано' : '📋 Копировать JS'}
          </button>
        </div>
        <pre className="tah-code-pre">{code.js}</pre>
      </div>

      {/* Action buttons */}
      <div className="tah-row tah-row-wrap">
        <button className="tah-btn tah-btn-primary" onClick={copyAll} style={{ flex: 1 }}>
          {copied.all ? '✓ Скопировано!' : '⚡ Скопировать всё'}
        </button>
        <button className="tah-btn tah-btn-secondary" onClick={onSave}>
          💾 Сохранить
        </button>
      </div>

      {/* Instructions toggle */}
      <button
        className="tah-btn tah-btn-ghost tah-btn-full"
        onClick={() => setShowInstructions((v) => !v)}
      >
        {showInstructions ? '▲ Скрыть инструкцию' : '📖 Как вставить в Tilda'}
      </button>

      {showInstructions && (
        <div className="tah-instructions">{code.instructions}</div>
      )}
    </div>
  );
};

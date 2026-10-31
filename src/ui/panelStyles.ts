/**
 * Panel CSS as a string for injection into Shadow DOM.
 * Using a TS module avoids Vite CSS extraction issues in content scripts.
 */
export const PANEL_CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:host { all: initial; }

#tah-panel {
  position: fixed;
  top: 60px;
  right: 16px;
  width: 380px;
  max-height: calc(100vh - 80px);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  z-index: 2147483646;
  overflow: hidden;
  transition: transform 0.25s ease, opacity 0.25s ease;
  border: 1px solid var(--border);
}

#tah-panel.tah-hidden {
  display: none;
}

#tah-panel.tah-minimized {
  max-height: 52px;
  overflow: hidden;
}

/* ── Themes ──────────────────────────────────────────────────────────────── */
.tah-dark {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --bg-hover: #1e2a45;
  --bg-code: #0d1117;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: rgba(255,255,255,0.08);
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --accent-dim: rgba(99,102,241,0.15);
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --code-text: #7dd3fc;
}

.tah-light {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-hover: #e2e8f0;
  --bg-code: #0d1117;
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border: rgba(0,0,0,0.08);
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-dim: rgba(99,102,241,0.1);
  --success: #059669;
  --warning: #d97706;
  --error: #dc2626;
  --code-text: #0ea5e9;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.tah-header {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  gap: 8px;
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
}

.tah-header:active { cursor: grabbing; }

.tah-logo {
  width: 20px;
  height: 20px;
  background: var(--accent);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  font-weight: 700;
  flex-shrink: 0;
}

.tah-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
}

.tah-version {
  font-size: 10px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 1px 5px;
  border-radius: 4px;
}

.tah-header-btns {
  display: flex;
  gap: 4px;
}

.tah-icon-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.tah-icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.tah-tabs {
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tah-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 8px 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s, border-bottom 0.15s;
  border-bottom: 2px solid transparent;
  text-align: center;
  font-family: inherit;
}

.tah-tab:hover { color: var(--text-primary); }
.tah-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* ── Body ────────────────────────────────────────────────────────────────── */
.tah-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.tah-body::-webkit-scrollbar { width: 4px; }
.tah-body::-webkit-scrollbar-track { background: transparent; }
.tah-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.tah-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  border: none;
  font-family: inherit;
  white-space: nowrap;
  line-height: 1.4;
}

.tah-btn:active { transform: scale(0.97); }

.tah-btn-primary {
  background: var(--accent);
  color: white;
}
.tah-btn-primary:hover { background: var(--accent-hover); }
.tah-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.tah-btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
.tah-btn-secondary:hover { background: var(--bg-hover); }

.tah-btn-ghost {
  background: var(--accent-dim);
  color: var(--accent);
}
.tah-btn-ghost:hover { background: var(--accent); color: white; }

.tah-btn-danger {
  background: rgba(239,68,68,0.1);
  color: var(--error);
}
.tah-btn-danger:hover { background: var(--error); color: white; }

.tah-btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.tah-btn-full { width: 100%; }

/* ── Inputs ──────────────────────────────────────────────────────────────── */
.tah-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.tah-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  line-height: 1.4;
}

.tah-input:focus { border-color: var(--accent); }
.tah-input::placeholder { color: var(--text-muted); }

.tah-select {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text-primary);
  font-family: inherit;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}

/* ── Section ─────────────────────────────────────────────────────────────── */
.tah-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tah-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

/* ── Element list ────────────────────────────────────────────────────────── */
.tah-elem-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-secondary);
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.tah-elem-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  cursor: pointer;
  transition: background 0.12s;
  border-radius: 6px;
}

.tah-elem-item:hover { background: var(--bg-hover); }
.tah-elem-item.selected { background: var(--accent-dim); }

.tah-elem-icon {
  font-size: 14px;
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}

.tah-elem-info { flex: 1; min-width: 0; }

.tah-elem-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tah-elem-sub {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tah-stability-badge {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}
.tah-stability-stable { background: rgba(16,185,129,0.15); color: var(--success); }
.tah-stability-unstable { background: rgba(245,158,11,0.15); color: var(--warning); }
.tah-stability-fragile { background: rgba(239,68,68,0.15); color: var(--error); }

/* ── Element preview ─────────────────────────────────────────────────────── */
.tah-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tah-preview-row {
  display: flex;
  gap: 6px;
  font-size: 11px;
}

.tah-preview-key {
  color: var(--text-muted);
  flex-shrink: 0;
  width: 60px;
}

.tah-preview-val {
  color: var(--text-primary);
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-all;
  flex: 1;
}

/* ── Code output ─────────────────────────────────────────────────────────── */
.tah-code-block {
  background: var(--bg-code);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
}

.tah-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.tah-code-lang {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.05em;
}

.tah-code-pre {
  padding: 10px;
  margin: 0;
  overflow-x: auto;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.6;
  color: var(--code-text);
  white-space: pre;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
  max-height: 200px;
}

/* ── Warnings ────────────────────────────────────────────────────────────── */
.tah-warning {
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 7px;
  padding: 8px 10px;
  font-size: 11px;
  color: var(--warning);
  display: flex;
  gap: 6px;
}

.tah-info {
  background: var(--accent-dim);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 7px;
  padding: 8px 10px;
  font-size: 11px;
  color: var(--accent);
}

/* ── Row layouts ─────────────────────────────────────────────────────────── */
.tah-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tah-row-wrap { flex-wrap: wrap; }

/* ── History ─────────────────────────────────────────────────────────────── */
.tah-history-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: border-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tah-history-item:hover { border-color: var(--accent); }

.tah-history-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tah-history-meta {
  font-size: 10px;
  color: var(--text-muted);
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
@keyframes tah-spin { to { transform: rotate(360deg); } }

.tah-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: tah-spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

/* ── Badge ───────────────────────────────────────────────────────────────── */
.tah-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.tah-badge-accent { background: var(--accent-dim); color: var(--accent); }
.tah-badge-success { background: rgba(16,185,129,0.15); color: var(--success); }

/* ── Divider ─────────────────────────────────────────────────────────────── */
.tah-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

/* ── Instructions ────────────────────────────────────────────────────────── */
.tah-instructions {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  font-size: 11px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  line-height: 1.6;
}

/* ── Picker active indicator ─────────────────────────────────────────────── */
.tah-picker-active-bar {
  background: var(--accent);
  color: white;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  animation: tah-pulse 1.5s ease-in-out infinite;
}

@keyframes tah-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* ── Empty state ─────────────────────────────────────────────────────────── */
.tah-empty {
  text-align: center;
  padding: 20px 12px;
  color: var(--text-muted);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tah-empty-icon { font-size: 28px; }
`;

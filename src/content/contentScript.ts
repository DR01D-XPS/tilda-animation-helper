/**
 * Content Script — entry point for Tilda Animation Helper.
 * Runs on every page. Mounts the React panel via Shadow DOM.
 * Bridges page DOM access with the React UI.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '../ui/App';
import type { AppProps } from '../ui/App';
import { createShadowMount } from './shadowDomMount';
import { PageScanner } from './pageScanner';
import { ElementPicker } from './elementPicker';

// Prevent double-initialization (MV3 can call content scripts multiple times in some edge cases)
if (!(window as unknown as Record<string, unknown>).__tahInitialized) {
  (window as unknown as Record<string, unknown>).__tahInitialized = true;
  init();
}

function init() {
  const scanner = new PageScanner();
  const picker = new ElementPicker();

  // Mount shadow DOM
  const { appContainer } = createShadowMount();

  // Build props for React app
  const appProps: AppProps = {
    onScan: async () => {
      return scanner.scan();
    },

    onStartPicker: (onSelect, onCancel) => {
      picker.start(onSelect, onCancel);
    },

    onStopPicker: () => {
      picker.stop();
    },

    onSearchElements: (query, elements) => {
      return scanner.searchElements(query, elements);
    },

    onHighlightElement: (selector) => {
      picker.highlightBySelector(selector);
    },

    onClearHighlight: () => {
      picker.clearAllHighlights();
    },
  };

  // Mount React app
  const reactRoot = ReactDOM.createRoot(appContainer);
  reactRoot.render(React.createElement(App, appProps));

  // Listen for messages from background service worker
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TAH_TOGGLE_PANEL') {
      // Dispatch to React app via custom event
      window.dispatchEvent(
        new CustomEvent('tah-message', { detail: { type: 'TAH_TOGGLE_PANEL' } })
      );
    }
    return false;
  });

  // Also expose toggle via keyboard shortcut Alt+Shift+T
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key === 'T') {
      window.dispatchEvent(
        new CustomEvent('tah-message', { detail: { type: 'TAH_TOGGLE_PANEL' } })
      );
    }
  });
}

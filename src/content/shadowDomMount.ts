import { PANEL_CSS } from '../ui/panelStyles';

export interface ShadowMount {
  shadowRoot: ShadowRoot;
  appContainer: HTMLDivElement;
}

export function createShadowMount(): ShadowMount {
  // Host element — positioned outside normal flow
  const host = document.createElement('div');
  host.id = 'tah-root';
  host.setAttribute('data-tah', 'host');
  host.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:0',
    'height:0',
    'overflow:visible',
    'z-index:2147483647',
    'pointer-events:none',
    // Reset all inherited styles
    'all:initial',
    'display:block',
    'position:fixed',
    'z-index:2147483647',
  ].join(';');

  // Attach shadow DOM for full CSS isolation
  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Inject panel styles into shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = PANEL_CSS;
  shadowRoot.appendChild(styleEl);

  // App container — pointer-events re-enabled only for panel
  const appContainer = document.createElement('div');
  appContainer.id = 'tah-app-container';
  appContainer.style.cssText = 'pointer-events:auto;';
  shadowRoot.appendChild(appContainer);

  // Append host to body
  if (document.body) {
    document.body.appendChild(host);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(host);
    });
  }

  return { shadowRoot, appContainer };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for contexts where clipboard API isn't available
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch {
      // ignore
    }
    document.body.removeChild(textarea);
    return success;
  }
}

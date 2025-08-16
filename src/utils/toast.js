export const showToast = (message, type = 'info') => {
  try {
    const detail = { id: Date.now(), type, message, timestamp: new Date() };
    window.dispatchEvent(new CustomEvent('toast:show', { detail }));
  } catch (_) {
    // no-op in non-browser environments
  }
};

export const toast = {
  info: (msg) => showToast(msg, 'info'),
  success: (msg) => showToast(msg, 'success'),
  error: (msg) => showToast(msg, 'error'),
  warn: (msg) => showToast(msg, 'warning'),
};

export default toast;

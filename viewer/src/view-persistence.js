export function createViewPersistence({ readURL, currentURL, replace, onError,
  now = () => performance.now(), schedule = setTimeout, cancel = clearTimeout, interval = 250 }) {
  let timer = null, lastWrite = -Infinity, pending = false;
  function flush() {
    timer = null;
    if (!pending) return;
    pending = false;
    try {
      const url = readURL();
      if (url === null || String(url) === String(currentURL())) return;
      lastWrite = now();
      replace(url);
    } catch (error) {
      onError(error);
    }
  }
  return {
    request() {
      pending = true;
      if (timer === null) timer = schedule(flush, Math.max(0, interval - (now() - lastWrite)));
    },
    flush() {
      if (timer !== null) cancel(timer);
      flush();
    },
    cancel() {
      if (timer !== null) cancel(timer);
      timer = null; pending = false;
    },
  };
}

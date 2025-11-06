/**
 * Utilidad para precargar imágenes y reportar progreso.
 */
export function preloadImages(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void,
  timeoutMs: number = 7000
): Promise<void> {
  return new Promise((resolve) => {
    const total = urls.length || 1;
    let loaded = 0;
    let finished = false;

    function done() {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve();
      }
    }

    function inc() {
      loaded += 1;
      onProgress?.(loaded, total);
      if (loaded >= total) {
        done();
      }
    }

    const timer = setTimeout(() => done(), timeoutMs);

    urls.forEach((url) => {
      try {
        const i = new Image();
        i.decoding = "async";
        // Establece atributo de carga sin usar 'any'
        i.setAttribute("loading", "eager");
        i.src = url;
        i.onload = () => inc();
        i.onerror = () => inc();
      } catch {
        inc();
      }
    });
  });
}
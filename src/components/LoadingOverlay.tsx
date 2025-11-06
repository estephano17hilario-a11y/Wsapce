"use client";

import { useEffect, useRef, useState } from "react";
import { preloadImages } from "@/lib/preload";

/**
 * Overlay de carga profesional con progreso suavizado.
 * - Bloquea el scroll temporalmente para evitar jank inicial.
 * - Precarga imágenes presentes en el DOM y un set de claves del /public.
 * - Respeta prefers-reduced-motion.
 * - Ofrece botón de "Saltar" tras un breve delay.
 */
export default function LoadingOverlay() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [skipVisible, setSkipVisible] = useState(false);

  const actualProgressRef = useRef(0);
  const displayProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const cleanupFnsRef = useRef<Array<() => void>>([]);
  const prevHtmlOverflowRef = useRef<string>("");
  const prevBodyOverflowRef = useRef<string>("");

  useEffect(() => {
    startTimeRef.current = performance.now();

    const minShowMs = 1100; // tiempo mínimo para evitar flash
    const maxShowMs = 7000; // tiempo máximo de seguridad
    const threshold = 0.6; // porcentaje para poder ocultar si se supera

    const imgs = Array.from(document.querySelectorAll("img"));
    const totalDom = imgs.length;
    let loadedDom = 0;

    function updateActualProgress() {
      const totalKnown = Math.max(1, totalDom + preloadUrls.length);
      const loadedKnown = Math.min(totalKnown, loadedDom + loadedPreload);
      actualProgressRef.current = Math.min(1, loadedKnown / totalKnown);
      scheduleStep();
    }

    function onDomLoad() {
      loadedDom += 1;
      updateActualProgress();
    }

    // Adjunta listeners a imágenes del DOM inicial
    imgs.forEach((img) => {
      const el = img as HTMLImageElement;
      if (el.complete) {
        loadedDom += 1;
      } else {
        el.addEventListener("load", onDomLoad, { once: true });
        el.addEventListener("error", onDomLoad, { once: true });
        cleanupFnsRef.current.push(() => {
          el.removeEventListener("load", onDomLoad);
          el.removeEventListener("error", onDomLoad);
        });
      }
    });

    // Precarga de imágenes clave del /public (primeras escenas)
    const preloadUrls = [
      "/andromeda up - copia.webp",
      "/espacio azul up - copia.webp",
      "/persona sun up - copia.webp",
      "/perxonas up - copia.webp",
      "/tierra para implementar - copia - copia.webp",
    ];
    let loadedPreload = 0;
    preloadImages(preloadUrls, (loaded) => {
      loadedPreload = loaded;
      updateActualProgress();
    }).catch(() => {
      // Nunca bloqueamos: si falla, el overlay seguirá por tiempo máximo
    });

    // Suavizado del progreso visual
    function step() {
      rafRef.current = null;
      const target = actualProgressRef.current;
      const current = displayProgressRef.current;
      const delta = target - current;
      const increment = Math.max(0.015, delta * 0.22); // easing suave
      const next = Math.min(1, current + increment);
      displayProgressRef.current = next;
      setProgress(next);

      const elapsed = performance.now() - startTimeRef.current;
      if ((next >= threshold && elapsed >= minShowMs) || elapsed >= maxShowMs) {
        setVisible(false);
      } else {
        scheduleStep();
      }
    }
    function scheduleStep() {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    // Arranca con medición inicial
    updateActualProgress();

    // Muestra el botón "Saltar" tras breve demora
    const skipTimer = setTimeout(() => setSkipVisible(true), 1400);

    // Bloquea scroll mientras visible
    prevHtmlOverflowRef.current = document.documentElement.style.overflow;
    prevBodyOverflowRef.current = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      cleanupFnsRef.current.forEach((fn) => fn());
      cleanupFnsRef.current = [];
      clearTimeout(skipTimer);
      document.documentElement.style.overflow = prevHtmlOverflowRef.current || "";
      document.body.style.overflow = prevBodyOverflowRef.current || "";
    };
  }, []);

  // Cuando se oculta, restauramos overflow y desmontamos el overlay
  useEffect(() => {
    if (!visible) {
      // Restaurar scroll inmediatamente al ocultar overlay
      document.documentElement.style.overflow = prevHtmlOverflowRef.current || "";
      document.body.style.overflow = prevBodyOverflowRef.current || "";
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="loading-overlay show" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-spin" aria-hidden="true" />
        <div className="loading-label">Cargando experiencia cinematográfica…</div>
        <div
          className="loading-progress"
          aria-label={`Progreso ${Math.round(progress * 100)}%`}
        >
          <div
            className="loading-progress-bar"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
        <button
          type="button"
          className={`loading-skip ${skipVisible ? "visible" : ""}`}
          onClick={() => setVisible(false)}
          aria-label="Saltar carga inicial"
        >
          Saltar
        </button>
      </div>
    </div>
  );
}
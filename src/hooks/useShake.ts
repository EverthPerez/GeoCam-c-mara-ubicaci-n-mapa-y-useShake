import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

interface ShakeOptions {
  threshold?: number; // magnitud en g (en reposo ≈ 1)
  cooldownMs?: number; // tiempo mínimo entre disparos
  enabled?: boolean; // false = no suscribirse (pantalla sin foco)
}

export function useShake(
  onShake: () => void,
  { threshold = 1.8, cooldownMs = 1000, enabled = true }: ShakeOptions = {}
): { isAvailable: boolean | null } {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  // El callback vive en una ref para no reiniciar la suscripción en cada render
  const callbackRef = useRef(onShake);
  const lastShakeRef = useRef(0);

  useEffect(() => {
    callbackRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    Accelerometer.isAvailableAsync()
      .then((available) => {
        if (cancelled) return;
        setIsAvailable(available);
        if (!available) return;

        Accelerometer.setUpdateInterval(100);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          if (magnitude > threshold && now - lastShakeRef.current > cooldownMs) {
            lastShakeRef.current = now;
            callbackRef.current();
          }
        });
      })
      .catch(() => {
        if (!cancelled) setIsAvailable(false);
      });

    return () => {
      cancelled = true;
      subscription?.remove();
      console.log('[useShake] acelerómetro limpiado'); // log temporal para verificar
    };
  }, [enabled, threshold, cooldownMs]);

  return { isAvailable };
}

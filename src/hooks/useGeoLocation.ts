import type { Coords, PermissionState } from '@/types/geo';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';

interface Options {
  /** Seguimiento continuo del GPS (solo si el permiso está concedido). */
  watch?: boolean;
  /** false = pantalla sin foco: se libera el GPS. Por defecto true. */
  active?: boolean;
}

interface GeoLocationState {
  permission: PermissionState;
  coords: Coords | null;
  error: string | null;
}

function mapPermission(res: Location.LocationPermissionResponse): PermissionState {
  if (res.granted) return 'granted';
  if (!res.canAskAgain) return 'blocked';
  if (res.status === 'undetermined') return 'undetermined';
  return 'denied';
}

function toCoords(loc: Location.LocationObject): Coords {
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    accuracy: loc.coords.accuracy,
    timestamp: loc.timestamp,
  };
}

export function useGeoLocation({ watch = false, active = true }: Options = {}) {
  const [state, setState] = useState<GeoLocationState>({
    permission: 'checking',
    coords: null,
    error: null,
  });

  // 1. Solo CONSULTAR el permiso (nunca pedirlo): al montar, al ganar foco
  //    y al volver de Ajustes (AppState).
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const check = () => {
      Location.getForegroundPermissionsAsync()
        .then((res) => {
          if (!cancelled) setState((s) => ({ ...s, permission: mapPermission(res) }));
        })
        .catch(() => {
          if (!cancelled) setState((s) => ({ ...s, permission: 'denied' }));
        });
    };

    check();
    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') check();
    });

    return () => {
      cancelled = true;
      appStateSub.remove();
    };
  }, [active]);

  // 2. Solicitar permiso por acción explícita del usuario
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const res = await Location.requestForegroundPermissionsAsync();
    setState((s) => ({ ...s, permission: mapPermission(res) }));
    return res.granted;
  }, []);

  // 3. Lectura única, útil justo antes de guardar una foto
  const getCurrent = useCallback(async (): Promise<Coords | null> => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = toCoords(loc);
      setState((s) => ({ ...s, coords, error: null }));
      return coords;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo obtener la ubicación';
      setState((s) => ({ ...s, error: message }));
      return null;
    }
  }, []);

  // 4. Seguimiento continuo con limpieza segura ante desmontaje temprano
  useEffect(() => {
    if (!watch || !active || state.permission !== 'granted') return;
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
      (loc) => setState((s) => ({ ...s, coords: toCoords(loc), error: null }))
    )
      .then((sub) => {
        if (cancelled) {
          sub.remove(); // se desmontó antes de resolver la promesa
        } else {
          subscription = sub;
        }
      })
      .catch((e) =>
        setState((s) => ({
          ...s,
          error: e instanceof Error ? e.message : 'Error de GPS',
        }))
      );

    return () => {
      cancelled = true;
      subscription?.remove();
      console.log('[useGeoLocation] watchPosition limpiado'); // log temporal para verificar
    };
  }, [watch, active, state.permission]);

  const openSettings = useCallback(() => Linking.openSettings(), []);

  return { ...state, requestPermission, getCurrent, openSettings };
}

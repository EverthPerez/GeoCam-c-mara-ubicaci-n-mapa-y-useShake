import type { PermissionState } from '@/types/geo';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissionState: PermissionState = !permission
    ? 'checking'
    : permission.granted
      ? 'granted'
      : !permission.canAskAgain
        ? 'blocked'
        : permission.status === 'undetermined'
          ? 'undetermined'
          : 'denied';

  // Al volver de Ajustes, volver a consultar el permiso
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  const toggleFacing = useCallback(() => {
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  }, []);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || !isReady || isCapturing) return null;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setError(null);
      return photo ?? null;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo tomar la foto');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isReady, isCapturing]);

  const openSettings = useCallback(() => Linking.openSettings(), []);
  const onCameraReady = useCallback(() => setIsReady(true), []);

  return {
    cameraRef,
    permissionState,
    requestPermission,
    openSettings,
    facing,
    toggleFacing,
    onCameraReady,
    takePhoto,
    isCapturing,
    error,
  };
}

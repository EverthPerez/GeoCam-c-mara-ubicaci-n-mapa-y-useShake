import { PermissionPrimer } from '@/components/PermissionPrimer';
import { useGeoPhotos } from '@/context/GeoPhotosContext';
import { useCamera } from '@/hooks/useCamera';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useShake } from '@/hooks/useShake';
import type { GeoPhoto } from '@/types/geo';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from 'expo-router/react-navigation';
import { useCallback } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function GeoCamScreen() {
  const isFocused = useIsFocused();
  const cam = useCamera();
  const geo = useGeoLocation({ watch: true, active: isFocused });
  const { photos, addPhoto, clearAll } = useGeoPhotos();
  const lastPhoto = photos[0] ?? null;

  const confirmClear = useCallback(() => {
    if (photos.length === 0) return;
    Alert.alert('¿Borrar todas las fotos?', 'Detectamos que agitaste el teléfono.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar todo', style: 'destructive', onPress: clearAll },
    ]);
  }, [photos.length, clearAll]);

  useShake(confirmClear, { enabled: isFocused });

  // Degradación elegante: sin permiso de ubicación, coords queda en null
  const resolveCoords = async () =>
    geo.permission === 'granted' ? (geo.coords ?? (await geo.getCurrent())) : null;

  const buildPhoto = (uri: string, source: GeoPhoto['source'], coords: GeoPhoto['coords']): GeoPhoto => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uri,
    coords,
    source,
    createdAt: Date.now(),
  });

  const handleCapture = async () => {
    const photo = await cam.takePhoto();
    if (!photo) return;
    addPhoto(buildPhoto(photo.uri, 'camera', await resolveCoords()));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return;
    addPhoto(buildPhoto(result.assets[0].uri, 'gallery', await resolveCoords()));
  };

  if (cam.permissionState === 'checking') {
    return <View style={styles.checking} />;
  }

  if (cam.permissionState !== 'granted') {
    return (
      <PermissionPrimer
        title="GeoCam necesita tu cámara"
        description="La usamos solo para tomar fotos que tú decidas guardar."
        state={cam.permissionState}
        onRequest={cam.requestPermission}
        onOpenSettings={cam.openSettings}
      />
    );
  }

  const locationMissing = geo.permission !== 'granted' && geo.permission !== 'checking';

  return (
    <View style={styles.container}>
      {/* CameraView sin hijos; solo montada con foco para liberar la cámara */}
      {isFocused && (
        <CameraView
          ref={cam.cameraRef}
          style={StyleSheet.absoluteFill}
          facing={cam.facing}
          onCameraReady={cam.onCameraReady}
        />
      )}

      {/* Banner: pedir ubicación en contexto, sin bloquear la cámara */}
      {locationMissing && (
        <Pressable
          onPress={geo.permission === 'blocked' ? geo.openSettings : geo.requestPermission}
          style={styles.banner}
        >
          <Text style={styles.bannerText}>
            {geo.permission === 'blocked'
              ? 'Ubicación bloqueada: toca para abrir Ajustes'
              : 'Activa la ubicación para etiquetar tus fotos'}
          </Text>
          <Text style={styles.bannerSub}>Sin ubicación, las fotos se guardan sin coordenadas.</Text>
        </Pressable>
      )}

      {/* Coordenadas en vivo */}
      {geo.coords && (
        <View style={styles.coordsBox}>
          <Text style={styles.coordsText}>
            {geo.coords.latitude.toFixed(5)}, {geo.coords.longitude.toFixed(5)}
          </Text>
          <Text style={styles.accuracyText}>±{Math.round(geo.coords.accuracy ?? 0)} m</Text>
        </View>
      )}

      {/* Errores como estado de UI */}
      {(cam.error || geo.error) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{cam.error ?? geo.error}</Text>
        </View>
      )}

      {/* Controles inferiores (hermanos absolutos de CameraView) */}
      <View style={styles.controls}>
        <Pressable onPress={handlePickImage} style={styles.sideButton} accessibilityLabel="Importar de galería">
          {lastPhoto ? (
            <Image source={{ uri: lastPhoto.uri }} style={styles.thumb} />
          ) : (
            <Text style={styles.icon}>🖼️</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleCapture}
          disabled={cam.isCapturing}
          style={styles.shutterOuter}
          accessibilityLabel="Tomar foto"
        >
          <View style={[styles.shutterInner, cam.isCapturing && { backgroundColor: '#a3a3a3' }]} />
        </Pressable>

        <Pressable onPress={cam.toggleFacing} style={styles.sideButton} accessibilityLabel="Cambiar cámara">
          <Text style={styles.icon}>↻</Text>
        </Pressable>
      </View>

      <Text style={styles.counter}>{photos.length} foto(s) · agita para borrar todas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  checking: { flex: 1, backgroundColor: '#0a0a0a' },
  banner: {
    position: 'absolute', left: 16, right: 16, top: 56,
    borderRadius: 12, backgroundColor: 'rgba(251,191,36,0.92)', padding: 12,
  },
  bannerText: { textAlign: 'center', fontWeight: '600', color: '#171717' },
  bannerSub: { textAlign: 'center', fontSize: 12, color: '#404040', marginTop: 2 },
  coordsBox: {
    position: 'absolute', left: 16, bottom: 150,
    borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8,
  },
  coordsText: { color: '#6ee7b7', fontSize: 12, fontFamily: 'monospace' },
  accuracyText: { color: '#a3a3a3', fontSize: 12, fontFamily: 'monospace' },
  errorBox: {
    position: 'absolute', right: 16, bottom: 150,
    borderRadius: 8, backgroundColor: 'rgba(220,38,38,0.85)', paddingHorizontal: 12, paddingVertical: 8,
  },
  errorText: { color: '#fff', fontSize: 12 },
  controls: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  sideButton: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  icon: { fontSize: 30, color: '#fff' },
  shutterOuter: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  counter: { position: 'absolute', bottom: 12, alignSelf: 'center', color: '#d4d4d4', fontSize: 11 },
});

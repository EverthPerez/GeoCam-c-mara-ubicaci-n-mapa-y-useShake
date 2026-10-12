import { useGeoLocation } from '@/hooks/useGeoLocation';
import { usePhotos, type Photo } from '@/hooks/usePhotos';
import { useIsFocused } from 'expo-router/react-navigation';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

const FALLBACK: Region = { latitude: 11.5444, longitude: -72.9072, latitudeDelta: 0.5, longitudeDelta: 0.5 };

function SourceBadge({ source }: { source: Photo['source'] }) {
  const isCamera = source === 'camera';
  return (
    <Text style={[styles.badge, { backgroundColor: isCamera ? '#10b981' : '#6366f1' }]}>
      {isCamera ? '📷 Cámara' : '🖼️ Galería'}
    </Text>
  );
}

export default function MapaScreen() {
  const isFocused = useIsFocused();
  const geo = useGeoLocation({ watch: false, active: isFocused });
  const { photos, photosWithLocation } = usePhotos();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Lectura única de la ubicación actual al entrar a la pestaña (con permiso)
  const { permission, getCurrent } = geo;
  useEffect(() => {
    if (isFocused && permission === 'granted') void getCurrent();
  }, [isFocused, permission, getCurrent]);

  const unlocated = useMemo(() => photos.filter((p) => p.latitude === null), [photos]);
  const selected = photosWithLocation.find((p) => p.id === selectedId) ?? null;

  // Centro: ubicación actual; sin permiso, la última foto con coordenadas
  const last = photosWithLocation[0];
  const center =
    permission === 'granted' && geo.coords
      ? { latitude: geo.coords.latitude, longitude: geo.coords.longitude }
      : last && last.latitude !== null && last.longitude !== null
        ? { latitude: last.latitude, longitude: last.longitude }
        : null;

  const region: Region = center
    ? { ...center, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : FALLBACK;

  return (
    <View style={styles.container}>
      <MapView
        key={`${region.latitude.toFixed(3)}-${region.longitude.toFixed(3)}`}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={permission === 'granted'}
        onPress={() => setSelectedId(null)}
      >
        {photosWithLocation.map((p) =>
          p.latitude !== null && p.longitude !== null ? (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              pinColor={p.source === 'camera' ? 'green' : 'indigo'}
              onPress={() => setSelectedId(p.id)}
            />
          ) : null
        )}
      </MapView>

      {selected && (
        <View style={styles.preview}>
          <Image source={{ uri: selected.uri }} style={styles.previewImg} />
          <View style={{ flex: 1, gap: 4 }}>
            <SourceBadge source={selected.source} />
            <Text style={styles.previewText}>
              {selected.latitude?.toFixed(5)}, {selected.longitude?.toFixed(5)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.unlocated}>
        <Text style={styles.sectionTitle}>Sin ubicación ({unlocated.length})</Text>
        {unlocated.length === 0 ? (
          <Text style={styles.empty}>Todas tus fotos tienen coordenadas.</Text>
        ) : (
          <FlatList
            data={unlocated}
            horizontal
            keyExtractor={(p) => String(p.id)}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <View>
                <Image
                  source={{ uri: item.uri }}
                  style={[styles.unlocatedImg, { borderColor: item.source === 'camera' ? '#10b981' : '#6366f1' }]}
                />
                <SourceBadge source={item.source} />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  preview: {
    position: 'absolute', top: 56, left: 16, right: 16, flexDirection: 'row', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 4,
  },
  previewImg: { width: 72, height: 72, borderRadius: 8 },
  previewText: { fontSize: 12, color: '#404040', fontFamily: 'monospace' },
  badge: { color: '#fff', fontSize: 11, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', overflow: 'hidden', marginTop: 2 },
  unlocated: { padding: 12, backgroundColor: '#fafafa', minHeight: 120 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, color: '#171717' },
  empty: { color: '#737373', fontSize: 13 },
  unlocatedImg: { width: 64, height: 64, borderRadius: 8, borderWidth: 2 },
});

import { useAlbums } from '@/hooks/useAlbums';
import { usePhoto } from '@/hooks/usePhoto';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';


export default function FotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const photoId = Number(id);
  const { photo, saveNote, setFavorite, moveToAlbum, remove } = usePhoto(
    Number.isFinite(photoId) ? photoId : null
  );
  const { albums } = useAlbums();
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  // Cargar la nota existente al abrir la foto
  useEffect(() => {
    setNote(photo?.note ?? '');
  }, [photo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!photo) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Foto no encontrada.</Text>
        <Text style={styles.muted}>id recibido: {String(id)}</Text>
      </View>
    );
  }

  const handleSaveNote = async () => {
    await saveNote(note);
    setStatus('Nota guardada');
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar foto', 'Se borrará la foto y su archivo. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await remove();
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="contain" />

      <View style={styles.row}>
        <Text style={styles.meta}>
          {photo.source === 'camera' ? '📷 Cámara' : '🖼️ Galería'} · {photo.createdAt.toLocaleString('es-CO')}
        </Text>
        <Pressable onPress={() => setFavorite(!photo.favorite)} accessibilityLabel="Marcar favorita">
          <Text style={styles.star}>{photo.favorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <Text style={styles.meta}>
        {photo.latitude !== null && photo.longitude !== null
          ? `📍 ${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}`
          : '📍 Sin ubicación'}
      </Text>

      <Text style={styles.label}>Nota</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe una nota..."
        value={note}
        onChangeText={(t) => {
          setNote(t);
          setStatus(null);
        }}
        multiline
      />
      <Pressable style={styles.button} onPress={handleSaveNote}>
        <Text style={styles.buttonText}>Guardar nota</Text>
      </Pressable>
      {status && <Text style={styles.ok}>{status}</Text>}

      <Text style={styles.label}>Álbum</Text>
      <View style={styles.chips}>
        <Pressable
          onPress={() => moveToAlbum(null)}
          style={[styles.chip, photo.albumId === null && styles.chipActive]}
        >
          <Text style={photo.albumId === null ? styles.chipTextActive : undefined}>Sin álbum</Text>
        </Pressable>
        {albums.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => moveToAlbum(a.id)}
            style={[styles.chip, photo.albumId === a.id && styles.chipActive]}
          >
            <Text style={photo.albumId === a.id ? styles.chipTextActive : undefined}>{a.name}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.delete} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Eliminar foto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#888' },
  image: { width: '100%', height: 320, backgroundColor: '#000', borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { color: '#555', fontSize: 13, flexShrink: 1 },
  star: { fontSize: 32, color: '#f59e0b' },
  label: { fontWeight: '700', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, minHeight: 70, textAlignVertical: 'top' },
  button: { backgroundColor: '#111', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  ok: { color: '#059669', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: '#10b981', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  chipActive: { backgroundColor: '#10b981' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  delete: { marginTop: 16, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#DC2626' },
  deleteText: { color: '#DC2626', fontWeight: '700' },
});
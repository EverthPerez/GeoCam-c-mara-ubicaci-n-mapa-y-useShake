import { useAlbums } from '@/hooks/useAlbums';
import { usePhotoSearch } from '@/hooks/usePhotos';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FotosScreen() {
  const [search, setSearch] = useState('');
  const [albumId, setAlbumId] = useState<number | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [newAlbum, setNewAlbum] = useState('');
  const [error, setError] = useState<string | null>(null);

  const photos = usePhotoSearch({ search, albumId, onlyFavorites });
  const { albums, createAlbum, removeAlbum } = useAlbums();

  const handleCreateAlbum = async () => {
    try {
      await createAlbum(newAlbum);
      setNewAlbum('');
      setError(null);
    } catch {
      setError('No se pudo crear el álbum (¿ya existe ese nombre?).');
    }
  };

  const confirmRemoveAlbum = (id: number, name: string) => {
    Alert.alert(`Eliminar álbum "${name}"`, 'Las fotos no se borran: quedarán sin álbum.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await removeAlbum(id);
          if (albumId === id) setAlbumId(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar en las notas..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.chips}>
        <Pressable
          onPress={() => setAlbumId(null)}
          style={[styles.chip, albumId === null && styles.chipActive]}
        >
          <Text style={albumId === null ? styles.chipTextActive : undefined}>Todas</Text>
        </Pressable>
        {albums.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => setAlbumId(a.id)}
            onLongPress={() => confirmRemoveAlbum(a.id, a.name)}
            style={[styles.chip, albumId === a.id && styles.chipActive]}
          >
            <Text style={albumId === a.id ? styles.chipTextActive : undefined}>{a.name}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setOnlyFavorites((v) => !v)}
          style={[styles.chip, onlyFavorites && styles.chipFav]}
        >
          <Text>★ Favoritas</Text>
        </Pressable>
      </View>

      <View style={styles.newAlbumRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nuevo álbum"
          value={newAlbum}
          onChangeText={setNewAlbum}
        />
        <Pressable style={styles.addButton} onPress={handleCreateAlbum}>
          <Text style={styles.addButtonText}>Crear</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.hint}>Mantén presionado un álbum para eliminarlo.</Text>

      <FlatList
        data={photos}
        numColumns={3}
        keyExtractor={(p) => String(p.id)}
        columnWrapperStyle={{ gap: 6 }}
        contentContainerStyle={{ gap: 6, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay fotos con estos filtros.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.cell}
            onPress={() => router.push(`/foto/${item.id}`)}
          >
            <Image source={{ uri: item.uri }} style={styles.thumb} />
            {item.favorite && <Text style={styles.star}>★</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 56, paddingHorizontal: 12, gap: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: '#10b981', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  chipActive: { backgroundColor: '#10b981' },
  chipFav: { backgroundColor: '#fbbf24', borderColor: '#fbbf24' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  newAlbumRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addButton: { backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#DC2626', fontSize: 13 },
  hint: { color: '#888', fontSize: 11 },
  empty: { textAlign: 'center', marginTop: 32, color: '#888' },
  cell: { flex: 1 / 3, aspectRatio: 1 },
  thumb: { flex: 1, borderRadius: 8 },
  star: { position: 'absolute', top: 4, right: 6, color: '#fbbf24', fontSize: 18 },
});

import { photosRepo } from '@/db/repositories/photos';
import { deletePhotoFile } from '@/services/photoFiles';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

/** Una foto y sus acciones (nota, favorita, álbum, eliminar). */
export function usePhoto(id: number | null) {
  // Misma consulta reactiva que usa la pestaña Fotos
  const { data: photos, error } = useLiveQuery(photosRepo.listQuery());
  const photo = id === null ? null : (photos.find((p) => p.id === id) ?? null);

  const saveNote = useCallback(
    async (note: string) => {
      if (id === null) return;
      const clean = note.trim();
      await photosRepo.update(id, { note: clean === '' ? null : clean });
    },
    [id]
  );

  const setFavorite = useCallback(
    async (value: boolean) => {
      if (id === null) return;
      await photosRepo.update(id, { favorite: value });
    },
    [id]
  );

  const moveToAlbum = useCallback(
    async (albumId: number | null) => {
      if (id === null) return;
      await photosRepo.update(id, { albumId });
    },
    [id]
  );

  // Elimina el registro y también el archivo
  const remove = useCallback(async () => {
    if (id === null) return;
    const current = await photosRepo.findById(id);
    await photosRepo.remove(id);
    if (current) deletePhotoFile(current.uri);
  }, [id]);

  return { photo, error, saveNote, setFavorite, moveToAlbum, remove };
}
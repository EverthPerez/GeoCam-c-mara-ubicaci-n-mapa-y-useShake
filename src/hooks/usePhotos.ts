import { photosRepo, type PhotoFilters } from '@/db/repositories/photos';
import { deletePhotoFile, persistPhoto } from '@/services/photoFiles';
import type { Coords } from '@/types/geo';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

export type { PhotoFilters } from '@/db/repositories/photos';
export type { Photo } from '@/db/schema';

export interface AddPhotoInput {
  uri: string; // URI temporal (caché) de la cámara o la galería
  coords: Coords | null;
  source: 'camera' | 'gallery';
}

export function usePhotos() {
  const { data: photos, error } = useLiveQuery(photosRepo.listQuery());
  const { data: photosWithLocation } = useLiveQuery(photosRepo.withLocationQuery());

  // C5: copia el archivo a la carpeta de documentos y guarda la ruta permanente
  const addPhoto = useCallback(async ({ uri, coords, source }: AddPhotoInput) => {
    const permanentUri = persistPhoto(uri);
    try {
      await photosRepo.create({
        uri: permanentUri,
        source,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        accuracy: coords?.accuracy ?? null,
      });
    } catch (e) {
      deletePhotoFile(permanentUri); // no dejar archivos huérfanos
      throw e;
    }
  }, []);

  const removePhoto = useCallback(async (id: number) => {
    const current = await photosRepo.findById(id);
    await photosRepo.remove(id);
    if (current) deletePhotoFile(current.uri);
  }, []);

  const clearAll = useCallback(async () => {
    const all = await photosRepo.listAll();
    await photosRepo.clearAll();
    all.forEach((p) => deletePhotoFile(p.uri));
  }, []);

  return { photos, photosWithLocation, error, addPhoto, removePhoto, clearAll };
}

/** C4: lista filtrada que se recalcula sola al cambiar los filtros. */
export function usePhotoSearch(filters: PhotoFilters) {
  const { search, albumId, onlyFavorites } = filters;
  const { data } = useLiveQuery(photosRepo.searchQuery(filters), [search, albumId, onlyFavorites]);
  return data;
}

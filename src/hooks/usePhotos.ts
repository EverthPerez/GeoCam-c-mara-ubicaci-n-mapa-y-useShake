import { photosRepo } from '@/db/repositories/photos';
import type { Coords } from '@/types/geo';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

export type { Photo } from '@/db/schema';

export interface AddPhotoInput {
  uri: string;
  coords: Coords | null; // null si el usuario negó la ubicación
  source: 'camera' | 'gallery';
}

export function usePhotos() {
  const { data: photos, error } = useLiveQuery(photosRepo.listQuery());
  const { data: photosWithLocation } = useLiveQuery(photosRepo.withLocationQuery());

  // Convierte Coords | null en columnas planas
  const addPhoto = useCallback(async ({ uri, coords, source }: AddPhotoInput) => {
    await photosRepo.create({
      uri,
      source,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      accuracy: coords?.accuracy ?? null,
    });
  }, []);

  const removePhoto = useCallback((id: number) => photosRepo.remove(id), []);
  const clearAll = useCallback(() => photosRepo.clearAll(), []);

  return { photos, photosWithLocation, error, addPhoto, removePhoto, clearAll };
}

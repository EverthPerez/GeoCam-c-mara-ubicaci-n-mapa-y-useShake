import { albumsRepo } from '@/db/repositories/albums';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback } from 'react';

export type { Album } from '@/db/schema';

export function useAlbums() {
  const { data: albums, error } = useLiveQuery(albumsRepo.listQuery());

  // Lanza error si el nombre ya existe (columna unique); la UI lo muestra
  const createAlbum = useCallback(async (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    await albumsRepo.create(clean);
  }, []);

  const removeAlbum = useCallback((id: number) => albumsRepo.remove(id), []);

  return { albums, error, createAlbum, removeAlbum };
}

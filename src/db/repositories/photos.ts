import { db } from '@/db/client';
import { photos, type NewPhoto } from '@/db/schema';
import { and, desc, eq, isNotNull, like } from 'drizzle-orm';

export type PhotoInput = Omit<NewPhoto, 'id'>;

export interface PhotoFilters {
  search: string; // texto a buscar en la nota
  albumId: number | null; // null = todos los álbumes
  onlyFavorites: boolean;
}

export const photosRepo = {
  listQuery() {
    return db.select().from(photos).orderBy(desc(photos.createdAt));
  },

  withLocationQuery() {
    return db
      .select()
      .from(photos)
      .where(isNotNull(photos.latitude))
      .orderBy(desc(photos.createdAt));
  },

  // C4: búsqueda por nota (like) + filtro por álbum + favoritas.
  // and() ignora los filtros undefined.
  searchQuery({ search, albumId, onlyFavorites }: PhotoFilters) {
    const term = search.trim();
    return db
      .select()
      .from(photos)
      .where(
        and(
          term ? like(photos.note, `%${term}%`) : undefined,
          albumId !== null ? eq(photos.albumId, albumId) : undefined,
          onlyFavorites ? eq(photos.favorite, true) : undefined
        )
      )
      .orderBy(desc(photos.createdAt));
  },

  byIdQuery(id: number) {
    return db.select().from(photos).where(eq(photos.id, id)).limit(1);
  },

  async listAll() {
    return db.select().from(photos).all();
  },

  async findById(id: number) {
    return db.select().from(photos).where(eq(photos.id, id)).get();
  },

  async create(data: PhotoInput) {
    return db.insert(photos).values(data).run();
  },

  async update(id: number, data: Partial<PhotoInput>) {
    return db.update(photos).set(data).where(eq(photos.id, id)).run();
  },

  async remove(id: number) {
    return db.delete(photos).where(eq(photos.id, id)).run();
  },

  async clearAll() {
    return db.delete(photos).run();
  },
};

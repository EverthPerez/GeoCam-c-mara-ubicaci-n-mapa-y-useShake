import { db } from '@/db/client';
import { photos, type NewPhoto } from '@/db/schema';
import { desc, eq, isNotNull } from 'drizzle-orm';

export type PhotoInput = Omit<NewPhoto, 'id'>;

// Única capa que conoce Drizzle. Las funciones ...Query() devuelven la consulta
// sin ejecutarla (para useLiveQuery); las demás se ejecutan con .run()/.get().
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

  async findById(id: number) {
    return db.select().from(photos).where(eq(photos.id, id)).get();
  },

  async create(data: PhotoInput) {
    return db.insert(photos).values(data).run();
  },

  async remove(id: number) {
    return db.delete(photos).where(eq(photos.id, id)).run();
  },

  async clearAll() {
    return db.delete(photos).run();
  },
};

import { db } from '@/db/client';
import { albums } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

export const albumsRepo = {
  listQuery() {
    return db.select().from(albums).orderBy(asc(albums.name));
  },

  async create(name: string) {
    return db.insert(albums).values({ name }).run();
  },

  // Gracias a onDelete: 'set null' (y PRAGMA foreign_keys = ON), las fotos del
  // álbum quedan sin álbum en lugar de borrarse.
  async remove(id: number) {
    return db.delete(albums).where(eq(albums.id, id)).run();
  },
};

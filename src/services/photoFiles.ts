import { Directory, File, Paths } from 'expo-file-system';

// API nueva de expo-file-system (clases File / Directory / Paths).
// No mezclar con FileSystem.copyAsync (API anterior, ahora en /legacy).
const photosDir = new Directory(Paths.document, 'photos');

/** Copia la foto de la caché a la carpeta de documentos y devuelve la nueva URI. */
export function persistPhoto(sourceUri: string): string {
  if (!photosDir.exists) photosDir.create();
  const source = new File(sourceUri);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const destination = new File(photosDir, name);
  source.copy(destination);
  return destination.uri;
}

/** Elimina el archivo de la foto si existe. */
export function deletePhotoFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('[photoFiles] no se pudo borrar el archivo', e);
  }
}

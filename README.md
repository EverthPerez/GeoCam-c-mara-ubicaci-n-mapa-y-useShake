# GeoCam – Taller Integrador 2 (Semana 6)

Cámara que etiqueta cada foto con coordenadas GPS, importa desde galería, muestra las fotos en un mapa y pregunta si se borran al agitar el teléfono.

## Cómo ejecutar
```bash
npm install
npx expo start          # o: npx expo start --tunnel
```
Abrir con **Expo Go** en un teléfono físico.

## Estructura
- `hooks/useCamera.ts`, `hooks/useGeoLocation.ts`, `hooks/useShake.ts`: hardware encapsulado, tipado, con limpieza de suscripciones.
- `components/PermissionPrimer.tsx`: pantalla previa de explicación y botón "Abrir Ajustes".
- `context/GeoPhotosContext.tsx`: estado global (`addPhoto`, `removePhoto`, `clearAll`).
- `app/(tabs)/geocam.tsx` y `app/(tabs)/mapa.tsx`: pantallas.

## Estados de permiso

| Concedido | Rechazado | Bloqueado |
|---|---|---|
| ![concedido](docs/concedido.png) | ![rechazado](docs/rechazado.png) | ![bloqueado](docs/bloqueado.png) |

## Decisiones
- Permisos solo en primer plano (`foreground`), pedidos en contexto con pantalla previa.
- Sin ubicación la cámara sigue funcionando (`coords: null`).
- `CameraView` sin hijos; controles como hermanos absolutos.
- Suscripciones (GPS, acelerómetro) con bandera `cancelled` y `.remove()`; se liberan al perder foco la pestaña.


## Semana 7 – Persistencia con SQLite + Drizzle ORM

GeoCam guarda las fotos en SQLite (offline-first): sobreviven al cierre de la app y funcionan sin conexión.
La imagen vive en la carpeta de documentos de la app; en la base se guarda su ruta, coordenadas, nota, favorita y álbum.

### Diagrama de tablas
```
albums                         photos
------                         ------
id PK                          id PK
name UNIQUE NOT NULL           uri NOT NULL
created_at NOT NULL            latitude, longitude, accuracy (real, opcionales)
   ▲                           source ('camera' | 'gallery')
   └──── album_id FK (ON DELETE SET NULL, opcional)
                               note (opcional), favorite (boolean, default false)
                               created_at NOT NULL
```

### Capas
pantalla (`src/app`) → hook (`src/hooks`) → repositorio (`src/db/repositories`) → Drizzle + esquema (`src/db`) → expo-sqlite.
Las pantallas no importan Drizzle.

### Migraciones (`drizzle/`, generadas con `drizzle-kit generate`, sin editar a mano)
1. `0000_*`: tablas `albums` y `photos`.
2. `0001_*`: columnas `note` y `favorite` en `photos`.

### Flujo (GIF)
![flujo](docs/flujo.gif)

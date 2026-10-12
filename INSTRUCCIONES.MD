# Cómo montar el proyecto

1. Crear el proyecto base:
   npx create-expo-app@latest geocam
   cd geocam
2. Borrar lo que no se usa de la plantilla:
   Windows (PowerShell): Remove-Item -Recurse app, components, hooks, constants, scripts -ErrorAction SilentlyContinue
   Mac/Linux: rm -rf app components hooks constants scripts
   (si hay package.json con "reset-project", no lo necesitas; basta con lo anterior)
3. Copiar dentro del proyecto las carpetas de este zip: app/, components/, hooks/, context/, types/, README.md, AI-LOG.md
4. Instalar dependencias (siempre con expo install):
   npx expo install expo-camera expo-location expo-image-picker expo-sensors react-native-maps @react-navigation/native
5. Pegar los plugins en app.json (dentro de "expo"), reemplazando "plugins" si ya existe pero conservando "expo-router":
   "plugins": [
     "expo-router",
     ["expo-camera", { "cameraPermission": "GeoCam usa la cámara para tomar fotos geolocalizadas.", "recordAudioAndroid": false }],
     ["expo-location", { "locationWhenInUsePermission": "GeoCam usa tu ubicación para registrar dónde tomaste cada foto." }],
     ["expo-image-picker", { "photosPermission": "GeoCam accede a tu galería para importar fotos." }]
   ]
6. Verificar que tsconfig.json tenga "paths": { "@/*": ["./*"] } (la plantilla ya lo trae).
7. Ejecutar: npx expo start   (y abrir con Expo Go en el teléfono)


# Semana 7 – cómo aplicar las etapas

Cada carpeta (etapa-1, etapa-2, etapa-3) se copia ENCIMA de la raíz de tu proyecto (donde está package.json),
respetando las rutas (src/...). Aplica las etapas EN ORDEN y prueba cada una antes de la siguiente.

ETAPA 1  (T1–T5 + tabla albums)
  1. Paso 1 de la guía (instalación + metro.config.js + babel.config.js).
  2. Copiar etapa-1/ al proyecto. Borrar src/context/ (GeoPhotosContext ya no se usa).
  3. npx drizzle-kit generate        -> crea drizzle/0000_*.sql y drizzle/migrations.js
  4. npx expo start -c  y tomar 3 fotos (una sin ubicación). Cerrar Expo Go por completo y reabrir.

ETAPA 2  (C2: segunda migración sobre datos reales)
  1. Copiar etapa-2/src/db/schema.ts (agrega note y favorite).
  2. npx drizzle-kit generate        -> drizzle/0001_*.sql
  3. npx expo start -c  -> las 3 fotos de la etapa 1 deben seguir ahí.

ETAPA 3  (C3, C4, C5)
  1. Copiar etapa-3/ al proyecto (reemplaza _layout, usePhotos y repositorio; agrega pestaña Fotos y foto/[id]).
  2. npx expo start -c

Al final: README (pegar README-semana7-seccion.md) y AI-LOG (basado en AI-LOG-semana7-borrador.md).

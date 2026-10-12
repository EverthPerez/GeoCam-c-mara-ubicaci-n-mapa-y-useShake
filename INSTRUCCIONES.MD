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

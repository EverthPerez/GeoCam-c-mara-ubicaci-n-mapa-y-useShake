# Registro de Auditoría de IA (AI-LOG)

**Estudiante(s):** Ever David Pérez Cerpa
**Semana:** 6
**Proyecto:** GeoCam – Taller Integrador 2
**Herramienta de IA:** Claude (Anthropic)

## 1. Prompts Utilizados
- "Ayúdame a hacer esta app desde cero" (adjuntando la guía de la Semana 6 en PDF y los requisitos del entregable: hooks, README con capturas, AI-LOG y las verificaciones de permisos).
- "Esto es lo que se creó, qué borro" (adjuntando una captura del explorador de archivos del proyecto con carpeta `src/`) para ubicar los archivos generados dentro de la estructura de la plantilla.
- Pegué en el chat cada error de Metro y de render que apareció al ejecutar la app, para que la IA los diagnosticara.

## 2. Código Generado vs. Código Modificado
- **¿Qué generó la IA?:** El proyecto completo: `useCamera`, `useGeoLocation` y `useShake` (tipados, con limpieza de suscripciones mediante bandera `cancelled` y `.remove()`), `PermissionPrimer`, `GeoPhotosContext`, la pantalla GeoCam (cámara, galería, banner de ubicación) y la pestaña Mapa.
- **¿Qué modifiqué/corregí?:**
  - Ajusté la ubicación de los archivos a la estructura `src/` de mi plantilla y verifiqué que el alias `@/` apuntara a `./src/*`.
  - Reemplacé el import de `useIsFocused` por el de `expo-router/react-navigation` (ver sección 3).
  - Agregué `mapa.web.tsx` para que el bundler web no intente cargar `react-native-maps`.
  - Corregí `src/app/(tabs)/_layout.tsx`, que no tenía `export default`.
  - Probé cada estado de permiso en mi teléfono con Expo Go (concedido, rechazado, bloqueado) y confirmé en los logs de limpieza que el GPS y el acelerómetro se detienen al salir de la pestaña.

## 3. Alucinaciones o Errores Detectados
- **API incompatible con el SDK instalado:** la IA importó `useIsFocused` desde `@react-navigation/native`, que era válido en SDKs anteriores. En SDK 56 Metro falla con el error "expo-router is no longer compatible with react-navigation". Lo corregí con `import { useIsFocused } from 'expo-router/react-navigation'`, siguiendo la guía oficial de migración SDK 55 → 56 de Expo. Quité además la dependencia `@react-navigation/native`.
- **Módulo nativo en web:** `react-native-maps` no funciona en web y producía el error `codegenNativeComponent is not a function`. Se resolvió con un archivo específico de plataforma `mapa.web.tsx`.
- **Error de integración (no de la IA):** el layout de las pestañas quedó sin export por defecto al copiarlo, lo que causó "Element type is invalid". Lo rehice con el código correcto y verifiqué las rutas.
- **Lección:** la IA mezcla versiones de las APIs de Expo; siempre hay que contrastar con la documentación del SDK instalado (campo `expo` en `package.json`).
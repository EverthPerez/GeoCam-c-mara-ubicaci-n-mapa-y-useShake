import type { PermissionState } from '@/types/geo';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  description: string;
  state: PermissionState;
  onRequest: () => void;
  onOpenSettings: () => void;
}

export function PermissionPrimer({ title, description, state, onRequest, onOpenSettings }: Props) {
  const isBlocked = state === 'blocked';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        {isBlocked
          ? 'Desactivaste este permiso. Puedes habilitarlo desde los Ajustes del sistema.'
          : state === 'denied'
            ? 'Rechazaste el permiso. Puedes intentarlo de nuevo. ' + description
            : description}
      </Text>
      <Pressable
        onPress={isBlocked ? onOpenSettings : onRequest}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>{isBlocked ? 'Abrir Ajustes' : 'Permitir acceso'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 32,
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center' },
  description: { color: '#d4d4d4', fontSize: 16, textAlign: 'center' },
  button: { backgroundColor: '#10b981', borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 },
  buttonText: { color: '#0a0a0a', fontWeight: '600', fontSize: 16 },
});

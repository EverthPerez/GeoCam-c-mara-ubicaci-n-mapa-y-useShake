import { db } from '@/db/client';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import migrations from '../../drizzle/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text>Error al preparar la base de datos: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="foto/[id]" options={{ headerShown: true, title: 'Foto' }} />
    </Stack>
  );
}

import { GeoPhotosProvider } from '@/context/GeoPhotosContext';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <GeoPhotosProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#10b981' }}>
        <Tabs.Screen
          name="geocam"
          options={{ title: 'GeoCam', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📷</Text> }}
        />
        <Tabs.Screen
          name="mapa"
          options={{ title: 'Mapa', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🗺️</Text> }}
        />
      </Tabs>
    </GeoPhotosProvider>
  );
}
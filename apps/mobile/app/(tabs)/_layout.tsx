import { Tabs } from 'expo-router';
import { Home, Package, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A3FF00',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: 'rgba(255,255,255,0.05)',
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#0a0a0a',
          borderBottomColor: 'rgba(255,255,255,0.05)',
        },
        headerTitleStyle: {
          color: '#fff',
          fontWeight: 'bold',
          letterSpacing: -0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Live Feed',
          tabBarLabel: 'Lives',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Produtos',
          tabBarLabel: 'Produtos',
          tabBarIcon: ({ color }) => <Package size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Minha Conta',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

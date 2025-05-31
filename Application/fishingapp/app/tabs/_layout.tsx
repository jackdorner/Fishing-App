import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffd33d',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#25292e',
        }
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="manageFish"
        options={{
            title: 'Manage Fish',
            tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
                name={focused ? 'fish' : 'fish'}
                color={color}
                size={24}
            />
            ),
        }}
      />
      <Tabs.Screen
        name="contest"
        options={{
            title: 'Contest',
            tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
                name={focused ? 'trophy' : 'trophy-outline'}
                color={color}
                size={24}
            />
            ),
        }}
      />
    </Tabs>
  );
}

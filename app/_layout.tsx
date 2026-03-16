// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { auth } from '@/firebase/config';

// Компонент для проверки авторизации
function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Проверяем состояние авторизации при загрузке
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'Authenticated' : 'Not authenticated');
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  if (isAuthenticated === null) {
    // Показываем загрузку пока проверяем авторизацию
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors[colorScheme ?? 'light'].background 
      }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();

  console.log('RootLayoutNav - user:', user ? 'Authenticated' : 'Not authenticated');

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        // Если пользователь НЕ авторизован - показываем только login
        <Stack.Screen name="login" />
      ) : (
        // Если пользователь авторизован - показываем tabs
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthCheck>
          <RootLayoutNav />
        </AuthCheck>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
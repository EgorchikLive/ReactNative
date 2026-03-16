// app/login.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  View
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const { signIn, signUp, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleBack = () => {
    // Возвращаемся на предыдущий экран
    if (router.canGoBack()) {
      router.back();
    } else {
      // Если нельзя вернуться назад, идем на главную
      router.replace('/(tabs)');
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (!isLogin && !displayName) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваше имя');
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, displayName);
      }
      
      if (result.success) {
        console.log('Auth successful, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Ошибка', result.error || 'Произошла ошибка');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла непредвиденная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Кнопка "Назад" в верхнем левом углу */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <IconSymbol name="chevron.left" size={28} color={colors.tint} />
        <ThemedText style={[styles.backText, { color: colors.tint }]}>Назад</ThemedText>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <View style={styles.logoContainer}>
            <ThemedText type="title" style={styles.appTitle}>
              Мое приложение
            </ThemedText>
            <ThemedText style={styles.appSubtitle}>
              {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </ThemedText>
          </View>
          
          {!isLogin && (
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1
              }]}
              placeholder="Ваше имя"
              placeholderTextColor={colors.icon}
              value={displayName}
              onChangeText={setDisplayName}
              editable={!loading}
            />
          )}
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1
            }]}
            placeholder="Email"
            placeholderTextColor={colors.icon}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
              borderWidth: 1
            }]}
            placeholder="Пароль"
            placeholderTextColor={colors.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </ThemedText>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              setIsLogin(!isLogin);
              setDisplayName('');
            }}
            disabled={loading}
            style={styles.switchButton}
          >
            <ThemedText type="link">
              {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 32,
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    padding: 10,
  },
});
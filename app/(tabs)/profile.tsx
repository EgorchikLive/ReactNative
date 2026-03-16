// app/(tabs)/profile.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Modal,
  View
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Timestamp } from 'firebase/firestore';

export default function ProfileScreen() {
  const { user, userData, logout, updateUserData } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isAuthenticated = !!user; // Проверяем, авторизован ли пользователь

  const handleLogin = () => {
    // Переходим на страницу входа
    router.push('/login');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              // После выхода остаемся на профиле, но он обновится
              // так как user станет null
            } else {
              Alert.alert('Ошибка', result.error);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    if (!isAuthenticated) {
      Alert.alert('Внимание', 'Пожалуйста, войдите в профиль для редактирования');
      return;
    }
    setEditName(userData?.displayName || '');
    setEditPhone(userData?.phoneNumber || '');
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const result = await updateUserData({
      displayName: editName || null,
      phoneNumber: editPhone || null,
    });

    if (result.success) {
      setModalVisible(false);
      Alert.alert('Успех', 'Профиль обновлен');
    } else {
      Alert.alert('Ошибка', result.error || 'Не удалось обновить профиль');
    }
  };

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return 'Неизвестно';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Неизвестно';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.tint + '20' }]}>
          <IconSymbol name="person.circle.fill" size={80} color={colors.tint} />
        </View>
        
        <ThemedText type="title" style={styles.name}>
          {isAuthenticated ? (userData?.displayName || 'Пользователь') : 'Гость'}
        </ThemedText>
        
        {isAuthenticated ? (
          <>
            <ThemedText style={styles.email}>
              {user?.email}
            </ThemedText>

            {userData?.phoneNumber && (
              <ThemedText style={styles.phone}>
                📞 {userData.phoneNumber}
              </ThemedText>
            )}

            <ThemedText style={styles.memberSince}>
              На сайте с: {formatDate(userData?.createdAt)}
            </ThemedText>
          </>
        ) : (
          <ThemedText style={styles.guestMessage}>
            Войдите в профиль, чтобы увидеть больше информации
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.menu}>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={handleEditProfile}
        >
          <IconSymbol name="pencil" size={24} color={isAuthenticated ? colors.tint : colors.icon} />
          <ThemedText style={[styles.menuText, !isAuthenticated && styles.disabledText]}>
            Редактировать профиль
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          disabled={!isAuthenticated}
        >
          <IconSymbol name="lock.fill" size={24} color={isAuthenticated ? colors.icon : colors.icon + '80'} />
          <ThemedText style={[styles.menuText, !isAuthenticated && styles.disabledText]}>
            Безопасность
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          disabled={!isAuthenticated}
        >
          <IconSymbol name="bell.fill" size={24} color={isAuthenticated ? colors.icon : colors.icon + '80'} />
          <ThemedText style={[styles.menuText, !isAuthenticated && styles.disabledText]}>
            Уведомления
          </ThemedText>
        </TouchableOpacity>

        {/* Условный рендеринг кнопок входа/выхода */}
        {isAuthenticated ? (
          // Если пользователь авторизован - показываем кнопку "Выйти"
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutButton, { backgroundColor: '#FF3B3020' }]} 
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#FF3B30" />
            <ThemedText style={[styles.menuText, styles.logoutText]}>Выйти из профиля</ThemedText>
          </TouchableOpacity>
        ) : (
          // Если пользователь не авторизован - показываем кнопку "Войти"
          <TouchableOpacity 
            style={[styles.menuItem, styles.loginButton, { backgroundColor: colors.tint + '20' }]} 
            onPress={handleLogin}
          >
            <IconSymbol name="arrow.right.circle.fill" size={24} color={colors.tint} />
            <ThemedText style={[styles.menuText, styles.loginText]}>Войти в профиль</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Модальное окно редактирования профиля (только для авторизованных) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ThemedText type="title" style={styles.modalTitle}>
              Редактировать профиль
            </ThemedText>

            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1
              }]}
              placeholder="Имя"
              placeholderTextColor={colors.icon}
              value={editName}
              onChangeText={setEditName}
            />

            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1
              }]}
              placeholder="Телефон"
              placeholderTextColor={colors.icon}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.card }]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText>Отмена</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleSaveProfile}
              >
                <ThemedText style={{ color: '#fff' }}>Сохранить</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontFamily: Fonts.rounded,
  },
  email: {
    fontSize: 16,
    opacity: 0.7,
  },
  phone: {
    fontSize: 14,
    marginTop: 4,
  },
  memberSince: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
  },
  guestMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
  menu: {
    padding: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    flex: 1,
  },
  disabledText: {
    opacity: 0.5,
  },
  loginButton: {
    marginTop: 20,
  },
  loginText: {
    color: '#0a7ea4',
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutText: {
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
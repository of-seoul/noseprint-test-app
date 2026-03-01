import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {API_ENDPOINTS} from '../config';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const [dogName, setDogName] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Camera screen에서 돌아올 때 photo path 받기
  React.useEffect(() => {
    if (route.params && 'photoPath' in route.params) {
      setPhotoPath((route.params as any).photoPath);
    }
  }, [route.params]);

  const handleTakePhoto = () => {
    navigation.navigate('Camera', {from: 'register'});
  };

  const handleRegister = async () => {
    if (!dogName.trim()) {
      Alert.alert('알림', '강아지 이름을 입력해주세요');
      return;
    }

    if (!photoPath) {
      Alert.alert('알림', '코 사진을 촬영해주세요');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', dogName.trim());
      formData.append('image', {
        uri: `file://${photoPath}`,
        type: 'image/jpeg',
        name: 'nose.jpg',
      } as any);

      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const result = await response.json();
      Alert.alert('등록 완료', `${dogName}이(가) 등록되었습니다!`, [
        {
          text: '확인',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Failed to register:', error);
      Alert.alert('오류', '서버 연결 실패\n나중에 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>강아지 등록</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>강아지 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 루피"
          value={dogName}
          onChangeText={setDogName}
          editable={!loading}
        />
      </View>

      <View style={styles.photoContainer}>
        <Text style={styles.label}>코 사진</Text>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={handleTakePhoto}
          disabled={loading}>
          {photoPath ? (
            <Image
              source={{uri: `file://${photoPath}`}}
              style={styles.photoPreview}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoPlaceholderLabel}>코 촬영하기</Text>
            </View>
          )}
        </TouchableOpacity>
        {photoPath && (
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleTakePhoto}
            disabled={loading}>
            <Text style={styles.retakeButtonText}>다시 촬영하기</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.registerButton, loading && styles.registerButtonDisabled]}
        onPress={handleRegister}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>등록</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  photoContainer: {
    marginBottom: 30,
  },
  photoButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderLabel: {
    fontSize: 16,
    color: '#666',
  },
  retakeButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

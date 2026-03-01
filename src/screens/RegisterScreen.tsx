import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const route = useRoute<RegisterScreenRouteProp>();
  const [dogName, setDogName] = useState('');

  const handleTakePhoto = () => {
    if (!dogName.trim()) {
      Alert.alert('알림', '강아지 이름을 먼저 입력해주세요');
      return;
    }

    // 가이드 화면으로 이동
    navigation.navigate('CaptureGuide', {
      from: 'register',
      dogName: dogName.trim(),
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>강아지 등록</Text>
      <Text style={styles.subtitle}>
        반려견의 코 지문을 등록하면{'\n'}
        나중에 코만 보고도 누구인지 알 수 있어요!
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>강아지 이름</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 루피"
          value={dogName}
          onChangeText={setDogName}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleTakePhoto}>
        <Text style={styles.captureButtonIcon}>📷</Text>
        <Text style={styles.captureButtonText}>코 촬영하기</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 촬영 팁</Text>
        <Text style={styles.infoText}>
          • 코를 정면에서 촬영하세요{'\n'}
          • 10~15cm 거리가 좋아요{'\n'}
          • 밝은 곳에서 찍으면 더 정확해요{'\n'}
          • 좋은 사진 3장 이상 촬영하면 자동으로 등록돼요
        </Text>
      </View>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  captureButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

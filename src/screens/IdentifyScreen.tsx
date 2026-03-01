import React, {useState} from 'react';
import {
  View,
  Text,
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

type IdentifyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Identify'
>;

type IdentifyScreenRouteProp = RouteProp<RootStackParamList, 'Identify'>;

interface IdentifyResult {
  matched: boolean;
  name?: string;
  similarity?: number;
  message?: string;
}

export const IdentifyScreen = () => {
  const navigation = useNavigation<IdentifyScreenNavigationProp>();
  const route = useRoute<IdentifyScreenRouteProp>();
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyResult | null>(null);

  // Camera screen에서 돌아올 때 photo path 받기
  React.useEffect(() => {
    if (route.params && 'photoPath' in route.params) {
      const newPhotoPath = (route.params as any).photoPath;
      setPhotoPath(newPhotoPath);
      setResult(null);
      
      // 자동으로 identify 실행
      handleIdentifyWithPath(newPhotoPath);
    }
  }, [route.params]);

  const handleTakePhoto = () => {
    // 가이드 화면으로 이동
    navigation.navigate('CaptureGuide', {from: 'identify'});
  };

  const handleIdentifyWithPath = async (path: string) => {
    if (!path) {
      Alert.alert('알림', '코 사진을 촬영해주세요');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: `file://${path}`,
        type: 'image/jpeg',
        name: 'nose.jpg',
      } as any);

      const response = await fetch(API_ENDPOINTS.IDENTIFY, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to identify:', error);
      Alert.alert('오류', '서버 연결 실패\n나중에 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentify = async () => {
    if (!photoPath) {
      handleTakePhoto();
      return;
    }
    await handleIdentifyWithPath(photoPath);
  };

  const renderResult = () => {
    if (!result) {
      return null;
    }

    if (result.matched && result.name) {
      const similarity = result.similarity
        ? Math.round(result.similarity * 100)
        : 0;
      return (
        <View style={[styles.resultContainer, styles.resultSuccess]}>
          <Text style={styles.resultIcon}>✅</Text>
          <Text style={styles.resultText}>
            {result.name}입니다!
          </Text>
          {result.similarity && (
            <Text style={styles.resultSimilarity}>
              유사도: {similarity}%
            </Text>
          )}
        </View>
      );
    } else {
      return (
        <View style={[styles.resultContainer, styles.resultFail]}>
          <Text style={styles.resultIcon}>❌</Text>
          <Text style={styles.resultText}>
            일치하는 강아지가 없습니다
          </Text>
          {result.message && (
            <Text style={styles.resultMessage}>{result.message}</Text>
          )}
        </View>
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>강아지 확인</Text>
      <Text style={styles.subtitle}>코를 촬영해서 누구인지 확인해보세요</Text>

      {photoPath && (
        <View style={styles.photoContainer}>
          <Text style={styles.label}>촬영한 사진</Text>
          <View style={styles.photoWrapper}>
            <Image
              source={{uri: `file://${photoPath}`}}
              style={styles.photoPreview}
            />
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleTakePhoto}
        disabled={loading}>
        <Text style={styles.captureButtonIcon}>📷</Text>
        <Text style={styles.captureButtonText}>
          {photoPath ? '다시 촬영하기' : '코 촬영하기'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>확인 중...</Text>
        </View>
      )}

      {renderResult()}

      {result && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleTakePhoto}>
          <Text style={styles.retryButtonText}>다시 촬영하기</Text>
        </TouchableOpacity>
      )}
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
  },
  photoContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  photoWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#34C759',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 1,
  },
  captureButton: {
    backgroundColor: '#34C759',
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultSuccess: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultFail: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultSimilarity: {
    fontSize: 16,
    color: '#666',
  },
  resultMessage: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    padding: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
});

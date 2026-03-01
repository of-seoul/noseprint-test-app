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
      setPhotoPath((route.params as any).photoPath);
      setResult(null); // 새로 촬영하면 결과 초기화
    }
  }, [route.params]);

  const handleTakePhoto = () => {
    navigation.navigate('Camera', {from: 'identify'});
  };

  const handleIdentify = async () => {
    if (!photoPath) {
      Alert.alert('알림', '코 사진을 촬영해주세요');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: `file://${photoPath}`,
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
        style={[styles.identifyButton, loading && styles.identifyButtonDisabled]}
        onPress={handleIdentify}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.identifyButtonText}>확인</Text>
        )}
      </TouchableOpacity>

      {renderResult()}
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  photoContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
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
    color: '#34C759',
    fontWeight: '600',
  },
  identifyButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  identifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  identifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSimilarity: {
    fontSize: 16,
    color: '#666',
  },
  resultMessage: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

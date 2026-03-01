import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import {API_ENDPOINTS} from '../config';

interface Dog {
  id: number;
  name: string;
  created_at: string;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.DOGS);
      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }
      const data = await response.json();
      setDogs(data.dogs || []);
    } catch (err) {
      console.error('Failed to load dogs:', err);
      setError('서버 연결 실패');
      setDogs([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, []),
  );

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleIdentify = () => {
    navigation.navigate('Identify');
  };

  const renderDog = ({item}: {item: Dog}) => {
    const date = new Date(item.created_at);
    return (
      <View style={styles.dogItem}>
        <View style={styles.dogInfo}>
          <Text style={styles.dogName}>{item.name}</Text>
          <Text style={styles.dogDate}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 코 지문 테스트</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.mainButton, styles.registerButton]}
          onPress={handleRegister}>
          <Text style={styles.mainButtonText}>등록하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainButton, styles.identifyButton]}
          onPress={handleIdentify}>
          <Text style={styles.mainButtonText}>확인하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dogsContainer}>
        <Text style={styles.dogsTitle}>등록된 강아지 목록</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadDogs}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : dogs.length === 0 ? (
          <Text style={styles.emptyText}>등록된 강아지가 없습니다</Text>
        ) : (
          <FlatList
            data={dogs}
            renderItem={renderDog}
            keyExtractor={item => item.id.toString()}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  mainButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#007AFF',
  },
  identifyButton: {
    backgroundColor: '#34C759',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dogsContainer: {
    flex: 1,
  },
  dogsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  dogItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dogInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dogName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dogDate: {
    fontSize: 12,
    color: '#666',
  },
});

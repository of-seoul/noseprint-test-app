import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

const STORAGE_KEY = 'noseprint_records';

interface NoseprintRecord {
  id: string;
  imagePath: string;
  timestamp: number;
}

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [records, setRecords] = useState<NoseprintRecord[]>([]);

  const loadRecords = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecords(parsed);
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, []),
  );

  const handleCapture = () => {
    navigation.navigate('Camera');
  };

  const renderRecord = ({item}: {item: NoseprintRecord}) => {
    const date = new Date(item.timestamp);
    return (
      <View style={styles.recordItem}>
        <Image
          source={{uri: `file://${item.imagePath}`}}
          style={styles.thumbnail}
        />
        <View style={styles.recordInfo}>
          <Text style={styles.recordDate}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
          <Text style={styles.recordPath} numberOfLines={1}>
            {item.imagePath}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>코 지문 촬영 테스트</Text>

      <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
        <Text style={styles.captureButtonText}>촬영하기</Text>
      </TouchableOpacity>

      <View style={styles.recordsContainer}>
        <Text style={styles.recordsTitle}>촬영 기록</Text>
        {records.length === 0 ? (
          <Text style={styles.emptyText}>촬영 기록이 없습니다</Text>
        ) : (
          <FlatList
            data={records}
            renderItem={renderRecord}
            keyExtractor={item => item.id}
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recordsContainer: {
    flex: 1,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  recordItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordPath: {
    fontSize: 12,
    color: '#666',
  },
});

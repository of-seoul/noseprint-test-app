import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

type RegisterResultScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegisterResult'
>;

type RegisterResultScreenRouteProp = RouteProp<RootStackParamList, 'RegisterResult'>;

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 60) / 3; // 3 columns with padding

export const RegisterResultScreen = () => {
  const navigation = useNavigation<RegisterResultScreenNavigationProp>();
  const route = useRoute<RegisterResultScreenRouteProp>();

  const {dogName, photoResults, bestPhotoIndex} = route.params;

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home'}],
    });
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'good':
        return '✅';
      case 'blurry':
        return '❌';
      case 'too_dark':
        return '⚠️';
      case 'too_bright':
        return '⚠️';
      case 'no_nose_detected':
        return '❌';
      default:
        return '❓';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'good':
        return '좋음';
      case 'blurry':
        return '흐림';
      case 'too_dark':
        return '어두움';
      case 'too_bright':
        return '밝음';
      case 'no_nose_detected':
        return '코 미감지';
      default:
        return '알 수 없음';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>{dogName}의 코 지문이</Text>
      <Text style={styles.title}>등록되었어요!</Text>

      <View style={styles.bestPhotoContainer}>
        <Text style={styles.sectionTitle}>최적 사진</Text>
        <View style={styles.bestPhotoWrapper}>
          <Image
            source={{uri: `file://${photoResults[bestPhotoIndex]?.uri}`}}
            style={styles.bestPhoto}
          />
          <View style={styles.bestPhotoBadge}>
            <Text style={styles.bestPhotoBadgeText}>⭐ BEST</Text>
          </View>
        </View>
      </View>

      <View style={styles.photosContainer}>
        <Text style={styles.sectionTitle}>촬영한 사진들</Text>
        <View style={styles.photoGrid}>
          {photoResults.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <Image
                source={{uri: `file://${photo.uri}`}}
                style={styles.photoThumbnail}
              />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoQualityIcon}>
                  {getQualityIcon(photo.quality)}
                </Text>
                <Text style={styles.photoQualityLabel}>
                  {getQualityLabel(photo.quality)}
                </Text>
              </View>
              {index === bestPhotoIndex && (
                <View style={styles.bestIndicator}>
                  <Text style={styles.bestIndicatorText}>⭐</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {photoResults.filter(p => p.quality === 'good').length}
          </Text>
          <Text style={styles.statLabel}>좋은 사진</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{photoResults.length}</Text>
          <Text style={styles.statLabel}>전체 사진</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Text style={styles.homeButtonText}>홈으로</Text>
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
    paddingTop: 40,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  bestPhotoContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  bestPhotoWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  bestPhoto: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  bestPhotoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bestPhotoBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photosContainer: {
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 4,
    alignItems: 'center',
  },
  photoQualityIcon: {
    fontSize: 16,
  },
  photoQualityLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  bestIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestIndicatorText: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#DEE2E6',
    marginHorizontal: 20,
  },
  homeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

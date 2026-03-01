import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

type CaptureGuideScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CaptureGuide'
>;

type CaptureGuideScreenRouteProp = RouteProp<RootStackParamList, 'CaptureGuide'>;

export const CaptureGuideScreen = () => {
  const navigation = useNavigation<CaptureGuideScreenNavigationProp>();
  const route = useRoute<CaptureGuideScreenRouteProp>();
  
  const from = route.params?.from || 'register';
  const dogName = route.params?.dogName;

  const handleStart = () => {
    navigation.navigate('Camera', {from, dogName});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>📸</Text>
      <Text style={styles.title}>이렇게 촬영해주세요</Text>
      
      <View style={styles.guideList}>
        <View style={styles.guideItem}>
          <Text style={styles.guideIcon}>✅</Text>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>코 정면을 향해주세요</Text>
            <Text style={styles.guideDescription}>
              반려견의 코를 정면에서 촬영하면 가장 좋아요
            </Text>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Text style={styles.guideIcon}>✅</Text>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>10~15cm 거리</Text>
            <Text style={styles.guideDescription}>
              너무 가깝거나 멀지 않게, 손바닥 정도 거리가 좋아요
            </Text>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Text style={styles.guideIcon}>✅</Text>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>밝은 곳에서</Text>
            <Text style={styles.guideDescription}>
              자연광이나 밝은 조명 아래에서 촬영해주세요
            </Text>
          </View>
        </View>

        <View style={styles.guideItem}>
          <Text style={styles.guideIcon}>✅</Text>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>화면을 탭하면 초점</Text>
            <Text style={styles.guideDescription}>
              코를 탭하면 초점이 맞춰져요
            </Text>
          </View>
        </View>

        <View style={[styles.guideItem, styles.guideItemWarning]}>
          <Text style={styles.guideIcon}>❌</Text>
          <View style={styles.guideTextContainer}>
            <Text style={styles.guideTitle}>옆면, 위에서 찍지 마세요</Text>
            <Text style={styles.guideDescription}>
              정면이 아니면 인식이 어려워요
            </Text>
          </View>
        </View>
      </View>

      {from === 'register' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 좋은 사진 3장 이상을 촬영하면 자동으로 등록돼요
          </Text>
          <Text style={styles.infoSubtext}>
            (최대 5장까지 촬영 가능)
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>시작하기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>취소</Text>
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
    marginBottom: 32,
    color: '#333',
  },
  guideList: {
    marginBottom: 24,
  },
  guideItem: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  guideItemWarning: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
  },
  guideIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  guideTextContainer: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#E7F3FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },
  infoText: {
    fontSize: 14,
    color: '#0056B3',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#0056B3',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

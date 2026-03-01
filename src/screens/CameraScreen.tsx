import React, {useRef, useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList, PhotoResult} from '../types/navigation';
import {API_ENDPOINTS} from '../config';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const GUIDE_SIZE = SCREEN_WIDTH * 0.6;

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Camera'
>;

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

interface QualityCheckResult {
  quality: 'good' | 'blurry' | 'too_dark' | 'too_bright' | 'no_nose_detected';
  sharpness?: number;
  message?: string;
}

export const CameraScreen = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [focusPoint, setFocusPoint] = useState<{x: number; y: number} | null>(null);

  const from = route.params?.from || 'register';
  const dogName = route.params?.dogName;

  // 등록 모드: 연속 촬영
  const [photoResults, setPhotoResults] = useState<PhotoResult[]>([]);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [registering, setRegistering] = useState(false);

  const MAX_PHOTOS = 5;
  const MIN_GOOD_PHOTOS = 3;

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // 탭하면 초점 맞추기
  const handleFocus = useCallback(async (e: GestureResponderEvent) => {
    if (!camera.current || !device) return;

    const x = e.nativeEvent.locationX;
    const y = e.nativeEvent.locationY;

    setFocusPoint({x, y});

    try {
      await camera.current.focus({x, y});
    } catch (err) {
      console.log('Focus failed:', err);
    }

    setTimeout(() => setFocusPoint(null), 1500);
  }, [device]);

  const checkPhotoQuality = async (photoUri: string): Promise<QualityCheckResult> => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: `file://${photoUri}`,
        type: 'image/jpeg',
        name: 'nose.jpg',
      } as any);

      const response = await fetch(API_ENDPOINTS.CHECK_QUALITY, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Quality check failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log('Quality check API failed, using fallback');
      // API 실패 시 fallback: 모두 good으로 처리
      return {
        quality: 'good',
        message: '품질 확인 서버 연결 실패 (기본 처리)',
      };
    }
  };

  const registerPhotos = async (photos: PhotoResult[]) => {
    if (!dogName) {
      Alert.alert('오류', '강아지 이름이 없습니다');
      return;
    }

    setRegistering(true);
    try {
      const formData = new FormData();
      formData.append('name', dogName);

      photos.forEach((photo, index) => {
        formData.append('images', {
          uri: `file://${photo.uri}`,
          type: 'image/jpeg',
          name: `nose_${index}.jpg`,
        } as any);
      });

      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      
      // 등록 결과 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [
          {name: 'Home'},
          {
            name: 'RegisterResult',
            params: {
              dogName,
              photoResults: result.photoResults || photos,
              bestPhotoIndex: result.bestPhotoIndex || 0,
            },
          },
        ],
      });
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert(
        '등록 실패',
        '서버 연결에 실패했습니다. 나중에 다시 시도해주세요.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleCapture = async () => {
    if (!camera.current) {
      return;
    }

    if (checkingQuality || registering) {
      return;
    }

    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        enableShutterSound: true,
      });

      if (from === 'identify') {
        // 확인 모드: 1장만 촬영 + 품질 체크
        setCheckingQuality(true);
        const qualityResult = await checkPhotoQuality(photo.path);
        setCheckingQuality(false);

        if (qualityResult.quality === 'good') {
          // 품질 OK → identify로 이동
          navigation.navigate('Identify', {photoPath: photo.path} as any);
        } else {
          // 품질 NG → 피드백 표시
          const feedbackMessages: Record<string, string> = {
            blurry: '흐릿해요! 초점을 맞추고 다시 찍어주세요',
            too_dark: '너무 어두워요. 밝은 곳으로 이동해주세요',
            too_bright: '너무 밝아요. 조명을 줄여주세요',
            no_nose_detected: '코가 감지되지 않았어요. 코를 정면에서 찍어주세요',
          };

          setLastFeedback({
            type: 'error',
            message: feedbackMessages[qualityResult.quality] || qualityResult.message || '다시 촬영해주세요',
          });

          setTimeout(() => setLastFeedback(null), 3000);
        }
      } else {
        // 등록 모드: 연속 촬영
        if (photoResults.length >= MAX_PHOTOS) {
          Alert.alert('알림', '최대 촬영 횟수에 도달했습니다');
          return;
        }

        setCheckingQuality(true);
        const qualityResult = await checkPhotoQuality(photo.path);
        setCheckingQuality(false);

        const photoResult: PhotoResult = {
          uri: photo.path,
          quality: qualityResult.quality,
          sharpness: qualityResult.sharpness,
          message: qualityResult.message,
        };

        const newPhotoResults = [...photoResults, photoResult];
        setPhotoResults(newPhotoResults);

        const goodPhotos = newPhotoResults.filter(p => p.quality === 'good');

        if (qualityResult.quality === 'good') {
          setLastFeedback({
            type: 'success',
            message: `좋아요! (${goodPhotos.length}/${MIN_GOOD_PHOTOS} 완료)`,
          });

          // 3장 이상 good 사진 → 자동 등록
          if (goodPhotos.length >= MIN_GOOD_PHOTOS) {
            setTimeout(() => {
              setLastFeedback({
                type: 'success',
                message: '✅ 코 지문 채취 완료! 등록 중...',
              });
            }, 500);

            setTimeout(() => {
              registerPhotos(newPhotoResults);
            }, 1500);
            return;
          }
        } else {
          const feedbackMessages: Record<string, {type: 'error' | 'warning', message: string}> = {
            blurry: {type: 'error', message: '흐릿해요! 초점을 맞추고 다시 찍어주세요'},
            too_dark: {type: 'warning', message: '너무 어두워요. 밝은 곳으로 이동해주세요'},
            too_bright: {type: 'warning', message: '너무 밝아요. 조명을 줄여주세요'},
            no_nose_detected: {type: 'error', message: '코가 감지되지 않았어요. 코를 정면에서 찍어주세요'},
          };

          const feedback = feedbackMessages[qualityResult.quality] || {
            type: 'error' as const,
            message: qualityResult.message || '다시 촬영해주세요',
          };

          setLastFeedback(feedback);
        }

        setTimeout(() => setLastFeedback(null), 3000);
      }
    } catch (error) {
      console.error('Failed to capture:', error);
      Alert.alert('오류', '촬영에 실패했습니다');
      setCheckingQuality(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>권한 요청</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라를 찾을 수 없습니다</Text>
      </View>
    );
  }

  const goodPhotosCount = photoResults.filter(p => p.quality === 'good').length;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* 탭 포커스 영역 */}
      <View
        style={StyleSheet.absoluteFill}
        onTouchEnd={handleFocus}
      >
        {/* 포커스 인디케이터 */}
        {focusPoint && (
          <View
            style={[
              styles.focusIndicator,
              {left: focusPoint.x - 30, top: focusPoint.y - 30},
            ]}
          />
        )}
      </View>

      {/* Guide Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        {/* 상단 진행 표시 (등록 모드) */}
        {from === 'register' && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {photoResults.length}/{MAX_PHOTOS} 촬영 중... (좋은 사진: {goodPhotosCount}/{MIN_GOOD_PHOTOS})
            </Text>
          </View>
        )}

        <View style={styles.guideContainer}>
          <View style={styles.guideCircle} />
          <Text style={styles.guideText}>
            🐾 코를 원 안에 맞추고{'\n'}화면을 탭하면 초점이 맞아요
          </Text>
        </View>

        {/* 거리 안내 */}
        <Text style={styles.distanceText}>
          10~15cm 거리에서 촬영하세요
        </Text>

        {/* 품질 피드백 */}
        {lastFeedback && (
          <View
            style={[
              styles.feedbackContainer,
              lastFeedback.type === 'success' && styles.feedbackSuccess,
              lastFeedback.type === 'error' && styles.feedbackError,
              lastFeedback.type === 'warning' && styles.feedbackWarning,
            ]}>
            <Text style={styles.feedbackText}>{lastFeedback.message}</Text>
          </View>
        )}
      </View>

      {/* Capture Button */}
      <View style={styles.bottomContainer}>
        {checkingQuality || registering ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>
              {registering ? '등록 중...' : '품질 확인 중...'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={checkingQuality || registering}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  guideContainer: {
    alignItems: 'center',
  },
  guideCircle: {
    width: GUIDE_SIZE,
    height: GUIDE_SIZE,
    borderRadius: GUIDE_SIZE / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  guideText: {
    color: '#fff',
    fontSize: 15,
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  distanceText: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 140,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    maxWidth: '80%',
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
  },
  feedbackError: {
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
  },
  feedbackWarning: {
    backgroundColor: 'rgba(255, 204, 0, 0.95)',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  focusIndicator: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'transparent',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

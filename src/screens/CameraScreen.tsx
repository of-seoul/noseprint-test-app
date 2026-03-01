import React, {useRef, useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const GUIDE_SIZE = SCREEN_WIDTH * 0.6;

type CameraScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Camera'
>;

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

export const CameraScreen = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [focusPoint, setFocusPoint] = useState<{x: number; y: number} | null>(null);

  const from = route.params?.from || 'register';

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
      // 포커스 실패는 무시 (일부 기기에서 지원 안 될 수 있음)
      console.log('Focus failed:', err);
    }

    // 포커스 표시 1.5초 후 숨기기
    setTimeout(() => setFocusPoint(null), 1500);
  }, [device]);

  const handleCapture = async () => {
    if (!camera.current) {
      return;
    }

    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        enableShutterSound: true,
      });

      if (from === 'register') {
        navigation.navigate('Register', {photoPath: photo.path} as any);
      } else if (from === 'identify') {
        navigation.navigate('Identify', {photoPath: photo.path} as any);
      }
    } catch (error) {
      console.error('Failed to capture:', error);
      Alert.alert('오류', '촬영에 실패했습니다');
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
      </View>

      {/* Capture Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
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

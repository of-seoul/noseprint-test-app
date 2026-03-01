export type RootStackParamList = {
  Home: undefined;
  Register: {photoResults?: PhotoResult[]} | undefined;
  Identify: undefined;
  Camera: {
    from: 'register' | 'identify';
    dogName?: string; // 등록 모드일 때 이름 전달
  };
  CaptureGuide: {
    from: 'register' | 'identify';
    dogName?: string;
  };
  RegisterResult: {
    dogName: string;
    photoResults: PhotoResult[];
    bestPhotoIndex: number;
  };
};

export interface PhotoResult {
  uri: string;
  quality: 'good' | 'blurry' | 'too_dark' | 'too_bright' | 'no_nose_detected';
  sharpness?: number;
  message?: string;
}
